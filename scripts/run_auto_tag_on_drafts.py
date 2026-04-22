#!/usr/bin/env python3
"""
Run /auto-tag on every draft weblink that has no triples yet.

Driver for the GitHub Actions telegram-sync workflow. Invokes Claude Code
headlessly with --dangerously-skip-permissions so the skill can read + write
files without prompting. Requires:
  - ANTHROPIC_API_KEY in the environment
  - claude CLI on PATH (installed via npm in the workflow)
"""

import os
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
WEBLINKS_DIR = REPO_ROOT / "src" / "content" / "weblinks"


def needs_enrichment(path: Path) -> bool:
    """A draft weblink needs enrichment if it lacks a non-empty `triples:` list."""
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return False
    # Only touch drafts
    if not re.search(r"^draft:\s*true\s*$", text, re.MULTILINE):
        return False
    # Skip if triples already populated (non-empty list)
    m = re.search(r"^triples:\s*(.*)$", text, re.MULTILINE)
    if not m:
        return True  # no triples field at all
    first = m.group(1).strip()
    # `triples: []` or `triples:` followed by nothing → needs enrichment
    if first in ("", "[]"):
        return True
    return False


def run_auto_tag(path: Path) -> bool:
    rel = path.relative_to(REPO_ROOT).as_posix()
    prompt = (
        f"Run /auto-tag on {rel}. Apply all accepted suggestions automatically "
        f"without asking for confirmation. Do not commit — the workflow will commit."
    )
    print(f"[auto-tag] {rel}", flush=True)
    result = subprocess.run(
        ["claude", "-p", prompt, "--dangerously-skip-permissions"],
        cwd=str(REPO_ROOT),
        capture_output=True,
        text=True,
        timeout=600,
    )
    if result.returncode != 0:
        print(f"[auto-tag] FAILED ({result.returncode}) for {rel}")
        print(result.stdout[-2000:] if result.stdout else "")
        print(result.stderr[-2000:] if result.stderr else "")
        return False
    print(f"[auto-tag] ok: {rel}")
    return True


def main() -> int:
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY not set — skipping auto-tag.")
        return 0
    if not WEBLINKS_DIR.exists():
        print(f"No weblinks dir at {WEBLINKS_DIR}")
        return 0

    drafts = [p for p in WEBLINKS_DIR.glob("*.md") if needs_enrichment(p)]
    if not drafts:
        print("No unenriched drafts found.")
        return 0

    print(f"Found {len(drafts)} draft(s) to auto-tag.")
    failed = 0
    for p in drafts:
        if not run_auto_tag(p):
            failed += 1

    print(f"Done. {len(drafts) - failed} enriched, {failed} failed.")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
