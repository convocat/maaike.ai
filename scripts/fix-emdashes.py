#!/usr/bin/env python3
"""
Replace em-dashes (—) in content files.

Rules:
  - Skip `title:` frontmatter lines (changing a title breaks wiki links)
  - **Bold name** — description  →  **Bold name**: description
  - All other occurrences of ` — `  →  `, `
  - Dry-run by default; pass --write to apply

Usage:
  python scripts/fix-emdashes.py           # preview
  python scripts/fix-emdashes.py --write   # apply
"""
import re
import sys
from pathlib import Path

CONTENT_DIR = Path(__file__).parent.parent / "src" / "content"
WRITE = "--write" in sys.argv

EM = "—"  # —

TITLE_RE   = re.compile(r"^(title\s*:.*)")   # skip title: lines
BOLD_EM_RE = re.compile(r"(\*\*[^*]+\*\*)\s*—\s*")  # **Name** — → **Name**:

changed_files = []

for md in sorted(CONTENT_DIR.rglob("*.md")):
    original = md.read_text(encoding="utf-8")
    lines_out = []
    changed = False
    for line in original.splitlines(keepends=True):
        if EM not in line:
            lines_out.append(line)
            continue
        # Skip title: lines entirely
        if TITLE_RE.match(line.lstrip()):
            lines_out.append(line)
            continue
        # **Bold** — desc  →  **Bold**: desc
        new_line = BOLD_EM_RE.sub(r"\1: ", line)
        # All remaining ` — ` → `, `
        new_line = new_line.replace(f" {EM} ", ", ")
        # Any stray lone em-dashes (no spaces) stay, but list them
        if new_line != line:
            changed = True
        lines_out.append(new_line)

    if changed:
        rel = md.relative_to(CONTENT_DIR.parent.parent)
        changed_files.append(rel)
        if WRITE:
            md.write_text("".join(lines_out), encoding="utf-8")
            print(f"Fixed: {rel}")
        else:
            print(f"Would fix: {rel}")

# Report titles that still have em-dashes (need manual wiki-link update)
print()
print("=== Titles with em-dashes (skipped — require wiki-link update too) ===")
for md in sorted(CONTENT_DIR.rglob("*.md")):
    text = md.read_text(encoding="utf-8")
    for line in text.splitlines():
        if line.lstrip().startswith("title:") and EM in line:
            print(f"  {md.relative_to(CONTENT_DIR.parent.parent)}: {line.strip()}")

print()
print(f"{'Applied' if WRITE else 'Preview'}: {len(changed_files)} file(s) affected")
if not WRITE:
    print("Run with --write to apply changes.")
