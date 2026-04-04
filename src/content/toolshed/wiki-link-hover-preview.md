---
title: Wiki link hover preview
date: 2026-04-04
maturity: solid
tags: [design, interaction, navigation, wiki-links]
description: Hovering an internal wiki link shows a small popup with the target post's title and description, without navigating away.
category: design
section: Interactive controls
ai: co-created
---

Wiki links (`[[Page Title]]`) connect posts across collections. Hovering one shows a small popup with the target's title and description — a preview before committing to navigate.

## Syntax

```markdown
This connects to [[another post]] mid-sentence.
```

Processed at build time by `remark-wiki-link` (configured in `astro.config.mjs`). Resolved links become `<a>` tags with a `data-preview` attribute or similar. Unresolved links get a `wiki-link--new` class and a `cursor: help` cursor.

## Visual design

The popup appears above the hovered word (or below if near the top of the viewport). It contains:

- Collection label (small caps, muted)
- Post title (medium weight, heading color, 2-line clamp)
- Description (muted, 2-line clamp)

```css
.wiki-link-preview {
  position: absolute;
  max-width: 280px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px var(--color-shadow);
  padding: 0.75rem 1rem;
  pointer-events: none;
  opacity: 0;
  transform: translateY(4px);
  transition: opacity 0.15s, transform 0.15s;
  z-index: 100;
}

.wiki-link:hover .wiki-link-preview {
  opacity: 1;
  transform: translateY(0);
}
```

## On touch devices

The preview is suppressed on `hover: none` media (touch-only devices). Touch users navigate directly on tap.

## Unresolved links

Links to posts that don't exist yet still render, but with visual distinction:

```css
.wiki-link--new {
  color: var(--color-text-muted);
  text-decoration-style: dashed;
  cursor: help;
}
```

This keeps broken links visible in the editor (Typora) and in the rendered page, making it easy to spot stubs.

## Implementation

`src/components/WikiLinkPreview.astro` — outputs all preview popup HTML for posts referenced on the current page. Included once in `PostLayout.astro`.
