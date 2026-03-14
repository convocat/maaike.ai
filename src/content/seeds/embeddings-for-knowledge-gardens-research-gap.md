---
title: "Embeddings for knowledge gardens: a research gap"
date: 2026-03-14
maturity: draft
tags:
  - digital-gardens
  - knowledge-graph
  - ai
  - knowledge-management
description: Academic research on embeddings hasn't caught up with how PKM tools actually use them. There might be something worth writing here.
draft: false
ai: co-created
---

While surveying embedding models for the [[knowledge-graph-for-the-garden|knowledge graph project]], I noticed something: there are no academic papers about using embeddings for digital gardens or personal knowledge management (PKM).

The tools have outpaced the research. Obsidian has community plugins that compute embeddings for note-linking. Mem.ai uses embeddings as a core feature. Logseq and Notion have explored similar territory. But nobody has studied this formally.

Questions that have no papers yet:

- What happens when you compute embeddings across a personal knowledge base with wildly diverse topics? Do the vectors even produce meaningful clusters?
- How do embedding-suggested links compare to manually created ones? Do they surface genuinely surprising connections, or just obvious ones you'd already make?
- What's the right threshold for "related enough to suggest"? Too low and everything connects to everything. Too high and you miss the serendipity
- Does the embedding model matter much at this scale (~200 documents), or do they all produce roughly the same connections?
- How do people actually use auto-suggested links? Do they accept them, ignore them, or do something else entirely?

The closest academic work is in knowledge graph embeddings (link prediction in large structured graphs) and recommendation systems. But a personal garden is neither: it's small, unstructured, deeply personal, and the "user" is also the author.

This might be worth writing about as the project progresses. The garden could be both the experiment and the documentation.

See also: [[knowledge-gardens-and-serendipity]]
