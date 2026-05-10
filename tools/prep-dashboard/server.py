#!/usr/bin/env python3
"""
Presentation prep dashboard (port 8901).

Generic per-project workspace: search the garden, collect cards,
take notes, build a narrative outline. Sidecar JSON per project.
"""

import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml
from flask import Flask, Response, jsonify, request, send_file

TOOL_DIR    = Path(__file__).parent
GARDEN_ROOT = TOOL_DIR.parent.parent
CONTENT_DIR = GARDEN_ROOT / "src" / "content"
DATA_DIR    = TOOL_DIR / "data"
INDEX_HTML  = TOOL_DIR / "index.html"
PORT        = 8901

COLLECTIONS = [
    "articles", "field-notes", "seeds", "weblinks",
    "videos", "library", "experiments", "jottings",
]

FRONTMATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n?(.*)$", re.DOTALL)
SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")

DATA_DIR.mkdir(exist_ok=True)

app = Flask(__name__)


def parse_md(path: Path):
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
    fm["_body"] = m.group(2)
    return fm


def load_all():
    items = []
    for coll in COLLECTIONS:
        cdir = CONTENT_DIR / coll
        if not cdir.exists():
            continue
        for p in cdir.glob("*.md"):
            if p.stem.startswith("_"):
                continue
            fm = parse_md(p)
            if fm is None:
                continue
            if fm.get("draft") is True:
                continue
            items.append({
                "slug":        fm["_slug"],
                "collection":  coll,
                "title":       fm.get("title", "") or fm["_slug"],
                "description": fm.get("description", "") or "",
                "tags":        fm.get("tags") or [],
                "maturity":    fm.get("maturity", "") or "",
                "date":        str(fm.get("date", "")),
                "_haystack":   " ".join([
                    str(fm.get("title", "")),
                    str(fm.get("description", "")),
                    " ".join(fm.get("tags") or []),
                    fm["_body"],
                ]).lower(),
            })
    return items


@app.route("/")
def root():
    return send_file(INDEX_HTML)


@app.route("/api/search")
def api_search():
    q = (request.args.get("q") or "").strip().lower()
    coll = (request.args.get("collection") or "").strip()
    items = load_all()
    if coll:
        items = [it for it in items if it["collection"] == coll]
    if q:
        terms = [t for t in q.split() if t]
        items = [it for it in items if all(t in it["_haystack"] for t in terms)]
    items.sort(key=lambda it: it["date"], reverse=True)
    for it in items:
        it.pop("_haystack", None)
    return jsonify({"items": items[:200], "total": len(items)})


@app.route("/api/article")
def api_article():
    coll = (request.args.get("collection") or "").strip()
    slug = (request.args.get("slug") or "").strip()
    if coll not in COLLECTIONS or not SLUG_RE.match(slug):
        return jsonify({"error": "invalid collection or slug"}), 400
    path = CONTENT_DIR / coll / f"{slug}.md"
    if not path.exists():
        return jsonify({"error": "not found"}), 404
    fm = parse_md(path)
    if fm is None:
        return jsonify({"error": "could not parse"}), 500
    return jsonify({
        "slug":        slug,
        "collection":  coll,
        "title":       fm.get("title", "") or slug,
        "description": fm.get("description", "") or "",
        "date":        str(fm.get("date", "")),
        "updated":     str(fm.get("updated") or ""),
        "maturity":    fm.get("maturity", "") or "",
        "tags":        fm.get("tags") or [],
        "url":         fm.get("url", "") or "",
        "body":        fm.get("_body", ""),
    })


def read_marginalia(path: Path):
    fm = parse_md(path)
    if fm is None:
        return None
    items = fm.get("marginalia") or []
    return [str(x) for x in items if x is not None]


def _format_marginalia_block(items):
    if not items:
        return "marginalia: []"
    lines = ["marginalia:"]
    for s in items:
        if "\n" in s:
            lines.append("  - |-")
            for ln in s.split("\n"):
                lines.append(f"    {ln}")
        else:
            esc = s.replace("\\", "\\\\").replace('"', '\\"')
            lines.append(f'  - "{esc}"')
    return "\n".join(lines)


