---
title: "Thematic-TAO: a three-pass method for post analysis"
description: "Extracting meaningful entities and relations, combining thematic analysis with TAO topic mapping in three passes."
date: 2026-03-30
maturity: developing
draft: true
tags: ["knowledge-graph", "thinking-tools", "digital-gardens"]
ai: "co-created"
develops: claude-features-garden
---

When I started building a concept graph for this garden, I ran into a tension between two ways of reading a text.

**Thematic analysis** reads wide. It asks: what is this about? What recurring ideas run through it? It's a great way for first explorations and orientations, because it surfaces emergent themes that I might not have found when just reading at surface level. It basically gives you lists of keywords and categories on different axes (so great taxonomies), but it's a one-sweep action that doesn't necessarily give good, robust an consistent structure. 

**Topic mapping** (Topics, Associations, Occurrences — [Steve Pepper's framework](https://www.ontopia.net/topicmaps/materials/tao.html)) is about very close reading. It's funny, I came acroos topic mapping and the article 'The TAO of topic maps' in my second job, when I was a customer training and information developer. We had these great sessions around knowledge modelling and information mapping with the amazing Joan Hackos (Claude, find wikipedia link), whose book ' Managing Documentation Projects (Claude link)' I found lying in a cupboard in my first job, and literally devoured. 

Topic mapping asks: what named things appear here, and what does the text claim about them? It gives you typed entities and typed relationships — the trees. Good for building a knowledge graph, but if you go straight to it without reading the forest first, you can end up with technically correct triples that together misrepresent what the post is actually arguing.

Neither is enough on its own. The method I've been developing for `/auto-tag` runs both in sequence, with a check at the end.

## The three passes

**Pass 1: Thematic read (wide angle)**

Read the full text once for gestalt. Don't take notes yet. Answer three questions:
- What are the 2–4 overarching themes?
- What intellectual tradition does this draw from?
- What is the central argument or position?

This produces the framing for everything that follows. It's also where tag candidates come from.

**Pass 2: TAO extraction (close read)**

Re-read carefully for entities and relationships. This is where the topic map gets built:

- **Topics (T):** extract all named things worth knowing about. Type each one (person, technology, philosophical concept, linguistic principle, etc.). Check against existing canonical topics — reuse rather than duplicate.
- **Associations (A):** extract typed S-P-O relationships using a controlled predicate vocabulary. Prioritise associations that connect to existing hub topics in the graph — isolated triples add nodes without adding connectivity.
- **Occurrences (O):** which other garden posts are also about these same topics? Those are natural candidates for internal wiki-links.

**Pass 3: Coherence check (wide angle again)**

Step back and read the extracted associations as a whole. Ask:
- Do these associations reflect what the text actually argues, or are they technically true but beside the point?
- Do the new topics connect to existing hubs, or do they hang as isolated leaves?
- Are the tags consistent with the themes from pass 1?

Prune anything that doesn't pass.

## Why the rhythm matters

The zoom-out / zoom-in / zoom-out pattern is borrowed from qualitative research methodology. The risk in going straight to extraction is that you optimise locally — each triple looks correct in isolation, but together they reconstruct a different argument than the one the text makes. The second wide-angle read catches that.

It also prevents over-indexing on what's easy to extract (named entities, explicit definitions) at the expense of what's harder (the implicit argument structure, the cross-connections to other posts).

## In practice

This method now drives `/auto-tag`, which uses it to enrich garden posts and update the [concept graph](/graph). Each post becomes an occurrence of the topics it discusses, and the associations it contributes build the graph's connectivity over time.

The graph grows better when passes 1 and 3 are taken seriously — not just as decoration around the extraction step, but as actual constraints on what gets added.

So yeah, pretty cool how stuff that I've been fond off since my very first job, all of a sudden gets a real base to land!
