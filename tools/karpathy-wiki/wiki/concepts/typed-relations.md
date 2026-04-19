# Typed relations

**Type:** concept
**First seen:** 2025 (typed-relations-as-garden-infrastructure)
**Last updated:** 2026-04-12

## Summary
Typed relations are semantic associations between entities that carry a specific predicate — not just "X links to Y" but "X counters Y", "X is-an-instance-of Y", "X leads-to Y". Maaike develops typed relations as infrastructure for her garden's knowledge graph, inspired by the way this wiki itself is organized. The predicate is the knowledge.

## How Maaike uses this concept
In the garden's architecture, typed relations are expressed in frontmatter fields (`develops`, `hub`) and in the triple-store format (`triples.json`). Maaike's interest is in making the type of relationship explicit: not every link is the same kind of connection, and the distinction matters for knowledge retrieval and navigation. A "counters" relationship tells the reader something qualitatively different from a "see-also" link.

## Appearances
- [typed-relations-as-garden-infrastructure](../raw/field-notes/typed-relations-as-garden-infrastructure.md) — primary design documentation

## Related concepts
- [[knowledge-graph]] — typed relations are the edges of the knowledge graph
- [[digital-garden]] — typed relations as infrastructure for the garden
- [[semantic-information-types]] — typed relations and typed content are parallel ideas

## Open questions
- How do you decide which predicates to support? Too few and the typing loses granularity; too many and it becomes unusable.
- Can typed relations in a personal garden scale to thousands of nodes, or do they require curation that doesn't scale?
