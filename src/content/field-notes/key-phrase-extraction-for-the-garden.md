---
title: "Key phrase extraction for the garden"
date: 2026-03-15
updated: 2026-03-19
maturity: developing
tags:
  - knowledge-graph
  - ai
  - digital-gardens
description: What key phrase extraction is, how it evolved from word counting to LLM prompting, and which approach fits a small multilingual knowledge garden.
ai: co-created
develops: knowledge-graph-for-the-garden
---

Key phrase extraction is step 1 in the [[knowledge-graph-for-the-garden|knowledge graph architecture]]: before we can block items by shared concepts (to reduce the 2,771 candidate pairs), we need to know what each item is *about* in a way that's more structured than tags but richer than raw text.

Tags are manually assigned and coarse-grained. An article tagged `ai` might be about prompt engineering, AI ethics, or embedding models. Key phrases capture what's actually in the text: "cosine similarity threshold," "conversational design," "serendipitous discovery." They sit between tags (human-curated, few per item) and embeddings (machine-generated, no human-readable meaning).

## How key phrases relate to embeddings

Embeddings and key phrases solve the same problem (what is this text about?) in opposite ways.

An embedding compresses the entire text into a single vector of 1,024 numbers. It captures the overall meaning, but that meaning is opaque: you can compute that two items are 0.63 similar, but you can't say *why*. The vector doesn't tell you which concepts they share.

Key phrases do the reverse. They extract specific, human-readable concepts from the text: "cosine similarity," "knowledge graph," "serendipitous discovery." They're transparent but narrow. Two items might share the concept "conversational AI" but talk about it in completely different ways that key phrases won't capture.

In the [[knowledge-graph-for-the-garden|knowledge graph pipeline]], they complement each other:

1. **Key phrases for blocking**: group items that share concepts, so you don't compare all 12,246 pairs
2. **Embeddings for scoring**: within each group, use cosine similarity to rank how closely related items actually are
3. **Key phrases for explanation**: when the system suggests a link, show *which concepts* the items share, not just a similarity score

This is the same layered approach the [[saga-knowledge-platform|Saga platform]] uses: cheap signals first (shared entities/phrases), expensive computation second (embedding similarity).

## Why this matters for the knowledge graph

The [[tuning-the-similarity-threshold|threshold tuning analysis]] showed that tag-based blocking would miss cross-topic connections. Key phrases offer a middle ground: two items might not share any tags, but if both mention "local embedding models" or "conversational AI," that's a cheap, meaningful signal to compare them.

Key phrases also feed directly into the extended triples from the [[saga-knowledge-platform|Saga architecture]]: `(item, has-concept, "cosine similarity")` is more useful for graph reasoning than `(item, has-tag, "ai")`.

## Four eras of key phrase extraction

### Era 1: statistical methods (1999-2013)

The earliest approaches use word frequency and position to identify important terms, with no understanding of meaning.

**RAKE** (Rapid Automatic Keyword Extraction, Rose et al. 2010) splits text on stopwords and punctuation, then scores the remaining phrases by word co-occurrence within those phrases. Simple and fast, but produces noisy results on short texts because there isn't enough co-occurrence data.

**YAKE** (Yet Another Keyword Extractor, Campos et al. 2020) improves on this with five features: word casing, position in text, frequency, relationship to context, and distribution across sentences. Purely statistical, no model needed, handles any language by swapping stopword lists. The best no-dependency option.

Key papers:
- Rose et al., "[Automatic keyword extraction from individual documents](https://doi.org/10.1002/9780470689646.ch1)" (2010): RAKE
- Campos et al., "[YAKE! Keyword extraction from single documents using multiple local features](https://doi.org/10.1016/j.ins.2019.09.013)" (Information Sciences, 2020)

### Era 2: graph-based methods (2004-2018)

**TextRank** (Mihalcea & Tarau 2004) builds a graph where words are nodes and edges connect words that appear near each other. Then it runs PageRank (the algorithm Google uses to rank web pages) on this graph. Words that connect to many other important words bubble to the top. Works better than statistical methods for longer texts, but still struggles with short content.

Key paper:
- Mihalcea & Tarau, "[TextRank: Bringing order into texts](https://aclanthology.org/W04-3252/)" (EMNLP 2004)

### Era 3: embedding-based methods (2018-2023)

**KeyBERT** (Grootendorst 2020) takes a different approach entirely. It embeds the full document and every candidate phrase using a sentence-transformer model, then ranks candidates by cosine similarity to the document embedding. The phrase that best represents the whole document scores highest.

This is conceptually elegant: instead of counting words, it asks "which phrase captures the meaning of this text?" It can also use MMR (Maximal Marginal Relevance) to diversify results, so you don't get five variations of the same phrase.

