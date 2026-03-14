---
title: Setting up local embedding models
date: 2026-03-14
maturity: developing
tags:
  - knowledge-graph
  - ai
  - digital-gardens
description: How to install and run embedding models on your own computer using Ollama, with no cloud services or API keys.
ai: co-created
---

Part of the [[knowledge-graph-for-the-garden|knowledge graph project]]. This experiment documents how to run embedding models locally, so the garden can compute semantic similarity without sending content to external services.

## Why local?

Cloud embedding APIs (OpenAI, Cohere, Google) are easy to use, but they mean sending all your content to someone else's server. For a personal knowledge garden, that feels wrong. Plus, local models are free, fast, and work offline.

## The tool: Ollama

[Ollama](https://ollama.com) lets you run AI models on your own computer. It works as a local server: you start it once, and any script on your machine can ask it to process text. No accounts, no API keys, no data leaving your machine.

### Installing Ollama

1. Go to [ollama.com](https://ollama.com) and download the installer for your operating system
2. Run the installer. On Windows, Ollama installs as a background service that starts automatically
3. Open a terminal and verify it's running:

```
ollama --version
```

You should see something like `ollama version is 0.17.7` (or newer).

### Pulling embedding models

"Pulling" a model means downloading it to your computer. It's a one-time download, like installing an app. In a terminal:

```
ollama pull nomic-embed-text
ollama pull bge-m3
ollama pull embeddinggemma:300m
```

To see what you have installed:

```
ollama list
```

## The three models we're comparing

| Model | What it's good at | Size on disk | Output dimensions |
|---|---|---|---|
| nomic-embed-text | Well-established, long context (8K tokens), fully open-source | 274 MB | 768 |
| bge-m3 | Multilingual (100+ languages including Dutch), triple retrieval modes | 1.2 GB | 1024 |
| embeddinggemma:300m | Google's newest small model, 100+ languages, Matryoshka support | 621 MB | 768 |

All three run on a regular laptop CPU. No GPU needed. Total disk space: about 2.1 GB.

## Testing the models

Ollama runs a local server at `http://localhost:11434`. You send it text, it returns a vector (a list of numbers representing the meaning of that text).

The simplest test, using `curl` in a terminal:

```
curl http://localhost:11434/api/embed -d '{
  "model": "nomic-embed-text",
  "input": "A digital garden is a personal knowledge base"
}'
```

This returns a JSON response containing a list of 768 numbers. Those numbers are the embedding: an abstract representation of what the sentence means. To compare two texts, you embed both and compute the "cosine similarity" between their vectors. Texts that mean similar things score close to 1.0; unrelated texts score close to 0.

### What the dimensions mean (or don't)

The 768 or 1024 numbers in an embedding aren't human-readable. Dimension 42 doesn't mean "about gardening." The model learns its own abstract features during training, and meaning emerges from the pattern across all dimensions together. You can't interpret individual numbers, but the math (cosine similarity) reliably captures semantic closeness.

## Results

All three models installed and responded correctly:

| Model | Dimensions returned | Status |
|---|---|---|
| nomic-embed-text | 768 | Working |
| bge-m3 | 1024 | Working |
| embeddinggemma:300m | 768 | Working |

## Experiment: body text vs metadata-enriched

We ran each model twice on 10 garden items across five collections (4 articles, 3 seeds, 1 book, 1 video, 1 field note):
- **Run 1**: body text only
- **Run 2**: title + description + tags prepended to body text

The items ranged from 43 words (a three-sentence seed) to 1797 words (a full article). The code and full results are in the repository at `scripts/embedding-experiment.py` and `scripts/embedding-results.txt`. A Jupyter notebook version is available at `scripts/embedding-experiment.ipynb`.

### Key findings

**Metadata helps, especially for short items.** Adding title, description, and tags improved connection quality across all three models. The biggest gains were for items under 200 words, where the body alone doesn't carry enough semantic signal.

Two examples:
- "The disappearance of authentic voice online" (43 words) matched to "Alone together" only when metadata was included (bge-m3 with metadata: 0.59, without: 0.51). The tags `ai`, `writing`, `philosophy` did the heavy lifting
- "A digital garden as central space" <-> "Knowledge gardens and serendipity" jumped from 0.74 to 0.85 with nomic-embed-text, because both share the `digital-gardens` tag

For long items (the Dall-e article at 1797 words), metadata barely changed anything.

**All three models agree on the strong connections:**
1. "An evening with ChatGPT" <-> "Designing for doubt" (conversational AI, trust)
2. "Knowledge gardens and serendipity" <-> "Chatbots without AI" (exploration without AI)
3. "A digital garden as central space" <-> "Knowledge gardens and serendipity" (digital garden philosophy)

**All three models agree on the weak connections:**
- "The disappearance of authentic voice online" <-> "Reading notes: Saga knowledge graph" (philosophy vs technical infrastructure)
- "De-biassing Dall-e" <-> "Alone together" (image generation bias vs intimacy with technology)

**Model differences:**
- **nomic-embed-text** has the highest baseline scores (0.54-0.85) and is the most "generous" with connections. Good for catching non-obvious links, but might suggest too many
- **bge-m3** is more discriminating (0.39-0.73), with clearer separation between related and unrelated pairs
- **embeddinggemma** is the most spread out (0.15-0.67), which makes threshold-setting easier but may miss subtler connections

**The "Alone together" problem:** embeddinggemma rated the Turkle book as nearly unrelated to everything (scores as low as 0.15). This is because the book entry is a publisher's blurb, not original writing. The other models handled it better, likely because they're less sensitive to writing style.

### Connection to Apple's Saga approach

Apple's Saga platform computes entity embeddings using name + description + type information + graph context (which other entities link to this one). Our Run 2 covers the first three. The missing piece is graph context: using existing wiki-links as input to the embedding. This would mean items that already link to each other get that relationship baked into their vectors.

### Practical recommendation

For the garden's embedding pipeline: **always include metadata**. Prepend title, description, and tags to the body text before embedding. The cost is negligible (a few extra tokens) and the quality improvement for short items is substantial.

## Next steps

- Test graph-context enrichment: prepend wiki-linked titles to each item before embedding
- Run on all ~176 garden items, not just 10
- Compare results to existing manual wiki-links: how many does the model rediscover?
- Test Dutch content handling across the three models

See the [[embedding-models-for-the-garden|embedding model survey]] for background on how these models work and how they compare.
