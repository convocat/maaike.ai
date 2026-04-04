---
title: View transitions
date: 2026-04-04
maturity: solid
tags: [design, interaction, performance, navigation]
description: How Astro's ViewTransitions component provides smooth page-to-page navigation and why dark mode state has to be re-applied on each swap.
category: design
section: Interactive controls
ai: co-created
---

The garden uses Astro's built-in `ViewTransitions` component for smooth client-side navigation between pages — without a full browser reload.

## How it works

`<ViewTransitions />` is included in `BaseLayout.astro` inside `<head>`. It intercepts link clicks and replaces page content via the browser's [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API) (or falls back to a regular navigation on unsupported browsers).

```astro
import { ViewTransitions } from 'astro:transitions';
// ...
<ViewTransitions />
```

That's the entire configuration — Astro handles the animation and swap mechanism.

## The dark mode problem

View transitions swap the `<html>` element's content but do not re-run `<head>` scripts on each navigation. This means the `data-theme` attribute set by the no-flash script in `<head>` is wiped on every page transition.

To fix this, a second inline script listens for Astro's `astro:after-swap` event and re-applies the theme:

```js
document.addEventListener('astro:after-swap', () => {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
});
```

`astro:after-swap` fires after the new page DOM is in place but before it's painted. Re-setting `data-theme` here prevents a flash of the wrong theme on navigation.

## Component re-initialization

Any JavaScript that runs on page load also needs to run on `astro:after-swap`. In `Header.astro`, the dropdown setup functions are called in both places:

```js
document.addEventListener('DOMContentLoaded', setupGardenDropdown);
document.addEventListener('astro:after-swap', setupGardenDropdown);
```

Without this, the dropdowns would stop working after the first navigation.

## Performance benefit

Transitions make navigation feel instant. The critical path is: intercept click → fetch new page → swap DOM → paint. There's no full page reload, no FOUC, no layout flash. Combined with Astro's static output (no server), pages load from CDN cache in milliseconds.

## When transitions don't fire

- Hard refreshes (`Ctrl+R`)
- External links (open in new tab or navigate away)
- Links with `data-astro-reload` attribute (forces full reload)

The no-flash script in `<head>` handles these cases: it runs on every hard load and sets the theme from `localStorage` before painting.
