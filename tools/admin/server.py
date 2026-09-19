#!/usr/bin/env python3
"""
Garden ingest admin dashboard — Flask backend (port 8900).

Three review workflows:
- Weblinks tab:    draft weblinks enriched via Telegram → approve/dismiss
- My content tab:  already-enriched posts with stale triples → mark reviewed
- Enrich tab:      TAO proposals for untagged articles → apply/skip
"""

import json
import os
import re
import subprocess
import sys
import threading
import time
import urllib.parse
from pathlib import Path

import requests
import yaml
from flask import Flask, jsonify, request, send_file

# Line-buffer stdout: the background sync-and-enrich thread's progress prints
# were sitting in Python's default block-buffer and never appearing in the
# console log until the process exited, making a stalled or crashed run
# indistinguishable from a slow one.
sys.stdout.reconfigure(line_buffering=True)

# ── Paths ──────────────────────────────────────────────────────────────────────
ADMIN_DIR      = Path(__file__).parent
GARDEN_ROOT    = ADMIN_DIR.parent.parent

# Load GITHUB_TOKEN / GITHUB_REPO / etc. from the repo-root .env — the server is
# launched as a plain `python` process (no shell profile sourcing it), so without
# this, GITHUB_TOKEN is never actually visible to os.environ and Sync Telegram
# fails silently server-side (500 "GITHUB_TOKEN not set", easy to miss as a toast).
try:
    from dotenv import load_dotenv
    load_dotenv(GARDEN_ROOT / ".env")
except ImportError:
    print("[admin] python-dotenv not installed; GITHUB_TOKEN must be set some other way")
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
        "body":        fm.get("_body", ""),
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
TRIPLES_PATH   = GARDEN_ROOT / "src/data/triples.json"
TAXONOMY_PATH  = GARDEN_ROOT / "src/data/taxonomy.json"
THEMES_PATH    = GARDEN_ROOT / "src/data/themes.json"
PROPOSALS_DIR  = GARDEN_ROOT.parent / "maaike-wiki" / "raw" / "proposals"


def _yaml_str(text: str) -> str:
    """Escape a string for use inside a YAML double-quoted scalar."""
    return text.replace("\\", "\\\\").replace('"', '\\"')


def _slugify(text: str) -> str:
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")[:60]


def _slugify_full(text: str) -> str:
    """Slugify without the 60-char cap (for weblink/video filenames)."""
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


class _FlowList(list):
    """Marker type: render as flow-style YAML (inline `[a, b, c]`)."""


def _represent_flow_list(dumper, data):
    return dumper.represent_sequence("tag:yaml.org,2002:seq", data, flow_style=True)


yaml.SafeDumper.add_representer(_FlowList, _represent_flow_list)


def _require_str_list(field_name, value):
    """Guard against a malformed AI tool-call response silently corrupting a file.

    Seen in practice: a batch enrichment run returned `themes` as a single raw
    string (leaked tool-call formatting like '<parameter name="themes">...')
    instead of a JSON array. Nothing downstream checked the type, so
    `list(a_string)` quietly exploded it into one YAML list item per
    character across a dozen files before anyone noticed. Fail loudly instead.
    """
    if not isinstance(value, list) or not all(isinstance(v, str) for v in value):
        raise ValueError(f"{field_name} must be a list of strings, got {type(value).__name__}: {value!r:.200}")


def _require_triple_list(triples):
    if not isinstance(triples, list) or not all(
        isinstance(t, (list, tuple)) and len(t) == 3 and all(isinstance(x, str) for x in t)
        for t in triples
    ):
        raise ValueError(f"triples must be a list of [subject, predicate, object] string triples, got: {triples!r:.200}")


