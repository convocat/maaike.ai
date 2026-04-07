---
title: Content validation
description: Validates frontmatter across all markdown files before build. Catches missing required fields, invalid enums, and unsafe YAML values.
date: 2026-04-06
maturity: solid
tags: [testing, content, scripts, yaml]
category: technical
section: Tests
ai: co-created
---

Validates frontmatter across all markdown files in the garden. Run after adding or editing any content file, and before pushing if you've hand-edited frontmatter.

```bash
npm run validate
```

## What it checks

**Required fields per collection**

Each collection has a minimum set of required fields. Shared across all: `title`, `date`, `maturity`. Collection-specific additions:

| Collection | Extra required fields |
|---|---|
| Weblinks, Videos | `url` |
| Library | `author`, `status` |

**Enum validation**

- `maturity` must be one of: `draft`, `developing`, `solid`, `complete`, `compost`
- Library `status` must be one of: `reading`, `read`, `to-read`, `abandoned`

**Unsafe YAML values**

Unquoted string values containing `: ` (colon-space) parse fine in development but break Astro's stricter production YAML parser. The validator flags these so you can quote them before they reach the build. This is what took the site down when `session-management.md` had an unquoted title with a colon.

## Output

Errors and warnings are listed by file. Exit code 1 if errors found, 0 if clean. Warnings (e.g. invalid date formats) don't fail the run.

```
✗ src/content/toolshed/session-management.md
  unsafe colon in title: Session management: working with Claude…
```

## Tip

Run `npm run validate` as a quick sanity check before committing any content edits. It catches the class of bug that causes silent build failures on GitHub Pages.
