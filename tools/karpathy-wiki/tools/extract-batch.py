#!/usr/bin/env python3
"""
Batch TAO extractor — runs three-pass analysis on all untagged articles
and saves proposal JSON files for review in the wiki viewer.

Usage:
  python tools/karpathy-wiki/tools/extract-batch.py            # all untagged
  python tools/karpathy-wiki/tools/extract-batch.py --limit 5  # first N articles
  python tools/karpathy-wiki/tools/extract-batch.py --slug chatgpt-presentation-prep

Proposals are saved to: C:/Sharing/Maaike/maaike-wiki/raw/proposals/<slug>.json
Skips articles that already have a proposal (pending or applied).
Skips articles that are already tagged (have non-empty triples in frontmatter).

Requires ANTHROPIC_API_KEY in tools/karpathy-wiki/.env or environment.
"""

import argparse
import json
import re
import sys
import os
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────────

SCRIPT_DIR    = Path(__file__).parent
KARPATHY_ROOT = SCRIPT_DIR.parent
GARDEN_ROOT   = KARPATHY_ROOT.parent.parent
PROPOSALS_DIR = GARDEN_ROOT.parent / "maaike-wiki" / "raw" / "proposals"
ARTICLES_DIR  = GARDEN_ROOT / "src" / "content" / "articles"
TAGS_DIR      = GARDEN_ROOT / "src" / "content" / "tags"
TRIPLES_PATH  = GARDEN_ROOT / "src" / "data" / "triples.json"

# Load .env
_env = KARPATHY_ROOT / ".env"
if _env.exists():
    for line in _env.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, _, v = line.partition("=")
            if not os.environ.get(k.strip()):
                os.environ[k.strip()] = v.strip()

# ── Frontmatter helpers ────────────────────────────────────────────────────────

def parse_frontmatter(text):
    if not text.startswith("---"):
        return {}, text
    end = text.find("---", 3)
    if end == -1:
        return {}, text
    fm_text = text[3:end].strip()
    body = text[end + 3:].strip()
    fm = {}
    current_key = None
    current_list = None
    for line in fm_text.split("\n"):
        if line.startswith("  - ") and current_list is not None:
            current_list.append(line[4:].strip().strip('"').strip("'"))
        elif ":" in line and not line.startswith(" "):
            if current_key and current_list is not None:
                fm[current_key] = current_list
                current_list = None
            key, _, val = line.partition(":")
            key = key.strip()
            val = val.strip()
            if val == "":
                current_key = key
                current_list = []
            elif val.startswith("[") and val.endswith("]"):
                items = [v.strip().strip('"').strip("'") for v in val[1:-1].split(",") if v.strip()]
                fm[key] = items
                current_key = None
                current_list = None
            else:
                fm[key] = val.strip('"').strip("'")
                current_key = None
                current_list = None
    if current_key and current_list is not None:
        fm[current_key] = current_list
    return fm, body


def is_untagged(fm):
    triples = fm.get("triples")
    if triples is None:
        return True
    if isinstance(triples, list) and len(triples) == 0:
        return True
    return False


# ── Context loaders ────────────────────────────────────────────────────────────

def load_existing_topics():
    if not TRIPLES_PATH.exists():
        return {}
    data = json.loads(TRIPLES_PATH.read_text(encoding="utf-8"))
    return data.get("topics", {})


def load_existing_tags():
    tags = []
    if not TAGS_DIR.exists():
        return tags
    for f in sorted(TAGS_DIR.glob("*.md")):
        text = f.read_text(encoding="utf-8")
        m = re.search(r'^title:\s*["\']?(.+?)["\']?\s*$', text, re.MULTILINE)
        title = m.group(1).strip('"\'') if m else f.stem.replace("-", " ")
        tags.append({"slug": f.stem, "title": title})
    return tags


def load_all_articles_index():
    """Lightweight index of all articles for occurrence candidates."""
    index = []
    for f in sorted(ARTICLES_DIR.glob("*.md")):
        text = f.read_text(encoding="utf-8", errors="ignore")
        fm, _ = parse_frontmatter(text)
        index.append({
            "slug": f.stem,
            "title": fm.get("title", f.stem),
            "description": fm.get("description", ""),
            "tags": fm.get("tags", []) if isinstance(fm.get("tags"), list) else [],
        })
    return index


# ── Untagged article list ──────────────────────────────────────────────────────

