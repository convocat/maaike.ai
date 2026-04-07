---
title: Maturity track
date: 2026-04-04
maturity: solid
tags: [design, components, content-lifecycle]
description: The visual progress indicator showing where a post sits in the draft-to-complete lifecycle, using plant growth as a metaphor.
category: design
section: Components
ai: co-created
---

Every post in the garden has a maturity stage. The maturity track visualizes this as a horizontal progression from seedling to tree.

## The stages

| Emoji | Key | Label | Meaning |
|---|---|---|---|
| 🌱 | `draft` | Seedling | Raw idea, barely formed |
| 🌿 | `developing` | Sprout | Taking shape, still evolving |
| 🪴 | `solid` | Plant | Stable, could publish |
| 🌳 | `complete` | Tree | Done, no further tending expected |
| 🍂 | `compost` | Composted | No longer active or growing |

Composted posts are excluded from the stream and collection indexes but remain accessible by URL. They appear on the `/compost` page. The 🍂 indicator replaces the maturity track entirely on the post page.

## Visual design

The track is a horizontal flex row of emoji + connector lines. Unreached stages are dim (opacity 0.25). The current stage is larger (1.5rem vs 1.25rem). Reached stages are full opacity.

```css
.maturity-track {
  display: flex;
  align-items: center;
  gap: 0;
}

.maturity-step {
  font-size: 1.25rem;
  opacity: 0.25;
}
.maturity-step.reached { opacity: 1; }
.maturity-step.current { font-size: 1.5rem; }

.maturity-line {
  width: 2rem;
  height: 2px;
  background: var(--color-border);
}
.maturity-line.filled {
  background: linear-gradient(to right, var(--color-accent), var(--color-accent-2));
  opacity: 0.6;
}
```

## In the post header

The track appears in the post header below the title. It's interactive: hovering a stage shows its label. Clicking a stage has no effect — it's display-only.

## In stream cards

The maturity emoji appears in the top meta bar of every index card, alongside the AI label. Just the emoji, no label — it's a quick visual signal, not a detailed description.

## Frontmatter

```yaml
maturity: solid   # draft | developing | solid | complete | compost
```

Draft posts with `draft: true` are excluded from all collections at build time. A post with `maturity: draft` but `draft: false` is visible — it just signals the content is early-stage.

## Why plant metaphors

The garden is built around growth as a metaphor for ideas. Posts aren't "published" or "unpublished" — they're at different stages of development. The plant scale makes this concrete without requiring explanation. A 🌱 is obviously less developed than a 🌳.
