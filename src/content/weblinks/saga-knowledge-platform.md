---
title: "Saga: a platform for continuous construction and serving of knowledge at scale"
date: 2026-03-14
maturity: solid
tags:
  - knowledge-graph
  - digital-gardens
  - information-architecture
themes:
  - "Hybrid batch-incremental architecture for continuously updated knowledge graphs"
  - "Extended triples with provenance as a durable pattern for trustworthy KGs"
  - "Transferring enterprise KG techniques to small-scale personal knowledge systems"
triples:
  - ["Saga", "instance-of", "Knowledge graph"]
  - ["Saga", "structured-as", "Hybrid batch-incremental design"]
  - ["Saga", "exhibits", "Provenance metadata"]
  - ["Hybrid batch-incremental design", "leads-to", "Delta processing"]
  - ["Knowledge graph", "requires", "Entity linking"]
description: Apple's hybrid batch-incremental knowledge graph platform. Key inspiration for building smarter connections in this garden.
url: https://arxiv.org/abs/2204.07309
---

Apple's knowledge graph platform, published at [SIGMOD](https://en.wikipedia.org/wiki/SIGMOD) 2022. The core insight is a hybrid batch-incremental design: a stable graph rebuilt periodically, overlaid with a live graph for real-time facts, plus human curations that hot-fix both.

Key ideas that transfer to smaller-scale knowledge systems: delta processing (only reprocess what changed), extended triples with provenance metadata, blocking + similarity for efficient linking, and confidence scoring for auto-generated links.

Follow-up paper (SIGMOD 2023): [Growing and serving large open-domain knowledge graphs](https://arxiv.org/abs/2305.09464), which adds graph embeddings, fact ranking, and semantic annotation of external content.

## Related

- [[building-this-garden|Building this garden: change log]]
- [[knowledge-graph-for-the-garden]]
- [[reading-notes-saga-knowledge-graph]]
- [[typed-relations-as-garden-infrastructure]]