def get_untagged_articles():
    untagged = []
    for f in sorted(ARTICLES_DIR.glob("*.md")):
        text = f.read_text(encoding="utf-8", errors="ignore")
        fm, body = parse_frontmatter(text)
        if fm.get("draft") is True or fm.get("draft") == "true":
            continue
        if is_untagged(fm):
            untagged.append({
                "path": f,
                "slug": f.stem,
                "title": fm.get("title", f.stem),
                "fm": fm,
                "body": body,
            })
    return untagged


def already_has_proposal(slug):
    p = PROPOSALS_DIR / f"{slug}.json"
    return p.exists()


# ── Claude API extraction ──────────────────────────────────────────────────────

EXTRACTION_TOOL = {
    "name": "save_tao_proposal",
    "description": "Save the structured TAO extraction result as a review proposal.",
    "input_schema": {
        "type": "object",
        "properties": {
            "argument": {
                "type": "string",
                "description": "Central argument or position of the post in 1-2 sentences."
            },
            "tradition": {
                "type": "string",
                "description": "Intellectual tradition(s) the post draws from."
            },
            "themes": {
                "type": "array",
                "items": {"type": "string"},
                "description": "2-5 opinionated one-liner theme statements about what the post argues."
            },
            "topics": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "label": {"type": "string"},
                        "type": {"type": "string"},
                        "is_new": {"type": "boolean"}
                    },
                    "required": ["label", "type", "is_new"]
                },
                "description": "Named topics extracted. is_new=true if not in existing taxonomy."
            },
            "associations": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "subject": {"type": "string"},
                        "predicate": {"type": "string"},
                        "object": {"type": "string"}
                    },
                    "required": ["subject", "predicate", "object"]
                },
                "description": "3-8 typed S-P-O relationships using only the allowed predicate vocabulary."
            },
            "tags": {
                "type": "array",
                "items": {"type": "string"},
                "description": "2-6 kebab-cased tag slugs (mix of existing and new)."
            },
            "occurrences": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "slug": {"type": "string"},
                        "reason": {"type": "string"}
                    },
                    "required": ["slug", "reason"]
                },
                "description": "Other garden articles that share significant topics with this one."
            },
            "gaps": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "label": {"type": "string"},
                        "suggested_type": {"type": "string"}
                    },
                    "required": ["label", "suggested_type"]
                },
                "description": "Concepts referenced but missing from the taxonomy."
            },
            "open_questions": {
                "type": "array",
                "items": {"type": "string"},
                "description": "1-3 research prompts or unresolved threads this post raises."
            }
        },
        "required": ["argument", "themes", "topics", "associations", "tags"]
    }
}


def build_prompt(article, existing_topics, existing_tags, articles_index):
    existing_topic_lines = "\n".join(
        f"  {slug}: {v.get('label', slug)} ({v.get('type', '?')})"
        for slug, v in list(existing_topics.items())[:80]
    )
    existing_tag_lines = ", ".join(t["slug"] for t in existing_tags[:60])
    article_index_lines = "\n".join(
        f"  {a['slug']}: {a['title']} — {a['description'][:80]}"
        for a in articles_index[:50]
    )

    return f"""You are performing a three-pass TAO (Thematic-Associations-Occurrences) analysis on a blog post from Maaike Groenewege's digital garden (maaike.ai). Maaike is a conversation designer who writes about AI, conversational interfaces, language, and design.

## Article

**Slug:** {article['slug']}
**Title:** {article['title']}
**Date:** {article['fm'].get('date', 'unknown')}

---
{article['body'][:4000]}
---

## Pass 1 — Thematic read

Identify:
- The central argument or position (1-2 sentences)
- The intellectual tradition(s) it draws from
- 2-5 opinionated theme statements about what the post argues (not summaries — take a stance)

## Pass 2 — TAO extraction

**Topics:** Extract all named things worth knowing about (people, technologies, concepts, methods, frameworks). For each, assign ONE type from this controlled vocabulary:
`person` · `technology` · `technology-category` · `technical-mechanism` · `technical-phenomenon` · `philosophical-method` · `philosophical-framework` · `philosophical-concept` · `epistemological-concept` · `epistemic-stance` · `cognitive-tendency` · `belief-type` · `linguistic-concept` · `linguistic-principle` · `communication-type` · `theoretical-concept` · `interaction-metaphor` · `design-discipline` · `acoustic-concept` · `methodology` · `artefact` · `concept` · `phenomenon` · `principle` · `discipline`

Mark `is_new: false` if the topic already exists in the taxonomy below. Mark `is_new: true` if it's genuinely new.

**Existing taxonomy topics:**
{existing_topic_lines}

**Associations:** Extract 3-8 typed S-P-O relationships. Use labels (not slugs). Use ONLY these predicates:
`attributed-to` · `structured-as` · `counters` · `reinforces` · `contrasted-with` · `demonstrates` · `lacks` · `caused-by` · `metaphor-for` · `inaccessible-via` · `instance-of` · `characterised-as` · `coined-by` · `defined-as` · `theorised-by` · `exhibits` · `violates` · `presupposes` · `leads-to` · `breaks-down-for` · `better-fits` · `risks` · `incompatible-with` · `generates` · `requires`

Capture what this post specifically argues — not generic background truths.

## Pass 3 — Coherence check

- Remove associations that don't reflect the post's actual argument
- Connect new topics to existing hub topics where natural
- Keep tags consistent with themes

## Tags

Suggest 2-6 kebab-case tag slugs. Reuse from existing tags where possible. Propose new ones only if the concept is genuinely distinct and reusable.

**Existing tags:** {existing_tag_lines}

## Occurrences

Which other articles in the garden cover overlapping topics? Only list genuinely relevant ones.

**Garden articles index:**
{article_index_lines}

**Style rule:** Never use em-dashes (—) in any generated text. Use commas, colons, or periods instead.

Call the save_tao_proposal tool with your complete analysis."""


