---
title: External content discovery
date: 2026-03-19
maturity: draft
tags:
  - knowledge-graph
  - digital-gardens
  - ai
hub: true
develops: knowledge-graph-for-the-garden
description: Using the garden's own knowledge graph to find relevant external content, papers, and articles.
ai: co-created
---

This project explores the third goal from the [[knowledge-graph-for-the-garden|knowledge graph project]]: using the garden's world model to look outward and discover relevant external content.

## The idea

The garden already knows what it's about: embeddings, key phrases, territories, typed relations. Can it use that self-knowledge to find things on the internet that would be worth reading, linking, or responding to?

Not a general-purpose feed or recommendation engine. More like a research assistant that says: "your garden has a lot about conversation design and prompt design, but nothing about constitutional AI. Here's a paper you might want to read."

## Comment by Maaike

> Greenhouse for new content: needs to be quarantined and matured before it can go to the garden beds. Decayed stuff goes into the composter to become soil. Soil could be a pre-stage for seeds? That way, we have a full recycle loop. See [[garden-lifecycle-greenhouse-compost|the lifecycle field note]] for the full metaphor.

## Constraints and conditions

Before building anything, a few things need to be true:

### What the garden needs to have in place

1. **Stable embeddings**: the normalized embedding pipeline needs to be reliable and up to date. Every garden item should have an embedding. Currently at 210/210.
2. **Key phrases with good coverage**: key phrase extraction currently covers 92 of 210 items (44%). Thin items (videos, books without summaries) produce weak or missing phrases. Coverage should be above 80% before external matching can work well.
3. **A clear definition of "gap"**: the system needs to distinguish between "the garden doesn't cover this topic" (a real gap) and "the garden doesn't cover this topic because it's not relevant" (not a gap). The territory map and tag structure help, but this needs a filter: only look for gaps within or adjacent to existing territories, not in random directions.
4. **Source quality filtering**: not everything on the internet is worth surfacing. Need criteria for what counts as a useful source: academic papers, established blogs, documentation. No SEO content farms, no paywalled content without abstracts.

### Design questions to answer first

- **Push or pull?** Does the system periodically scan for new content (push), or does it respond to a specific request like "find me papers about X" (pull)? Pull is simpler to start with.
- **Where do results go?** The greenhouse: a quarantine stage where external content lands before it earns a place in the garden beds. See the [[garden-lifecycle-greenhouse-compost|lifecycle metaphor]].
- **How to avoid noise?** The garden has ~10 territories. Searching the internet for each one will produce thousands of results. Need aggressive filtering: high similarity to existing items, recency, source reputation.
- **How to handle decay?** External content changes. Links rot. Papers get retracted. Decayed content moves to the compost heap, where it can break down into soil for future seeds.

### What's explicitly out of scope (for now)

- Automatic publishing of external content to the garden
- Social media monitoring or trend tracking
- Real-time feeds or notifications
- Anything that requires API keys or paid services to function (the garden should work with free, local tools where possible)

## Status

- [ ] Improve key phrase coverage to 80%+
- [ ] Define gap detection criteria
- [ ] Prototype pull-based search: "find papers about X"
- [ ] Evaluate source filtering strategies
- [ ] First test run: discover 10 genuinely useful external items