The catch for short texts: when the document is only 50-100 words, the document embedding and candidate embeddings are too similar to each other. There isn't enough context for the model to differentiate meaningfully.

**KeyphraseVectorizers** (Schopf et al. 2022) improves candidate selection by using part-of-speech patterns instead of raw n-grams, so you get grammatically correct phrases rather than broken fragments.

Key papers:
- Grootendorst, "[KeyBERT: Minimal keyword extraction with BERT](https://github.com/MaartenGr/KeyBERT)" (2020)
- Schopf et al., "[PatternRank: Leveraging pretrained language models and part of speech for unsupervised keyphrase extraction](https://arxiv.org/abs/2210.05245)" (2022)

### Era 4: LLM-based extraction (2023-present)

The newest approach: prompt a language model to extract key phrases. This works by asking something like "Extract 5-10 key phrases from this text. Return only the phrases, one per line."

This is the best option for short texts because LLMs understand context even in 43-word snippets. They can also generate *abstractive* key phrases: concepts that capture what the text is about even if those exact words don't appear. And they handle mixed-language content natively.

The cost is speed: 5-30 seconds per document with a local 7B model on CPU, versus milliseconds for YAKE. For 157 items, that's 15-80 minutes versus under a second. But it's a one-time batch job.

**KeyLLM** (part of the KeyBERT library) combines this with embedding-based clustering: it groups similar documents first, then only calls the LLM once per cluster and assigns the results to all documents in that cluster. This cuts the number of LLM calls dramatically.

Key papers:
- Song, Feng & Jing, "[A survey on recent advances in keyphrase extraction from pre-trained language models](https://aclanthology.org/2023.findings-eacl.161/)" (EACL 2023 Findings)
- Giarelis & Karacapilidis, "[Deep learning and embeddings-based approaches for keyphrase extraction](https://link.springer.com/article/10.1007/s10115-024-02164-w)" (Knowledge and Information Systems, 2024)

## The short-text problem

Most keyphrase extraction research targets academic papers (3,000-10,000 words). This garden has items from 28 words (a video blurb) to 1,800 words (a full article). The median is probably around 200 words.

Y-Rank (Zeng et al. 2024) is the only method designed specifically for short text. It combines information content scoring with a similarity-based graph, addressing the "not enough signal" problem that plagues both statistical and embedding-based methods on short documents.

Key paper:
- Zeng et al., "[Y-Rank: a multi-feature-based keyphrase extraction method for short text](https://www.mdpi.com/2076-3417/14/6/2510)" (Applied Sciences, 2024)

## What fits this garden

The garden has 157 items, 28-1,800 words, mostly English with some Dutch. The requirements:

1. **Works on short text**: many items are under 200 words
2. **Handles Dutch**: at least one article and future content is in Dutch
3. **Runs locally**: no API calls, consistent with the embedding setup
4. **Produces concepts, not just keywords**: "conversational AI" is more useful than "conversational" and "AI" separately

**Recommended approach: LLM-based extraction via Ollama.**

The garden already has Ollama set up with local models. Using a general-purpose model (like gemma3 or mistral) to extract phrases gives the highest quality on short texts, handles Dutch natively, and produces abstract concepts. The ~30-60 minute runtime for 157 items is a one-time cost.

YAKE is worth running as a fast comparison (zero dependencies, instant), but for the actual pipeline, LLM extraction is the better fit. The trade-off is clear: YAKE is fast but shallow, LLM extraction is slow but understands meaning.

## Further reading

- Campos et al., "[YAKE! Keyword extraction from single documents](https://doi.org/10.1016/j.ins.2019.09.013)" (Information Sciences, 2020)
- Mihalcea & Tarau, "[TextRank: Bringing order into texts](https://aclanthology.org/W04-3252/)" (EMNLP 2004)
- Grootendorst, "[KeyBERT: Minimal keyword extraction with BERT](https://github.com/MaartenGr/KeyBERT)" (2020)
- Schopf et al., "[PatternRank: Leveraging pretrained language models and part of speech](https://arxiv.org/abs/2210.05245)" (2022)
- Song et al., "[Survey on keyphrase extraction from pre-trained language models](https://aclanthology.org/2023.findings-eacl.161/)" (EACL 2023)
- Giarelis & Karacapilidis, "[Deep learning approaches for keyphrase extraction](https://link.springer.com/article/10.1007/s10115-024-02164-w)" (KAIS, 2024)
- Zeng et al., "[Y-Rank: keyphrase extraction for short text](https://www.mdpi.com/2076-3417/14/6/2510)" (Applied Sciences, 2024)
