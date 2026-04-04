---
title: Homepage stream
date: 2026-04-04
maturity: solid
tags: [design, layout, content, filtering]
description: How the homepage feed is built, filtered, and displayed, including pinning, exclusion rules, and the sidebar.
category: design
section: Layout
ai: co-created
---

The homepage is the garden's stream: a chronological feed of content across all collections, with filter controls and a contextual sidebar. It's built entirely at build time — no API calls on page load.

## Feed eligibility rules

Not everything makes it into the stream. The feed excludes:

| Rule | Excluded |
|------|----------|
| `hub: true` | Project hub posts (they live on `/projects`) |
| `ai: 'generated'` | Fully AI-generated posts |
| `collection === 'library'` | Books (they have their own `/library` page) |
| `develops: <slug>` | Project sub-files (they're too contextual without the hub) |
| field-notes with tag `about` | Meta-posts about the garden itself |
| jottings with `type: 'quote'` | Raw quotes (noise without context) |

The result is a curated stream of articles, seeds, field notes (non-meta), weblinks, videos, experiments, and non-quote jottings.

## Pinned article

The most recent article is pulled out of the feed order and rendered as a **hero card** at the top — visually larger, with ruled lines and a "FEATURED" rubber stamp. The rest of the feed follows in date-descending order.

```js
const latestArticle = mainFeedEligible.find((e) => e.collection === 'articles');
const feedItems = mainFeedEligible.filter((e) => e !== latestArticle);
```

## Pagination

The stream paginates at 6 items per page on mobile and 12 per page on desktop. Filter changes reset to page 1. Next/previous controls scroll to the top of the stream grid. See [Pagination](/toolshed/pagination).

## Filters

The sidebar (desktop) and mobile filter panel offer four filter groups:

- **Collection** — checkboxes per collection (articles, seeds, field notes, jottings, weblinks, videos)
- **Maturity** — 🌱 Draft, 🌿 Developing, 🪴 Solid, 🌳 Complete
- **AI level** — ✍️ 100% Maaike, ✏️ Assisted, ✨ Co-created
- **Sort** — pill bar: Date planted / Date tended

Data attributes on each card (`data-collection`, `data-maturity`, `data-tags`, `data-date`, `data-updated`, `data-ai`) power the client-side filter with no server round-trip.

## Sidebar

The homepage sidebar is contextual:

- **Currently reading** — up to 3 books from the library with `status: 'reading'`
- **Active projects** — up to 8 posts with `hub: true`
- **blogroll recent posts** — latest item from each blogroll site that has an RSS feed, fetched at build time

The blogroll fetch runs at build time via `rss-parser`:

```js
const feedResults = await Promise.allSettled(
  blogroll
    .filter(site => Boolean(site.feed))
    .map(async (site) => {
      const feed = await parser.parseURL(site.feed);
      const latest = feed.items[0];
      return { name: site.name, postTitle, postUrl, postDate };
    })
);
```

Failed feeds are silently dropped (allSettled). Stale data is acceptable — it's updated on each deploy.

## Body preview

Some cards in the stream show a short body preview. This is extracted at build time by `extractBodyPreview()`:

```js
function extractBodyPreview(body, maxLen = 220) {
  return body
    .replace(/<div[^>]*class="tended"[^>]*>[\s\S]*?<\/div>/g, '')  // strip tended notes
    .replace(/<[^>]+>/g, '')                                         // strip HTML
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')                        // unwrap links
    // ... more cleanup
    .slice(0, maxLen) + '…';
}
```

Tended revision notes are specifically stripped from previews — they're editorial metadata, not content.
