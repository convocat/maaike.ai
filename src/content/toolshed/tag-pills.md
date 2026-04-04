---
title: Tag pills
date: 2026-04-04
maturity: solid
tags: [design, components, navigation, tags]
description: Capsule-shaped tag links used in the Mycelium section footer and as filter checkboxes in the sidebar.
category: design
section: Components
ai: co-created
---

Tags appear in two contexts: as clickable pill links inside post footers, and as checkbox filters in the stream sidebar. The pill shape is consistent across both.

## Post footer pills

Rendered by `TagList.astro`. Each tag is an `<a>` linking to `/tags/[tag]`:

```css
.tag {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  padding: 0.4em 0.7em;
  min-height: 36px;
  border-radius: 1em;        /* full capsule */
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  text-decoration: none;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.tag:hover {
  background: var(--color-accent);
  color: #FFFFFF;
}
```

`min-height: 36px` satisfies touch target guidelines without making desktop pills feel oversized. `border-radius: 1em` creates the capsule regardless of content length.

The hover state inverts the pill — background becomes the accent pink, text becomes white. No border needed; the background fill is enough.

## Tag colors

`--color-tag-bg` and `--color-tag-text` are theme tokens, not hardcoded:

| Mode  | Background         | Text                  |
|-------|--------------------|-----------------------|
| Light | `#F0EDE8` (warm sand) | `#3a3a3a` (near-black) |
| Dark  | `#2a2a2a`          | `#cccccc`             |

The warm sand background in light mode ties tags to the paper/parchment aesthetic of the garden.

## Filter sidebar pills

In the stream sidebar, tags appear as pill-styled `<label>` elements wrapping `<input type="checkbox">`. Visually they match the footer pills (same border-radius, same background), but the checked state replaces the hover state: a checked pill takes the accent background.

The checkbox input itself is visually hidden; only the label is styled.

## Tag index page

Every tag links to `/tags/[tag]` — a page that collects all posts across all collections that include that tag. This makes tags a cross-collection navigation axis alongside the collection pages.

## Tag cloud on /tags

The tags index page renders all known tags. Font size is proportional to usage count, providing a rough content map by topic.
