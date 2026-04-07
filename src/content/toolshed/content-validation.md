---
title: Content validation
date: 2026-04-05
maturity: solid
tags: [technical, tooling, content, quality]
description: The validate-content script that checks frontmatter completeness, slug hygiene, and required fields before publishing.
category: technical
section: Infrastructure
ai: co-created
---

Before publishing, `scripts/validate-content.mjs` runs a set of checks across all content files. It's invoked by the `/publish` skill as a pre-flight step.

## What it checks

- **Required fields present**: `title`, `date`, `maturity`, `tags`
- **Maturity is a known value**: one of `draft`, `developing`, `solid`, `complete`, `compost`
- **Slug hygiene**: filename is lowercase, hyphenated, no spaces or special characters
- **Description length**: warns if description is absent or too short (under 30 characters)
- **AI field**: warns if `ai` is not set (all published posts should declare their AI involvement)
- **Date format**: validates that `date` is a parseable ISO date
- **Draft flag**: checks that posts being published don't have `draft: true`

## Output

The script prints a report to stdout. Errors (missing required fields, invalid values) fail the process with a non-zero exit code. Warnings (missing description, missing AI field) are printed but don't fail.

```
✓ articles/my-post.md
⚠ seeds/rough-idea.md — description missing
✗ field-notes/broken.md — maturity "in-progress" is not a valid value
```

## Where it runs

- Manually: `node scripts/validate-content.mjs`
- Via `/publish` skill: runs before OG image generation and git push
- The skill aborts if validation fails with errors

## Why not rely on Zod alone

Astro's Zod schema validation runs at build time and will fail the build if required fields are missing. The validate script is a faster, earlier check — it runs in under a second without starting the full Astro build. It also surfaces warnings (like missing descriptions) that Zod doesn't cover because those fields are optional in the schema.

## Adding new checks

The script uses a simple array of check functions. Each check receives the parsed frontmatter and filename, and returns `{ type: 'error' | 'warn' | 'ok', message: string }`.
