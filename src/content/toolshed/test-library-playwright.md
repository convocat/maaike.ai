---
title: Library UI tests (Playwright)
description: End-to-end browser tests for the library page. Covers filtering, status toggles, and the book recommender drawer.
date: 2026-04-06
maturity: solid
tags: [testing, library, playwright, ui]
category: technical
section: Tests
ai: co-created
---

End-to-end browser tests for the library page. Runs a real Chromium browser against the dev server to verify that filtering and the recommender drawer work correctly.

```bash
npm test
```

The dev server starts automatically. Tests run in Chromium only, single worker (not parallel).

## What it covers

**Book cards**
- Cards render and there are more than 10

**Category filter**
- Filtering reduces visible cards
- Clicking the same filter again restores all cards

**Maturity filter**
- Filtering to `draft` shows only cards with `data-maturity="draft"`
- The "All" button resets the filter

**Status filter**
- Filtering to `to-read` shows only `data-status="to-read"` cards
- Filtering to `read` shows only `data-status="read"` cards
- Clicking the active status filter again restores all cards

**Recommender drawer**
- Drawer is hidden by default
- Open button makes drawer visible
- Close button hides it again

## Debugging

Playwright records traces on first retry. If a test fails, open the trace viewer:

```bash
npx playwright show-trace test-results/<run>/trace.zip
```