def apply_edits(path: Path, tags, description, triples, title=None, themes=None, open_questions=None, body=None, url=None):
    """Parse the frontmatter, update fields, write it back via pyyaml.

    Preserves existing fields (and their order, since dict iteration is ordered).
    Triples are written in flow style `- [s, p, o]` to match convention.
    Pass body=str to replace the markdown body; omit/None to preserve existing.
    """
    text = path.read_text(encoding="utf-8")
    m = FRONTMATTER_RE.match(text)
    if not m:
        raise ValueError("Invalid frontmatter")
    fm = yaml.safe_load(m.group(1)) or {}
    existing_body = m.group(2)

    if title is not None:
        fm["title"] = title
    if url is not None:
        fm["url"] = url
    if tags is not None:
        _require_str_list("tags", tags)
        fm["tags"] = list(tags)
    if description is not None:
        fm["description"] = description
    if themes is not None:
        _require_str_list("themes", themes)
        fm["themes"] = list(themes)
    if open_questions is not None:
        _require_str_list("open_questions", open_questions)
        fm["open_questions"] = list(open_questions)
    if triples is not None:
        _require_triple_list(triples)
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
    new_body = (body if body is not None else existing_body)
    # Ensure a single blank line separates frontmatter from body when body is non-empty
    separator = "\n" if new_body.strip() else ""
    new_text = f"---\n{dumped}---\n{separator}{new_body}"
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
    """Set `draft: true` → `draft: false` in a weblink file.
    No-op if draft is already false or missing."""
    text = path.read_text(encoding="utf-8")
    new_text = re.sub(
        r"^draft:\s*true\s*$",
        "draft: false",
        text,
        count=1,
        flags=re.MULTILINE,
    )
    if new_text == text:
        return  # already false or field absent — nothing to do
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
    resp = send_file(str(DASHBOARD_HTML))
    resp.headers["Cache-Control"] = "no-store"
    return resp


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
        # Optional edits: tags, description, body, triples, themes, url
        if any(k in data for k in ("tags", "description", "triples", "body", "themes", "url")):
            apply_edits(
                path,
                data.get("tags"),
                data.get("description"),
                data.get("triples"),
                title=data.get("title"),
                themes=data.get("themes") or None,
                body=data.get("body"),
                url=data.get("url"),
            )
            if "triples" in data:
                sync_triples_json(slug, "weblinks", data["triples"])
            if data.get("themes"):
                _update_themes_json(slug, data["themes"])
        flip_draft_false(path)
        commit_files = [path, TRIPLES_PATH]
        if data.get("themes"):
            commit_files.append(THEMES_PATH)
        git_commit_push(commit_files, f"Publish weblink: {slug}")
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


@app.route("/api/save-edits", methods=["POST"])
def api_save_edits():
    """Persist edits (title, tags, description, body, triples, themes) to the
    weblink frontmatter WITHOUT flipping draft and WITHOUT committing.
    Lets the reviewer edit a draft over multiple sessions before publishing."""
    data = request.json or {}
    slug = data.get("slug")
    if not slug:
        return jsonify({"error": "slug required"}), 400
    path = WEBLINKS_DIR / f"{slug}.md"
    if not path.exists():
        return jsonify({"error": f"not found: {slug}"}), 404
    try:
        apply_edits(
            path,
            data.get("tags"),
            data.get("description"),
            data.get("triples"),
            title=data.get("title"),
            themes=data.get("themes") or None,
            body=data.get("body"),
        )
        if "triples" in data:
            sync_triples_json(slug, "weblinks", data["triples"])
        if data.get("themes"):
            _update_themes_json(slug, data["themes"])
        return jsonify({"ok": True, "slug": slug})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


_VIDEO_HOST_RE = re.compile(
    r"^https?://(?:www\.|m\.)?(?:youtube\.com/(?:watch|shorts|embed|live)|youtu\.be/|vimeo\.com/)",
    re.IGNORECASE,
)


