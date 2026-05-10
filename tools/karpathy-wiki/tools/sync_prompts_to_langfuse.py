"""Sync system-prompt markdown files to Langfuse.

Pushes the prompts shipped in the repo to Langfuse so they become the
runtime source of truth. After the first sync, edit prompts in the
Langfuse UI; the .md files remain only as a fallback when Langfuse
cannot be reached.

What gets synced:

- `tools/karpathy-wiki/SYSTEM_PROMPT.md`         → name `ask-system-prompt-v1`
- `src/content/prompts/<prompt_id>.md`           → name = the `prompt_id`
  frontmatter field, only when `bot_id` is `garden` or `wiki`.

Each Langfuse prompt is created (or a new version added) with:

- type: text
- prompt: the markdown body, frontmatter + HTML comments stripped (same
  rules as `serve.load_prompt`)
- labels: ["production", "<prompt_status>"] when status is active, else
  ["<prompt_status>"]
- config: model, version, bot_id, source filename

Usage:

    python tools/karpathy-wiki/tools/sync_prompts_to_langfuse.py --dry-run
    python tools/karpathy-wiki/tools/sync_prompts_to_langfuse.py
"""
from __future__ import annotations

import argparse
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent.parent  # Digital-Garden/
KARPATHY_ROOT = ROOT / "tools" / "karpathy-wiki"
GARDEN_PROMPTS_DIR = ROOT / "src" / "content" / "prompts"
ASK_PROMPT_FILE = KARPATHY_ROOT / "SYSTEM_PROMPT.md"

# Make langfuse_integration importable so the env-loading + client init logic
# matches the runtime exactly.
sys.path.insert(0, str(KARPATHY_ROOT / "tools"))

# Load .env from karpathy-wiki/.env if present (matches serve.py behaviour).
_env_file = KARPATHY_ROOT / ".env"
if _env_file.exists():
    for _line in _env_file.read_text().splitlines():
        _line = _line.strip()
        if _line and not _line.startswith("#") and "=" in _line:
            _k, _v = _line.split("=", 1)
            _k, _v = _k.strip(), _v.strip()
            if not os.environ.get(_k):
                os.environ[_k] = _v


def _strip_frontmatter_and_comments(text: str) -> tuple[dict, str]:
    """Return (frontmatter_dict, body_without_html_comments)."""
    fm: dict = {}
    body = text
    m = re.match(r'^---\n(.+?)\n---\n', text, flags=re.DOTALL)
    if m:
        for line in m.group(1).splitlines():
            if ":" in line:
                k, v = line.split(":", 1)
                fm[k.strip()] = v.strip().strip("'").strip('"')
        body = text[m.end():]
    body = re.sub(r'<!--.*?-->', '', body, flags=re.DOTALL)
    return fm, body.strip()


def _collect_prompts() -> list[dict]:
    """Return [{name, body, labels, config, source}] for every prompt to sync."""
    out: list[dict] = []

    if ASK_PROMPT_FILE.exists():
        body = ASK_PROMPT_FILE.read_text(encoding="utf-8").strip()
        out.append({
            "name": "garden/ask-system-prompt-v1",
            "body": body,
            "labels": ["production", "active"],
            "config": {"bot_id": "wiki", "source": str(ASK_PROMPT_FILE.relative_to(ROOT)).replace("\\", "/")},
            "source": str(ASK_PROMPT_FILE),
        })

    if GARDEN_PROMPTS_DIR.exists():
        for path in sorted(GARDEN_PROMPTS_DIR.glob("*.md")):
            text = path.read_text(encoding="utf-8", errors="ignore")
            fm, body = _strip_frontmatter_and_comments(text)
            bot_id = fm.get("bot_id")
            if bot_id not in ("garden", "wiki"):
                continue
            prompt_id = fm.get("prompt_id") or path.stem
            status = fm.get("prompt_status", "")
            labels: list[str] = []
            if status:
                labels.append(status)
            if status == "active":
                labels.append("production")
            out.append({
                "name": f"garden/{prompt_id}",
                "body": body,
                "labels": labels or ["draft"],
                "config": {
                    "bot_id": bot_id,
                    "version": fm.get("prompt_version", ""),
                    "model": fm.get("prompt_model", ""),
                    "source": str(path.relative_to(ROOT)).replace("\\", "/"),
                },
                "source": str(path),
            })

    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="List what would sync; do not call Langfuse.")
    args = parser.parse_args()

    prompts = _collect_prompts()
    if not prompts:
        print("No prompt files found.")
        return 1

    print(f"Found {len(prompts)} prompt(s):")
    for p in prompts:
        print(f"  - {p['name']}  (labels={p['labels']}, source={p['source']})")

    if args.dry_run:
        print("\nDry run. No changes pushed to Langfuse.")
        return 0

    if not (os.environ.get("LANGFUSE_PUBLIC_KEY") and os.environ.get("LANGFUSE_SECRET_KEY")):
        print("LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY not set. Aborting.", file=sys.stderr)
        return 2

    try:
        from langfuse import Langfuse
    except Exception as e:
        print(f"langfuse SDK not installed: {e}", file=sys.stderr)
        return 2

    client = Langfuse(
        public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
        secret_key=os.environ["LANGFUSE_SECRET_KEY"],
        host=os.environ.get("LANGFUSE_HOST", "https://cloud.langfuse.com"),
    )

    pushed = 0
    for p in prompts:
        try:
            client.create_prompt(
                name=p["name"],
                type="text",
                prompt=p["body"],
                labels=p["labels"],
                config=p["config"],
            )
            print(f"  [ok] pushed {p['name']}")
            pushed += 1
        except Exception as e:
            print(f"  [fail] {p['name']}: {e}", file=sys.stderr)

    client.flush()
    print(f"\nSynced {pushed}/{len(prompts)} prompt(s) to Langfuse.")
    return 0 if pushed == len(prompts) else 1


if __name__ == "__main__":
    sys.exit(main())
