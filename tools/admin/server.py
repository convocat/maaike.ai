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


class _FlowList(list):
    """Marker type: render as flow-style YAML (inline `[a, b, c]`)."""


def _represent_flow_list(dumper, data):
    return dumper.represent_sequence("tag:yaml.org,2002:seq", data, flow_style=True)


yaml.SafeDumper.add_representer(_FlowList, _represent_flow_list)


def apply_edits(path: Path, tags, description, triples, title=None, themes=None, body=None):
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
    if tags is not None:
        fm["tags"] = list(tags)
    if description is not None:
        fm["description"] = description
    if themes is not None:
        fm["themes"] = list(themes)
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
        # Optional edits: tags, description, body, triples (list of [s,p,o])
        if any(k in data for k in ("tags", "description", "triples", "body")):
            apply_edits(
                path,
                data.get("tags"),
                data.get("description"),
                data.get("triples"),
                title=data.get("title"),
                body=data.get("body"),
            )
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
        accepted_tags   = accepted.get("tags", [])
        accepted_assocs = accepted.get("associations", [])
        accepted_themes = accepted.get("themes", [])
        accepted_topics = accepted.get("topics", [])

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

        apply_edits(article_path, merged_tags, None, existing_triples, themes=accepted_themes or None)
        msgs.append(f"Frontmatter: {len(merged_tags)} tags, {len(existing_triples)} triples, {len(accepted_themes)} themes")

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


# ── Weblink enrichment via Anthropic API ───────────────────────────────────────

WEBLINK_EXTRACTION_TOOL = {
    "name": "save_weblink_enrichment",
    "description": "Save the TAO enrichment result for a weblink.",
    "input_schema": {
        "type": "object",
        "properties": {
            "summary": {
                "type": "string",
                "description": "2-3 sentence summary of the source's central argument. Focus on the claim, not a description of the article.",
            },
            "themes": {
                "type": "array",
                "items": {"type": "string"},
                "description": "2-4 opinionated one-liner theme statements about what the source argues.",
            },
            "topics": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "label": {"type": "string"},
                        "type":  {"type": "string"},
                        "is_new": {"type": "boolean"},
                    },
                    "required": ["label", "type", "is_new"],
                },
                "description": "Named things worth knowing about. is_new=true if not in existing taxonomy.",
            },
            "associations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "subject":   {"type": "string"},
                        "predicate": {"type": "string"},
                        "object":    {"type": "string"},
                    },
                    "required": ["subject", "predicate", "object"],
                },
                "description": "3-7 typed S-P-O relationships using only the allowed predicate vocabulary.",
            },
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "2-6 kebab-cased tag slugs.",
            },
        },
        "required": ["summary", "themes", "topics", "associations", "tags"],
    },
}


def _fetch_page_text(url: str) -> tuple[str, str]:
    """Fetch a URL and return (title, body_text). title falls back to domain."""
    import html as html_mod
    title = ""
    body  = ""
    try:
        r = requests.get(url, timeout=15, headers={"User-Agent": "Mozilla/5.0"})
        r.raise_for_status()
        raw = r.text

        t_match = re.search(r"<title[^>]*>([^<]+)</title>", raw, re.IGNORECASE)
        if t_match:
            title = html_mod.unescape(t_match.group(1).strip())

        # Strip scripts, styles, then tags — keep text nodes
        clean = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", raw, flags=re.DOTALL | re.IGNORECASE)
        clean = re.sub(r"<[^>]+>", " ", clean)
        clean = re.sub(r"&[a-z#0-9]+;", " ", clean)
        clean = re.sub(r"\s+", " ", clean).strip()
        body  = clean[:8000]
    except Exception as exc:
        print(f"[enrich] fetch failed for {url}: {exc}")
    return title, body


def _load_topics_for_prompt() -> str:
    if not TRIPLES_PATH.exists():
        return ""
    data = json.loads(TRIPLES_PATH.read_text(encoding="utf-8"))
    lines = [
        f"  {slug}: {v.get('label', slug)} ({v.get('type', '?')})"
        for slug, v in list(data.get("topics", {}).items())[:80]
    ]
    return "\n".join(lines)


def _load_tags_for_prompt() -> str:
    tags_dir = CONTENT_DIR / "tags"
    if not tags_dir.exists():
        return ""
    slugs = [p.stem for p in sorted(tags_dir.glob("*.md"))]
    return ", ".join(slugs[:80])


