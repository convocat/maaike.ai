"""
Vercel serverless entry point for the garden chatbot.
Last touched: 2026-05-07 (chip-marker parser + v0.2 default).

Routes (read-only):
  GET  /api/topics                      → list of topics
  GET  /api/article/{section}/{slug}    → post markdown
  GET  /api/topic-meta/{slug}           → real triples-derived topic metadata
  GET  /api/topic-view/{slug}           → derived (cached) wiki-view; never regenerates in prod
  GET  /api/prompts                     → list of selectable system prompts (cogwheel)
  POST /api/ask                         → answer streaming (live Claude call)
  POST /api/chat                        → per-page chat streaming (live Claude call)

Security:
  - CORS locked to maaike.ai + localhost for dev
  - /api/ask, /api/chat: per-IP rate limit, message-length cap, no client-supplied keys
  - No write endpoints
  - /api/topic-view serves cached JSON only; no on-demand regeneration in prod

Business logic is imported from `tools/karpathy-wiki/tools/serve.py` (one source of truth).
"""
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote
from pathlib import Path
from collections import defaultdict
import sys, json, os, time, hashlib

# Make serve.py importable (absolute path relative to this file)
_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_ROOT / "tools" / "karpathy-wiki" / "tools"))
import serve  # noqa: E402

MAX_QUESTION_LEN = 500
MAX_CHAT_MESSAGE_LEN = 1000
RATE_LIMIT_WINDOW_SEC = 300
RATE_LIMIT_MAX = 10
_rate_state = defaultdict(list)

_IS_PRODUCTION = os.environ.get("VERCEL_ENV") == "production"

ALLOWED_ORIGINS = {
    "https://maaike.ai",
    "https://www.maaike.ai",
}
if not _IS_PRODUCTION:
    ALLOWED_ORIGINS.update({
        "http://localhost:4321",
        "http://127.0.0.1:4321",
        "http://localhost:8780",
    })


def _client_ip(handler_):
    xff = handler_.headers.get("x-forwarded-for", "")
    if xff:
        return xff.split(",")[0].strip()
    return handler_.client_address[0]


def _check_rate_limit(ip):
    now = time.time()
    recent = [t for t in _rate_state[ip] if now - t < RATE_LIMIT_WINDOW_SEC]
    if len(recent) >= RATE_LIMIT_MAX:
        return False, int(RATE_LIMIT_WINDOW_SEC - (now - min(recent))) + 1
    recent.append(now)
    _rate_state[ip] = recent
    if len(_rate_state) > 5000:
        for k in list(_rate_state.keys()):
            if not any(now - t < RATE_LIMIT_WINDOW_SEC for t in _rate_state[k]):
                del _rate_state[k]
    return True, 0


def _log(event, **fields):
    parts = [f"[{event}]", time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())]
    for k, v in fields.items():
        if k == "ip" and v:
            v = hashlib.sha256(v.encode()).hexdigest()[:12]
        parts.append(f"{k}={v}")
    print(" ".join(parts), file=sys.stderr, flush=True)


