---
title: Book recommender
date: 2026-03-17
maturity: draft
tags:
  - project
  - python
  - knowledge-management
  - digital-gardens
description: A personal book recommender that matches candidates against my library, garden interests, and current mood. No AI, just logic.
ai: co-created
---

A mini project to help me decide what to read next. The idea: take a list of book candidates, compare them against my existing library and what I'm currently writing about in the garden, and surface the best match for my mood.

## Why

I have stacks of unread books, both physical and on my e-reader. Picking the next one is surprisingly hard. I don't want algorithmic recommendations based on what other people read. I want something that knows *me*: my library, my current interests, my energy level.

## Design constraints

- **No AI**: pure logic and scoring. How far can structured matching get us?
- **Free**: no API keys, no subscriptions
- **Visual**: an interactive HTML dashboard (single file, like a vibe-coded prototype)
- **Personal**: reads directly from my digital garden and library data
- **Integrated**: reads from and writes back to the garden library. The library page is the single source of truth

## How it works

**Input:**
- Book candidates (titles + metadata, entered manually)
- Mood selection (deep focus / light & curious / comfort zone / challenge me)

**Context (pulled automatically):**
- Library collection with audit labels (status, type, purpose, ratings)
- Garden content tags (77 unique tags across all collections)
- Recent garden activity (what I'm currently writing about)

**Output per book:**
- Summary
- Density indicator
- Social proof (what others thought)
- Garden connection: which projects it supports, what new ideas it opens up
- Maaike fun factor
- Estimated reading time (based on 1 hour/day)

**Scoring dimensions:**
1. **Relevance**: tag and subject overlap with my library and garden interests
2. **Novelty**: does this book fill a gap in my reading, or add to an existing cluster?
3. **Mood fit**: matches the candidate's character (dense/light, academic/narrative) to selected mood
4. **Current focus**: bonus for books that connect to what I'm actively working on

**Output format:**
- Not "pick one book" but a *reading mix*: a lighter book for momentum + a denser book for longer-term reading
- Interactive HTML dashboard with scored book cards

## Project log

### 2026-03-17: kickoff

Researched the approach using Claude. Decided on logic-based scoring over embeddings.

- [x] User research interview ([[book-recommender-user-research|write-up]])
- [x] Library audit, 40 books labeled ([[book-recommender-library-audit|prototype]])
- [ ] Library audit follow-up: interview for remaining unlabeled books
- [x] Design the scoring algorithm ([[book-recommender-scoring-algorithm|design]])
- [x] Build the Python script
- [x] Build the HTML dashboard (all 4 moods, score breakdowns, pages, reading time)
- [x] Add learning layer to dashboard (score tooltips, matched keywords, mood profile card, algorithm explainer)
- [x] Library integration ([[book-recommender-library-integration|design]]): extend library frontmatter with audit fields
- [x] Library integration: update recommender to read from garden library markdown files
- [x] Library integration: write top picks back to library frontmatter
- [ ] Library integration: inline audit editing on library page
- [ ] Library integration: add "get recommendations" trigger on library page