@app.route("/api/convert-to-video", methods=["POST"])
def api_convert_to_video():
    """Move a draft weblink into the videos collection.

    Renames the file based on the current title (slugified, no cap), updates
    the `source` slug + `collection` on its associations in triples.json,
    renames its themes.json key, and commits the move. Keeps draft: true so
    the reviewer still controls when the post goes live (publish via Approve
    after the convert, which now operates on the videos file).
    """
    data = request.json or {}
    slug = data.get("slug")
    if not slug:
        return jsonify({"error": "slug required"}), 400
    src = WEBLINKS_DIR / f"{slug}.md"
    if not src.exists():
        return jsonify({"error": f"not found: {slug}"}), 404

    fm = parse_weblink(src) or {}
    url = (fm.get("url") or "").strip()
    if not _VIDEO_HOST_RE.match(url):
        return jsonify({"error": f"URL does not look like a video host: {url!r}"}), 400

    # Pick the new slug: prefer caller's slug override, else slugify title.
    title = (data.get("title") or fm.get("title") or "").strip()
    new_slug = (data.get("new_slug") or _slugify_full(title) or slug).strip("-")
    if not new_slug:
        return jsonify({"error": "could not derive a slug from the title"}), 400

    videos_dir = CONTENT_DIR / "videos"
    videos_dir.mkdir(parents=True, exist_ok=True)
    dst = videos_dir / f"{new_slug}.md"
    if dst.exists() and dst.resolve() != src.resolve():
        return jsonify({"error": f"target already exists: videos/{new_slug}.md"}), 409

    cwd = str(GARDEN_ROOT)
    try:
        # Use git mv when possible so history follows the rename
        rel_src = str(src.relative_to(GARDEN_ROOT))
        rel_dst = str(dst.relative_to(GARDEN_ROOT))
        mv = subprocess.run(
            ["git", "mv", rel_src, rel_dst], cwd=cwd, capture_output=True, text=True
        )
        if mv.returncode != 0:
            # Fall back to a plain rename if git mv complained (e.g. untracked)
            src.rename(dst)
    except Exception as e:
        return jsonify({"error": f"move failed: {e}"}), 500

    # Optional title rewrite (in case the reviewer edited it client-side and
    # passed it along — same code path apply_edits uses elsewhere).
    if title and title != fm.get("title"):
        try:
            apply_edits(dst, None, None, None, title=title)
        except Exception:
            pass

    # Rewrite triples.json: change source slug + collection for matching rows
    try:
        if TRIPLES_PATH.exists():
            tdata = json.loads(TRIPLES_PATH.read_text(encoding="utf-8"))
            changed = 0
            for a in tdata.get("associations", []):
                if a.get("source") == slug and a.get("collection") in (None, "weblinks"):
                    a["source"] = new_slug
                    a["collection"] = "videos"
                    changed += 1
            if changed:
                TRIPLES_PATH.write_text(
                    json.dumps(tdata, indent=2, ensure_ascii=False) + "\n",
                    encoding="utf-8",
                )
    except Exception as e:
        print(f"[admin] triples.json rewrite failed: {e}")

    # Rename themes.json key if present
    try:
        if THEMES_PATH.exists():
            th = json.loads(THEMES_PATH.read_text(encoding="utf-8"))
            if slug in th:
                th[new_slug] = th.pop(slug)
                THEMES_PATH.write_text(
                    json.dumps(th, indent=2, ensure_ascii=False) + "\n",
                    encoding="utf-8",
                )
    except Exception as e:
        print(f"[admin] themes.json rewrite failed: {e}")

    git_commit_push(
        [dst, src, TRIPLES_PATH, THEMES_PATH],
        f"Convert weblink to video: {slug} -> {new_slug}",
    )
    return jsonify({
        "ok": True,
        "old_slug": slug,
        "new_slug": new_slug,
        "new_path": str(dst.relative_to(GARDEN_ROOT)).replace("\\", "/"),
    })


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


def _dispatch_telegram_sync():
    """Trigger the telegram-sync GitHub Actions workflow. Returns a dict with
    either {"ok": True} or {"error": "..."} — never raises."""
    token = os.environ.get("GITHUB_TOKEN", "")
    repo = os.environ.get("GITHUB_REPO", "convocat/maaike.ai")
    if not token:
        return {"error": "GITHUB_TOKEN not set"}
    try:
        r = requests.post(
            f"https://api.github.com/repos/{repo}/actions/workflows/telegram-sync.yml/dispatches",
            headers={"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"},
            json={"ref": "main"},
            timeout=10,
        )
        if r.status_code == 204:
            return {"ok": True}
        return {"error": f"GitHub API returned {r.status_code}: {r.text}"}
    except Exception as e:
        return {"error": str(e)}


@app.route("/api/sync-telegram", methods=["POST"])
def api_sync_telegram():
    """Trigger the telegram-sync workflow (button-triggered; polling + enrich
    loop happens client-side in the dashboard JS)."""
    result = _dispatch_telegram_sync()
    if result.get("error"):
        return jsonify(result), 500
    return jsonify({"ok": True, "message": "Telegram sync triggered"})


def _run_telegram_sync_and_enrich(source="manual"):
    """Dispatch telegram-sync, wait for it to finish, pull, then auto-enrich
    every draft that isn't enriched yet. Blocking — call from a background
    thread for startup use, or synchronously for a request that should wait.

    This is the server-side twin of the dashboard's "Sync Telegram" button
    (which does the same steps client-side via polling). Having it here lets
    it run automatically when the server starts, not just on a button click.
    """
    print(f"[sync] starting ({source})")
    dispatch = _dispatch_telegram_sync()
    if dispatch.get("error"):
        print(f"[sync] dispatch failed: {dispatch['error']}")
        return dispatch

    token = os.environ.get("GITHUB_TOKEN", "")
    repo = os.environ.get("GITHUB_REPO", "convocat/maaike.ai")
    conclusion = None
    for _ in range(90):  # poll for up to ~6 minutes, matching the dashboard's own timeout
        time.sleep(4)
        try:
            r = requests.get(
                f"https://api.github.com/repos/{repo}/actions/workflows/telegram-sync.yml/runs",
                headers={"Authorization": f"token {token}", "Accept": "application/vnd.github.v3+json"},
                params={"per_page": 1},
                timeout=10,
            )
            runs = r.json().get("workflow_runs", [])
            if runs and runs[0]["status"] == "completed":
                conclusion = runs[0].get("conclusion")
                break
        except Exception as e:
            print(f"[sync] poll error: {e}")

    if conclusion != "success":
        print(f"[sync] workflow did not finish successfully (conclusion={conclusion})")
        return {"error": f"workflow conclusion: {conclusion}"}

    try:
        git_pull()
    except Exception as e:
        print(f"[sync] git pull failed: {e}")
        return {"error": f"git pull failed: {e}"}

    items = [weblink_to_item(fm) for fm in list_drafts()]
    unenriched = [it for it in items if not it["processed"] and not it["enriched"]]
    print(f"[sync] {len(unenriched)} draft(s) to enrich")
    for it in unenriched:
        err = _enrich_and_save_slug(it["slug"])
        if err:
            print(f"[sync] enrich failed for {it['slug']}: {err}")
    print(f"[sync] done ({source}), {len(unenriched)} draft(s) enriched")
    return {"ok": True, "enriched": len(unenriched)}


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