def extract_one(article, existing_topics, existing_tags, articles_index, client):
    import anthropic

    prompt = build_prompt(article, existing_topics, existing_tags, articles_index)

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        tools=[EXTRACTION_TOOL],
        tool_choice={"type": "tool", "name": "save_tao_proposal"},
        messages=[{"role": "user", "content": prompt}],
    )

    for block in response.content:
        if block.type == "tool_use" and block.name == "save_tao_proposal":
            return block.input

    raise ValueError("No tool_use block in response")


# ── Save proposal ──────────────────────────────────────────────────────────────

def save_proposal(slug, title, extracted):
    PROPOSALS_DIR.mkdir(parents=True, exist_ok=True)
    proposal = {
        "slug": slug,
        "title": title,
        "status": "pending",
        "extracted": extracted,
    }
    path = PROPOSALS_DIR / f"{slug}.json"
    path.write_text(json.dumps(proposal, indent=2, ensure_ascii=False), encoding="utf-8")
    return path


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Batch TAO extractor")
    parser.add_argument("--limit", type=int, default=None, help="Max articles to process")
    parser.add_argument("--slug", type=str, default=None, help="Process a single article by slug")
    parser.add_argument("--force", action="store_true", help="Re-extract even if proposal exists")
    args = parser.parse_args()

    import anthropic
    client = anthropic.Anthropic()

    existing_topics = load_existing_topics()
    existing_tags = load_existing_tags()
    articles_index = load_all_articles_index()

    untagged = get_untagged_articles()

    if args.slug:
        untagged = [a for a in untagged if a["slug"] == args.slug]
        if not untagged:
            # Also allow processing a tagged article by slug with --force
            for f in ARTICLES_DIR.glob("*.md"):
                if f.stem == args.slug:
                    text = f.read_text(encoding="utf-8", errors="ignore")
                    fm, body = parse_frontmatter(text)
                    untagged = [{"path": f, "slug": f.stem, "title": fm.get("title", f.stem), "fm": fm, "body": body}]
                    break
            if not untagged:
                print(f"Article not found: {args.slug}")
                sys.exit(1)

    queue = []
    skipped = []
    for a in untagged:
        if not args.force and already_has_proposal(a["slug"]):
            skipped.append(a["slug"])
        else:
            queue.append(a)

    if args.limit:
        queue = queue[:args.limit]

    print(f"Queue: {len(queue)} articles to extract")
    if skipped:
        print(f"Skipped (proposal exists): {len(skipped)} — use --force to re-extract")
    print()

    ok = 0
    failed = []
    for i, article in enumerate(queue, 1):
        slug = article["slug"]
        title = article["title"]
        print(f"[{i}/{len(queue)}] {slug} ...", end=" ", flush=True)
        try:
            extracted = extract_one(article, existing_topics, existing_tags, articles_index, client)
            path = save_proposal(slug, title, extracted)
            print(f"saved: {path.name}")
            ok += 1
        except Exception as e:
            print(f"FAILED: {e}")
            failed.append((slug, str(e)))

    print()
    print(f"Done: {ok} saved, {len(failed)} failed")
    if failed:
        print("Failures:")
        for slug, err in failed:
            print(f"  {slug}: {err}")
    print(f"\nOpen http://localhost:8780/review to review proposals")


if __name__ == "__main__":
    main()
