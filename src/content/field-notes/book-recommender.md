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

## Research findings

### User research interview (2026-03-17)

Used Claude to interview me about my book selection habits.

**How I pick books:**
- Topic is the primary driver. Prizes and praise lower the barrier but aren't the reason.
- Two interest threads: *how things connect* (systems, relationships, taxonomy, ecology) and *the craft of language* (words, storytelling, beauty of expression). Conversation design sits at the intersection.
- Also: soul, connection, community, humor, intelligence, layers.

**What goes wrong:**
- Topic match alone isn't enough. The Overstory had perfect topic fit but failed on experience: boring narrative, couldn't connect, no momentum.
- What makes a book work: compelling narrative, humor, intelligence, multiple layers, pulls you forward. Pratchett is the gold standard.

**Reading habits:**
- Focus is low right now. Need momentum and completion dopamine.
- Don't want "pick one book" but a *reading mix*: something lighter to keep going, plus something denser for longer-term reading.
- Fiction is for beauty/escape/narrative. Non-fiction is for curiosity and professional growth.
- Read one hour per day.
- Music is also important.

### Library audit (2026-03-17)

Labeled 40 books (10 physical, 30 e-books) across status, type, purpose, and "why stuck". Built an interactive HTML labeling interface.

**Key patterns:**
- **Ereader invisibility**: multiple books I didn't know were on my ereader. Discoverability is a real problem.
- **"Should read" guilt**: some topics feel like a chore even when I think I should read about them.
- **Density without momentum**: interesting topics but textbook feel kills the urge.
- **Lost track**: started books that just faded away.
- **Old sci-fi bias**: "masculine sci-fi" doesn't appeal, even when the topic is relevant.

**What works:**
- Pratchett: loved it, every time. Language + humor + philosophy + layers.
- Art of Co-design: started and enjoying it, high contender.
- Earth Emotions: remembered being beautiful but didn't stick.
- Some books work as "on the side" reads (Complete Robot, Typography Beyond Borders, Microcopy).

## Project log

### 2026-03-17: kickoff

Researched the approach using Claude. Decided on logic-based scoring over embeddings.

- [x] User research interview
- [x] Library audit (40 books labeled)
- [ ] Library audit follow-up: interview for remaining unlabeled books
- [ ] Design the scoring algorithm from research insights
- [ ] Build the Python script
- [ ] Build the HTML dashboard
