---
title: Hero watercolor rotation
date: 2026-05-07
maturity: solid
tags: [design, illustration, homepage]
description: The right-hand watercolor in the stream hero rotates between three painted images on each page load.
category: design
section: Components
ai: co-created
---

The stream hero (homepage, `src/pages/index.astro`) shows a small watercolor on the right. Instead of a static leaf, it rotates between three painted images on each visit:

| Image | Width | Notes |
|---|---|---|
| `watercolor-leaf-trimmed.png` | 110px | The original. Tall green leaf. |
| `watercolor-oak-trimmed.png` | 120px | Oak leaf, transparent background, slightly larger to read at the same visual weight. |
| `watercolor-acorn-trimmed.png` | 160px | Wider aspect ratio, sized larger so the body reads substantial. |

## How

The `<img>` carries the default leaf src plus a `data-options` attribute encoding `name:width` pairs. A small inline `is:inline` script runs at page load, picks one option at random, and overwrites the `src` and `width` style.

```html
<img id="hero-watercolor" src="/images/watercolor-leaf-trimmed.png"
     data-options="watercolor-leaf-trimmed:110,watercolor-oak-trimmed:120,watercolor-acorn-trimmed:160"
     ... />
```

Rotation is per-visit, not per-day or per-session. Random gives serendipity without persistence overhead. If JS is disabled the leaf renders as the static fallback.

## Sizes

The three images have different aspect ratios (the acorn is wider than the leaves), so a single fixed width would make the acorn read smaller and the leaves read larger. The per-image width in `data-options` corrects for that.

## Trimming

`watercolor-oak-trimmed.png` and `watercolor-acorn-trimmed.png` were both produced from their source PNGs by:

1. Floodfilling near-white pixels from the four corners and zeroing their alpha
2. A two-pixel soft fade at the edge to avoid a hard cut
3. Cropping to the opaque bounding box

For the acorn, an additional rectangle mask removed the AI-generated watermark badge in the top-left.

## Files

- `src/pages/index.astro` — markup + inline rotation script
- `public/images/watercolor-leaf-trimmed.png`
- `public/images/watercolor-oak-trimmed.png`
- `public/images/watercolor-acorn-trimmed.png`
