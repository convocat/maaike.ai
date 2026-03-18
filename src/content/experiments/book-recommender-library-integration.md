---
title: "Book recommender: library integration"
date: 2026-03-18
maturity: draft
tags:
  - project
  - knowledge-management
  - digital-gardens
description: Design for integrating the book recommender with the garden library, making it the single source of truth for all book data.
ai: co-created
---

Design for integrating the [[book-recommender]] with the garden's library collection.

## Goal

Replace the standalone `library-audit.json` with the garden's existing library collection. The library page becomes the single interface for managing books and triggering recommendations.

## Approach

### 1. Extend library frontmatter

Add audit fields to each book's markdown frontmatter:

```yaml
# Existing fields
title: 1Q84
author: Haruki Murakami
status: to-read

# New audit fields
type: fiction
purpose: personal
reason: "Not on my radar; I really liked previous Murakami books"
notes: null
rating: null
review: null
```

### 2. Recommender reads from library

`recommend.py` reads markdown files from `src/content/library/` instead of `library-audit.json`. Parses frontmatter using Python's `yaml` library.

### 3. Write back recommendations

After scoring, the script updates top picks with a `recommended` field in their frontmatter:

```yaml
recommended: true
recommended_mood: comfort-zone
recommended_score: 57.0
```

This lets the library page highlight current picks visually.

### 4. Library page UI

Two upgrades to the existing garden library page:
- Inline audit editing: each book entry has an expandable form for type, purpose, reason, notes, rating
- A "get recommendations" trigger that runs the recommender and opens the dashboard

The display layer (covers, collection view, status filters) stays unchanged.