@app.route("/api/save-as-book", methods=["POST"])
def api_save_as_book():
    """Create a library entry from a weblink and optionally dismiss the weblink."""
    from datetime import date as _date
    data   = request.json or {}
    title  = (data.get("title") or "").strip()
    author = (data.get("author") or "").strip()
    status = data.get("status", "to-read")
    weblink_slug = (data.get("weblink_slug") or "").strip()

    if not title:
        return jsonify({"error": "title required"}), 400
    if not author:
        return jsonify({"error": "author required"}), 400
    if status not in ("to-read", "reading", "read"):
        status = "to-read"

    lib_dir = CONTENT_DIR / "library"
    slug = _slugify(title)
    path = lib_dir / f"{slug}.md"
    counter = 1
    while path.exists():
        path = lib_dir / f"{slug}-{counter}.md"
        counter += 1

    today = _date.today().isoformat()
    content = (
        f'---\n'
        f'title: "{_yaml_str(title)}"\n'
        f'author: "{_yaml_str(author)}"\n'
        f'date: {today}\n'
        f'updated:\n'
        f'maturity: draft\n'
        f'status: {status}\n'
        f'tags: []\n'
        f'description: ""\n'
        f'draft: false\n'
        f'ai: "100% Maai"\n'
        f'---\n'
    )
    try:
        lib_dir.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")

        commit_files = [path]

        # Dismiss the source weblink if it was still a draft
        if weblink_slug:
            wl_path = WEBLINKS_DIR / f"{weblink_slug}.md"
            if wl_path.exists():
                wl_fm = parse_weblink(wl_path)
                if wl_fm and wl_fm.get("draft") is True:
                    wl_path.unlink()
                    commit_files.append(wl_path)

        git_commit_push(commit_files, f"Add to library (to-read): {path.stem}")
        return jsonify({"ok": True, "slug": path.stem})
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


# ── Enrich: proposal helpers ───────────────────────────────────────────────────