def write_marginalia(path: Path, items):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        raise ValueError(f"no frontmatter in {path}")
    # Locate the closing '---' line precisely so we preserve any blank line
    # between frontmatter and body byte-for-byte.
    close_re = re.compile(r"\n---[ \t]*\r?\n")
    cm = close_re.search(text, 4)
    if not cm:
        raise ValueError(f"no closing --- in {path}")
    fm_text = text[4:cm.start()]
    body = text[cm.end():]
    fm_lines = fm_text.split("\n")

    start = None
    end = None
    for i, line in enumerate(fm_lines):
        if re.match(r"^marginalia\s*:", line):
            start = i
            end = i + 1
            while end < len(fm_lines):
                nxt = fm_lines[end]
                if nxt == "" or nxt.startswith(" ") or nxt.startswith("\t") or nxt.startswith("-"):
                    end += 1
                else:
                    break
            break

    new_block = _format_marginalia_block(items).split("\n")
    if start is not None:
        new_fm_lines = fm_lines[:start] + new_block + fm_lines[end:]
    else:
        # Append. Trim trailing blank lines from fm before adding.
        trimmed = list(fm_lines)
        while trimmed and trimmed[-1].strip() == "":
            trimmed.pop()
        new_fm_lines = trimmed + new_block

    new_text = "---\n" + "\n".join(new_fm_lines) + "\n---\n" + body
    path.write_text(new_text, encoding="utf-8")


def _post_path(collection: str, slug: str):
    if collection not in COLLECTIONS or not SLUG_RE.match(slug):
        return None
    p = CONTENT_DIR / collection / f"{slug}.md"
    return p if p.exists() else None


@app.route("/api/marginalia", methods=["GET"])
def api_get_marginalia():
    coll = (request.args.get("collection") or "").strip()
    slug = (request.args.get("slug") or "").strip()
    p = _post_path(coll, slug)
    if not p:
        return jsonify({"error": "post not found"}), 404
    items = read_marginalia(p)
    if items is None:
        return jsonify({"error": "could not parse"}), 500
    return jsonify({"marginalia": items})


@app.route("/api/marginalia", methods=["POST"])
def api_post_marginalia():
    coll = (request.args.get("collection") or "").strip()
    slug = (request.args.get("slug") or "").strip()
    p = _post_path(coll, slug)
    if not p:
        return jsonify({"error": "post not found"}), 404
    body = request.get_json(silent=True) or {}
    items = body.get("marginalia") or []
    if not isinstance(items, list) or not all(isinstance(x, str) for x in items):
        return jsonify({"error": "marginalia must be array of strings"}), 400
    items = [s for s in (s.strip() for s in items) if s]
    write_marginalia(p, items)
    return jsonify({"ok": True, "path": str(p.relative_to(GARDEN_ROOT)), "count": len(items)})


@app.route("/api/promote-card-notes", methods=["POST"])
def api_promote_card_notes():
    project = (request.args.get("project") or "").strip()
    try:
        path = _state_path(project)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if not path.exists():
        return jsonify({"error": "no state for this project"}), 404
    state = json.loads(path.read_text(encoding="utf-8"))
    promoted = 0
    skipped = 0
    paths = []
    for c in state.get("cards") or []:
        note = (c.get("note") or "").strip()
        if not note:
            continue
        coll = c.get("collection")
        slug = c.get("id")
        p = _post_path(coll, slug)
        if not p:
            continue
        existing = read_marginalia(p) or []
        if note in existing:
            skipped += 1
            continue
        existing.append(note)
        write_marginalia(p, existing)
        promoted += 1
        paths.append(str(p.relative_to(GARDEN_ROOT)))
    return jsonify({"promoted": promoted, "skipped": skipped, "paths": paths})


def _state_path(project: str) -> Path:
    if not SLUG_RE.match(project):
        raise ValueError("invalid project slug")
    return DATA_DIR / f"{project}.json"


def _empty_state(project: str):
    return {
        "project": project,
        "updated": datetime.now(timezone.utc).isoformat(),
        "cards":   [],
        "notes":   "",
        "outline": [],
        "slides":  [],
        "ui":      {},
    }


@app.route("/api/state", methods=["GET"])
def api_get_state():
    project = (request.args.get("project") or "").strip()
    try:
        path = _state_path(project)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if path.exists():
        try:
            return jsonify(json.loads(path.read_text(encoding="utf-8")))
        except json.JSONDecodeError:
            pass
    return jsonify(_empty_state(project))


@app.route("/api/state", methods=["POST"])
def api_save_state():
    project = (request.args.get("project") or "").strip()
    try:
        path = _state_path(project)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    body = request.get_json(silent=True) or {}
    state = {
        "project": project,
        "updated": datetime.now(timezone.utc).isoformat(),
        "cards":   body.get("cards") or [],
        "notes":   body.get("notes") or "",
        "outline": body.get("outline") or [],
        "slides":  body.get("slides") or [],
        "ui":      body.get("ui") or {},
    }
    path.write_text(json.dumps(state, indent=2, ensure_ascii=False), encoding="utf-8")
    return jsonify({"ok": True, "updated": state["updated"]})


