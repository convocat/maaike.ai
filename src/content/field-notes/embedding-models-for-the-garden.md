---
title: "Embedding models: a survey for the garden"
date: 2026-03-14
updated: 2026-03-19
maturity: developing
tags:
  - knowledge-graph
  - ai
  - digital-gardens
description: A non-coder's guide to text embedding models, from word counting to semantic understanding, surveyed for use in a personal knowledge garden.
ai: co-created
develops: knowledge-graph-for-the-garden
---

Research for the [[knowledge-graph-for-the-garden|knowledge graph project]]: what embedding model should power the garden's semantic linking? This surveys the landscape from simple to sophisticated, with a focus on models that run locally without API calls.

## What embeddings do

An embedding turns a piece of text into a list of numbers (a "vector"). Texts with similar meaning end up as similar lists of numbers. You can then compare any two pieces of content by comparing their vectors, and the math tells you how semantically close they are, even if they share no words at all.

The history of embeddings is a story of getting better at capturing what text *means*, not just which words it contains.

## Five eras of text embedding

### Era 1: counting words (1970s-2000s)

**TF-IDF** and **BM25** are the simplest approaches. They create a sparse vector where each dimension is a word from the vocabulary, weighted by how distinctive that word is. "The" gets near-zero weight; "serendipity" gets high weight.

No semantic understanding at all. "Car" and "automobile" are completely unrelated. Only exact word overlap counts. Still, BM25 remains the backbone of search engines like Elasticsearch because it's fast and surprisingly effective for keyword search.

Key papers:
- Sparck Jones, "A statistical interpretation of term specificity" (1972): introduced IDF
- Salton & Buckley, "Term-weighting approaches in automatic text retrieval" (1988): formalized TF-IDF

### Era 2: discovering latent topics (1988-2013)

**Latent Semantic Analysis** (LSA) takes a TF-IDF matrix and compresses it using matrix math (singular value decomposition). This discovers hidden topics: if "car" and "automobile" tend to appear in similar documents, they end up near each other in the compressed space.

