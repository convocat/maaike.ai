#!/usr/bin/env python3
"""
Garden ingest admin dashboard — Flask backend (port 8900).

Pure review UI. No Claude API, no scraping, no extraction.
Enrichment happens in GitHub Actions via the telegram-sync workflow
(which runs /auto-tag on draft weblinks). The dashboard reads those
enriched drafts and lets Maaike approve (flip draft:false) or discard
(delete file).
"""

import json
import os
import re
import subprocess
import threading
from pathlib import Path

import requests
import yaml
from flask import Flask, jsonify, request, send_file

# ── Paths ──────────────────────────────────────────────────────────────────────
ADMIN_DIR      = Path(__file__).parent
GARDEN_ROOT    = ADMIN_DIR.parent.parent
WEBLINKS_DIR   = GARDEN_ROOT / "src/content/weblinks"
DASHBOARD_HTML = GARDEN_ROOT / "public/mockup-ingest-dashboard.html"
PORT = 8900


# ── Environment ────────────────────────────────────────────────────────────────
def _load_env():
    candidates = [
        GARDEN_ROOT / ".env",
        GARDEN_ROOT / "tools" / "karpathy-wiki" / ".env",
    ]
    for env_file in candidates:
        if env_file.exists():
            for line in env_file.read_text(encoding="utf-8").splitlines():
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    key = k.strip()
                    if not os.environ.get(key):
                        os.environ[key] = v.strip()

_load_env()


# ── Flask app ──────────────────────────────────────────────────────────────────
app = Flask(__name__)


# ── Draft weblink reader ───────────────────────────────────────────────────────
FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", re.DOTALL)


def parse_weblink(path: Path):
    """Return parsed frontmatter + body, or None if not valid."""
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return None
    m = FRONTMATTER_RE.match(text)
    if not m:
        return None
    try:
        fm = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError:
        return None
    fm["_slug"] = path.stem
    fm["_path"] = str(path.relative_to(GARDEN_ROOT))
    fm["_body"] = m.group(2).strip()
    return fm


def list_drafts():
    """All draft weblinks, sorted by date desc."""
    items = []
    if not WEBLINKS_DIR.exists():
        return items
    for p in WEBLINKS_DIR.glob("*.md"):
        fm = parse_weblink(p)
        if fm and fm.get("draft") is True:
            items.append(fm)
    items.sort(key=lambda it: str(it.get("date", "")), reverse=True)
    return items


def weblink_to_item(fm):
    """Shape a frontmatter dict into the item format the dashboard expects."""
    triples = fm.get("triples") or []
    # triples are stored as [[subject, predicate, object], ...] in YAML
    associations = [
        {"subject": t[0], "predicate": t[1], "object": t[2]}
        for t in triples if isinstance(t, list) and len(t) == 3
    ]
    has_enrichment = bool(associations or fm.get("themes"))
    return {
        "slug":        fm["_slug"],
        "path":        fm["_path"],
        "title":       fm.get("title", ""),
        "url":         fm.get("url", ""),
        "date":        str(fm.get("date", "")),
        "description": fm.get("description", ""),
        "tags":        fm.get("tags") or [],
        "themes":      fm.get("themes") or [],
        "associations": associations,
        "enriched":    has_enrichment,
        "processed":   False,  # draft=true means unprocessed in the review UI
    }


# ── Frontmatter mutation ───────────────────────────────────────────────────────
def flip_draft_false(path: Path):
    """Set `draft: true` → `draft: false` in a weblink file."""
    text = path.read_text(encoding="utf-8")
    new_text = re.sub(
        r"^draft:\s*true\s*$",
        "draft: false",
        text,
        count=1,
        flags=re.MULTILINE,
    )
    if new_text == text:
        raise ValueError("No `draft: true` line found")
    tmp = path.with_suffix(".tmp")
    tmp.write_text(new_text, encoding="utf-8")
    tmp.replace(path)


