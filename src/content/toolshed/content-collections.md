---
title: Content collections
date: 2026-04-05
maturity: solid
tags: [technical, astro, architecture, content]
description: How the eight content collections are defined, validated, and loaded using Astro 5's content layer and Zod schemas.
category: technical
section: Architecture
ai: co-created
---

All content in the garden is stored as Markdown files. Astro's content collections give each file a typed, validated schema. The configuration lives in `src/content.config.ts`.

## The base schema

All collections share a common base schema defined with Zod:

```ts
const baseSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  updated: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce.date().optional(),
  ),
  maturity: z.enum(['draft', 'developing', 'solid', 'complete']).default('draft'),
  tags: z.array(z.string()).default([]),
  triples: z.array(z.tuple([z.string(), z.string(), z.string()])).optional(),
  themes: z.array(z.string()).optional(),
  description: z.string().optional(),
  draft: z.boolean().default(false),
  ai: z.enum(['100% Maai', 'assisted', 'co-created', 'generated']).optional(),
  hub: z.boolean().optional(),
  develops: z.string().optional(),
});
```

The `updated` field uses a `preprocess` step to coerce empty strings and null to `undefined` — this prevents Zod from rejecting a YAML field that's been cleared to an empty value in Typora.

## Per-collection extensions

Each collection extends `baseSchema` with its own additional fields:

| Collection | Extra fields |
|------------|-------------|
| `articles` | `pruning?: string` — notes on what to cut · `image?: string` — path to featured image, drives split OG card |
| `weblinks` | `url: string` (required URL) |
| `videos` | `url: string` (required URL) |
| `library` | `author`, `cover?`, `status`, `genre?`, `book_type?`, `purpose?`, `reason?`, `notes?`, `rating?`, `review?`, `recommended?`, `recommended_score?` |
| `jottings` | `type: 'note' \| 'quote' \| 'event' \| 'link' \| 'post'`, `source?`, `page?`, `url?` |
| `toolshed` | `category: 'design' \| 'technical'`, `section?: string` |

## The glob loader

Astro 5 uses the content layer API. Each collection uses a `glob` loader:

```ts
const fieldNotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/field-notes' }),
  schema: baseSchema,
});
```

The `glob` loader scans the base directory recursively for `.md` files. The `id` of each entry is the filename without extension (e.g., `my-post.md` → `id: 'my-post'`).

## Draft filtering

`draft: true` in frontmatter marks a post as unpublished. Filtering happens in each page that fetches content:

```ts
.filter((e) => !e.data.draft)
```

There is no global draft filter — each route is responsible for its own exclusion.

## Collection name mapping

Astro uses camelCase for collection names internally (`fieldNotes`, not `field-notes`). The `getAllContent()` utility in `src/utils/collections.ts` normalizes these to URL-friendly slugs with hyphens:

```ts
...fieldNotes.map((e) => ({ ...e, collection: 'field-notes' as const })),
```

This means routes use `/field-notes/[slug]` while the Astro API uses `getCollection('fieldNotes')`.

## Dev server restart

When adding new `.md` files to a collection, the Astro dev server must be restarted. The content store is built at startup — new files are not picked up by hot reload.
