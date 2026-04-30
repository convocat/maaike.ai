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
CONTENT_DIR    = GARDEN_ROOT / "src/content"
WEBLINKS_DIR   = CONTENT_DIR / "weblinks"
DASHBOARD_HTML = GARDEN_ROOT / "public/mockup-ingest-dashboard.html"
PORT = 8900

# Collections reviewable in the "My content" tab
REVIEW_COLLECTIONS = ["articles", "field-notes", "seeds", "jottings", "experiments"]


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
    """All weblinks (drafts + published), sorted by date desc. Published ones
    are marked processed=True so the dashboard shows them greyed out for
    situation awareness."""
    items = []
    if not WEBLINKS_DIR.exists():
        return items
    for p in WEBLINKS_DIR.glob("*.md"):
        fm = parse_weblink(p)
        if fm:
            items.append(fm)
    items.sort(key=lambda it: str(it.get("date", "")), reverse=True)
    return items


def fm_to_item(fm, collection):
    """Shape a frontmatter dict into the item format the dashboard expects."""
    triples = fm.get("triples") or []
    associations = [
        {"subject": t[0], "predicate": t[1], "object": t[2]}
        for t in triples if isinstance(t, list) and len(t) == 3
    ]
    has_enrichment = bool(associations or fm.get("themes"))
    return {
        "slug":        fm["_slug"],
        "path":        fm["_path"],
        "collection":  collection,
        "title":       fm.get("title", ""),
        "url":         fm.get("url", ""),
        "date":        str(fm.get("date", "")),
        "updated":     str(fm.get("updated") or fm.get("date", "")),
        "reviewed":    str(fm.get("reviewed") or ""),
        "description": fm.get("description", ""),
        "tags":        fm.get("tags") or [],
        "themes":      fm.get("themes") or [],
        "associations": associations,
        "enriched":    has_enrichment,
        "processed":   collection == "weblinks" and fm.get("draft") is not True,
    }


def weblink_to_item(fm):
    return fm_to_item(fm, "weblinks")


def list_content_for_review():
    """Posts that need periodic triple review: have triples, reviewed missing or
    older than updated. Sorted by updated desc."""
    items = []
    for coll in REVIEW_COLLECTIONS:
        d = CONTENT_DIR / coll
        if not d.exists():
            continue
        for p in d.glob("*.md"):
            fm = parse_weblink(p)  # parser is generic, name is legacy
            if not fm or fm.get("draft") is True:
                continue
            triples = fm.get("triples") or []
            if not triples:
                continue  # not yet enriched — skip in review queue
            reviewed = fm.get("reviewed")
            updated = fm.get("updated") or fm.get("date")
            if reviewed and updated and str(reviewed) >= str(updated):
                continue  # already reviewed at or after last update
            items.append(fm_to_item(fm, coll))
    items.sort(key=lambda it: it["updated"], reverse=True)
    return items


# ── Frontmatter mutation ───────────────────────────────────────────────────────
TRIPLES_PATH = GARDEN_ROOT / "src/data/triples.json"


def _slugify(text: str) -> str:
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:60]


class _FlowList(list):
    """Marker type: render as flow-style YAML (inline `[a, b, c]`)."""


def _represent_flow_list(dumper, data):
    return dumper.represent_sequence("tag:yaml.org,2002:seq", data, flow_style=True)


yaml.SafeDumper.add_representer(_FlowList, _represent_flow_list)


def apply_edits(path: Path, tags, description, triples, title=None):
    """Parse the frontmatter, update fields, write it back via pyyaml.

    Preserves existing fields (and their order, since dict iteration is ordered).
    Triples are written in flow style `- [s, p, o]` to match convention.
    """
    text = path.read_text(encoding="utf-8")
    m = FRONTMATTER_RE.match(text)
    if not m:
        raise ValueError("Invalid frontmatter")
    fm = yaml.safe_load(m.group(1)) or {}
    body = m.group(2)

    if title is not None:
        fm["title"] = title
    if tags is not None:
        fm["tags"] = list(tags)
    if description is not None:
        fm["description"] = description
    if triples is not None:
        fm["triples"] = [_FlowList(list(t)) for t in triples]
    elif "triples" in fm and isinstance(fm["triples"], list):
        # Preserve flow-style for existing triples on rewrite
        fm["triples"] = [_FlowList(list(t)) if isinstance(t, list) else t for t in fm["triples"]]

    dumped = yaml.safe_dump(
        fm,
        allow_unicode=True,
        sort_keys=False,
        default_flow_style=False,
        width=10000,
    )
    new_text = f"---\n{dumped}---\n{body}"
    tmp = path.with_suffix(".tmp")
    tmp.write_text(new_text, encoding="utf-8")
    tmp.replace(path)