def _update_taxonomy_json(new_topics):
    """Add new topic stubs to taxonomy.json (definition left blank)."""
    if not TAXONOMY_PATH.exists():
        return
    data = json.loads(TAXONOMY_PATH.read_text(encoding="utf-8"))
    topics = data.get("topics", {})
    for topic in new_topics:
        tslug = topic["label"].lower().replace(" ", "-")
        if tslug not in topics:
            topics[tslug] = {"label": topic["label"], "type": topic["type"], "definition": ""}
    data["topics"] = topics
    TAXONOMY_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _update_themes_json(slug, themes):
    """Set themes for a post slug in themes.json."""
    data = json.loads(THEMES_PATH.read_text(encoding="utf-8")) if THEMES_PATH.exists() else {}
    if themes:
        _require_str_list("themes", themes)
        data[slug] = themes
    THEMES_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def _mark_proposal_applied(slug, status="applied"):
    path = PROPOSALS_DIR / f"{slug}.json"
    if not path.exists():
        return
    p = json.loads(path.read_text(encoding="utf-8"))
    p["status"] = status
    path.write_text(json.dumps(p, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


# ── Enrich: API routes ─────────────────────────────────────────────────────────

@app.route("/api/proposals")
def api_proposals():
    """Return all proposals with lightweight metadata for the queue."""
    if not PROPOSALS_DIR.exists():
        return jsonify([])
    items = []
    for f in sorted(PROPOSALS_DIR.glob("*.json"), key=lambda x: x.stat().st_mtime, reverse=True):
        try:
            d = json.loads(f.read_text(encoding="utf-8"))
            ext = d.get("extracted", {})
            # Pull date from article frontmatter for sorting
            slug = d.get("slug", f.stem)
            date = ""
            for coll in ("articles", "field-notes", "seeds"):
                ap = CONTENT_DIR / coll / f"{slug}.md"
                if ap.exists():
                    m = re.search(r"^date:\s*(.+)$", ap.read_text(encoding="utf-8", errors="ignore"), re.MULTILINE)
                    if m:
                        date = m.group(1).strip().strip("\"'")
                    break
            items.append({
                "slug":     slug,
                "title":    d.get("title", slug),
                "status":   d.get("status", "pending"),
                "date":     date,
                "argument": (ext.get("argument") or "")[:120],
            })
        except Exception:
            pass
    return jsonify(items)


@app.route("/api/proposals/<slug>")
def api_proposal(slug):
    """Return the full proposal JSON for one article."""
    path = PROPOSALS_DIR / f"{slug}.json"
    if not path.exists():
        return jsonify({"error": f"not found: {slug}"}), 404
    try:
        return jsonify(json.loads(path.read_text(encoding="utf-8")))
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/article/<slug>")
def api_article(slug):
    """Return the article body text for display in the enrich panel."""
    for coll in ("articles", "field-notes", "seeds", "jottings", "experiments"):
        path = CONTENT_DIR / coll / f"{slug}.md"
        if path.exists():
            text = path.read_text(encoding="utf-8", errors="ignore")
            m = re.match(r"^---\s*\n(.*?)\n---\s*\n?(.*)", text, re.DOTALL)
            if m:
                body = m.group(2).strip()
            else:
                body = text.strip()
            return jsonify({"slug": slug, "collection": coll, "body": body})
    return jsonify({"error": f"not found: {slug}"}), 404


@app.route("/api/apply-proposal", methods=["POST"])
def api_apply_proposal():
    """Apply accepted TAO items to article frontmatter + central JSON files + commit."""
    import traceback
    data = request.json
    slug = data["slug"]
    accepted = data.get("accepted", {})

    # Resolve article path across collections
    article_path = None
    for coll in ("articles", "field-notes", "seeds"):
        p = CONTENT_DIR / coll / f"{slug}.md"
        if p.exists():
            article_path = p
            collection = coll
            break
    if not article_path:
        return jsonify({"error": f"article not found: {slug}"}), 404

    try:
        msgs = []
        accepted_tags      = accepted.get("tags", [])
        accepted_assocs    = accepted.get("associations", [])
        accepted_themes    = accepted.get("themes", [])
        accepted_topics    = accepted.get("topics", [])
        accepted_questions = accepted.get("open_questions", [])

        # Read existing frontmatter to merge (don't overwrite what's already there)
        text = article_path.read_text(encoding="utf-8")
        m = FRONTMATTER_RE.match(text)
        fm = yaml.safe_load(m.group(1)) if m else {}

        merged_tags = list(dict.fromkeys((fm.get("tags") or []) + accepted_tags))

        existing_triples = fm.get("triples") or []
        existing_set = {(t[0], t[1], t[2]) for t in existing_triples if isinstance(t, list) and len(t) == 3}
        for a in accepted_assocs:
            key = (a["subject"], a["predicate"], a["object"])
            if key not in existing_set:
                existing_triples.append(list(key))
                existing_set.add(key)

        apply_edits(article_path, merged_tags, None, existing_triples,
                    themes=accepted_themes or None,
                    open_questions=accepted_questions or None)
        msgs.append(f"Frontmatter: {len(merged_tags)} tags, {len(existing_triples)} triples, {len(accepted_themes)} themes, {len(accepted_questions)} questions")

        # triples.json: associations + new topic stubs
        sync_triples_json(slug, collection, [[a["subject"], a["predicate"], a["object"]] for a in accepted_assocs])
        if TRIPLES_PATH.exists() and accepted_topics:
            tdata = json.loads(TRIPLES_PATH.read_text(encoding="utf-8"))
            tp = tdata.get("topics", {})
            for topic in accepted_topics:
                if topic.get("is_new"):
                    tslug = topic["label"].lower().replace(" ", "-")
                    if tslug not in tp:
                        tp[tslug] = {"label": topic["label"], "type": topic["type"]}
            tdata["topics"] = tp
            TRIPLES_PATH.write_text(json.dumps(tdata, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        msgs.append(f"triples.json: {len([t for t in accepted_topics if t.get('is_new')])} new topics, {len(accepted_assocs)} associations")

        # taxonomy.json: new stubs with empty definitions
        new_topics = [t for t in accepted_topics if t.get("is_new")]
        if new_topics:
            _update_taxonomy_json(new_topics)
            msgs.append(f"taxonomy.json: {len(new_topics)} new stubs")

        # themes.json
        if accepted_themes:
            _update_themes_json(slug, accepted_themes)
            msgs.append(f"themes.json: {len(accepted_themes)} themes")

        # Mark proposal applied
        _mark_proposal_applied(slug)

        # Commit all changed files
        commit_files = [article_path, TRIPLES_PATH]
        if accepted_themes:
            commit_files.append(THEMES_PATH)
        if new_topics:
            commit_files.append(TAXONOMY_PATH)
        git_commit_push(commit_files, f"Enrich article: {slug}")

        return jsonify({"ok": True, "messages": msgs})

    except Exception as e:
        return jsonify({"ok": False, "error": str(e), "trace": traceback.format_exc()}), 500


@app.route("/api/skip-proposal", methods=["POST"])
def api_skip_proposal():
    """Mark a proposal as skipped (no file writes, no commit)."""
    data = request.json
    slug = data.get("slug", "")
    try:
        _mark_proposal_applied(slug, status="skipped")
        return jsonify({"ok": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Weblink enrichment via Anthropic API ──────────────────────────────────────
# For on-demand, user-triggered enrichment of individual draft weblinks.
# Uses claude-haiku-4-5 to keep per-call costs low.
# NEVER call in a loop, from CI, or from any automated workflow.

WEBLINK_EXTRACTION_TOOL = {
    "name": "save_weblink_enrichment",
    "description": "Save structured enrichment data for a weblink.",
    "input_schema": {
        "type": "object",
        "properties": {
            "description": {
                "type": "string",
                "description": "2-3 sentence summary of what the source argues. No em-dashes.",
            },
            "themes": {
                "type": "array",
                "items": {"type": "string"},
                "description": "2-4 opinionated theme statements. No em-dashes.",
            },
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "2-5 kebab-case tag slugs. Reuse existing where possible.",
            },
            "topics": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "label": {"type": "string"},
                        "type": {"type": "string"},
                        "is_new": {"type": "boolean"},
                    },
                    "required": ["label", "type", "is_new"],
                },
                "description": "Named topics: people, technologies, concepts. is_new=true if not in existing taxonomy.",
            },
            "associations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "subject": {"type": "string"},
                        "predicate": {"type": "string"},
                        "object": {"type": "string"},
                    },
                    "required": ["subject", "predicate", "object"],
                },
                "description": "3-6 typed S-P-O relationships using the allowed predicate vocabulary.",
            },
        },
        "required": ["description", "themes", "tags", "topics", "associations"],
    },
}


