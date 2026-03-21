---
title: "Experiment 2: thematic analysis with 1M context"
date: 2026-03-21
maturity: developing
tags:
  - claude-code
  - 1m-context
  - thematic-analysis
description: "Testing the 1M context window by loading the entire garden and running thematic analysis, comparing fresh analysis against graph-augmented analysis."
ai: co-created
develops: claude-code-whats-new-for-the-garden
---

# Experiment 2: thematic analysis with 1M context

Part of [[claude-code-whats-new-for-the-garden]].

**Feature under test:** 1M context window (Opus 4.6, standard pricing)
**Question:** Can Claude hold an entire garden in context and discover themes that the gardener hasn't explicitly structured?

## Design

Two passes over the same garden, compared:

### Approach A: fresh thematic analysis
Load all ~200 content files as raw markdown. No prior structure, no embeddings. Code themes purely from what the text says. Tests whether 1M context can find patterns a human would miss.

### Approach B: graph-augmented thematic analysis
Start from existing embeddings and key phrases, cluster by similarity, then read representative files per cluster to name themes. Tests whether existing infrastructure accelerates or constrains discovery.

**Risk noted before starting:** B might just confirm what the existing tag/relation structure already captures — locking us into the known rather than surfacing the unknown.

## Findings

### Approach A

See [[thematic-analysis-approach-a-fresh]]. Seven themes and one emerging pattern discovered from a fresh reading of all 244 files.

### Approach B

See [[thematic-analysis-approach-b-graph-augmented]]. Ten embedding clusters compared against the fresh themes. The embeddings confirm topical structure but miss cross-cutting themes about truth, authenticity, non-linearity, and bilingual critique.

## Observations

- The 1M context window held all 244 files comfortably. Loading was the bottleneck (tool output limits required chunked reads), not context capacity.
- Fresh reading (Approach A) found themes that embeddings (Approach B) structurally cannot: themes defined by stance, autobiography, and argument structure rather than topic.
- Embeddings confirmed the known format contamination problem: videos cluster together regardless of topic.
- The combination is stronger than either alone: embeddings map the landscape, full-context reading finds the threads that cross it.