The first method to capture synonymy. But it treats every document as a bag of words (order doesn't matter), and every word gets a single representation regardless of context.

Key paper:
- Deerwester et al., "[Indexing by latent semantic analysis](https://asistdl.onlinelibrary.wiley.com/doi/10.1002/(SICI)1097-4571(199009)41:6%3C391::AID-ASI1%3E3.0.CO;2-9)" (1990)

### Era 3: learning word meaning (2013-2018)

**Word2Vec**, **GloVe**, and **FastText** train neural networks to predict words from their context. The byproduct is a dense vector per word (typically 300 dimensions) that captures meaning. The famous result: `king - man + woman ≈ queen`.

The catch: these produce *word-level* vectors. To get a document embedding, you average all word vectors, which muddies the signal for mixed-topic texts. And each word gets one fixed vector regardless of context: "bank" the river and "bank" the institution share the same representation.

**FastText** (Meta, 2016) improves on this by using character fragments, so it can handle typos and words it hasn't seen before.

**Doc2Vec** extends Word2Vec to learn document-level vectors directly, but it's finicky and largely superseded.

Key papers:
- Mikolov et al., "[Efficient estimation of word representations in vector space](https://arxiv.org/abs/1301.3781)" (2013): Word2Vec
- Pennington et al., "[GloVe: global vectors for word representation](https://aclanthology.org/D14-1162/)" (2014)
- Le & Mikolov, "[Distributed representations of sentences and documents](https://arxiv.org/abs/1405.4053)" (2014): Doc2Vec
- Bojanowski et al., "[Enriching word vectors with subword information](https://arxiv.org/abs/1607.04606)" (2017): FastText

### Era 4: contextual understanding (2018-present)

**Sentence-BERT** and the sentence-transformers library brought the transformer revolution to embeddings. Unlike static word vectors, every word now gets a *different* vector depending on its context. "Bank" in "river bank" vs "savings bank" produces different representations. Word order matters. Negation works.

These models produce a single dense vector (typically 768 dimensions) for an entire sentence or paragraph. Pre-trained models work out of the box and run on a laptop.

Key papers:
- Vaswani et al., "[Attention is all you need](https://arxiv.org/abs/1706.03762)" (2017): the transformer architecture
- Devlin et al., "[BERT](https://arxiv.org/abs/1810.04805)" (2018): bidirectional pre-training
- Reimers & Gurevych, "[Sentence-BERT](https://arxiv.org/abs/1908.10084)" (2019): made BERT practical for semantic similarity

### Era 5: LLM-based embeddings (2023-present)

OpenAI, Cohere, and Google offer embedding APIs using billion-parameter models. These are marginally better in quality but require sending your data to an external service. The more interesting development is that open-source alternatives have nearly closed the gap and run locally.

## Open-source models that run locally

This is the interesting part for the garden. All of these run on a laptop CPU, no GPU needed, no API calls, no data leaving the machine.

### The classics (sentence-transformers)

| Model | Parameters | Size | Embedding dims | Max input | Languages |
|---|---|---|---|---|---|
| all-MiniLM-L6-v2 | 22M | ~80 MB | 384 | 256 tokens | English |
| all-mpnet-base-v2 | 110M | ~420 MB | 768 | 384 tokens | English |

Simple to use, well-documented, but English-only and showing their age.

### Current generation (2024-2026)

| Model | Parameters | Size | Embedding dims | Max input | Languages | Dutch |
|---|---|---|---|---|---|---|
| EmbeddingGemma (Google) | 308M | <200 MB quantized | 128-768 | 2,048 tokens | 100+ | Yes |
| Nomic Embed v2 | 305M | ~600 MB | 256-768 | 8,192 tokens | 100+ | Yes |
| BGE-M3 (BAAI) | 568M | ~1.2 GB | 1024 | 8,192 tokens | 100+ | Yes |
| Jina v3 | 570M | ~1.1 GB | 32-1024 | 8,192 tokens | 89+ | Yes |
| Qwen3-Embedding 0.6B | 600M | ~523 MB | 32-1024 | 32,768 tokens | 100+ | Yes |
| E5-NL | varies | varies | varies | 512 tokens | Dutch | Native |

All available through [Ollama](https://ollama.com), which makes running them locally as simple as pulling a Docker image.

Key papers for these models:
- Nomic Embed: [arXiv:2402.01613](https://arxiv.org/abs/2402.01613)
- Jina v3: [arXiv:2409.10173](https://arxiv.org/abs/2409.10173)
- EmbeddingGemma: [arXiv:2509.20354](https://arxiv.org/abs/2509.20354)
- Qwen3-Embedding: [arXiv:2506.05176](https://arxiv.org/abs/2506.05176)
- BGE / C-Pack: [arXiv:2309.07597](https://arxiv.org/abs/2309.07597)

### Two concepts worth knowing

**Matryoshka embeddings**: named after Russian nesting dolls. The model packs the most important information into the first N dimensions of the vector. You can truncate a 768-dimensional vector to 256 dimensions and keep ~98% of quality. Supported by EmbeddingGemma, Nomic, Jina, and Qwen3.

Key paper: Kusupati et al., "[Matryoshka representation learning](https://arxiv.org/abs/2205.13147)" (NeurIPS 2022)

**Instruction-aware embeddings**: newer models let you describe what kind of similarity you're looking for. Instead of just comparing text, you can say "find documents about the same topic" or "find documents with a similar argument structure." This evolved from simple prefixes (2023) to full natural language instructions (2025).

## What this means for the garden

The garden has ~176 items, mostly 100-500 words, covering diverse topics (AI ethics, book reviews, voice coaching, design principles, programming). The requirements are:

1. **Semantic, not keyword**: we want to find that an article about "authentic voice online" relates to a book review about "the ethics of AI writing," even if they share no words
2. **Local**: no API calls, no data leaving the machine
3. **Dutch would be nice**: some content and future content may be in Dutch
4. **Small enough**: this runs at build time or as a script, not as a service

The sentence-transformers classics would work for a quick prototype. For production, EmbeddingGemma (tiny, multilingual, Matryoshka) or Nomic v2 (long context, multilingual, fully open) look like the strongest candidates.

## Further reading

Surveys and benchmarks:
- Muennighoff et al., "[MTEB: massive text embedding benchmark](https://arxiv.org/abs/2210.07316)" (EACL 2023): the standard evaluation framework
- Nie et al., "[When text embedding meets large language model](https://arxiv.org/abs/2412.09165)" (2024): comprehensive survey
- "[Is cosine-similarity of embeddings really about similarity?](https://arxiv.org/abs/2403.05440)" (2024): a critical look at a core assumption

Knowledge graphs and embeddings:
- Sardina et al., "[A survey on knowledge graph structure and knowledge graph embeddings](https://arxiv.org/abs/2412.10092)" (2024)
- "[Combining embedding-based and semantic-based models for recommendations](https://arxiv.org/abs/2401.04474)" (2024)

## Choosing a model for your dataset

The experiment comparing all three models on 10 garden items ([[setting-up-local-embedding-models|full results]]) showed they agree on the strongest and weakest connections. The differences are in how they distribute similarity scores, and that distribution matters more than raw quality.

Four questions to ask:

**1. How discriminating do you need?**
nomic-embed-text scores everything between 0.54 and 0.85: a narrow band where most items look somewhat related. bge-m3 spreads from 0.39 to 0.73: related pairs score clearly higher than unrelated ones. embeddinggemma goes widest (0.15 to 0.67). If you need to set a threshold for "related enough to suggest," wider spread makes that easier.

**2. What languages are in your content?**
All three claim 100+ languages, but claims and quality differ. If your content is mixed-language (this garden has both English and Dutch), you want a model trained with strong multilingual data. bge-m3 was specifically designed for multilingual retrieval. nomic and embeddinggemma support Dutch but it's not their focus.

**3. How robust is it to thin content?**
A personal knowledge base has items ranging from 43 words (a quick thought) to 1800 words (a full essay). embeddinggemma struggled with the shortest items and publisher blurbs, scoring them near zero against everything. bge-m3 and nomic handled short content better, likely because they're less sensitive to writing style and more focused on semantic content.

**4. Does it need to be a generative model?**
embeddinggemma is based on Gemma, a generative LLM distilled down for embeddings. nomic uses a custom BERT variant. bge-m3 is a pure BERT-family encoder: it only reads, never generates. For an embedding-only task like semantic linking, a non-generative encoder is a better fit. It's architecturally focused on understanding text, not predicting next tokens. Less overhead, more predictable behavior, and no risk of the model "thinking" in a generative direction that doesn't serve the task.

This isn't a universal rule. For tasks where you need to generate text alongside embeddings (like retrieval-augmented generation with inline citations), an LLM-based embedding model can make sense because its representations are closer to what the generator expects. But for pure similarity search on a static corpus, where the only question is "how related are these two texts?", a focused encoder is the right tool. The MTEB benchmarks confirm this: the best LLM-based embeddings and the best encoder-based embeddings perform nearly identically on retrieval tasks. The difference is efficiency and predictability, not raw quality.

For this garden, **bge-m3** won on all four: clearest discrimination, strongest multilingual support, reliable handling of short items, and a focused encoder architecture. The cost is size (1.2 GB vs 274 MB for nomic) and slightly slower inference. At build-time scale, that cost is irrelevant.

## Status

This survey answers the "what embedding model?" question from the [[knowledge-graph-for-the-garden|project tracker]]. Three candidate models are now [[setting-up-local-embedding-models|set up locally via Ollama]]. bge-m3 was selected for the full-scale run based on the criteria above.

## Related

- [[embeddings-for-knowledge-gardens-research-gap|Embeddings for knowledge gardens: a research gap]]
