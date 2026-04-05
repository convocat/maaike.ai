---
title: Prose conventions
date: 2026-04-04
maturity: solid
tags: [design, content, typography, prose]
description: "The custom prose elements available in garden posts: blockquotes, observation blocks, tended notes, LinkedIn drafts, and the h6 paragraph header."
category: content
section: Patterns
ai: co-created
---

Garden posts use standard Markdown for most content, but several custom patterns extend prose. These are CSS classes applied to HTML elements, usable in Markdown via raw HTML blocks.

## Blockquote

Standard Markdown `>` blockquote. Styled with a left accent border:

```css
.prose blockquote {
  border-inline-start: 3px solid var(--color-accent);
  padding-inline-start: var(--space-md);
  color: var(--color-text-muted);
  font-style: italic;
  margin-block: var(--space-md);
}
```

Pink left border, muted italic text. Used for quotes from external sources or for emphasis.

## Observation block

A teal-bordered callout for personal observations or key insights:

```html
<div class="observation">

Your observation here.

</div>
```

```css
.prose .observation {
  background: rgba(13, 124, 102, 0.08);
  border-inline-start: 3px solid var(--color-accent-2);  /* teal */
  border-radius: 4px;
  padding: var(--space-md) var(--space-lg);
  margin-block: var(--space-xl);
  font-size: 0.92em;
}
```

The teal color (`--color-accent-2`) distinguishes observations from blockquotes (pink). The subtle green background wash makes the block feel like a sticky note rather than a hard boundary. This is where thinking happens — not just citation.

## Tended revision note

For recording when and why a post was updated:

```html
<div class="tended">

Tended April 2026: Added the observation block pattern after using it extensively.

</div>
```

```css
.prose .tended {
  display: flex;
  gap: var(--space-sm);
  align-items: baseline;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-style: italic;
  border-block-end: 1px solid var(--color-border);
  padding-block-end: var(--space-md);
  margin-block-end: var(--space-xl);
}

.prose .tended::before {
  content: '✏️';
  font-style: normal;
  flex-shrink: 0;
  font-size: 0.75rem;
}
```

The pencil emoji is generated via `::before`, so the HTML stays clean. "Tended" is the garden word for "revised" — aligns with the maturity vocabulary.

## LinkedIn draft block

Posts can include a LinkedIn draft that's invisible on the web but visible in Typora (for editing convenience):

```html
<div class="linkedin">

Draft LinkedIn post here.

</div>
```

```css
.prose .linkedin {
  display: none;
}
```

`display: none` hides it completely from the rendered page. In Typora the raw HTML is visible, so it serves as an inline scratchpad for the companion post. The LinkedIn publishing flow uses a separate script — this block is purely for drafting.

## h6 as paragraph header

`h6` is repurposed as a bold inline-style run-in heading, rendered in body font rather than heading font:

```css
.prose h6 {
  font-family: var(--font-body);   /* Roboto, not Lora */
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.7;
  margin-block: var(--space-md);
}
```

This gives a lightweight section label that doesn't break the prose flow the way `h3` or `h4` would. Use it for named subsections inside a long paragraph cluster, or when a full heading feels too heavy.

`h1`–`h5` use Lora serif. `h6` is the exception — it reads as prose, just bold.

## hr as major section break

`---` in Markdown produces an `<hr>`. Styled as a thin border with generous vertical space:

```css
.prose hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin-block: var(--space-2xl);
}
```

2xl spacing (~3rem) ensures the break reads as a significant pause rather than a decorative line.
