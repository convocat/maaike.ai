---
title: One page, one scrollbar
date: 2026-04-04
maturity: solid
tags: [design, layout, scrolling]
description: Two-column layouts use a single native scrollbar. No sticky sidebars, no overflow on columns.
category: design
section: Layout
ai: co-created
---

A two-column layout has exactly one scroll context: the browser's native page scrollbar. Both the sidebar and the main column scroll together as a single page.

## What goes wrong

Two common mistakes:

**Sticky sidebar.** `position: sticky` makes the sidebar stay on screen while only the main column scrolls. Now there are two things moving at different rates. Disorienting.

**Overflow on the sidebar.** Adding `max-height` and `overflow-y: auto` creates a second scrollbar inside the sidebar. Items below the fold are hidden behind a separate scroll container. Users have to scroll two places to see everything.

## Correct pattern

```css
.sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  /* no position: sticky, no overflow, no max-height */
}
```

The sidebar is a normal flow element. It and the main column both scroll with the page.

## When sticky is appropriate

Only if the sidebar is genuinely shorter than the viewport and you want it to stay alongside a very long main column, and only if that behavior is explicitly called for. The default is always: one page, one scrollbar.

## Reference

Established after the library redesign (April 2026). The principle: "The whole page should have just one scrollbar that moves the entire page as a whole. Just like the homepage."
