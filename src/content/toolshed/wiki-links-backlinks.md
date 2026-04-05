---
title: Wiki links and backlinks
date: 2026-04-05
maturity: solid
tags: [technical, wiki-links, knowledge-graph, navigation]
description: How [[wiki links]] are processed at build time, resolved to URLs, and how backlinks are computed from them.
category: technical
section: Architecture
ai: co-created
---

Wiki links (`[[Page Title]]`) are the garden's primary cross-referencing mechanism. They connect posts across collections and power the backlink graph shown in every post's sidebar.

## Build-time processing

Wiki links are handled by `remark-wiki-link`, configured in `astro.config.mjs`. The plugin intercepts `[[...]]` syntax during Markdown processing and transforms it into HTML `<a>` tags.

The resolver maps a wiki link's text to a URL path. Unresolved links (no matching post) get a `wiki-link--new` CSS class and a `cursor: help` cursor — they stay visible but are visually distinct.

## Slug normalization

Both the wiki link plugin and the backlinks utility normalize slugs the same way:

```ts
const targetSlug = match[1].split('|')[0].replace(/ /g, '-').toLowerCase();
```

`[[My Post Title]]` → `my-post-title`. The `|` split handles aliased links: `[[my-post-title|Custom label]]` resolves to `my-post-title` with "Custom label" as the anchor text.

## Backlink computation

`src/utils/backlinks.ts` scans every post body at build time and extracts all wiki links. It builds a reverse map: given a target slug, which posts link to it?

```ts
async function buildBacklinkMap() {
  // Scan all collections
  for (const entry of allEntries) {
    const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;
    let match;
    while ((match = wikiLinkRegex.exec(entry.body)) !== null) {
      const targetSlug = match[1].split('|')[0].replace(/ /g, '-').toLowerCase();
      map.get(targetSlug)!.push({
        title: entry.data.title,
        href: `/${entry.collection}/${entry.id}`,
        collection: entry.collection,
        date: entry.data.date,
      });
    }
  }
  return map;
}
```

The map is lazily built on first call and cached in module scope (`let backlinkMap: Map | null = null`). Subsequent calls within the same build reuse the cached map.

## Module-level caching

Because Astro's build runs in a single Node.js process, module-level variables persist across component renders. The backlink map is built once and reused for every `PostSidebar` render. This matters because the backlinks utility scans all 8 collections — without caching, it would run hundreds of times.

## Used by

- `PostSidebar.astro` — shows "Linked from" or "Project files" in the sidebar
- `src/utils/collections.ts` / `getLinkedBooks()` — identifies wiki links that point to library entries specifically, for the "Books mentioned" sidebar section

## Alias syntax

```markdown
[[target-slug|Display label]]
```

The text before `|` is the slug used for resolution and backlink indexing. The text after `|` is the rendered anchor text. Both sides are stripped of whitespace and lowercased.

## Limitations

Backlinks are computed from the raw Markdown body. If a post is excluded from the build (e.g., `draft: true`), its links are still indexed — but the href will lead to a 404. In practice this is rare since drafts don't link extensively.
