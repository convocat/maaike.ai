---
title: Index card (mosaic card)
date: 2026-04-04
maturity: solid
tags: [design, components, cards, layout]
description: The signature card pattern used in the stream, library, and kanban. White card, colored bookmark strip, ruled meta bar, and a double-line separator.
category: design
section: Components
ai: co-created
---

The index card is the primary display unit for content across the garden. It draws from physical index cards: a white paper surface, a colored tab strip on the left for category identification, a ruled meta bar, and a body area for the content.

## Structure

Every card is a flex row with two areas:

```
[strip 52px] | [main column]
                [meta bar: label · date · maturity · ai]  ← double-line border-bottom
                [body: title, description]
```

```html
<article class="mosaic-card mosaic-card--articles">
  <a href="..." class="mosaic-link">
    <div class="mosaic-strip">
      <img src="/images/icons/doc.svg" class="mosaic-doodle-icon" />
    </div>
    <div class="mosaic-main">
      <div class="mosaic-top-meta">...</div>
      <div class="mosaic-body">...</div>
    </div>
  </a>
</article>
```

## The bookmark strip

Left edge, 52px wide, colored by collection. Contains a doodle icon (hand-drawn SVG from `/images/icons/`). Separated from the main column by a `3px double #B8B0AA` border.

Strip colors are soft, desaturated pastels — each a lightened version of the collection's icon stroke color. They don't shout; they identify.

## The meta bar

```css
.mosaic-top-meta {
  padding: 0.45rem 1rem;
  border-block-end: 4px double rgba(180, 60, 60, 0.3);
}
```

The double-line bottom border is the ruling of the index card. The color — a washed-out, transparent red — references pencil lines on paper without being literal about it.

Contents: `COLLECTION LABEL · DATE · [TENDED DATE] · MATURITY EMOJI · AI LABEL`

Right-aligned group: maturity emoji + AI label. Left group: collection, date, tended.

## Hover state

```css
.mosaic-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--color-shadow);
  border-color: transparent;
}
```

The card lifts 2px. Border disappears (shadow takes over). 250ms ease transition.

## Hero card variant

The pinned/featured card gets:
- Larger strip (64px)
- Ruled lines on the main column (repeating blue linear-gradient, every 1.75rem)
- A rubber stamp: "FEATURED" in red at bottom-right, 10deg rotation, 45% opacity
- `scale(1.01)` on hover instead of translate

```css
.mosaic-card--hero .mosaic-main {
  background-image: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent calc(1.75rem - 1px),
    rgba(80, 120, 200, 0.1) calc(1.75rem - 1px),
    rgba(80, 120, 200, 0.1) 1.75rem
  );
}

.mosaic-card--hero::after {
  content: 'FEATURED';
  position: absolute; bottom: 1.1rem; right: 1.6rem;
  font-size: 0.75rem; font-weight: 800; letter-spacing: 0.25em; text-transform: uppercase;
  color: #CC2020; border: 2.5px solid #CC2020;
  padding: 0.35em 0.75em; border-radius: 0.15rem;
  opacity: 0.45; transform: rotate(-10deg);
}
```

## Icon tint

Each collection's doodle icon is tinted via CSS `filter` to match its strip color family. Example:

```css
.mosaic-card--field-notes .mosaic-doodle-icon {
  filter: invert(40%) sepia(30%) saturate(600%) hue-rotate(100deg);
}
```

This lets a single greyscale SVG icon take on any hue without maintaining separate colored assets.

## Where used

`src/components/MosaicCard.astro` — rendered in `src/pages/index.astro` (stream) and `src/pages/library/index.astro` (library). The toolshed kanban cards adapt this pattern at a smaller scale.
