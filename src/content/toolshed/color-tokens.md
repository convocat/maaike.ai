---
title: Color tokens
date: 2026-04-04
maturity: solid
tags: [design, color, tokens, dark-mode]
description: The full color token system, light and dark mode values, and semantic usage rules.
category: design
section: Foundation
ai: co-created
---

All colors are CSS custom properties defined in `src/styles/tokens.css`. Nothing uses hardcoded values in components — everything references a token.

## Primary palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `--color-accent` | `#D6006C` | `#FF4DA6` | Brand pink. Primary interactive color. |
| `--color-accent-2` | `#0D7C66` | `#2DD4A8` | Teal. Secondary links, wiki links, currently reading. |
| `--color-bg` | `#FCFCFB` | `#111111` | Page background. |
| `--color-bg-card` | `#FAFAFA` | `#1A1A1A` | Card and panel backgrounds. |
| `--color-text` | `#1A1A1A` | `#E8E8E8` | Body text. |
| `--color-text-muted` | `#6B6B6B` | `#999999` | Secondary text, labels, dates. |
| `--color-heading` | `#111111` | `#F0F0F0` | Headings and card titles. |
| `--color-border` | `#E5E5E5` | `#2A2A2A` | Dividers, card borders, input borders. |
| `--color-shadow` | `rgba(0,0,0,0.06)` | `rgba(0,0,0,0.3)` | Drop shadows. |

## Semantic colors (not tokenized)

Some colors are used directly in components where they are meaningful:

- **Double-line meta bar accent**: `rgba(180, 60, 60, 0.3)` — washed-out red, mimics ruling on paper
- **Rubber stamp red**: `#CC2020` — featured card stamp, 45% opacity + 10deg rotate
- **Quote mark**: `#8B7355` — warm brown, evokes ink on paper

## Dark mode implementation

Dark mode is toggled via `data-theme="dark"` on `<html>`. The theme attribute is set from `localStorage` on every page load (in `BaseLayout.astro`) to prevent flash.

```js
const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
document.documentElement.setAttribute('data-theme', saved ?? (prefersDark ? 'dark' : 'light'));
```

Tokens are redefined under `[data-theme="dark"]`:

```css
[data-theme="dark"] {
  --color-accent: #FF4DA6;
  --color-bg: #111111;
  /* etc */
}
```

## Collection strip colors

Each collection has a distinct background for its bookmark strip. These are not tokenized — they live directly in `MosaicCard.astro`.

| Collection | Light strip | Dark strip |
|---|---|---|
| Articles | `#EEE6DF` | `#2a2320` |
| Seeds | `#EDE8D5` | `#272310` |
| Field notes | `#D8ECD8` | `#1a2b1a` |
| Weblinks | `#D4E8E5` | `#182422` |
| Jottings | `#DDE3EF` | `#1c2130` |
| Videos | `#E8DDE5` | `#251d24` |
| Library | `#E5E0DA` | `#221e1b` |
| Experiments | `#D4E5E8` | `#182224` |

Each is a desaturated, lightened variant of the collection's icon stroke color.

## Accent color rule

`#D6006C` is the company brand color. It must not change. Any component that needs a primary interactive color uses `var(--color-accent)`.
