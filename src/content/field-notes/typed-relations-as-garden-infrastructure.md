---
title: "Typed relations as garden infrastructure"
date: 2026-03-19
maturity: developing
tags:
  - knowledge-graph
  - digital-gardens
  - information-architecture
  - ontology
description: "How hub/develops relations replace tag-based project structure with an explicit ontology, and what that means for the three kinds of connections in the garden."
ai: co-created
develops: knowledge-graph-for-the-garden
---

This garden has always had connections: wiki-links between posts, backlinks in sidebars, tags grouping similar ideas. What it lacked was structure. Not more connections, but *typed* ones. A link that says "this file is part of that project" carries fundamentally different information than a link that says "this file mentions that concept."

## Terminology

| Technical term | Garden metaphor | Meaning |
|---|---|---|
| Hub | Seedbed | A post that defines a project. Marked `hub: true`. Appears on the Projects page. |
| Project file | Planting | A post that develops a hub: an experiment, field note, or seed that grows from it. |
| Develops | Takes root in | The relation from a file to its hub. Direction: file → hub. |
| Part of | Grows in | The sidebar label on project files: "Part of: [hub title]." |
| Project files | What's growing | The sidebar label on hub posts, listing their plantings. |
| Authored relation | Tended path | A structural connection explicitly declared in frontmatter (`develops`). |
| Intentional reference | Laid path | A wiki-link placed manually. "I deliberately connected these." |
| Emergent connection | Wind-seeded | A semantic similarity discovered through embeddings. Not planted, just happened. |

## The problem with tags as structure

The garden's project hubs were originally identified by a `project` tag. It worked, but it conflated two things: topic (this is about a project) and structure (this file is the hub). Tags are good at the first job, bad at the second.

When a book recommender experiment file shows up on the Projects page, the tag system has no vocabulary to prevent it. You either give everything the tag or nothing. There is no "grows in" in a tag list.

## The ontology question

Typed relations are subject-predicate-object triples: "book-recommender-scoring-algorithm.md **develops** book-recommender.md". The predicate carries the meaning.

Choosing the right predicate turns out to be harder than it looks. Some candidates considered:

- `inquiry: book-recommender` (noun-based): describes the topic but not the relationship. "I belong to this inquiry" is not the same as "I am a step in developing this thing."
- `grows: book-recommender` (verb, garden metaphor): ambiguous direction. Does this file grow from the hub, or does it grow the hub?
- `develops: book-recommender` (verb, unambiguous direction): this file develops the hub. Clear direction: the file is doing the developing.

`develops` was chosen because it names the relationship from the file's perspective (active, directional) and is unambiguous about which end is the contributor and which is the seedbed.

## The `hub`/`develops` system

Two frontmatter fields now encode project structure:

- `hub: true` on the defining post for a project. The Projects page filters on this. The sidebar shows "Project files": the plantings that grow from this seedbed.
- `develops: <slug>` on any post that is a planting. The sidebar shows "Part of": the seedbed it grows in.

A post can have both. The explore-page design field note is a seedbed for its own sub-project *and* a planting in the knowledge graph project. The system supports nesting naturally.

## Three kinds of connections

The garden now has three distinct connection layers, each answering a different question:

| Layer | Garden metaphor | Source | Question |
|---|---|---|---|
| Wiki-links | Laid paths | Author | What is this post deliberately connected to? |
| `develops` | Root system | Author | What seedbed does this planting grow from? |
| Embeddings | Wind-seeded | Algorithm | What is semantically close, without anyone planning it? |

These layers are complementary, not redundant. A post can reference another without developing it. Two posts can be semantically similar without being part of the same project. `develops` is the first layer in the garden that carries explicit structural semantics rather than topic semantics.

## What's still open

The knowledge graph plantings (reading notes, embedding surveys, threshold analysis) haven't all been tagged with `develops` yet. That's a labeling task.

The explore map's named areas (currently emergent k-means clusters) now have a second layer: inquiry areas derived from `develops` relations, drawn as pink dashed outlines around the actual project plantings. The two layers show the difference between "what the algorithm thinks is related" and "what we know belongs together."
