---
title: Reading font picker
date: 2026-05-07
maturity: solid
tags: [design, typography, accessibility]
description: A small Aa control in the header lets visitors swap the body font between Nunito (default), Mulish, Atkinson Hyperlegible, and Roboto.
category: design
section: Components
ai: co-created
---

A small "Aa" button next to the search icon in the header opens a popover with four reading-font options. Choice persists in `localStorage` and is applied via a `data-font` attribute on `<html>` before paint, the same FOUC-prevention pattern as dark mode.

## Options

| Choice | Family | Notes |
|---|---|---|
| Default | Nunito | Rounded humanist, slightly heavier (`font-weight: 460`) so it doesn't read light. |
| Mulish | Mulish | Soft humanist, cooler than Nunito. |
| Atkinson Hyperlegible | Atkinson Hyperlegible | Accessibility-first, distinctive apertures, recommended for readers with low vision. |
| Classic | Roboto | The previous default, kept available for visitors who prefer it. |

Headings stay Lora regardless of body-font choice.

## How the swap works

`tokens.css` declares a default `--font-body: 'Nunito', ...` plus `[data-font="..."]` overrides for each alternative:

```css
:root[data-font="roboto"]   { --font-body: 'Roboto', -apple-system, sans-serif; --font-weight-body: 400; }
:root[data-font="mulish"]   { --font-body: 'Mulish', -apple-system, sans-serif; --font-weight-body: 400; }
:root[data-font="atkinson"] { --font-body: 'Atkinson Hyperlegible', -apple-system, sans-serif; --font-weight-body: 400; }
```

The body uses `font-family: var(--font-body)` and `font-weight: var(--font-weight-body)`. `--font-weight-body` defaults to `460` (Nunito needs the bump) and drops to `400` for the alternatives.

## Self-hosted

All four fonts are self-hosted in `public/fonts/` as woff2 (latin + latin-ext subsets). Mulish and Nunito are variable (400-700 + ital); Atkinson is static 400/700 + ital. Total ~445KB across 16 files, lazily fetched by the browser when a family is in use.

## Files

- `src/styles/fonts.css` — `@font-face` declarations for all four
- `src/styles/tokens.css` — the `--font-body` token + `[data-font]` overrides
- `src/components/Header.astro` — the picker UI and JS handlers
- `src/layouts/BaseLayout.astro` — inline pre-paint script that reads `localStorage` and applies `data-font`

## Related

The standalone [/font-compare.html](/font-compare.html) and [/font-preview.html](/font-preview.html) tools were used to choose these three alternates before wiring them. See the [Font comparison tool](/toolshed/font-comparison/) entry.