# ── Git operations ─────────────────────────────────────────────────────────────
def git_commit_push(files, message):
    cwd = str(GARDEN_ROOT)
    for f in files:
        subprocess.run(["git", "add", str(f)], cwd=cwd, check=True)
    subprocess.run(["git", "commit", "-m", message], cwd=cwd, check=True)

    def push():
        try:
            subprocess.run(["git", "push"], cwd=cwd, timeout=30, check=True)
        except Exception as e:
            print(f"[admin] Push failed: {e}")

    threading.Thread(target=push, daemon=True).start()


def git_pull():
    subprocess.run(
        ["git", "pull", "--rebase", "--autostash"],
        cwd=str(GARDEN_ROOT), timeout=30, check=False,
    )


# ── API routes ─────────────────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_file(str(DASHBOARD_HTML))


@app.route("/images/<path:filename>")
def serve_image(filename):
    return send_file(str(GARDEN_ROOT / "public" / "images" / filename))


@app.route("/api/inbox")
def api_inbox():
    """Return all draft weblinks as review items."""
    drafts = list_drafts()
    return jsonify([weblink_to_item(fm) for fm in drafts])


@app.route("/api/approve", methods=["POST"])
def api_approve():
    """Flip draft:false and commit. Does not re-run enrichment."""
    data = request.json
    slug = data["slug"]
    path = WEBLINKS_DIR / f"{slug}.md"
    if not path.exists():
        return jsonify({"error": f"not found: {slug}"}), 404
    try:
        flip_draft_false(path)
        git_commit_push([path], f"Publish weblink: {slug}")
        return jsonify({"ok": True, "slug": slug})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/dismiss", methods=["POST"])
def api_dismiss():
    """Delete a draft weblink and commit."""
    data = request.json
    slug = data["slug"]
    path = WEBLINKS_DIR / f"{slug}.md"
    if not path.exists():
        return jsonify({"error": f"not found: {slug}"}), 404
    try:
        path.unlink()
        git_commit_push([path], f"Dismiss weblink draft: {slug}")
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Back-compat: dashboard calls /api/delete for processed items. Same behaviour
# as dismiss now — delete the draft.
@app.route("/api/delete", methods=["POST"])
def api_delete():
    return api_dismiss()


@app.route("/api/telegram-sync-status")
def api_telegram_sync_status():
    """Latest telegram-sync GitHub Actions run status."""
    token = os.environ.get("GITHUB_TOKEN", "")
    repo = os.environ.get("GITHUB_REPO", "convocat/maaike.ai")
    if not token:
        return jsonify({"error": "no token"}), 500
    try:
        r = requests.get(
            f"https://api.github.com/repos/{repo}/actions/workflows/telegram-sync.yml/runs",
            headers={"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"},
            params={"per_page": 1},
            timeout=10,
        )
        runs = r.json().get("workflow_runs", [])
        if not runs:
            return jsonify({"status": "unknown"})
        run = runs[0]
        return jsonify({
            "status":     run["status"],
            "conclusion": run.get("conclusion"),
            "created_at": run["created_at"],
            "html_url":   run["html_url"],
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/sync-telegram", methods=["POST"])
def api_sync_telegram():
    """Trigger the telegram-sync workflow."""
    token = os.environ.get("GITHUB_TOKEN", "")
    repo = os.environ.get("GITHUB_REPO", "convocat/maaike.ai")
    if not token:
        return jsonify({"error": "GITHUB_TOKEN not set"}), 500
    try:
        r = requests.post(
            f"https://api.github.com/repos/{repo}/actions/workflows/telegram-sync.yml/dispatches",
            headers={"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"},
            json={"ref": "main"},
            timeout=10,
        )
        if r.status_code == 204:
            return jsonify({"ok": True, "message": "Telegram sync triggered"})
        return jsonify({"error": f"GitHub API returned {r.status_code}: {r.text}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/git-pull", methods=["POST"])
def api_git_pull():
    """Pull remote commits so the dashboard sees newly enriched drafts."""
    try:
        git_pull()
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print(f"Garden admin dashboard: http://localhost:{PORT}")
    app.run(port=PORT, debug=False)
