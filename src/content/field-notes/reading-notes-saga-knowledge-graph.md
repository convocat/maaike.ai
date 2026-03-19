---
title: "Reading notes: Apple's Saga knowledge graph"
date: 2026-03-14
maturity: solid
tags:
  - knowledge-graph
  - ai
description: Reading notes from Apple's Saga papers on building knowledge graphs at scale, and what transfers to a personal digital garden.
ai: co-created
develops: knowledge-graph-for-the-garden
---

Reading notes from two papers by Apple's knowledge graph team:
- [Saga: a platform for continuous construction and serving of knowledge at scale](/papers/saga-sigmod-2022.pdf) (SIGMOD 2022)
- [Growing and serving large open-domain knowledge graphs](/papers/saga-sigmod-2023.pdf) (SIGMOD 2023)

## Paper 1: the Saga platform (2022)

### Three-layer data model

Saga doesn't use one monolithic graph. It layers three structures on top of each other:

1. **Stable KG**: the batch-constructed, high-confidence graph. Rebuilt on a daily (or longer) cycle through the full pipeline
2. **Live graph**: a real-time overlay that unions the stable KG with streaming sources (sports scores, stock prices, flight data). Live sources bypass the heavy linking pipeline because their entities are uniquely identifiable
3. **Curations**: human-in-the-loop corrections that hot-fix the live index immediately and also feed back into the next batch cycle

This is the insight that matters most for the garden: you don't have to choose between batch and real-time. You layer them.

### How facts are stored

Standard RDF triples (subject, predicate, object) are extended with metadata:

```
(Subject, Predicate, Object, SourceID, Timestamp, Confidence, CuratorID)
```

This means every fact carries its provenance: where it came from, when, how confident the system is, and whether a human has reviewed it.

For the garden: if we auto-generate links between content, we should store them as extended triples too. A link between two posts would carry a confidence score and a method tag (manual, auto-extracted, embedding-based).

### Source ingestion: five stages

Every data source goes through:

1. **Import**: normalize raw formats (APIs, databases, feeds)
2. **Entity transform**: one-entity-per-row views, standardize representations
3. **Ontology alignment**: map source schema to the KG schema using predicate generation functions
4. **Delta computation**: compare against previous snapshot, producing three payload types: Added, Updated, Deleted
5. **Export**: convert to extended triples for the live graph

The delta computation is key. Instead of rebuilding everything, only process what changed.

### Entity linking

When new entities arrive, the system needs to decide: is this the same entity as one already in the graph?

1. **Blocking**: group candidate pairs using cheap signals (q-gram overlap on titles) to avoid comparing every pair
2. **Similarity scoring**: domain-specific matching models (both neural string similarity and rule-based)
3. **Correlation clustering**: build a linkage graph with +1 (match) and -1 (non-match) edges, then cluster
4. **Object resolution**: select a canonical representative from each cluster, preserve aliases

For updated/deleted entities, this is simpler: the entity already exists, so only object resolution is needed.

### Knowledge fusion

When multiple sources provide facts about the same entity, conflicts are resolved through:

- **Outer joins** for simple facts (merge everything, keep all)
- **Truth discovery** for conflicting values: probabilistic reconciliation using source reliability scores and temporal recency

### Serving architecture: polystore

Rather than one database, Saga uses multiple specialized backends:

- Stable KG properties: RDF store or graph database
- Recent changes: in-memory cache or time-series index
- Curated corrections: document store or key-value index
- A query federation engine merges results with provenance and confidence

### Entity importance

Four signals combined:

- **In-degree**: how many things point to this entity
- **Out-degree**: how many things this entity points to
- **Identity count**: how many sources mention it
- **PageRank**: transitive importance from high-rank neighbors

For the garden: in-degree is the most relevant. A post that many other posts link to is probably a central idea.

## Paper 2: growing the graph (2023)

### Graph embeddings

Two approaches:

- **Shallow embeddings**: trained using random edge-based graph partitioning for distributed training. Uses Marius (an external-memory embedding trainer) for the full graph. Training takes about a day
- **Reasoning-based models**: multi-hop reasoning with logical operators for specialized tasks

Before training, a computational graph engine generates filtered views, removing irrelevant facts (e.g., "height of a person", "National Library ID") so the model focuses on meaningful relationships.

### What embeddings enable

Once you have embeddings for every entity, you get four capabilities for free:

1. **Fact ranking**: when an entity has multiple values for one property (e.g., a person's many occupations), embedding similarity determines which to surface first
2. **Fact verification**: facts that score low against the embedding model are flagged as implausible
3. **Related entities**: cosine similarity between embeddings finds semantically related entities
4. **Entity linking**: embeddings help disambiguate when text mentions could refer to multiple entities

### Semantic annotation

Links entity mentions in unstructured web text to KG entities:

1. Mention detection + named entity recognition
2. Entity linking with contextual reranking
3. Entity embeddings precomputed from textual features (name, description, popularity) and cached
4. At query time: compute only query embeddings + similarity lookup
5. Only processes changed web pages at configured frequency (daily/weekly)

For the garden: this is exactly how external content discovery would work. When I find a new article online, compute its embedding and match it against the garden's entity embeddings.

### Open-domain knowledge extraction (ODKE)

Three strategies for finding missing knowledge:

1. **Reactive**: analyze query logs for unanswerable queries (what are people asking that the graph can't answer?)
2. **Proactive**: profile the KG to find coverage/freshness gaps (orphan entities, sparse regions)
3. **Predictive**: analyze potential trending queries to anticipate needs

For each gap, the system auto-composes search queries, retrieves web pages, and applies extractors: rule-based for structured data (schema.org), neural/LLM-based for plain text.

For the garden: proactive gap-finding is the most relevant. Profile the content graph, find orphan posts and sparse topic clusters, then suggest what to write about next or what external content to link.

## What transfers to the garden

| Saga concept | Garden-scale adaptation |
|---|---|
| Three-layer model | Stable link graph (rebuild on publish) + draft overlay for work-in-progress |
| Extended triples | Store auto-links as (source, relationship, target, confidence, method) |
| Delta processing | Only reprocess content that changed since last build |
| Blocking + similarity | Use shared tags first, then embedding similarity within blocks |
| Confidence scores | High confidence = auto-linked. Low confidence = queued for review |
| Entity importance | In-degree (backlink count) as a resonance signal |
| Graph embeddings | sentence-transformers on all content items (works fine at ~200 items) |
| Fact verification | Use embeddings to check if proposed new links "make sense" |
| ODKE gap-finding | Profile the graph for orphans and sparse clusters |
| Semantic annotation | Auto-link bookmarked external content via embedding similarity |

## What doesn't transfer

- Distributed training, multi-GPU (irrelevant at 200 items)
- Correlation clustering for entity resolution (no duplicate entities in a personal garden)
- Source reliability / truth discovery across conflicting sources (single author)
- Sub-20ms query SLAs and polystore architecture
- Volatile predicate partitioning

## Related

- [[knowledge-graph-for-the-garden]]
- [[saga-knowledge-platform]]
- [[setting-up-local-embedding-models|Setting up local embedding models]]
- [[embeddings-for-knowledge-gardens-research-gap|Embeddings for knowledge gardens: a research gap]]
