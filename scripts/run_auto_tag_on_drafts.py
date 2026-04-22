#!/usr/bin/env python3
"""
Run /auto-tag on posts that have no triples yet.

Scopes:
  weblinks (default): only draft weblinks — used by the telegram-sync workflow
  all: every post across articles, field-notes, seeds, jottings, experiments,
       and draft weblinks. Used by the backlog workflow.

Requires:
  - ANTHROPIC_API_KEY in the environment
  - claude CLI on PATH (installed via npm in the workflow)
"""

import argparse
import os
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent
CONTENT = REPO_ROOT / "src" / "content"
ALL_COLLECTIONS = ["articles", "field-notes", "seeds", "jottings", "experiments", "weblinks"]


def has_empty_triples(text: str) -> bool:
    m = re.search(r"^triples:\s*(.*)$", text, re.MULTILINE)
    if not m:
        return True
    return m.group(1).strip() in ("", "[]")


def is_draft_true(text: str) -> bool:
    return bool(re.search(r"^draft:\s*true\s*$", text, re.MULTILINE))


def needs_enrichment(path: Path, scope: str) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except Exception:
        return False
    if not has_empty_triples(text):
        return False

    collection = path.parent.name
    if scope == "weblinks":
        # telegram-sync flow: only new draft weblinks
        return collection == "weblinks" and is_draft_true(text)
    # scope == "all": backlog run across every collection
    # Skip in-progress drafts for non-weblinks (they're still being written).
    # For weblinks, draft:true is the pre-enrichment state, so include them.
    if collection != "weblinks" and is_draft_true(text):
        return False
    return True


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
        timeout=900,
    )
    if result.returncode != 0:
        print(f"[auto-tag] FAILED ({result.returncode}) for {rel}")
        print(result.stdout[-2000:] if result.stdout else "")
        print(result.stderr[-2000:] if result.stderr else "")
        return False
    print(f"[auto-tag] ok: {rel}")
    return True


def collect_targets(scope: str) -> list[Path]:
    collections = ALL_COLLECTIONS if scope == "all" else ["weblinks"]
    targets = []
    for c in collections:
        d = CONTENT / c
        if not d.exists():
            continue
        for p in d.glob("*.md"):
            if needs_enrichment(p, scope):
                targets.append(p)
    return targets


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--scope", choices=["weblinks", "all"], default="weblinks")
    ap.add_argument("--max", type=int, default=0, help="Cap runs per invocation (0 = no cap)")
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY not set — skipping auto-tag.")
        return 0

    targets = collect_targets(args.scope)
    if args.max > 0:
        targets = targets[: args.max]

    if not targets:
        print(f"No unenriched posts found for scope={args.scope}.")
        return 0

    print(f"Found {len(targets)} post(s) to auto-tag (scope={args.scope}).")
    failed = 0
    for p in targets:
        if not run_auto_tag(p):
            failed += 1

    print(f"Done. {len(targets) - failed} enriched, {failed} failed.")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
