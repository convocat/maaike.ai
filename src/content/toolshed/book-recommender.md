---
title: Book recommender
date: 2026-04-05
maturity: solid
tags: [technical, library, recommender, nlp]
description: How the sidebar's "Suggested reading" is computed using cosine similarity between post content and library book profiles.
category: technical
section: Infrastructure
ai: co-created
---

The "Suggested reading" section in the post sidebar recommends library books based on the current post's content. It runs entirely at build time — no server, no API, no vector database. All logic lives in `src/utils/recommender.ts`.

## The approach

Each post and each book gets a keyword profile — a weighted map of tokens extracted from title, description, and body. Similarity is computed using cosine similarity between these two profiles. A tag bonus adds signal when posts and books share tags directly or via a synonym table.

## Keyword profiles

Text is stripped of Markdown syntax, tokenized, lowercased, and filtered against a stop-word list. Weights differ by source:

```ts
const titleKeywords    = buildKeywordMap(tokenize(postTitle), 3);   // 3× weight
const descKeywords     = buildKeywordMap(tokenize(postDescription), 2);
const bodyKeywords     = buildKeywordMap(tokenize(postBody), 1);
const articleProfile   = mergeKeywordMaps(titleKeywords, descKeywords, bodyKeywords);
```

Title carries the most weight — it expresses the post's core topic. Body has the lowest weight because it's noisy.

## Cosine similarity

```ts
function cosineSimilarity(a, b) {
  let dotProduct = 0, normA = 0, normB = 0;
  for (const [key, val] of a) {
    normA += val * val;
    if (b.has(key)) dotProduct += val * b.get(key);
  }
  for (const [, val] of b) normB += val * val;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
```

Returns a value between 0 and 1. A combined score is: `contentScore * 10 + tagBonus`. Posts with score below 0.5 are excluded. The top 3 are surfaced in the sidebar.

## Tag synonym table

Tags don't always overlap directly. The synonym table bridges related concepts:

```ts
const TAG_SYNONYMS = {
  'conversation-design': ['conversational-ai', 'voice', 'design'],
  'ai': ['ai-ethics', 'ai-tools', 'nlp'],
  'llm': ['ai', 'nlp', 'conversational-ai'],
  // ...
};
```

A direct tag match adds 3 points; a synonym match adds 1.5. This improves recall for semantically related content that doesn't share exact tag strings.

## Caching

```ts
let cachedBooks: Awaited<ReturnType<typeof getCollection<'library'>>> | null = null;
```

The library collection is fetched once and cached in module scope. All posts in the same build reuse the same book list without re-querying Astro's content layer.

## Limitations

- Cosine similarity is bag-of-words — word order and semantics are ignored. Two posts using the same words in different contexts score identically.
- The tag synonym table is handwritten — it doesn't update automatically as the tag vocabulary grows.
- Books without body content (no notes written yet) rely entirely on title and tag matching.

## When suggestions appear

The `PostSidebar` component shows "Suggested reading" only when `suggestedBooks.length > 0` and the post is not itself a hub (project hubs already have a "Project files" section). Self-referential suggestions (viewing a library entry) are filtered out.
