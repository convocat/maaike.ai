---
title: Header mega menu
date: 2026-04-04
maturity: solid
tags: [design, navigation, components]
description: The dropdown navigation pattern used for The Garden and Toolshed top-level entries, with collection grids and icon links.
category: design
section: Interactive controls
ai: co-created
---

The site header has two mega menus: The Garden (9 collections + 5 views) and Toolshed (3 sections). Each drops down as a positioned panel on click, not hover, to avoid accidental opens.

## Why click, not hover

Hover-triggered menus are frustrating on touch screens and create accidental-open problems when moving the mouse across the header. Click is deliberate.

## The Garden menu

A two-column grid of collection links + a horizontal row of view links below:

```
[Articles]   [Seeds]
[Field Notes][Jottings]
[Weblinks]   [Videos]
[Experiments][Library]
[Projects]
─────────────────────────
Stream  Map  Collections  Stack  Graph
```

Each collection item: icon (20px, sketchy filter applied) + label + description. The description keeps each item's purpose scannable without navigating.

```css
.garden-mega-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: -100px;           /* offset leftward to avoid viewport edge */
  width: 520px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  padding: var(--space-lg);
}

.mega-collections {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xs);
}

.mega-views {
  display: flex;
  gap: var(--space-md);
  border-top: 1px solid var(--color-border);
  margin-top: var(--space-md);
  padding-top: var(--space-md);
}
```

## The Toolshed menu

Simpler — three links in a single column, each with an icon and description. Width 260px (about half the Garden menu).

```css
.toolshed-mega-menu {
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}
```

## Active state

Both menus track the current path and apply `.active` to the matching item. The active item's label turns accent-colored.

## Mobile

At 640px breakpoint, the hamburger menu appears and both mega menus become static (positioned normally in the document flow, not absolutely positioned). They open/close as part of the full-height mobile nav drawer.

## Keyboard

Escape closes any open dropdown and returns focus to the trigger button. Clicking outside also closes.

## Implementation

`src/components/Header.astro` — both dropdowns, their JavaScript (`setupGardenDropdown`, `setupToolshedDropdown`), and all CSS. Initialized on load and on `astro:after-swap` for view transitions.
