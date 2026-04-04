---
title: Post sidebar
date: 2026-04-04
maturity: solid
tags: [design, components, navigation, sidebar]
description: The narrow sidebar on every post, showing linked-from backlinks, related posts, hub relationships, and suggested books.
category: design
section: Components
ai: co-created
---

The 14rem sidebar on every post is contextual: it shows different sections depending on the post's role in the garden. All data is computed at build time in `PostSidebar.astro`.

## Sections and their logic

### Part of

Shown when the post has a `develops: <slug>` frontmatter field. Renders a single link to the hub post — the project this file belongs to.

The hub is resolved at build time by scanning all content for a post whose `id` matches the `develops` slug. If no match is found, the section is suppressed.

### Linked from / Project files

Shows backlinks — other posts that link to this one via `[[Wiki link]]` syntax. The heading adapts:

- **Hub post** (`hub: true`): heading is "Project files"
- **Regular post**: heading is "Linked from"

Each link shows a small collection icon (14px) alongside the post title.

### Related

Only shown on non-hub posts. Computed by `getRelatedPosts()` which ranks posts by shared tag overlap, filtered to exclude the current post. These are posts that share themes without explicitly linking to each other.

### Books mentioned

Shown when the post body contains `[[wiki links]]` to library entries. `getLinkedBooks()` resolves these to book records and renders them as small cards with cover thumbnail (28×40px), title, and author.

### Suggested reading

Uses `getSuggestedBooks()` — a recommender that finds books in the library relevant to the post's collection and tags. Shown only when there are matches and the post isn't already saturated with linked books.

## Visual design

```css
.sidebar-content {
  position: sticky;
  top: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  font-size: 0.85rem;
}

.sidebar-heading {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--color-text-muted);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-block-end: var(--space-xs);
}
```

Section headings are small-caps, muted, 0.72rem — they label without competing with content. Links are muted by default and turn accent on hover.

## Sticky behavior

`.sidebar-content` uses `position: sticky; top: var(--space-xl)`. No `max-height` or `overflow-y` — the sidebar scrolls with the page rather than independently. See [One page, one scrollbar](/toolshed/one-page-one-scrollbar) for why.

## Mobile behavior

At `68rem` breakpoint, the sidebar drops below the article and goes `position: static`. Links switch from vertical stacking to `flex-wrap: row` — they spread horizontally at the bottom of the post rather than forming a column.

## Book card design

```css
.sidebar-book-cover {
  width: 28px;
  height: 40px;
  object-fit: cover;
  border-radius: 2px;
  flex-shrink: 0;
}
```

A small 28×40 thumbnail acts as a visual anchor. If no cover image is provided, a placeholder tile shows the book's first letter. Title (0.78rem) and author (0.68rem, 70% opacity) complete the card.