def _resolve_linkedin_redirect(url: str) -> str:
    """LinkedIn share links (lnkd.in shortlinks, linkedin.com/redir/redirect interstitials)
    don't HTTP-redirect to the real target — they serve a small React shell (200 OK,
    title "LinkedIn", meta description "This link will take you to a page that's not on
    LinkedIn") whose only real-world outbound link is an <a href> to the actual
    destination. Follow it (and one more hop, since that destination is sometimes itself
    a tracking shortlink) so enrichment describes the actual source."""
    host = urllib.parse.urlsplit(url).netloc.lower()
    if not (host == "lnkd.in" or host.endswith(".lnkd.in") or "linkedin.com" in host):
        return url
    headers = {"User-Agent": "Mozilla/5.0 (compatible; GardenBot/1.0)"}
    try:
        r = requests.get(url, timeout=10, headers=headers, allow_redirects=True)
        final_host = urllib.parse.urlsplit(r.url).netloc.lower()
        if "linkedin.com" not in final_host and final_host != host:
            return r.url  # a plain HTTP redirect already took us off LinkedIn

        def _off_linkedin(href: str) -> bool:
            h = urllib.parse.urlsplit(href).netloc.lower()
            return bool(h) and "linkedin.com" not in h and "licdn.com" not in h

        for href in re.findall(r'href="(https?://[^"]+)"', r.text):
            if _off_linkedin(href):
                try:
                    r2 = requests.get(href, timeout=10, headers=headers, allow_redirects=True)
                    return r2.url
                except Exception:
                    return href
        return url
    except Exception:
        return url


# Generic platform titles left over from a stub that only ever captured the
# LinkedIn/social interstitial's own <title> — same list the pre-commit
# validator (scripts/validate-content.mjs) rejects weblinks for. Keep in sync.
GENERIC_TITLES = {"linkedin", "youtube", "- youtube", "twitter", "instagram", "facebook", "x"}