def _build_weblink_prompt(url: str, title: str, body: str) -> str:
    topics_ctx = _load_topics_for_prompt()
    tags_ctx   = _load_tags_for_prompt()
    return f"""You are performing a TAO (Thematic-Associations-Occurrences) enrichment pass on an external source that Maaike Groenewege (conversation designer, maaike.ai) has bookmarked for her digital garden.

## Source

**URL:** {url}
**Title:** {title}

**Page text (first 8000 chars):**
---
{body}
---

## Task

Run a three-pass analysis:

**Pass 1 — Thematic read:** What are the 2-4 overarching themes? What is the central argument?

**Pass 2 — TAO extraction:**
- Topics: people, technologies, concepts, frameworks. Assign ONE type from: `person` `technology` `mechanism` `phenomenon` `discipline` `concept` `metaphor` `principle` `method`
- Mark `is_new: false` if found in existing taxonomy, `is_new: true` if genuinely new.
- Associations: 3-7 typed S-P-O relationships. Use ONLY these predicates: `attributed-to` `structured-as` `counters` `reinforces` `contrasted-with` `demonstrates` `lacks` `caused-by` `metaphor-for` `inaccessible-via` `instance-of` `characterised-as` `coined-by` `defined-as` `theorised-by` `exhibits` `violates` `presupposes` `leads-to` `breaks-down-for` `better-fits` `risks` `incompatible-with` `generates` `requires`

**Pass 3 — Coherence check:** Remove weak associations, connect new topics to existing hubs.

**Existing taxonomy topics:**
{topics_ctx}

**Existing tags:** {tags_ctx}

**Style rule:** Never use em-dashes (—) in any generated text. Use commas, colons, or periods instead.

Call save_weblink_enrichment with your complete analysis."""


@app.route("/api/enrich-weblink", methods=["POST"])
def api_enrich_weblink():
    """Fetch a draft weblink URL, run TAO extraction via Anthropic API, write results."""
    import traceback
    try:
        import anthropic
    except ImportError:
        return jsonify({"error": "anthropic package not installed — run: pip install anthropic"}), 500

    data   = request.json or {}
    slug   = data.get("slug", "")
    if not slug:
        return jsonify({"error": "slug required"}), 400

    path = WEBLINKS_DIR / f"{slug}.md"
    if not path.exists():
        return jsonify({"error": f"weblink not found: {slug}"}), 404

    fm = parse_weblink(path)
    if not fm:
        return jsonify({"error": f"could not parse frontmatter: {slug}"}), 500

    url = fm.get("url", "")
    if not url:
        return jsonify({"error": f"no url in frontmatter: {slug}"}), 400

    api_key = os.environ.get("ANTHROPIC_API_KEY", "")
    if not api_key:
        return jsonify({"error": "ANTHROPIC_API_KEY not set"}), 500

    try:
        # 1. Fetch page content
        fetched_title, body = _fetch_page_text(url)
        display_title = fm.get("title") or fetched_title or url

        # 2. Call Anthropic API
        client = anthropic.Anthropic(api_key=api_key)
        prompt = _build_weblink_prompt(url, display_title, body)
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=4096,
            tools=[WEBLINK_EXTRACTION_TOOL],
            tool_choice={"type": "tool", "name": "save_weblink_enrichment"},
            messages=[{"role": "user", "content": prompt}],
        )

        extracted = None
        for block in response.content:
            if block.type == "tool_use" and block.name == "save_weblink_enrichment":
                extracted = block.input
                break
        if not extracted:
            return jsonify({"error": "No tool_use block returned by API"}), 500

        summary      = extracted.get("summary", "")
        themes       = extracted.get("themes", [])
        topics       = extracted.get("topics", [])
        associations = extracted.get("associations", [])
        tags         = extracted.get("tags", [])

        # 3. Write frontmatter (tags, description, themes, triples)
        triples = [[a["subject"], a["predicate"], a["object"]] for a in associations]
        apply_edits(
            path,
            tags=tags,
            description=summary,
            triples=triples,
            themes=themes,
        )

        # 4. Flip draft: false
        flip_draft_false(path)

        # 5. triples.json
        sync_triples_json(slug, "weblinks", triples)

        # 6. taxonomy.json — new topic stubs
        new_topics = [t for t in topics if t.get("is_new")]
        if new_topics:
            _update_taxonomy_json(new_topics)

        # 7. themes.json
        if themes:
            _update_themes_json(slug, themes)

        # 8. Commit
        commit_files = [path, TRIPLES_PATH]
        if themes:
            commit_files.append(THEMES_PATH)
        if new_topics:
            commit_files.append(TAXONOMY_PATH)
        git_commit_push(commit_files, f"Enrich weblink: {slug}")

        return jsonify({
            "ok":          True,
            "slug":        slug,
            "topics_new":  len(new_topics),
            "topics_total": len(topics),
            "associations": len(associations),
            "tags":        tags,
            "summary":     summary[:120] + ("…" if len(summary) > 120 else ""),
        })

    except Exception as e:
        return jsonify({"ok": False, "error": str(e), "trace": traceback.format_exc()}), 500


if __name__ == "__main__":
    print(f"Garden admin dashboard: http://localhost:{PORT}")
    app.run(port=PORT, debug=False)
