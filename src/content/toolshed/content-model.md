---
title: Content model and rules
date: 2026-04-06
maturity: solid
tags: [content, workflow, architecture]
description: Terminology, collection rules, and the project hub template for the garden.
category: technical
section: Architecture
ai: co-created
---

## Terminology

| Term | Definition |
|---|---|
| Garden | The entire site: a collection of interconnected notes, not a blog |
| Item | Any piece of content (article, seed, field note, etc.) |
| Collection | A content type with its own schema, icon, and color |
| Maturity | How developed an item is: 🌱 draft → 🌿 developing → 🪴 solid → 🌳 complete |
| Wiki-link | Internal cross-reference using `[[Page Title]]` syntax |
| Backlink | Automatically computed reverse wiki-link |
| Project hub | A field note with `hub: true` that tracks a multi-item effort |

## Content rules

- **Project hubs are always field notes.** If it has `hub: true`, it lives in `field-notes/`. Seeds never get `hub: true`.
- **Experiments contain code.** If it's analysis or narrative about code, it's a field note. If it's runnable instructions, it's an experiment. Link the two with wiki-links.
- **Seeds are conceptual.** Standalone ideas, definitions, frameworks. Not active project work.
- **Draft items** (`draft: true`) are excluded from build output.
- **AI transparency** is declared per item: `100% Maai`, `assisted`, `co-created`, or `generated`. Omit the field to show no indicator.

## Project hub template

Project hubs are field notes with `hub: true` that appear on the Projects page. Individual project files point back with `develops: <hub-slug>`.

```markdown
---
title: "Project name"
date: YYYY-MM-DD
maturity: draft
tags:
  - relevant-topic-tags
hub: true
description: "One-line summary of what the project does and why."
ai: co-created
---

One paragraph: what is this project and what problem does it solve?

## Why

Motivation. What triggered this? What is the gap?

## Design constraints

- Bullet list of non-negotiable requirements or boundaries

## How it works

Describe the approach, architecture, or method. Use sub-sections as needed.

## Observations

Insights, patterns, or surprises that emerged during the work. Not task updates, but things worth remembering.

## Project log

### YYYY-MM-DD: phase name

- [x] Completed task ([[linked-experiment|label]])
- [ ] Upcoming task
```

Key conventions:
- Link to experiments and related items with wiki-links
- Log entries are grouped by phase, not individual dates
- Observations capture insights that might feed future seeds or articles
- The checklist in the project log is the single source of truth for progress
