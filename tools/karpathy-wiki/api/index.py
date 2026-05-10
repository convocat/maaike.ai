"""
Vercel serverless entry point for the wiki chat.

Exposes ONLY read-only routes. Writes (proposal review, apply) stay local.

Routes:
  GET  /api/topics                           → list of all wiki topics + article metadata
  GET  /api/wiki/{section}/{slug}            → full markdown of a wiki page
  GET  /api/article/{section}/{slug}         → full markdown of an article/field-note/seed
  POST /api/ask                              → answer question, return sources

Security hardening:
  - CORS: only allowed origins (maaike.ai family + localhost in dev)
  - Input: question capped at 500 chars
  - Client-supplied `key` parameter is ignored (prevents probing / misuse)
  - No write endpoints exposed

Business logic is imported from `tools/serve.py` so there's one source of truth.
"""

from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, unquote
from pathlib import Path
from collections import defaultdict
import sys
import json
import os
import time
import hashlib

# Make ../tools/serve.py importable
_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE.parent / "tools"))

import serve  # noqa: E402  (import order intentional)

MAX_QUESTION_LEN = 500
MAX_CHAT_MESSAGE_LEN = 1000

# Rate limits: per-IP, in-memory. Not shared across Vercel cold starts or
# concurrent containers, so this is a best-effort throttle against casual
# abuse, not a hard quota. The Anthropic account-level spend cap is the
# true backstop.
RATE_LIMIT_WINDOW_SEC = 300   # 5-minute sliding window
RATE_LIMIT_MAX        = 10    # max questions per window per IP
_rate_state = defaultdict(list)  # ip -> list of request timestamps

_IS_PRODUCTION = os.environ.get("VERCEL_ENV") == "production"

ALLOWED_ORIGINS = {
    "https://maaike.ai",
    "https://www.maaike.ai",
    "https://wiki.maaike.ai",
}
if not _IS_PRODUCTION:
    ALLOWED_ORIGINS.update({
        "http://localhost:8800",
        "http://localhost:4321",
        "http://127.0.0.1:8800",
    })


def _client_ip(request_handler):
    """Real client IP, preferring Vercel's x-forwarded-for header."""
    xff = request_handler.headers.get("x-forwarded-for", "")
    if xff:
        return xff.split(",")[0].strip()
    return request_handler.client_address[0]


def _check_rate_limit(ip):
    """Return (allowed: bool, retry_after_sec: int)."""
    now = time.time()
    recent = [t for t in _rate_state[ip] if now - t < RATE_LIMIT_WINDOW_SEC]
    if len(recent) >= RATE_LIMIT_MAX:
        retry_after = int(RATE_LIMIT_WINDOW_SEC - (now - min(recent))) + 1
        return False, retry_after
    recent.append(now)
    _rate_state[ip] = recent
    # Opportunistic cleanup so the dict doesn't grow forever
    if len(_rate_state) > 5000:
        for k in list(_rate_state.keys()):
            if not any(now - t < RATE_LIMIT_WINDOW_SEC for t in _rate_state[k]):
                del _rate_state[k]
    return True, 0


def _log(event, **fields):
    """Structured log line to stderr — Vercel captures this in function logs.
    Logs IP as a short hash (privacy-preserving) and never logs question text."""
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

    def _send_json(self, status: int, body: str):
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

        if path.startswith("/api/wiki/"):
            parts = path[len("/api/wiki/"):].split("/", 1)
            if len(parts) == 2:
                return self._send_json(200, serve.handle_wikipage_api(parts[0], parts[1]))
            return self._send_json(400, json.dumps({"error": "bad path"}))

        if path.startswith("/api/article/"):
            parts = path[len("/api/article/"):].split("/", 1)
            if len(parts) == 2:
                return self._send_json(200, serve.handle_article_api(parts[0], parts[1]))
            return self._send_json(400, json.dumps({"error": "bad path"}))

        if path.startswith("/api/topic-meta/"):
            slug = path[len("/api/topic-meta/"):]
            return self._send_json(200, serve.handle_topic_meta_api(slug))

        if path.startswith("/api/topic-view/"):
            # Production: serve cached JSON only (cache was populated at dev time)
            slug = path[len("/api/topic-view/"):]
            return self._send_json(200, serve.handle_topic_view_api(slug, force=False))

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
            q_len = len(question)
            if not question:
                _log("ask", ip=ip, outcome="empty")
                return self._send_json(400, json.dumps({"error": "No question provided"}))
            if q_len > MAX_QUESTION_LEN:
                _log("ask", ip=ip, outcome="too_long", q_len=q_len)
                return self._send_json(
                    400,
                    json.dumps({"error": f"Question too long ({q_len} chars, max {MAX_QUESTION_LEN})"}),
                )

            # Per-IP rate limit (best-effort; in-memory, not shared across instances)
            allowed, retry_after = _check_rate_limit(ip)
            if not allowed:
                _log("ask", ip=ip, outcome="rate_limited", retry_after=retry_after)
                self.send_response(429)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Retry-After", str(retry_after))
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({
                    "error": f"You've asked a lot of questions in a short time. Try again in {retry_after}s."
                }).encode("utf-8"))
                return

            # Pass conversation history through (server sanitizes it further). Strip
            # any client-supplied `key` — in public mode only the server's env var is trusted.
            history = data.get("history") if isinstance(data.get("history"), list) else []
            session_id = str(data.get("session_id") or "").strip()[:64]
            user_id = hashlib.sha256(ip.encode()).hexdigest()[:12] if ip else ""
            sanitized = json.dumps({
                "question": question,
                "history": history,
                "session_id": session_id,
                "user_id": user_id,
            }).encode("utf-8")

            # Stream: headers first, then token-by-token JSON-lines.
            self.send_response(200)
            self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-transform")
            self.send_header("X-Accel-Buffering", "no")  # hint to any buffering proxy
            self._send_cors()
            self.end_headers()

            def write(chunk):
                try:
                    self.wfile.write(chunk.encode("utf-8"))
                    self.wfile.flush()
                except (BrokenPipeError, ConnectionResetError):
                    pass  # client disconnected

            try:
                serve.handle_ask_api_stream(sanitized, write)
                _log("ask", ip=ip, outcome="ok", q_len=q_len)
            except Exception:
                _log("ask", ip=ip, outcome="backend_error", q_len=q_len)
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
            session_id = str(data.get("session_id") or "").strip()[:64]
            user_id = hashlib.sha256(ip.encode()).hexdigest()[:12] if ip else ""
            sanitized = json.dumps({
                "message": message,
                "history": history,
                "current": current,
                "prompt_id": prompt_id,
                "session_id": session_id,
                "user_id": user_id,
            }).encode("utf-8")

            self.send_response(200)
            self.send_header("Content-Type", "application/x-ndjson; charset=utf-8")
            self.send_header("Cache-Control", "no-cache, no-transform")
            self.send_header("X-Accel-Buffering", "no")
            self._send_cors()
            self.end_headers()

            def write_chat(chunk):
                try:
                    self.wfile.write(chunk.encode("utf-8"))
                    self.wfile.flush()
                except (BrokenPipeError, ConnectionResetError):
                    pass

            try:
                serve.handle_chat_api_stream(sanitized, write_chat)
                _log("chat", ip=ip, outcome="ok", m_len=len(message))
            except Exception:
                _log("chat", ip=ip, outcome="backend_error")
                write_chat(json.dumps({"type": "error", "error": "backend error"}) + "\n")
            return

        return self._send_json(404, json.dumps({"error": "not found"}))

    def log_message(self, format, *args):
        # Silence the default logging; Vercel captures stdout anyway.
        pass