class handler(BaseHTTPRequestHandler):
    def _send_cors(self):
        origin = self.headers.get("Origin", "")
        if origin in ALLOWED_ORIGINS:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, status, body):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._send_cors()
        self.end_headers()
        self.wfile.write(body.encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        path = unquote(urlparse(self.path).path)

        if path == "/api/topics":
            return self._send_json(200, serve.handle_topics_api())

        if path.startswith("/api/article/"):
            parts = path[len("/api/article/"):].split("/", 1)
            if len(parts) == 2:
                return self._send_json(200, serve.handle_article_api(parts[0], parts[1]))
            return self._send_json(400, json.dumps({"error": "bad path"}))

        if path.startswith("/api/topic-meta/"):
            slug = path[len("/api/topic-meta/"):]
            return self._send_json(200, serve.handle_topic_meta_api(slug))

        if path.startswith("/api/topic-view/"):
            # In prod: cache-only, never regenerate (cache was populated at build/dev time)
            slug = path[len("/api/topic-view/"):]
            return self._send_json(200, serve.handle_topic_view_api(slug, force=False))

        if path == "/api/prompts":
            return self._send_json(200, serve.handle_prompts_api())

        return self._send_json(404, json.dumps({"error": "not found"}))

    def do_POST(self):
        path = unquote(urlparse(self.path).path)

        if path == "/api/ask":
            ip = _client_ip(self)
            length = int(self.headers.get("Content-Length", 0) or 0)
            raw = self.rfile.read(length) if length else b""
            try:
                data = json.loads(raw) if raw else {}
            except Exception:
                _log("ask", ip=ip, outcome="bad_json")
                return self._send_json(400, json.dumps({"error": "invalid JSON"}))

            question = str(data.get("question", "")).strip()
            if not question:
                return self._send_json(400, json.dumps({"error": "No question provided"}))
            if len(question) > MAX_QUESTION_LEN:
                return self._send_json(400, json.dumps({
                    "error": f"Question too long (max {MAX_QUESTION_LEN} chars)"
                }))

            allowed, retry_after = _check_rate_limit(ip)
            if not allowed:
                self.send_response(429)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Retry-After", str(retry_after))
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"Too many questions. Try again in {retry_after}s."
                }).encode("utf-8"))
                return

            history = data.get("history") if isinstance(data.get("history"), list) else []
            sanitized = json.dumps({"question": question, "history": history}).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-transform")
            self.send_header("X-Accel-Buffering", "no")
            self._send_cors()
            self.end_headers()

            def write(chunk):
                try:
                    self.wfile.write(chunk.encode("utf-8"))
                    self.wfile.flush()
                except (BrokenPipeError, ConnectionResetError):
                    pass

            try:
                serve.handle_ask_api_stream(sanitized, write)
                _log("ask", ip=ip, outcome="ok", q_len=len(question))
            except Exception:
                _log("ask", ip=ip, outcome="backend_error")
                write(json.dumps({"type": "error", "error": "backend error"}) + "\n")
            return

        if path == "/api/chat":
            ip = _client_ip(self)
            length = int(self.headers.get("Content-Length", 0) or 0)
            raw = self.rfile.read(length) if length else b""
            try:
                data = json.loads(raw) if raw else {}
            except Exception:
                _log("chat", ip=ip, outcome="bad_json")
                return self._send_json(400, json.dumps({"error": "invalid JSON"}))

            message = str(data.get("message", "")).strip()
            if not message:
                return self._send_json(400, json.dumps({"error": "No message provided"}))
            if len(message) > MAX_CHAT_MESSAGE_LEN:
                return self._send_json(400, json.dumps({
                    "error": f"Message too long (max {MAX_CHAT_MESSAGE_LEN} chars)"
                }))

            allowed, retry_after = _check_rate_limit(ip)
            if not allowed:
                self.send_response(429)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Retry-After", str(retry_after))
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"Too many messages. Try again in {retry_after}s."
                }).encode("utf-8"))
                return

            history = data.get("history") if isinstance(data.get("history"), list) else []
            current = data.get("current") if isinstance(data.get("current"), dict) else {}
            prompt_id = str(data.get("prompt_id") or "").strip()
            sanitized = json.dumps({
                "message": message,
                "history": history,
                "current": current,
                "prompt_id": prompt_id,
            }).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-transform")
            self.send_header("X-Accel-Buffering", "no")
            self._send_cors()
            self.end_headers()

            def write(chunk):
                try:
                    self.wfile.write(chunk.encode("utf-8"))
                    self.wfile.flush()
                except (BrokenPipeError, ConnectionResetError):
                    pass

            try:
                serve.handle_chat_api_stream(sanitized, write)
                _log("chat", ip=ip, outcome="ok", m_len=len(message))
            except Exception:
                _log("chat", ip=ip, outcome="backend_error")
                write(json.dumps({"type": "error", "error": "backend error"}) + "\n")
            return

        return self._send_json(404, json.dumps({"error": "not found"}))

    def log_message(self, format, *args):
        pass
