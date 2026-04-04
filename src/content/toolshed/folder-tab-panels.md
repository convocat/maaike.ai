---
title: Folder-tab panels
date: 2026-04-04
maturity: solid
tags: [design, components, panels, sidebar]
description: The panel pattern with a protruding label tab used for filter sidebars, toolshed panels, and any grouped content block.
category: design
section: Components
ai: co-created
---

Folder-tab panels group related content inside a labeled container that looks like a physical folder. The label protrudes above the panel as a tab.

## Structure

The tab is rendered via a `::before` pseudo-element using `data-label` on the container. No extra markup needed.

```html
<div class="ts-panel" data-label="Garden health">
  <!-- content -->
</div>
```

```css
.ts-panel {
  position: relative;
  background: #F0EAE4;            /* sand — varies by context */
  border-radius: 0 0.75rem 0.75rem 0.75rem;   /* top-left square = where tab sits */
  padding: var(--space-sm) var(--space-md) var(--space-md);
  margin-top: 1.5rem;             /* space for the tab above */
}

.ts-panel::before {
  content: attr(data-label);
  position: absolute;
  top: -1.35rem;
  left: 0;
  padding: 0.22rem 0.75rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--color-text-muted);
  background: #F0EAE4;            /* must match panel background */
  border-radius: 5px 5px 0 0;
  white-space: nowrap;
}
```

Key: the top-left corner of the panel has no border-radius (`border-radius: 0 0.75rem 0.75rem 0.75rem`) so it sits flush with the tab above it, creating the illusion of one connected shape.

## Background colors

The panel and its tab must share the same background color. Different contexts use different colors to match the page:

| Context | Color |
|---|---|
| Stream filter sidebar | `#EEF3EB` (green) |
| Library filter sidebar | `#F0EAE4` (sand) |
| Toolshed sidebar | `#E8EAED` (slate) |

Dark mode: always `#1e2025` (near-black) regardless of context.

## Collapsible variant

For long content (style guides, reference material), wrap the panel in a `<details>` element. The summary acts as a secondary reveal trigger inside the panel — not a replacement for the tab.

```html
<details class="ts-panel ts-style-guide-panel" data-label="Style guide">
  <summary class="ts-panel-summary">
    Style guide <span class="ts-toggle-hint">click to expand</span>
  </summary>
  <div class="ts-style-guide-body" set:html={content} />
</details>
```

## Where used

- `src/pages/index.astro` — three filter sidebar panels (Collection, Maturity, Written by)
- `src/pages/library/index.astro` — four filter sidebar panels (Status, Format, Topic, Book type)
- `src/pages/toolshed/index.astro` — Garden health and Toolshed nav panels
