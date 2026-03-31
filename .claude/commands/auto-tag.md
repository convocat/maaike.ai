# Auto-tag and link

Analyze a post's content and enrich it with tags, triples, internal wiki-links, and Wikipedia links.
Triples follow the **TAO of Topic Mapping** method (Topics, Associations, Occurrences),
applied through a **three-pass read**.

## Step 1: Select the post

Use the post that was just created (if called from `/new-post`), or ask the user which post to analyze. Read the full content (frontmatter + body).

## Step 2: Build context

1. **Existing tags**: Glob `src/content/tags/*.md` and extract all tag titles and slugs.

2. **Existing topics**: Read `src/data/triples.json`. Extract all topic IDs, labels, and types from the `topics` object. These are the canonical entities already in the graph — reuse them rather than creating near-duplicates.

3. **All garden content** (for backlink candidates): For each collection (articles, field-notes, seeds, weblinks, videos, library, experiments, jottings), glob `src/content/<collection>/*.md` and extract `title`, `description`, and `tags` from frontmatter. Build a map of slug → { title, description, collection }.

4. **What the post already has**: Note existing tags, triples, and `[[...]]` wiki-links in the body.

## Step 3: Three-pass analysis

### Pass 1 — Thematic read (wide angle)

Read the full text once for the big picture. Ask:
- What are the 2–4 overarching themes?
- What intellectual tradition(s) does it draw from?
- What is the central argument or position?

→ Produces: **theme list** (for tags) and framing for pass 2.

### Pass 2 — TAO extraction (close read)

Re-read carefully for entities and relationships.

**Topics (T):** Extract all named things worth knowing about:
- People (researchers, philosophers, public figures)
- Technology (tools, products, systems, models)
- Concepts (theories, frameworks, methods, principles, phenomena)
- Design elements (metaphors, interaction models, disciplines)

For each topic, assign a **type** from this controlled vocabulary:
`person` · `technology` · `technology-category` · `technical-mechanism` · `technical-phenomenon` ·
`philosophical-method` · `philosophical-framework` · `philosophical-concept` ·
`epistemological-concept` · `epistemic-stance` · `cognitive-tendency` · `belief-type` ·
`linguistic-concept` · `linguistic-principle` · `communication-type` · `theoretical-concept` ·
`interaction-metaphor` · `design-discipline` · `acoustic-concept`

Check existing topics in `triples.json` first — reuse canonical IDs and labels where the concept matches.

**Associations (A):** Extract 3–7 typed relationships between topics. Use **only** predicates from this controlled vocabulary:
`attributed-to` · `structured-as` · `counters` · `reinforces` · `contrasted-with` · `demonstrates` ·
`lacks` · `caused-by` · `metaphor-for` · `inaccessible-via` · `instance-of` · `characterised-as` ·
`coined-by` · `defined-as` · `theorised-by` · `exhibits` · `violates` · `presupposes` ·
`leads-to` · `breaks-down-for` · `better-fits` · `risks` · `incompatible-with` · `generates`

If a needed predicate is genuinely absent (not just a synonym), propose adding it.

Good associations:
- Use **canonical topic labels** exactly as they appear in `triples.json`, or the new label you're proposing
- Connect to **existing hub topics** where natural (LLMs, Conversational grounding, Epistemic bias, etc.)
- Capture what the post actually argues — not generic background truths

**Occurrences (O):** Which other garden posts are also "about" these same topics? Those are occurrence links — suggest them as internal wiki-links. Each association will be tagged with this post's slug automatically.

### Pass 3 — Coherence check (wide angle again)

Step back and ask:
- Do the extracted associations reflect what the text actually argues, or are they technically true but miss the point?
- Do new topics connect to existing hubs, or are they isolated leaves?
- Are the proposed tags consistent with the themes from pass 1?

→ Prune weak associations and orphan topics before presenting suggestions.

## Step 4: Tag suggestions

Map themes and topics (from pass 1) to the existing tag list.

**For existing tags**: suggest any that genuinely fit, ranked by relevance.

**For new tags**: if a theme is significant but not in the tag list, propose creating it. A good new tag:
- Is a distinct, reusable concept (not too specific to one post)
- Would plausibly be used on 2+ future posts
- Is a noun or noun phrase, kebab-cased

Don't pad with weak tags. 2–5 total is ideal.

## Step 5: Backlink suggestions (internal wiki-links)

From pass 2 occurrences: garden posts that are also "about" the same topics are natural link targets.
Also scan the body for phrases that match or closely relate to other posts. A good wiki-link:
- The phrase is genuinely about that post's topic
- The linked post adds real value for the reader
- 2–5 per post max; don't suggest existing links

Format: `[[slug|display phrase]]` if phrase ≠ slug, else `[[slug]]`.

## Step 6: Wikipedia link suggestions

For named concepts, people, or theories that:
- Are significant and well-documented on Wikipedia
- Don't have their own garden content
- Would give the reader genuinely useful context

Suggest: `[display text](https://en.wikipedia.org/wiki/Article_title)`.

Higher bar than internal links. Only suggest where Wikipedia is the natural reference.

## Step 7: Present all suggestions

Show in one block:

```
**Pass 1 — Themes:**
- theme 1, theme 2, …

**Topics (n new, n reused from graph):**
- `topic-id` | Label | type [NEW] or [reused: existing-id]

**Associations:**
- ["Subject label", "predicate", "Object label"]

**Suggested tags** (n new, n existing):
- `tag-slug` — reason [NEW] or [existing]

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

**Triples (frontmatter):**
- Add accepted associations to frontmatter `triples:` array using canonical labels:
  `- ["Subject label", "predicate", "Object label"]`

**Triples (central registry):**
- Read `src/data/triples.json`
- For each NEW topic: add an entry to the `topics` object: `"topic-id": { "label": "...", "type": "..." }`
- For each accepted association: append to the `associations` array:
  `{ "subject": "topic-id", "predicate": "...", "object": "topic-id", "source": "<post-slug>", "collection": "<collection>" }`
- If associations for this post already exist (same source slug), remove the old ones first
- Write the updated file back

**Wiki-links:** Replace plain phrases in body with `[[slug|phrase]]` syntax.

**Wikipedia links:** Wrap plain text with `[text](https://en.wikipedia.org/wiki/...)`.

Keep all other body content intact.

## Step 9: Save

Write the updated post file. Do not commit — the caller decides when to commit.
