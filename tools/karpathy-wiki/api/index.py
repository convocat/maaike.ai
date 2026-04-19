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
import sys
import json
import os

# Make ../tools/serve.py importable
_HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(_HERE.parent / "tools"))

import serve  # noqa: E402  (import order intentional)

MAX_QUESTION_LEN = 500

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

        return self._send_json(404, json.dumps({"error": "not found"}))

    def do_POST(self):
        path = unquote(urlparse(self.path).path)

        if path == "/api/ask":
            length = int(self.headers.get("Content-Length", 0) or 0)
            raw = self.rfile.read(length) if length else b""
            try:
                data = json.loads(raw) if raw else {}
            except Exception:
                return self._send_json(400, json.dumps({"error": "invalid JSON"}))

            question = str(data.get("question", "")).strip()
            if not question:
                return self._send_json(400, json.dumps({"error": "No question provided"}))
            if len(question) > MAX_QUESTION_LEN:
                return self._send_json(
                    400,
                    json.dumps({"error": f"Question too long ({len(question)} chars, max {MAX_QUESTION_LEN})"}),
                )

            # Strip any client-supplied `key` — in public mode only the server's env var is trusted.
            sanitized = json.dumps({"question": question}).encode("utf-8")

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
            except Exception:
                write(json.dumps({"type": "error", "error": "backend error"}) + "\n")
            return

        return self._send_json(404, json.dumps({"error": "not found"}))

    def log_message(self, format, *args):
        # Silence the default logging; Vercel captures stdout anyway.
        pass
