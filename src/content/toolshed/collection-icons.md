---
title: Collection icons
date: 2026-04-04
maturity: solid
tags: [design, icons, svg, aesthetic]
description: How each collection gets its own hand-drawn SVG icon, where they come from, and how CSS filter tinting keeps assets minimal.
category: design
section: Components
ai: co-created
---

Every collection in the garden has a doodle-style SVG icon. The icons are hand-drawn (or hand-drawn-looking), serve as visual identity for each collection, and appear in three sizes across the site.

## Icon mapping

`CollectionIcon.astro` maps collection slugs to `/images/icons/*.svg` paths:

| Collection | Icon file |
|------------|-----------|
| articles | `doc.svg` |
| field-notes | `note.svg` |
| seeds | `bulb.svg` |
| weblinks | `globe.svg` |
| videos | `play.svg` |
| library | `bookmark.svg` |
| experiments | `flask.svg` |
| jottings | `pencil.svg` |
| projects | `rocket.svg` |

The component accepts a `size` prop (default 24px) and renders an `<img>` with `aria-hidden="true"` — icons are decorative, not informational.

## Where they appear

1. **Header mega menu** — 20px, with the sketchy SVG filter applied, beside each collection link
2. **Collection index headers** — 32–48px, with sketchy filter, as the page heading icon
3. **Post detail header** — 16px, beside the collection label (no filter — small enough that the wobble would be invisible)
4. **Sidebar links** — 14px, beside backlinks and related post titles

## CSS filter tinting

The SVG files are greyscale. Each collection gets a different color via CSS `filter`, applied in `MosaicCard.astro`:

```css
.mosaic-card--articles   .mosaic-doodle-icon {
  filter: invert(30%) sepia(50%) saturate(500%) hue-rotate(-15deg);
}
.mosaic-card--field-notes .mosaic-doodle-icon {
  filter: invert(40%) sepia(30%) saturate(600%) hue-rotate(100deg);
}
.mosaic-card--seeds      .mosaic-doodle-icon {
  filter: invert(45%) sepia(60%) saturate(400%) hue-rotate(10deg);
}
```

One SVG file, eight different tints. No separate colored asset per collection. The filter chain works by: inverting to get the base hue, adding sepia warmth, boosting saturation, then rotating to the target hue angle.

## Sketchy filter

On the mega menu and collection index headers, icons have `filter="url(#sketchy)"` applied — the SVG feTurbulence filter defined in `SketchyFilter.astro`. At 20px+ sizes this produces a visible hand-drawn wobble. See [Sketchy filter](/toolshed/sketchy-filter) for the full implementation.

## Jotting-type icons

Jottings have sub-types with their own icons:

| Type | Icon |
|------|------|
| note | `pencil.svg` |
| quote | `message.svg` |
| event | `calendar.svg` |
| link | `send.svg` |
| post | `linkedin.svg` |

These override the default `pencil.svg` when rendering jotting cards.

## Adding a new collection

1. Create the SVG in `public/images/icons/`
2. Add the mapping in `CollectionIcon.astro`
3. Add the doodle icon map entry in `MosaicCard.astro`
4. Define a strip color and filter for the new collection in `MosaicCard.astro`
5. Define icon stroke colors in `CLAUDE.md` for reference
