---
title: "Book recommender: scoring algorithm"
date: 2026-03-17
maturity: draft
tags:
  - knowledge-management
description: Design for the logic-based scoring algorithm that powers the book recommender. Five dimensions, no AI.
ai: co-created
develops: book-recommender
---

Scoring algorithm design for the [[book-recommender]] project. Pure logic, no AI, no embeddings.

## Per-book scores (0-100 each)

### 1. Topic match (weight: 30%)

Compare book's genre/subjects against core interest threads:
- *How things connect*: systems, ecology, relationships, taxonomy, community, connection
- *The craft of language*: language, storytelling, words, communication, conversation design
- *The deeper layer*: soul, humor, intelligence, philosophy, layers

Each keyword match = points. More matches = higher score.

### 2. Experience prediction (weight: 25%)

Based on audit calibration data: what made finished books work or fail.
- Signals: genre density (academic vs narrative), page count, known-loved author (Pratchett, Murakami)
- Penalize: "textbook feel" genres (Linguistics, Semiotics, Economics) unless mood is "deep focus"
- Bonus: humor, satire, short stories (momentum-friendly)

### 3. Mood fit (weight: 25%)

User selects mood at runtime:
- **Deep focus**: boost dense non-fiction, professional, long reads
- **Light & curious**: boost short fiction, essays, poetry, short stories
- **Comfort zone**: boost known authors, series continuations, re-reads
- **Challenge me**: boost unread genres, unfamiliar authors, "should reads"

### 4. Garden connection (weight: 10%)

- Match book subjects against garden tags
- Bonus if it connects to an active project (tagged `project` + recent `updated` date)

### 5. Freshness (weight: 10%)

- Boost books marked "not on my radar" or "forgot I had it" (ereader invisibility fix)
- Boost recent purchases
- Penalize abandoned books (unless mood is "challenge me")

## Reading mix output

Instead of ranking all books 1-40, output a recommended mix:
- **Main read**: highest overall score
- **Side read**: highest score among short/light books (short stories, essays, reference works, children's books)
- **Wildcard**: random pick from top 10 that isn't in the same genre as main/side

Each book card shows: title, author, total score, score breakdown, estimated days to finish, garden connections, and a one-line "why this one".
