---
title: Post layout with sidebar
date: 2026-04-04
maturity: solid
tags: [design, layout, post, sidebar]
description: "The two-column grid used on every post: a fluid article column next to a fixed 14rem sidebar."
category: design
section: Layout
ai: co-created
---

Every post uses the same two-column layout: a fluid article area on the left, a fixed-width sidebar on the right. The structure is defined in `PostLayout.astro` and applies to all collections.

## The grid

```css
.post-with-sidebar {
  display: grid;
  grid-template-columns: 1fr 14rem;
  gap: var(--space-xl);
  max-width: var(--max-width);
  margin-inline: auto;
}
```

The article column is `1fr` — it takes all remaining space. The sidebar is a hard `14rem`, narrow enough to be supplementary but wide enough for a short list of links.

`min-width: 0` on the article prevents overflow when content (code blocks, wide tables) is wider than the available column space.

## Breakpoint collapse

At `68rem`, the sidebar collapses below the article:

```css
@media (max-width: 68rem) {
  .post-with-sidebar {
    grid-template-columns: 1fr;
  }

  .post-sidebar {
    padding-block-start: var(--space-xl);
    border-top: 1px solid var(--color-border);
  }
}
```

On mobile the sidebar becomes a second block at the bottom of the page. The border-top acts as a visual separator.

## Post header anatomy

The post header sits inside the article column. From top to bottom:

1. **Collection label** — 14px icon + collection name in muted small-caps. Hub posts also show a pink-bordered "Project hub" badge.
2. **Title** — `clamp(1.8rem, 4vw, 2.5rem)`, Lora serif.
3. **Subtitle** — description in muted body text (1.05rem), line-height 1.5.
4. **External link** (optional) — shown for weblinks and videos; renders the hostname with an ↗ arrow.
5. **Meta line** — formatted date; if `updated` is set, "Tended [date]" follows after a `·` separator.
6. **Maturity track** — four plant emojis as stage indicators.

The header is separated from the prose by a bottom border and generous spacing (`margin-block-end: var(--space-3xl)`).

## Sidebar alignment

The sidebar starts `padding-block-start: var(--space-3xl)` down the page — matching the post header height so sidebar content aligns roughly with the body text, not the title. Opacity is `0.85` to read as secondary.

## Sidebar stickiness

The sidebar content itself uses `position: sticky; top: var(--space-xl)` so it stays in view while scrolling a long post. The sidebar column has no `overflow` or `max-height` — only one scrollbar exists on the page.

## Back link

Above the `post-with-sidebar` grid, a `←` link appears. By default it links to `/` with label "Stream". The toolshed slug route overrides this to return to the appropriate toolshed section.

```astro
<a href={backHref} class="back-to-stream">&larr; {backLabel}</a>
```

## AI attribution box

Immediately above the prose (before `<slot />`), if the `ai` frontmatter field is set, a styled `<aside>` appears with a pink left border and the attribution level. See [AI attribution box](/toolshed/ai-attribution-box).
