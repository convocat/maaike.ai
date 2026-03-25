---
title: "Full-scale key phrase extraction: results"
date: 2026-03-15
updated: 2026-03-19
maturity: developing
tags:
  - knowledge-graph

  - digital-gardens
description: Running LLM-based key phrase extraction on all 92 garden items. What the results reveal about phrase overlap, short-text limits, and the role of key phrases in the knowledge graph.
ai: co-created
develops: knowledge-graph-for-the-garden
---

This is the third step in building a knowledge graph for the garden. After [[setting-up-local-embedding-models|computing embeddings]] and [[tuning-the-similarity-threshold|tuning the similarity threshold]], I now have key phrases for every item. The idea: use phrases alongside embeddings to make link suggestions more interpretable and filterable.

## The run

Ran gemma3:4b (temperature 0.1) on all 92 published garden items. Total time: 43 minutes, averaging 28 seconds per item. Every item received exactly 8 phrases, as instructed: the model followed the prompt well.

736 total phrases, of which 705 are unique (96%). That's the headline finding, and it says a lot.

## Quality: mostly good, with predictable weak spots

The phrases are meaningful concepts, not fragments. A few examples:

| Item | Phrases |
|---|---|
| "Onthaast je voice action met SSML" (Dutch, 1420 words) | voice action onthaasten, speech synthesis markup language, conversational designer, standaard stemmen, dialoogtekst, natuurlijke zinsmelodie, adempauzes, ssml reference |
| "Saga: a platform for continuous construction..." (89 words) | knowledge graph platform, hybrid batch-incremental design, delta processing, extended triples metadata, blocking similarity linking, confidence scoring links, graph embeddings, fact ranking annotation |
| "My favorite AI tools - 2025 edition" (9 words) | ai tools, 2025 edition, ai overview, favorite tools, never ending, ai update, tool selection, future ai |

The Dutch article shows the model handles multilingual content natively. The Saga weblink (89 words) produces sharp, technical phrases from a short text. But the 9-word video item is pure padding: "never ending", "future ai", "ai update" are hallucinated filler, not content.

**Short texts are the weak spot.** With under ~50 words, the model invents phrases to fill the 8-phrase quota. This is the short-text problem I flagged in the [[key-phrase-extraction-for-the-garden|key phrase extraction write-up]], now confirmed in practice.

## Phrase structure

- 64% are two-word phrases, 30% are three words. The model defaults to bigrams.
- Some near-duplicates slip through: "digital gardens" vs "digital garden", "embeddings" vs "text embeddings" vs "llm-based embeddings". A normalization step (lowercase, singularize, check containment) would clean these up.
- A few formatting artifacts: "1. cosine similarity threshold" and "8. serendipitous discovery" leaked list numbering from the source content.

## Overlap: low, by design

Only 24 phrases appear in more than one item. Just 32 of 92 items (35%) share even a single phrase with another item. The remaining 60 items have completely unique phrase sets.

This isn't a failure. It reflects two things:

1. **The garden is diverse.** Content spans conversation design, AI tools, linguistics, book notes, personal reflections, and technical experiments. There genuinely aren't many items about the same topic.
2. **The LLM is specific.** It generates "conversational system prompts" instead of "conversation design", "diverse image generation" instead of "ai ethics". Specificity is good for describing individual items, but it reduces exact-match overlap.

## What this means for the knowledge graph

Key phrases alone won't build the graph. If only 35% of items share a phrase, phrase co-occurrence misses most of the meaningful connections.

But that was always the plan. The embeddings capture semantic similarity (items about related topics score high even with different vocabulary), while key phrases add interpretability (they explain *why* two items are related).

The combination works like this:
- Embeddings propose link candidates (based on vector similarity)
- Key phrases label the connection ("both discuss embedding models") or flag false positives (high similarity but no shared concepts)

## Cleanup before using

Before feeding these into the graph, a few normalization steps:

- Strip list numbering artifacts
- Lowercase and deduplicate near-matches ("digital gardens" → "digital garden")
- Drop or reduce phrases for very short items (under 50 words) where the model padded

## Next step

Design the review UI for link candidates, combining similarity scores with key phrase overlap.
