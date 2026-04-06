---
title: Book recommender
date: 2026-03-17
updated: 2026-03-19
maturity: draft
tags:
  - python
  - knowledge-management
  - digital-gardens
hub: true
description: A personal book recommender that matches candidates against my library and garden interests. No AI, just logic and situational vibe chips.
ai: co-created
---

A mini project to help me decide what to read next. The idea: score all my unread books against my interests and garden context, then let situational vibe chips re-rank the results based on what I actually need right now.

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
- The garden library (all books with audit labels: status, type, purpose, ratings)
- Vibe chip selection (optional, client-side)

**Context (pulled automatically):**
- Garden content tags across all collections
- Active garden projects (tagged `project`)

**Scoring dimensions (Python, run once):**
1. **Topic match** (30%): keyword overlap with three interest threads: systems/ecology, language/storytelling, philosophy/depth
2. **Experience** (35%): predicted enjoyment: loved authors, genre density, momentum signals
3. **Garden connection** (20%): tag and project overlap with active garden work
4. **Freshness** (15%): rediscovery bonus for forgotten or recently acquired books

**Vibe chips (client-side re-ranking):**
- **Short session**: best-scoring book under 250 pages
- **Feed the work**: re-ranks by garden connection score
- **From the pile**: re-ranks by freshness score
- **Surprise me**: widens the shuffle pool to top 15

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
- [x] Build the HTML dashboard (score breakdowns, pages, reading time, learning layer)
- [x] Add learning layer to dashboard (score tooltips, matched keywords, algorithm explainer)
- [x] Library integration ([[book-recommender-library-integration|design]]): extend library frontmatter with audit fields
- [x] Library integration: update recommender to read from garden library markdown files
- [x] Library integration: write top picks back to library frontmatter
- [x] Add vibe chips: client-side re-ranking with situational chips and a shuffle button
- [x] Library integration: inline audit editing on library page
- [x] Library integration: add "get recommendations" trigger on library page
- [x] Port Python scoring script to Node.js: `scripts/generate-book-recommendations.cjs`
- [x] Score all 110 library books (previously only 3 were scored)
- [x] Add "include books I already read" toggle on dashboard
- [x] Add test suite: `scripts/test-book-recommendations.cjs` — parser edge cases, type safety, output structure
