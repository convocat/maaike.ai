---
title: Dark mode
date: 2026-04-04
maturity: solid
tags: [design, dark-mode, tokens, accessibility]
description: How the theme toggle works, how flash of wrong theme is prevented, and the token switching strategy.
category: design
section: Foundation
ai: co-created
---

The garden supports a light and dark theme. The active theme is stored in `localStorage` and applied before the first paint to prevent a flash of the wrong theme.

## The no-flash script

In `BaseLayout.astro`, an inline `<script>` runs synchronously in `<head>` — before any CSS or DOM is painted:

```html
<script is:inline>
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute(
    'data-theme',
    saved ?? (prefersDark ? 'dark' : 'light')
  );
</script>
```

`is:inline` tells Astro not to bundle this script — it must run synchronously, not deferred. The `data-theme` attribute on `<html>` is set before the browser renders anything.

## Token switching

All colors are CSS custom properties. The dark mode overrides live in `src/styles/tokens.css`:

```css
:root {
  --color-bg: #FCFCFB;
  --color-text: #1A1A1A;
  --color-accent: #D6006C;
  /* ... */
}

[data-theme="dark"] {
  --color-bg: #111111;
  --color-text: #E8E8E8;
  --color-accent: #FF4DA6;
  /* ... */
}
```

Switching themes is instant — just changing the attribute triggers all the custom property recalculations simultaneously. No JavaScript manipulates individual element styles.

## The toggle button

In the header, a sun/moon icon button calls:

```js
const current = document.documentElement.getAttribute('data-theme');
const next = current === 'dark' ? 'light' : 'dark';
document.documentElement.setAttribute('data-theme', next);
localStorage.setItem('theme', next);
```

## Body transition

```css
body {
  transition: background-color var(--transition-base), color var(--transition-base);
}
```

A 250ms ease transition on color and background makes the switch feel smooth rather than abrupt. Not all properties are transitioned — only the two most noticeable ones.

## Component-level dark variants

Some components define their own dark overrides because they use hardcoded colors (like strip colors on index cards):

```css
:root[data-theme="dark"] .mosaic-card--articles .mosaic-strip {
  background: #2a2320;
}
```

These live in the component file, not in tokens. They're explicit rather than abstracted because each collection's strip color has a specific warm/cool character that doesn't map cleanly to a generic token.

## System preference fallback

If no `localStorage` preference exists, the system preference (`prefers-color-scheme`) is used. If the user has never toggled, they get the theme their OS reports.
