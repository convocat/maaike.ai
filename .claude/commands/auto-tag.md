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

**Note on controlled vocabulary:** the allowed lists for `type`, `lens`, `subject`, `role`, and `predicate` are hardcoded below in Step 3 Pass 2, not read from `triples.json`. This is deliberate — the vocabulary is a design decision, and hardcoding in the skill prompt keeps it audited, guardrail-strong, and decoupled from whatever happens to be in the JSON. The lists here must stay byte-for-byte identical to those in `/ingest-source`.

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

Each topic is classified on four faceted dimensions (hardcoded — must stay in sync with `/ingest-source`):

**`type`** (required, single value) — the *kind of thing* the topic is:
`person` · `technology` · `mechanism` · `phenomenon` · `discipline` · `concept` · `metaphor` · `principle` · `method`

**`lens`** (required, array — one or more) — the *discipline(s) through which the topic is understood*:
`philosophy` · `epistemology` · `linguistics` · `rhetoric` · `design` · `interaction` · `cognition` · `culture` · `personal` · `observability` · `analytics` · `development`

The last three are tech-specific lenses: `development` for engineered/built-artifact framing, `observability` for the "can-you-see-inside" angle, `analytics` for data/metrics framing.

Use `personal` when the topic reflects Maaike's own view or lived experience rather than a disciplinary framework. Use `culture` as the catchall for cultural figures/objects without a clearer disciplinary home. Most topics have one lens; some (e.g. `anthropomorphism` as design + cognition) legitimately have two.

**`subject`** (required, array — one or more) — the *topic area(s) the concept is about*:
`conversation` · `content` · `writing` · `voice` · `language` · `linguistics` · `llm` · `prompt` · `agent` · `knowledge` · `mind` · `pragmatics` · `psycholinguistics` · `content-design` · `conversation-design` · `prompt-design` · `information-architecture` · `structured-authoring` · `interaction-design` · `future-of-work` · `digital-garden` · `music` · `tooling`

Subject is what the topic is *about*. Lens is the discipline through which it is *examined*. These are different axes. Do NOT use `ai` — it was retired as too broad; specify `llm`, `prompt`, or `agent` instead. If none of the above fits the topic, propose a new subject for Maaike to review rather than skipping the field.

**`role`** (optional, single value) — the *function the topic plays in your arguments*:
`instrument` · `position` · `framework` · `counter-position` · `stance` · `tendency`

Check existing topics in `triples.json` first — reuse canonical IDs and labels where the concept matches.

**Associations (A):** Extract 3–7 typed relationships between topics. Use **only** predicates from this controlled vocabulary (hardcoded — must stay in sync with `/ingest-source`):
`attributed-to` · `structured-as` · `counters` · `reinforces` · `contrasted-with` · `demonstrates` ·
`lacks` · `caused-by` · `metaphor-for` · `inaccessible-via` · `instance-of` · `characterised-as` ·
`coined-by` · `defined-as` · `theorised-by` · `exhibits` · `violates` · `presupposes` ·
`leads-to` · `breaks-down-for` · `better-fits` · `risks` · `incompatible-with` · `generates` · `requires`

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

## Step 7: Present all suggestions (canonical review block)

Use this exact block shape — same field order and labels as `/ingest-source`. Fields that don't apply are shown as `n/a` but never reordered or removed.

```
**Identity**
- slug: <post-slug>
- collection: articles | field-notes | seeds | jottings | ...
- date: <YYYY-MM-DD>

**Description / Summary**
<existing frontmatter description, or a proposed one to refine>

**Themes**
- theme 1
- theme 2

**Topics (n new, n reused)**
- topic-id | Label | type · [lens(es)] · [subject(s)] · role     [NEW]
- topic-id | Label | type · [lens(es)] · [subject(s)] · role     [reused]

**Associations (n)**
- [Subject label, predicate, Object label]

**Tags (n new, n existing)**
- tag-slug — reason               [NEW]
- tag-slug — reason               [existing]

**Internal wiki-links**
- "phrase" → [[slug|phrase]] (collection: title)

**Wikipedia links**
- "concept" → [concept](https://en.wikipedia.org/wiki/Concept) — reason

**Graph fit**
- Overlap with existing graph: n topics
- Related garden posts: slug (collection), ...
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
- For each NEW topic: add an entry to the `topics` object with the faceted schema:
  ```json
  "topic-id": {
    "label": "...",
    "type": "...",
    "lens": ["..."],
    "subject": ["..."],
    "role": "..."
  }
  ```
  Omit `subject` and `role` when empty/not applicable. `lens` is always present (array, minimum one value).
- For each accepted association: append to the `associations` array:
  `{ "subject": "topic-id", "predicate": "...", "object": "topic-id", "source": "<post-slug>", "collection": "<collection>" }`
- If associations for this post already exist (same source slug), remove the old ones first
- Write the updated file back

**Wiki-links:** Replace plain phrases in body with `[[slug|phrase]]` syntax.

**Wikipedia links:** Wrap plain text with `[text](https://en.wikipedia.org/wiki/...)`.

Keep all other body content intact.

## Step 9: Save

Write the updated post file. Do not commit — the caller decides when to commit.
