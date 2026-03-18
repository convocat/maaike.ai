---
title: "A test strategy for the garden"
date: 2026-03-18
maturity: draft
tags:
  - testing
  - developer-experience
  - digital-gardens
description: "Three layers of automated testing: content validation, build verification, and Playwright E2E. Why each layer exists and what it catches."
ai: co-created
---

Testing a static site feels like overkill until the day your production build silently fails and you spend an afternoon wondering why the library page is empty.

That day happened. Four markdown files had YAML frontmatter with unquoted colon-space sequences (`reason: Strengers and Kennedy on the gendered design: who gets to be the default voice`). The Astro dev server parsed them fine. The production build did not. GitHub Actions ran, the deploy succeeded, and the site served a broken library page. No alert. No error visible in the browser. Just... fewer books.

So: a proper test strategy. Three layers, each catching different things.

## Layer 1: content validation

A Node.js script (`scripts/validate-content.mjs`) that runs on all 230 markdown files before anything else. It checks:

- **YAML parse errors** (using `js-yaml`, which is stricter than the dev server)
- **Unquoted colon-space sequences** in string values (the specific failure mode we hit)
- **Required fields per collection** (title, date, maturity, and collection-specific extras like `url` for weblinks or `author` and `status` for library)
- **Enum validation** for maturity and library status fields

Run it with `npm run validate`. It exits with code 1 if anything fails, so it can block a commit or a build pipeline.

The script doesn't run automatically yet. The right place for it is as a pre-push hook or a CI step. For now, running it manually before commits is enough. The habit is the system.

## Layer 2: build verification

The existing GitHub Actions workflow (`astro build`) already acts as a middle layer. If content breaks the build, the deploy never happens. The gap before was that it failed silently: the old build stayed live and nothing in the browser showed an error.

This layer is already in place. The value is in knowing it exists and checking `gh run list` when the site looks off.

## Layer 3: Playwright E2E

Nine tests in `tests/library.spec.ts` covering the things most likely to break after a change:

- Book cards render (basic smoke test)
- Category filter hides non-matching books
- Deactivating a category restores all books
- Maturity filter correctly shows only matching cards
- "All" button resets the maturity filter
- Sort by "Last tended" changes card order
- Recommender drawer is closed by default
- Open button opens the drawer
- Close button closes it

Run with `npm test`. Playwright spins up the dev server automatically if it isn't already running.

The tests are deliberately behavioural: they test what a user would notice is broken, not internal implementation details. Selector changes in the components would update the tests; that's the right coupling.

## What the pyramid catches

| Layer | What it catches | When to run |
|---|---|---|
| Content validator | YAML errors, missing fields, unsafe frontmatter | Before every commit |
| Build | Schema errors, broken imports, Astro compilation failures | On every push (CI) |
| Playwright | JS interaction bugs, filter logic, drawer state | After touching interactive components |

The pyramid isn't about coverage percentages. It's about knowing which layer to look at when something breaks.
