---
title: "Stable map positions: giving the garden roots"
date: 2026-03-19
maturity: solid
tags:
  - digital-gardens
  - knowledge-graph
develops: explore-page-design
description: How the explore map got stable positions and pinned territories, so the landscape doesn't shift on every rebuild.
ai: co-created
---

The explore map used to be stateless. Every rebuild ran UMAP from scratch, which meant items moved around, territories shifted, and the topography changed. The map had no memory of where things were.

This is a problem for a garden. You want to develop a sense of place. "The AI cluster is over there, the conversation design territory is up here." If the landscape rearranges itself every night, you can never build that familiarity.

## What changed

The build script now saves a `map-roots.json` file containing two things:

1. **Pinned positions**: every item's x,y coordinates. Once an item has been placed on the map, it stays there across rebuilds.
2. **Pinned territories**: the territory definitions (labels and center points). These don't get recomputed unless you explicitly ask for it.

## How new items are placed

When a new piece of content appears (no pinned position yet), the script finds its most similar existing neighbor by cosine similarity on embeddings and places it nearby with a small random offset. This means new items land in the right neighborhood without disturbing everything else.

## Recomputing

If the map needs a full reset (after a major restructuring, or when the territories no longer reflect the content), you can force it:

```
node scripts/build-explore-data.cjs --recompute
```

This runs UMAP and k-means from scratch, then saves the new positions as the new roots.

## Why it matters

A map that keeps changing isn't a map, it's a kaleidoscope. Pinning positions gives the garden a stable geography that visitors (and the gardener) can learn over time. The territories become real places, not labels that float around.
