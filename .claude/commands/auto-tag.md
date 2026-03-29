# Auto-tag and link

Analyze a post's content and enrich it with tags, triples, internal wiki-links, and Wikipedia links.

## Step 1: Select the post

Use the post that was just created (if called from `/new-post`), or ask the user which post to analyze. Read the full content (frontmatter + body).

## Step 2: Build context

1. **Existing tags**: Glob `src/content/tags/*.md` and extract all tag titles and slugs.

2. **All garden content** (for backlink candidates): For each collection (articles, field-notes, seeds, weblinks, videos, library, experiments, jottings), glob `src/content/<collection>/*.md` and extract `title`, `description`, and `tags` from frontmatter. Build a map of slug → { title, description, collection }.

3. **What the post already has**: Note existing tags, triples, and `[[...]]` wiki-links in the body.

## Step 3: Thematic analysis

Read the post carefully. Extract:

**Named entities:**
- People (researchers, philosophers, public figures)
- Tools and products (software, platforms, services)
- Disciplines and fields (conversation design, philosophy, linguistics)
- Movements and schools of thought
- Named theories, concepts, and frameworks

**Key themes:** the 2-4 main ideas the post is about.

**Relationships:** Subject-predicate-object triples capturing claims, attributions, or structural relationships in the text. Aim for 2-5 triples. Good triples:
- Are precise and non-trivial
- Capture something the post actually argues or demonstrates
- Use short, active predicate phrases: "argues against", "builds on", "coined by", "distinguishes between"

Example: `["Dialectical thinking", "attributed to", "Hegel"]`

## Step 4: Tag suggestions

Map entities and themes to the existing tag list.

**For existing tags**: suggest any that genuinely fit, ranked by relevance.

**For new tags**: if a theme or entity is significant but not in the tag list, propose creating it. A good new tag:
- Is a distinct, reusable concept (not too specific to one post)
- Would plausibly be used on 2+ future posts
- Is a noun or noun phrase, kebab-cased

Don't pad with weak tags. 2-5 total is ideal.

## Step 5: Backlink suggestions (internal wiki-links)

Scan the body for phrases that match or closely relate to other garden posts. A good wiki-link:
- The phrase is genuinely about that post's topic
- The linked post adds real value for the reader
- 2-5 per post max; don't suggest existing links

Format: `[[slug|display phrase]]` if phrase ≠ slug, else `[[slug]]`.

## Step 6: Wikipedia link suggestions

For named concepts, people, or theories in the post that:
- Are significant and well-documented on Wikipedia
- Don't have their own garden content
- Would give the reader genuinely useful context

Suggest: `[display text](https://en.wikipedia.org/wiki/Article_title)`.

Higher bar than internal links. Only suggest where Wikipedia is the natural reference.

## Step 7: Present all suggestions

Show in one block:

```
**Suggested tags** (n new, n existing):
- `tag-slug` — reason [NEW] or [existing]

**Triples:**
- ["Subject", "predicate", "Object"]

**Wiki-links (internal):**
- "phrase in text" → [[slug|phrase]] (collection: title)

**Wikipedia links:**
- "concept" → [concept](https://en.wikipedia.org/wiki/Concept) — why it's worth linking
```

Ask: "Accept all, or tell me what to skip/change."

## Step 8: Apply

**Tags:**
- Add accepted tags to frontmatter `tags:` array
- For NEW tags: create `src/content/tags/<slug>.md`:
  ```yaml
  ---
  title: Tag Name
  ---
  ```

**Triples:**
- Add accepted triples to frontmatter `triples:` array
- Format: `- ["Subject", "predicate", "Object"]`

**Wiki-links:** Replace plain phrases in body with `[[slug|phrase]]` syntax.

**Wikipedia links:** Wrap plain text with `[text](https://en.wikipedia.org/wiki/...)`.

Keep all other body content intact.

## Step 9: Save

Write the updated file. Do not commit — the caller decides when to commit.
