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

## How it works

**Input:**
- Book candidates (titles + metadata, entered manually)
- Mood selection (deep focus / light & curious / comfort zone / challenge me)

**Context (pulled automatically):**
- Library collection (59 books, subjects, tags)
- Open Library metadata for candidates (subjects, descriptions)
- Garden content tags (77 unique tags across all collections)
- Recent garden activity (what I'm currently writing about)

**Scoring dimensions:**
1. **Relevance**: tag and subject overlap with my library and garden interests
2. **Novelty**: does this book fill a gap in my reading, or add to an existing cluster?
3. **Mood fit**: matches the candidate's character (dense/light, academic/narrative) to selected mood
4. **Current focus**: bonus for books that connect to what I'm actively working on

**Output:**
- Interactive HTML dashboard with scored book cards
- Visual breakdown per book: why this one, why now
- Tag cloud sidebar showing current interests

## Project log

### 2026-03-17: kickoff

Researched the approach using Claude. Decided on Option A (logic-based scoring) over embeddings. Key decisions:
- Manual candidate input for v1 (I'll use the Claude app to read book photos and type in the data)
- Mood categories need user research to get right
- Relevance vs. novelty balance: needs investigation through interview

**Next steps:**
- [ ] User research interview: how do I actually pick books?
- [ ] Design the scoring algorithm from interview insights
- [ ] Build tag mapping (Open Library subjects to garden tags)
- [ ] Build the Python script
- [ ] Build the HTML dashboard
