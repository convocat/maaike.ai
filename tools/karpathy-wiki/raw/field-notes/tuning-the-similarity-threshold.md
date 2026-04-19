---
title: "Tuning the similarity threshold: from 2,771 candidates to useful suggestions"
date: 2026-03-15
updated: 2026-03-19
maturity: developing
tags:
  - knowledge-graph

  - digital-gardens
description: How to go from "everything is related to everything" to a useful set of link candidates. Data analysis, filtering strategies, and the research behind them.
ai: co-created
develops: knowledge-graph-for-the-garden
---

The [[knowledge-graph-for-the-garden|knowledge graph experiment]] produced 2,771 candidate link pairs at a 0.55 cosine similarity threshold. At that volume, the results become meaningless: no one is going to review nearly three thousand pairs, and the genuinely surprising connections (a seed about Dutch quantization linking to a book review about multilingual NLP, say) are buried under hundreds of obvious same-topic matches. This field note documents how to find a better threshold, what filtering strategies exist, and which ones fit a garden this size.

## The problem with a fixed threshold

A single global threshold assumes that similarity scores are comparable across all pairs. They're not.

Same-collection pairs (article to article, book to book) average 0.556 similarity. Cross-collection pairs (article to book, seed to video) average 0.479. A threshold of 0.55 catches most of the interesting same-collection pairs but also floods the results with noise. The 95th percentile for cross-collection pairs is only 0.590, while for same-collection it's 0.695.

This means 0.55 is simultaneously too low for same-collection (catches obvious matches like Dutch/English versions of the same article at 0.93, or SSML quickstart part 1 and part 2 at 0.85) and too high for cross-collection (misses subtle connections that score below 0.55 but are genuinely interesting).

**How many pairs survive at different thresholds:**

| Threshold | Pairs | % of total |
|---|---|---|
| 0.55 | 2,801 | 22.9% |
| 0.60 | 1,170 | 9.6% |
| 0.65 | 470 | 3.8% |
| 0.70 | 180 | 1.5% |

Even at 0.65, that's 470 pairs to review. And the cross-collection gems (the ones that would surprise me) might not make that cut.

## Four approaches from the literature

### 1. Per-document normalization

Instead of asking "is 0.62 high enough?", ask "is this score unusually high *for this particular document*?"

Rossi et al. ("Relevance filtering for embedding-based retrieval", CIKM 2024) show that raw cosine similarity scores aren't comparable across queries. Their solution is a learned transformation, but the core insight works without machine learning: z-score normalize each document's similarity scores (subtract the mean, divide by standard deviation), then threshold on the normalized score. A document about conversational design that's similar to lots of other items at 0.58 would need a higher raw score to stand out than a niche seed about Dutch quantization that rarely scores above 0.50.

This directly addresses the cross-collection problem. A cross-collection pair scoring 0.56 might be unremarkable for a well-connected article but exceptional for an isolated seed.

### 2. Spectral thresholding

Build the full similarity graph (all pairs, all scores) and let graph theory find the natural cutoff.

Sterner & Geibel ("Thresholding of semantic similarity networks using a spectral graph-based technique", 2013) use eigenvalue decomposition of the graph Laplacian to find the threshold that best preserves community structure while removing noise. Witschard & Mayr ("Using similarity network analysis to improve text similarity calculations", 2025) extend this to compare embedding models and validate thresholds.

The idea: every similarity graph has a natural structure of clusters and bridges. The spectral gap (the jump between eigenvalues of the Laplacian) tells you where the boundary between "real structure" and "noise" lies. No labeled data needed, and computationally trivial for 157 items.

### 3. Blocking (compare less, not more)

Instead of computing all 12,246 pairs and filtering afterward, only compare pairs that share some cheap signal first.

Papadakis et al. ("Blocking and filtering techniques for entity resolution: a survey", ACM Computing Surveys 2020) is the definitive overview. The relevant technique for this garden is **token blocking**: group items by shared tags, then only compute embedding similarity within groups. Two items tagged `knowledge-graph` get compared; an item tagged `voice-design` and one tagged `book-review` don't, unless they also share a keyword or entity.

This is exactly what the [[saga-knowledge-platform|Saga papers]] recommend: blocking + lightweight similarity before expensive comparison. At garden scale, blocking isn't about computation time (computing all 12,246 cosine similarities takes milliseconds). It's about reducing false positives: pairs that score moderately high on embeddings but have no business being linked.

The twist: pure tag-based blocking would miss the surprising cross-topic connections that make a garden interesting. A hybrid approach could use tag-blocking for high-confidence auto-links and unblocked comparison for the "serendipity" suggestions, with a higher threshold for the unblocked set.

### 4. Empirical calibration with labeled pairs

The sentence-transformers library includes a BinaryClassificationEvaluator that sweeps all possible thresholds against a set of labeled pairs (should link / should not link) and reports the F1-optimal threshold.

For a corpus this size, labeling 50-100 pairs is enough. The wiki-links we already have give us ~50 positive examples. Sampling 50 pairs from the mid-range (0.50-0.60) and labeling them "yes" or "no" would produce a reliable calibration set.

## What fits this garden

The garden has 157 items across 7 collections. The goals are serendipitous discovery (not just confirming obvious connections) and a manageable review queue (not 2,771 candidates).

A layered approach:

1. **Normalize per document** to make scores comparable across items of different connectedness
2. **Split same-collection and cross-collection** with different thresholds: same-collection pairs need a higher bar (skip the obvious series matches), cross-collection pairs get a lower bar (that's where the surprises are)
3. **Exclude trivially similar pairs**: translations (Dutch/English), series entries (SSML quickstart 1, 2, 3), and items linking to their own reading notes. These can be detected by slug similarity or explicit series metadata
4. **Label 50 pairs from the middle range** to calibrate the threshold empirically, rather than guessing

The spectral approach is elegant but might be overkill for a first pass. Worth trying once the obvious noise is filtered out.

## Further reading

- Rossi et al., "[Relevance filtering for embedding-based retrieval](https://arxiv.org/abs/2408.04887)" (CIKM 2024): per-query score normalization
- Rekabsaz & Lupu, "[Exploration of a threshold for similarity based on uncertainty in word embeddings](https://navid-rekabsaz.github.io/papers/ecir17-uncertainty.pdf)" (ECIR 2017): deriving thresholds from embedding uncertainty
- Witschard & Mayr, "[Using similarity network analysis to improve text similarity calculations](https://link.springer.com/article/10.1007/s41109-025-00699-7)" (Applied Network Science, 2025): spectral thresholding for document similarity
- Sterner & Geibel, "[Thresholding of semantic similarity networks](https://arxiv.org/abs/1305.4858)" (2013): foundational spectral graph technique
- Papadakis et al., "[Blocking and filtering techniques for entity resolution: a survey](https://dl.acm.org/doi/10.1145/3377455)" (ACM Computing Surveys, 2020)
- [Sentence-Transformers BinaryClassificationEvaluator](https://sbert.net/docs/package_reference/sentence_transformer/evaluation.html): empirical threshold calibration

<div class="observation">

**Observation**

At first, I struggled with Claude generating so much, rather than me researching and writing. Was this still me, and is this still research?

Then I realised: the answer to that is in me, not in the AI. The real questions are: am I reading everything Claude outputs? Am I capable of spotting omissions and doing a critical analysis of the generated content?

I decided to ask for specific write-ups for each step, and to reference research articles. To my surprise, I now seem to have some kind of living textbook that's based on my own garden, with my own goals. This really does seem to come close to the rich note-taking, writing, and learning environment I envisioned.

</div>
