---
title: "How content chunk size influences embedding representations"
date: 2026-03-15
updated: 2026-03-19
maturity: developing
tags:
  - knowledge-graph

  - embeddings
description: Why embedding models cluster documents by format instead of topic when content lengths vary, and what to do about it.
ai: co-created
develops: knowledge-graph-for-the-garden
---

## The problem

When you embed documents of very different lengths, the embedding model doesn't just encode "what this is about." It also encodes "what kind of text this is." A 1500-word article and a 30-word video description can be about the exact same topic, but their embeddings will be far apart because the model encodes content structure, vocabulary density, and stylistic patterns alongside the actual meaning.

We discovered this in the [[explore-page-design|explore page]] for this garden. The spatial map was clustering items by collection type (all library books together, all videos together, all articles together) instead of by topic. A book about conversation design should sit near an article about conversation design, but it didn't.

## What we tried

### Attempt 1: metadata-enriched full text

The original embedding input was: `Title + Description + Tags + full body text` (truncated to 800 words).

Result: strong collection-type clustering. Articles dominated by prose, videos by their short descriptions, library books by blurb language. bge-m3 encoded the format more than the topic.

Collection mix per cluster: "conversation design" was 100% articles, "artificial intelligence" was 96% library books, "key phrase extraction" was 70% videos. The map showed content type, not content topic.

### Attempt 2: normalized metadata only

Re-embedded all 164 items using only: `Title + Description + Tags`. No body text at all, same format for every item regardless of collection type.

Result: better mixing. The "digital garden" cluster had 4 collection types, "graph embeddings" had 5. But library books still clumped together (95% of one cluster). Their descriptions share a "book blurb" writing style that the model picks up on.

## Why this happens

Embedding models are trained on enormous text corpora. They learn that certain word patterns, sentence structures, and vocabulary choices co-occur. A book description ("A comprehensive guide to...") is syntactically different from a field note ("Today I tried...") even if both discuss the same concept.

For short texts, this problem is amplified. With a 30-word video title, there's almost no topical signal for the model to work with. The embedding ends up mostly encoding genre and format.

This is related to the short-text problem we identified in [[full-scale-key-phrase-extraction|key phrase extraction]]: short content items lack enough signal for meaningful analysis.

## Potential solutions

1. **Enrich thin content before embedding.** Pull in video transcripts (YouTube API), generate book summaries from full texts, expand seed descriptions. More topical text = more topical embeddings.
2. **Hybrid embedding:** Embed metadata separately from body text, then combine with weighted average. This prevents body text length from dominating the signal.
3. **Collection-blind normalization:** Strip collection-specific language patterns (e.g., "In this video...", "A guide for...") before embedding.
4. **Fine-tune the embedding model** on garden-specific data. Impractical at our scale (164 items).

Option 1 is the most promising and aligns with what we already need: video transcripts and book summaries would improve the garden content regardless of the embedding use case.

## Implications for the knowledge graph

The embedding-based link candidates (the 100 cross-links we applied) used full-text embeddings. Those links are likely biased toward within-collection connections: articles linked to articles, not articles linked to relevant videos or books. A re-run with better embeddings could surface more cross-collection connections.

The UMAP map positions now use normalized embeddings, but the link candidates haven't been regenerated yet.

## Related

- [[embedding-models-for-the-garden]]
- [[tuning-the-similarity-threshold]]
- [[full-scale-key-phrase-extraction]]
- [[explore-page-design]]
