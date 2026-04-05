---
title: OG image generation
date: 2026-04-04
maturity: solid
tags: [design, tooling, sharing, social]
description: How Open Graph images are generated at build time using satori and sharp, composited onto a watercolor background.
category: design
section: Content
ai: co-created
---

Every published post has an Open Graph image — a 1200×627 PNG that appears when the URL is shared on LinkedIn, Slack, or in a browser preview. They're generated at build time, not dynamically.

## The pipeline

`scripts/generate-og-images.cjs` runs after a build. It processes four collections: articles, field-notes, seeds, and jottings.

For each post:

1. Parse frontmatter to extract `title`, `description`, and `draft` flag
2. Skip draft posts
3. Build a text overlay as a React-like element tree using **satori** (text → SVG)
4. Composite the text SVG on top of a pre-rendered background PNG using **sharp**
5. Save to `public/images/og/<collection>/<slug>.png`

## The background

`scripts/og-bg.png` is a pre-rendered 1200×627 PNG — a sage green wash with a watercolor leaf in the upper right. It's generated once and reused for every image.

## Text layout

```js
// Inside buildTextOverlay()
{
  type: 'div',
  props: {
    style: {
      padding: '60px 80px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    children: [
      // Title: dark, large, Lora-style serif
      // Description: muted, smaller
      // Site label: "maaike.ai" bottom-left
    ]
  }
}
```

Satori converts this element tree to an SVG. Sharp composites it over the background at full opacity.

## Output path

```
public/images/og/articles/my-post-slug.png
public/images/og/field-notes/my-field-note.png
```

In `BaseLayout.astro`, the OG image meta tag uses:

```astro
const ogImage = `/images/og/${collection}/${slug}.png`;
const socialImage = ogImage
  ? new URL(ogImage, 'https://www.maaike.ai').href
  : 'https://www.maaike.ai/images/og-default.png';
```

If no image exists (collections not in the generation script, or unpublished drafts), it falls back to `og-default.png`.

## CopyCardImage component

`CopyCardImage.astro` (in the post footer share section) lets readers copy the OG image to their clipboard as a PNG — for pasting directly into LinkedIn without uploading. It reads the pre-generated file at the `imagePath` prop and uses the Clipboard API with a Canvas fallback.

## When to regenerate

OG images need to be regenerated when:

- A post title or description changes
- A new post is published

The `/publish` skill handles this automatically as part of the publishing workflow.