def _fetch_page_text(url: str, max_chars: int = 6000) -> tuple[str, str, str]:
    """Fetch a URL and return (stripped plain text, resolved url, page title).

    Resolved url differs from the input only when the input was a LinkedIn
    redirect/shortlink that pointed somewhere else. page_title is the resolved
    page's own <title>, empty string if none found — used to replace a stub
    title like "LinkedIn" that was scraped off the wrapper page, not the
    actual source (the validator rejects those generic titles on approve).
    """
    import html as html_lib
    resolved_url = _resolve_linkedin_redirect(url)
    headers = {"User-Agent": "Mozilla/5.0 (compatible; GardenBot/1.0)"}
    r = requests.get(resolved_url, timeout=15, headers=headers, allow_redirects=True)
    r.raise_for_status()
    raw = r.text
    title_match = re.search(r"<title[^>]*>(.*?)</title>", raw, re.DOTALL | re.IGNORECASE)
    page_title = html_lib.unescape(re.sub(r"\s+", " ", title_match.group(1))).strip() if title_match else ""
    content = re.sub(r"<(script|style)[^>]*>.*?</(script|style)>", " ", raw, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r"<[^>]+>", " ", content)
    content = html_lib.unescape(content)
    content = re.sub(r"\s+", " ", content).strip()
    return content[:max_chars], resolved_url, page_title


def _load_topics_for_prompt() -> str:
    if not TRIPLES_PATH.exists():
        return "(none)"
    data = json.loads(TRIPLES_PATH.read_text(encoding="utf-8"))
    topics = data.get("topics", {})
    lines = [
        f"  {slug}: {v.get('label', slug)} ({v.get('type', '?')})"
        for slug, v in list(topics.items())[:80]
    ]
    return "\n".join(lines) or "(none)"


def _load_tags_for_prompt() -> str:
    tags_dir = GARDEN_ROOT / "src/content/tags"
    if not tags_dir.exists():
        return "(none)"
    slugs = [f.stem for f in sorted(tags_dir.glob("*.md"))[:60]]
    return ", ".join(slugs) or "(none)"


def _build_weblink_prompt(title: str, url: str, page_text: str, topics_str: str, tags_str: str) -> str:
    return f"""You are enriching a weblink for Maaike Groenewege's digital garden (maaike.ai). Maaike is a conversation designer who writes about AI, conversational interfaces, language, and design.

## Source

**Title:** {title}
**URL:** {url}

## Page content

---
{page_text}
---

## Your task

Perform a three-pass TAO analysis:

**Pass 1 (Thematic read):** What is the central argument and 2-4 overarching themes?

**Pass 2 (TAO extraction):**

Topics: named people, technologies, concepts worth knowing about. Assign ONE type from:
`person` `technology` `technology-category` `technical-mechanism` `technical-phenomenon` `philosophical-method` `philosophical-framework` `philosophical-concept` `epistemological-concept` `epistemic-stance` `cognitive-tendency` `belief-type` `linguistic-concept` `linguistic-principle` `communication-type` `theoretical-concept` `interaction-metaphor` `design-discipline` `methodology` `concept` `phenomenon` `principle` `discipline`

Mark `is_new: false` if already in the taxonomy below. Mark `is_new: true` if genuinely new.

**Existing taxonomy topics:**
{topics_str}

Associations: 3-6 typed S-P-O relationships. Use ONLY these predicates:
`attributed-to` `structured-as` `counters` `reinforces` `contrasted-with` `demonstrates` `lacks` `caused-by` `metaphor-for` `inaccessible-via` `instance-of` `characterised-as` `coined-by` `defined-as` `theorised-by` `exhibits` `violates` `presupposes` `leads-to` `breaks-down-for` `better-fits` `risks` `incompatible-with` `generates` `requires`

Tags: 2-5 kebab-case slugs. Reuse from existing where possible.
**Existing tags:** {tags_str}

**Pass 3 (Coherence check):** Remove associations that don't reflect the source's actual argument.

**Style rule:** Never use em-dashes in any generated text. Use commas, colons, or periods instead.

Call save_weblink_enrichment with your complete analysis."""


