---
title: Spacing and typography
date: 2026-04-04
maturity: solid
tags: [design, typography, spacing, tokens]
description: The spacing scale, font stack, heading sizes, and label/meta typography conventions used across every component.
category: design
section: Foundation
ai: co-created
---

## Spacing scale

Seven steps, defined as CSS custom properties in `src/styles/tokens.css`:

| Token | Value | Pixels |
|---|---|---|
| `--space-xs` | `0.25rem` | 4px |
| `--space-sm` | `0.5rem` | 8px |
| `--space-md` | `1rem` | 16px |
| `--space-lg` | `1.5rem` | 24px |
| `--space-xl` | `2rem` | 32px |
| `--space-2xl` | `3rem` | 48px |
| `--space-3xl` | `4rem` | 64px |

Components use tokens exclusively. No arbitrary pixel values in component CSS.

## Font stack

Three families, all self-hosted as variable fonts:

| Role | Family | Fallbacks |
|---|---|---|
| Headings | Lora (serif) | Georgia, Times New Roman |
| Body | Roboto (sans-serif) | -apple-system, system-ui |
| Code | JetBrains Mono | Menlo, Monaco, Consolas |

Referenced as `var(--font-heading)`, `var(--font-body)`, `var(--font-mono)`.

## Heading scale

Fluid sizing with `clamp()` so headings scale between viewport widths:

| Element | Size |
|---|---|
| h1 | `clamp(2rem, 4vw, 2.75rem)` |
| h2 | `clamp(1.5rem, 3vw, 2rem)` |
| h3 | `clamp(1.25rem, 2.5vw, 1.5rem)` |

All headings: `line-height: 1.2`, `font-weight: 600`.

Post titles use a separate scale: `clamp(1.8rem, 4vw, 2.5rem)`.

## Body text

- Base font-size: `1rem` (browser default 16px)
- Line-height: `1.7` — generous for comfortable reading
- Prose max-width: `42rem` — keeps line lengths readable

## Label and meta typography

A consistent sub-scale is used for labels, tags, collection identifiers, and secondary metadata throughout all components. These rules must stay consistent to maintain visual hierarchy.

| Use | Size | Weight | Transform | Letter-spacing |
|---|---|---|---|---|
| Collection label (card top) | `0.62rem` | 700 | uppercase | `0.08em` |
| Maturity / AI label | `0.58rem` | 600 | uppercase | `0.06em` |
| Section headings (toolshed, filters) | `0.65–0.72rem` | 700 | uppercase | `0.1–0.12em` |
| Sidebar section heading | `0.72rem` | 600 | uppercase | `0.03em` |
| Card dates, muted meta | `0.62–0.68rem` | 400 | none | none |
| Tag pills | `0.75rem` | 400 | none | none |

## The line-height trap

When mixing element types in one visually unified component (`<button>`, `<label>`, `<span>`), always pin `line-height: 1` explicitly on the shared class. Buttons default to `line-height: normal` (~1.2) while spans inherit body (~1.7). Identical padding will produce different heights without this fix. See [[pill-bar]] for a concrete example.

## Container widths

| Purpose | Value |
|---|---|
| Max page width | `65rem` |
| Content/prose width | `42rem` |
| Post sidebar column | `14rem` |
