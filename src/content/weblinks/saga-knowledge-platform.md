---
title: "Saga: a platform for continuous construction and serving of knowledge at scale"
date: 2026-03-14
maturity: draft
tags:
  - knowledge-graph
  - ai
description: Apple's hybrid batch-incremental knowledge graph platform. Key inspiration for building smarter connections in this garden.
url: https://arxiv.org/abs/2204.07309
---

Apple's knowledge graph platform, published at SIGMOD 2022. The core insight is a hybrid batch-incremental design: a stable graph rebuilt periodically, overlaid with a live graph for real-time facts, plus human curations that hot-fix both.

Key ideas that transfer to smaller-scale knowledge systems: delta processing (only reprocess what changed), extended triples with provenance metadata, blocking + similarity for efficient linking, and confidence scoring for auto-generated links.

Follow-up paper (SIGMOD 2023): [Growing and serving large open-domain knowledge graphs](https://arxiv.org/abs/2305.09464), which adds graph embeddings, fact ranking, and semantic annotation of external content.
