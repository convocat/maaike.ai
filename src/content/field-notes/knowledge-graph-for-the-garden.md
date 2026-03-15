---
title: Knowledge graph for the garden
date: 2026-03-14
maturity: developing
tags:
  - project
  - digital-gardens
  - knowledge-graph
  - ai
description: Research into making the garden smarter about its own connections, from automatic backlinks to a full world model.
ai: co-created
---

This field note tracks research into making the garden smarter about its own connections: automatically discovering semantic links between content, building a "world model" from the garden's own structure, and using that model to find relevant external content.

## The idea

Right now, connections in this garden are manual. Wiki-links, tags, and the recommender system all work, but they depend on me knowing what connects to what. What if the garden could discover its own structure?

Three goals:
1. **Smarter backlinks**: automatically suggest and maintain semantically relevant links between content, beyond explicit wiki-links
2. **Garden world model**: extract a knowledge graph from all content, capturing entities, topics, and relationships
3. **External discovery**: use the world model to periodically find relevant articles, papers, and resources on the internet

## Inspiration: Apple's Saga

The [[saga-knowledge-platform|Saga platform]] (SIGMOD 2022) builds knowledge graphs at scale using a hybrid batch-incremental design. Not everything transfers to a garden with ~200 items, but several ideas do:

**What transfers:**
- **Delta processing**: don't rebuild the link graph from scratch on every change. Track what's added/updated and only reprocess those items
- **Extended triples with provenance**: store links as (source, relationship, target, confidence, method). The "method" metadata (manual, auto-extracted, external) lets you filter and audit
- **Blocking + lightweight similarity**: don't compare every pair (200 items = 19,900 pairs). Use cheap signals first (shared tags, overlapping terms), then run expensive semantic similarity only within candidate blocks
- **Confidence scores**: auto-generated links get a confidence score. High confidence = shown as "related". Low confidence = queued for review
- **Gap identification**: profile the content graph for orphan nodes and sparse regions to find what's missing

**From the follow-up paper (SIGMOD 2023):**
- **Embeddings for similarity**: compute embeddings per item (sentence-transformers works fine at this scale), use cosine similarity to find non-obvious connections
- **Semantic annotation of external content**: when bookmarking external content, auto-link it to existing items via embedding similarity
- **Plausibility scoring**: use the graph's embeddings to check whether a proposed new link "makes sense"

## Research questions

- What's the simplest pipeline that gives useful results at garden scale?
- Can this run at build time (Astro) or does it need a separate process?
- How to handle the review step: present candidates for manual approval vs. auto-linking?
- ~~What embedding model works well for short-form content with mixed topics?~~ Answered: bge-m3, a non-generative BERT-family encoder. Selected for score discrimination, multilingual support, thin-content robustness, and focused encoder architecture (not an LLM). See [[embedding-models-for-the-garden|model selection criteria]].
- How to balance serendipity (surprising connections) with relevance? Partially answered: 0.55 cosine similarity threshold yields 2,771 candidates across 157 items. Most high-scoring pairs are obvious (same-series items, book pairs on the same topic). The interesting cross-collection candidates are buried in noise. See [[tuning-the-similarity-threshold|threshold tuning analysis]] for filtering strategies and research.

## Rough architecture

```
Content items (markdown)
    ↓
1. Extract key phrases + entities per item
2. Compute embeddings (bge-m3 via Ollama)
3. Block by shared tags/entities
4. Within blocks: cosine similarity on embeddings
5. Threshold → auto-links (high confidence) + candidates (review)
6. Store as extended triples: (item, relates-to, item, confidence, method)
    ↓
Static link graph (deployed with site)
    ↓
Periodic enrichment job:
  - Profile graph for orphans / sparse clusters
  - Search external sources for gap topics
  - Embed results, match to internal items
  - Flag new candidates for review
```

## Status

- [x] Read and annotate Saga papers ([[reading-notes-saga-knowledge-graph|reading notes]])
- [x] Survey embedding models ([[embedding-models-for-the-garden|model survey]])
- [x] Set up models locally + compare on 10 items ([[setting-up-local-embedding-models|experiment]])
- [x] Full-scale embedding run on 157 items ([[setting-up-local-embedding-models|experiment]])
- [x] Analyze threshold and filtering strategies ([[tuning-the-similarity-threshold|write-up]])
- [x] Research key phrase extraction methods ([[key-phrase-extraction-for-the-garden|write-up]])
- [x] Prototype: extract key phrases from 10 garden items ([[key-phrase-extraction-prototype|experiment]])
- [ ] Design review UI for link candidates

## Related

- [[garden-to-do-list]]
- [[chatbots-without-ai]]