PICKS_HEADING = "## Talk picks"
PICKS_BLOCK_RE = re.compile(
    r"\n*## Talk picks\n(?:.*?\n)*?(?=\n## |\Z)", re.DOTALL
)


@app.route("/api/sync-to-hub", methods=["POST"])
def api_sync_to_hub():
    project = (request.args.get("project") or "").strip()
    try:
        _state_path(project)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    hub = CONTENT_DIR / "field-notes" / f"{project}.md"
    if not hub.exists():
        return jsonify({"error": f"hub not found: {hub.relative_to(GARDEN_ROOT)}"}), 404
    state_path = _state_path(project)
    if not state_path.exists():
        return jsonify({"error": "no state for this project"}), 404
    state = json.loads(state_path.read_text(encoding="utf-8"))
    cards = state.get("cards") or []
    if not cards:
        return jsonify({"error": "no cards selected"}), 400

    lines = [PICKS_HEADING, ""]
    for c in cards:
        slug = c.get("id") or c.get("slug")
        title = c.get("title") or slug
        if not slug:
            continue
        lines.append(f"- [[{slug}|{title}]]")
    block = "\n".join(lines) + "\n"

    text = hub.read_text(encoding="utf-8")
    if PICKS_HEADING in text:
        new_text = PICKS_BLOCK_RE.sub("\n\n" + block, text, count=1)
        if not new_text.endswith("\n"):
            new_text += "\n"
    else:
        sep = "" if text.endswith("\n\n") else ("\n" if text.endswith("\n") else "\n\n")
        new_text = text + sep + block
    hub.write_text(new_text, encoding="utf-8")
    return jsonify({
        "ok":    True,
        "path":  str(hub.relative_to(GARDEN_ROOT)),
        "lines": len(cards),
    })


def _pretty_project(slug: str) -> str:
    return slug.replace("-", " ").strip().capitalize()


@app.route("/api/export")
def api_export():
    project = (request.args.get("project") or "").strip()
    fmt = (request.args.get("format") or "md").strip().lower()
    try:
        path = _state_path(project)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    if not path.exists():
        return jsonify({"error": "no state for this project"}), 404
    state = json.loads(path.read_text(encoding="utf-8"))
    cards  = state.get("cards") or []
    slides = state.get("slides") or []
    notes  = state.get("notes") or ""
    today  = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    if fmt == "txt":
        # PowerPoint / Keynote outline import: one slide title per line.
        # Empty slides exported as a placeholder so PPT still creates the slide.
        lines = []
        for s in slides:
            t = (s.get("title") or "").strip()
            lines.append(t if t else "(untitled)")
        body = "\r\n".join(lines) + "\r\n"
        return Response(
            body,
            mimetype="text/plain; charset=utf-8",
            headers={"Content-Disposition": f'attachment; filename="{project}-outline.txt"'},
        )

    # Default: markdown brief
    out = []
    out.append(f"# {_pretty_project(project)}")
    out.append("")
    out.append(f"> Prep brief exported {today} from the prep dashboard.")
    out.append("")
    if slides:
        out.append("## Outline")
        out.append("")
        for i, s in enumerate(slides, 1):
            t = (s.get("title") or "").strip() or "(untitled)"
            out.append(f"{i}. {t}")
        out.append("")
    if notes.strip():
        out.append("## Free-form notes")
        out.append("")
        out.append(notes.strip())
        out.append("")
    if cards:
        out.append("## Cards")
        out.append("")
        for c in cards:
            slug  = c.get("id") or ""
            coll  = c.get("collection") or ""
            title = c.get("title") or slug
            note  = (c.get("note") or "").strip()
            out.append(f"### {title}")
            out.append("")
            out.append(f"- Collection: {coll}")
            if slug and coll:
                out.append(f"- Link: http://localhost:4321/{coll}/{slug}/")
            out.append("")
            if note:
                for line in note.splitlines():
                    out.append(f"> {line}" if line else ">")
                out.append("")
            out.append("---")
            out.append("")
    body = "\n".join(out)
    return Response(
        body,
        mimetype="text/markdown; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{project}-brief.md"'},
    )


if __name__ == "__main__":
    print(f"Prep dashboard on http://localhost:{PORT}/?project=conference-talk-guildford", flush=True)
    app.run(host="127.0.0.1", port=PORT, debug=False)