@app.route("/api/enrich-weblink", methods=["POST"])
def api_enrich_weblink():
    """Call Anthropic API to enrich a single draft weblink.
    User-triggered only. Returns proposal for review before apply."""
    try:
        import anthropic
    except ImportError:
        return jsonify({"error": "anthropic package not installed"}), 500

    data = request.json or {}
    slug = data.get("slug", "").strip()
    if not slug:
        return jsonify({"error": "slug required"}), 400

    path = WEBLINKS_DIR / f"{slug}.md"
    if not path.exists():
        return jsonify({"error": f"not found: {slug}"}), 404

    fm = parse_weblink(path)
    if not fm:
        return jsonify({"error": "could not parse frontmatter"}), 500

    url = fm.get("url", "")
    title = fm.get("title", slug)
    if not url:
        return jsonify({"error": "no URL in weblink frontmatter"}), 400

    try:
        page_text, resolved_url, page_title = _fetch_page_text(url)
    except Exception as e:
        return jsonify({"error": f"fetch failed: {e}"}), 500

    prompt = _build_weblink_prompt(
        title, resolved_url, page_text,
        _load_topics_for_prompt(),
        _load_tags_for_prompt(),
    )

    try:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=2048,
            tools=[WEBLINK_EXTRACTION_TOOL],
            tool_choice={"type": "tool", "name": "save_weblink_enrichment"},
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as e:
        return jsonify({"error": f"API call failed: {e}"}), 500

    for block in response.content:
        if block.type == "tool_use" and block.name == "save_weblink_enrichment":
            result = {"ok": True, "slug": slug, "proposal": block.input}
            if resolved_url != url:
                result["resolved_url"] = resolved_url
            if title.strip().lower() in GENERIC_TITLES and page_title:
                result["resolved_title"] = page_title
            return jsonify(result)

    return jsonify({"error": "no tool_use block in API response"}), 500


def _enrich_and_save_slug(slug: str):
    """Enrich one draft weblink and write the result directly to its frontmatter.
    User-triggered only (button click, or the sync-and-enrich flow that a button
    click or server startup kicks off) — never called from CI. Does not publish.

    Returns None on success, or an error string on failure. Never raises.
    """
    try:
        import anthropic
    except ImportError:
        return "anthropic package not installed"

    path = WEBLINKS_DIR / f"{slug}.md"
    if not path.exists():
        return f"not found: {slug}"

    fm = parse_weblink(path)
    if not fm:
        return "could not parse frontmatter"

    url = fm.get("url", "")
    title = fm.get("title", slug)
    if not url:
        return "no URL in weblink frontmatter"

    try:
        page_text, resolved_url, page_title = _fetch_page_text(url)
    except Exception as e:
        return f"fetch failed: {e}"

    prompt = _build_weblink_prompt(
        title, resolved_url, page_text,
        _load_topics_for_prompt(),
        _load_tags_for_prompt(),
    )

    try:
        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-haiku-4-5-20251001",
            max_tokens=2048,
            tools=[WEBLINK_EXTRACTION_TOOL],
            tool_choice={"type": "tool", "name": "save_weblink_enrichment"},
            messages=[{"role": "user", "content": prompt}],
        )
    except Exception as e:
        return f"API call failed: {e}"

    for block in response.content:
        if block.type == "tool_use" and block.name == "save_weblink_enrichment":
            # A malformed tool-call response (seen in practice: `themes` coming back
            # as a raw string of leaked tool-call formatting instead of a JSON array)
            # must not corrupt this file or the shared JSON stores. Validate everything
            # before writing anything, and never let an exception here escape to the
            # caller — a batch run must treat this as "this one item failed", not crash.
            try:
                p = block.input
                tags = p.get("tags") or []
                description = p.get("description") or None
                themes = p.get("themes") or None
                assocs = p.get("associations") or []
                if not isinstance(assocs, list):
                    return f"malformed API response: associations was {type(assocs).__name__}, not a list"
                triples = [[a["subject"], a["predicate"], a["object"]] for a in assocs]
                new_title = page_title if (title.strip().lower() in GENERIC_TITLES and page_title) else None
                apply_edits(
                    path, tags or None, description, triples or None, themes=themes or None,
                    url=resolved_url if resolved_url != url else None,
                    title=new_title,
                )
                if triples:
                    sync_triples_json(slug, "weblinks", triples)
                if themes:
                    _update_themes_json(slug, themes)
                return None
            except Exception as e:
                return f"malformed API response, nothing written: {e}"

    return "no tool_use block in API response"


@app.route("/api/enrich-and-save", methods=["POST"])
def api_enrich_and_save():
    """Enrich a draft weblink and write result directly to frontmatter.
    User-triggered only (called by syncTelegram after pull). Does not publish."""
    data = request.json or {}
    slug = data.get("slug", "").strip()
    if not slug:
        return jsonify({"error": "slug required"}), 400
    err = _enrich_and_save_slug(slug)
    if err:
        return jsonify({"error": err}), 500
    return jsonify({"ok": True, "slug": slug})


if __name__ == "__main__":
    print(f"Garden admin dashboard: http://localhost:{PORT}")
    # Auto-trigger a Telegram sync + enrich pass every time the dashboard starts,
    # so drafts are enriched before you ever open the queue instead of waiting on
    # a button click or the nightly task. Runs in a background thread so it
    # doesn't delay the server coming up; progress prints to this console.
    threading.Thread(target=_run_telegram_sync_and_enrich, args=("startup",), daemon=True).start()
    app.run(port=PORT, debug=False)
