---
title: "Book recommender: library audit"
date: 2026-03-17
maturity: draft
tags:
  - knowledge-management
description: Audit of 40 unread and in-progress books with status labels, reading patterns, and calibration data for the recommender.
ai: co-created
---

Labeled 40 books (10 physical, 30 e-books) across status, type, purpose, and "why stuck". Built an interactive HTML labeling interface as part of the [[book-recommender]] project.

## Key patterns

- **Ereader invisibility**: multiple books I didn't know were on my ereader. Discoverability is a real problem.
- **"Should read" guilt**: some topics feel like a chore even when I think I should read about them.
- **Density without momentum**: interesting topics but textbook feel kills the urge.
- **Lost track**: started books that just faded away.
- **Old sci-fi bias**: "masculine sci-fi" doesn't appeal, even when the topic is relevant.

## What works

- Pratchett: loved it, every time. Language + humor + philosophy + layers.
- Art of Co-design: started and enjoying it, high contender.
- Earth Emotions: remembered being beautiful but didn't stick.
- Some books work as "on the side" reads (Complete Robot, Typography Beyond Borders, Microcopy).

## Prototype

Interactive HTML labeling tool: `book-recommender/library-audit.html`. Potential future use as a library management UI on the garden.

**Features:**
- 40 books grouped by theme
- Status, type, and purpose buttons per book
- "How did you like it?" review section for finished books
- Progress bar and filter (all/labeled/unlabeled)
- Auto-saves to localStorage
- Export to JSON
