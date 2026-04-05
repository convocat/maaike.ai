---
title: Mobile header and nav drawer
date: 2026-04-05
maturity: solid
tags: [design, mobile, navigation, header]
description: How the header collapses into a hamburger menu on mobile, and the design principles for the nav drawer layout.
category: design
section: Interactive controls
ai: co-created
---

At 640px, the header switches from a horizontal nav bar to a hamburger + drawer. The mega menus that open as floating panels on desktop become flat sections inside the drawer.

## The hamburger trigger

The menu toggle button (`44×44px` tap target, `-10px` margin offset for visual alignment) shows three horizontal lines. Clicking it opens the drawer and auto-expands the Garden menu inside.

## The drawer

The nav slides down from the header as an absolutely positioned panel:

```css
.site-nav {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-bg);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-md);
  z-index: 100;
}
.site-nav.open { display: block; }
```

It's not an overlay — it pushes the page content down. This avoids z-index conflicts with sticky elements and keeps the one-scrollbar principle intact.

## All items start collapsed

When the drawer opens, the three top-level nav items show collapsed: The Garden, Toolshed, About. No section auto-expands. The user taps the section they want.

This keeps the initial drawer compact and avoids assuming which section the user is heading to.

## Desktop vs mobile mega menu: design differences

| | Desktop | Mobile |
|---|---|---|
| Position | Absolute floating panel | Static, inline in drawer |
| Descriptions | Shown (scannable before navigating) | Shown (still useful for deciding where to go) |
| Collection items | 2-column grid | Single column |
| Views row | Horizontal flex | Horizontal flex, wrap-allowed |
| Trigger button | Inline in nav bar | Full-width, chevron pushed right |
| Toolshed | Auto-stays closed | Stays closed until tapped |
| Box shadow | Yes | No |
| Border | Yes | No |

Descriptions remain visible on mobile — they're useful when deciding where to navigate, and the drawer scrolls naturally if it's tall.

## Full-width triggers

On mobile, dropdown trigger buttons stretch to full width with the chevron pushed to the right:

```css
@media (max-width: 640px) {
  .garden-dropdown-trigger,
  .toolshed-dropdown-trigger {
    width: 100%;
    justify-content: space-between;
    padding: var(--space-sm) var(--space-xs);
    min-height: 44px;
  }
}
```

This makes the entire row tappable rather than just the text label.

## Views row on mobile

The views strip (Stream, Map, Collections, Stack, Graph) stays horizontal on mobile — it wraps to a second row if needed. Stacking vertically would make the drawer unnecessarily long.

## Close behaviors

- Tap outside the drawer
- Press Escape (keyboard)
- No close-on-link-click — the navigation itself handles page change, which resets state