def sync_triples_json(slug: str, collection: str, triples):
    """Remove existing associations for this source, add the new ones."""
    if not TRIPLES_PATH.exists():
        return
    data = json.loads(TRIPLES_PATH.read_text(encoding="utf-8"))
    assocs = [a for a in data.get("associations", []) if a.get("source") != slug]
    for t in triples or []:
        assocs.append({
            "subject":    _slugify(t[0]),
            "predicate":  t[1],
            "object":     _slugify(t[2]),
            "source":     slug,
            "collection": collection,
        })
    data["associations"] = assocs
    TRIPLES_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def bump_reviewed_date(path: Path, iso_date: str):
    """Set or update `reviewed: YYYY-MM-DD` in a post's frontmatter."""
    text = path.read_text(encoding="utf-8")
    if re.search(r"^reviewed:\s*.*$", text, re.MULTILINE):
        new_text = re.sub(
            r"^reviewed:\s*.*$", f"reviewed: {iso_date}", text, count=1, flags=re.MULTILINE
        )
    else:
        # Insert `reviewed: ...` just after the opening `---`
        new_text = re.sub(
            r"^(---\s*\n)",
            r"\1" + f"reviewed: {iso_date}\n",
            text,
            count=1,
        )
    if new_text == text:
        raise ValueError("Failed to insert/update `reviewed:` field")
    tmp = path.with_suffix(".tmp")
    tmp.write_text(new_text, encoding="utf-8")
    tmp.replace(path)


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
    # Skip gracefully if there's nothing staged (no-op edit, or already reviewed today)
    status = subprocess.run(
        ["git", "diff", "--cached", "--quiet"], cwd=cwd
    )
    if status.returncode == 0:
        print(f"[admin] Nothing to commit for: {message}")
        return
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
    """Apply edits (optional) + flip draft:false + commit."""
    data = request.json
    slug = data["slug"]
    path = WEBLINKS_DIR / f"{slug}.md"
    if not path.exists():
        return jsonify({"error": f"not found: {slug}"}), 404
    try:
        # Optional edits: tags, description, triples (list of [s,p,o])
        if any(k in data for k in ("tags", "description", "triples")):
            apply_edits(path, data.get("tags"), data.get("description"), data.get("triples"), title=data.get("title"))
            if "triples" in data:
                sync_triples_json(slug, "weblinks", data["triples"])
        flip_draft_false(path)
        git_commit_push([path, TRIPLES_PATH], f"Publish weblink: {slug}")
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


@app.route("/api/content-review")
def api_content_review():
    """Return enriched posts across non-weblink collections that need review."""
    return jsonify(list_content_for_review())


@app.route("/api/mark-reviewed", methods=["POST"])
def api_mark_reviewed():
    """Stamp a post with today's date as `reviewed:` in frontmatter and commit."""
    data = request.json
    collection = data["collection"]
    slug = data["slug"]
    if collection not in REVIEW_COLLECTIONS:
        return jsonify({"error": f"collection not reviewable: {collection}"}), 400
    path = CONTENT_DIR / collection / f"{slug}.md"
    if not path.exists():
        return jsonify({"error": f"not found: {collection}/{slug}"}), 404
    from datetime import date
    today = date.today().isoformat()
    try:
        if any(k in data for k in ("tags", "description", "triples")):
            apply_edits(path, data.get("tags"), data.get("description"), data.get("triples"), title=data.get("title"))
            if "triples" in data:
                sync_triples_json(slug, collection, data["triples"])
        bump_reviewed_date(path, today)
        git_commit_push([path, TRIPLES_PATH], f"Review triples: {collection}/{slug}")
        return jsonify({"ok": True, "reviewed": today})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


SCRATCH_PATH = ADMIN_DIR / "scratch.md"


@app.route("/api/read-scratch")
def api_read_scratch():
    if not SCRATCH_PATH.exists():
        return jsonify({"content": ""})
    return jsonify({"content": SCRATCH_PATH.read_text(encoding="utf-8")})


@app.route("/api/write-scratch", methods=["POST"])
def api_write_scratch():
    data = request.json or {}
    content = data.get("content", "")
    try:
        SCRATCH_PATH.write_text(content, encoding="utf-8")
        return jsonify({"ok": True, "bytes": len(content)})
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
