---
title: Sketchy filter (hand-drawn aesthetic)
date: 2026-04-04
maturity: solid
tags: [design, svg, aesthetic, icons]
description: The SVG feTurbulence filter that gives collection icons their hand-drawn, organic wobble.
category: design
section: Components
ai: co-created
---

The garden's icons don't look crisp and geometric. They wobble slightly, as if drawn with a pen. This is achieved with a single SVG filter.

## The filter

```svg
<svg style="display: none">
  <filter id="sketchy">
    <feTurbulence
      type="turbulence"
      baseFrequency="0.015"
      numOctaves="3"
      seed="5"
    />
    <feDisplacementMap
      in="SourceGraphic"
      in2="turbulence"
      scale="0.4"
      xChannelSelector="R"
      yChannelSelector="G"
    />
  </filter>
</svg>
```

Applied to an icon: `filter="url(#sketchy)"` on the SVG element.

## How it works

`feTurbulence` generates a noise field — a procedurally generated pattern of smooth random values. `feDisplacementMap` uses that noise field to displace (shift) the pixels of the source graphic. Each pixel moves a small amount based on its position in the noise field.

The result: straight lines get a subtle wave, corners become slightly soft. It reads as hand-drawn without being cartoonish.

## Key parameters

- **`baseFrequency: 0.015`** — very low frequency = large, slow waves. Higher values produce a jagged effect; lower values produce gentle drift. At 0.015, a 100px icon shifts by only a few pixels at its edges.
- **`scale: 0.4`** — displacement strength. The default would be 1, which would be extreme. At 0.4, the distortion is barely perceptible but still present.
- **`numOctaves: 3`** — layers of noise stacked for organic complexity. More octaves = more texture but higher compute cost.
- **`seed: 5`** — the random seed. Changing this changes the exact shape of the distortion while keeping the same character.

## Where the filter is defined

`src/components/SketchyFilter.astro` — a tiny component that outputs just the SVG definition. It's included in `PageLayout.astro` so it's available on every page without repeating the markup.

## Applied on

Collection icons in `CollectionIcon.astro` — the icons in the header mega menu, collection index page headings, and post detail headers.

## Trade-off

SVG filters run on the GPU and are generally fast. At `scale: 0.4`, there's no visible performance cost. Avoid applying the filter to large raster images or animated elements.
