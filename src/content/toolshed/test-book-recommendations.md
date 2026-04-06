---
title: Book recommendations test suite
description: "Tests for the book recommendation pipeline: parser edge cases, output structure, and type safety."
date: 2026-04-06
maturity: solid
tags: [testing, books, scripts]
category: technical
section: Tests
ai: co-created
---

The test suite at `scripts/test-book-recommendations.cjs` catches bugs in the book recommendation pipeline before they reach production. Run it after any change to `generate-book-recommendations.cjs` or the library frontmatter parser.

```bash
node scripts/test-book-recommendations.cjs
# or
npm run test:books
```

## What it tests

**Frontmatter parser edge cases**
- Empty quoted strings (`author: ""`) must parse as `''`, not `[]`
- Boolean values (`true`/`false`) parse as booleans
- Numeric strings stay as strings (no silent coercion)
- Arrays with items parse correctly
- Empty array literals (`[]`) parse as empty arrays

**Output structure**
- `scored-books.json` exists and is valid
- `all_scored` is an array with at least 10 books
- `mix.main`, `mix.side`, and `mix.wildcard` are all present

**Type safety on every scored book**
- `title` is a string
- `author` is a string
- `scores` is an object with a `garden.score` number

**Content rules**
- No books with `status: read` appear in the scored list

## Lesson encoded

The frontmatter parser in `generate-book-recommendations.cjs` had a subtle bug: it stripped quotes before checking for an empty value. So `author: ""` became `""` → strip quotes → `""` (empty string) → `value === ''` check → assigned as `[]` (empty array). Arrays are truthy, so `[] || ""` returns `[]`, and `[].toLowerCase` is not a function. The error was caught only at runtime in the browser, not during generation.

Fix: always check for empty before stripping quotes. If the raw value is `""` or `''`, that is an explicit empty string, not an array start.

The corrected version in `build-explore-data.cjs` already had this right. The bug lived only in the copy made for the recommender script.
