# Ingest source

Analyze an external URL, mine it for knowledge graph enrichment, and publish it as a weblink.

The source is added to `triples.json` (topics, associations, source entry) **and** a weblink file is created in `src/content/weblinks/` with the extracted topics as tags and the summary as description.

Use this for every external article, paper, or post Maaike wants in the garden. Standard routine for Telegram-captured links and manually pasted URLs.

If you want the knowledge graph enrichment *without* a weblink (rare), skip Step 10 when prompted.

## Step 1: Identify the source

If a URL was provided as an argument, use that.

Otherwise, check for draft weblinks in `src/content/weblinks/` (files where `draft: true`).
If any exist, show the list (title + URL) and ask (AskUserQuestion):

- Pick one of the draft weblinks
- Paste a different URL

If a draft weblink is selected, read its frontmatter to get the `url` field.
Remember the file path for Step 9.

## Step 2: Fetch and read the page

Use WebFetch to retrieve the page content at the URL. Extract:
- Page title
- Main body text (the article/post content)
- Author name (if available)
- Publication date (if available)

If WebFetch fails (paywall, JavaScript-only rendering, consent redirect, etc.),
tell the user and ask them to paste the article text manually.

## Step 3: Build context

Pull the same context items as `/auto-tag`, plus source-ID dedup:

1. **Existing tags**: glob `src/content/tags/*.md` and extract all tag titles/slugs.
2. **Existing topics**: read `src/data/triples.json` and extract all topic IDs, labels, and types from the `topics` object. These are the canonical entities already in the graph.
3. **All garden content** (for backlink + related-post candidates): for each collection (articles, field-notes, seeds, weblinks, videos, library, experiments, jottings), glob `src/content/<collection>/*.md` and extract `title`, `description`, `tags` from frontmatter. Build a map of slug → { title, description, collection }.
4. **Existing source IDs** from the `sources` object (to check for duplicates in Step 7).

**Note on controlled vocabulary:** the allowed lists for `type`, `lens`, `subject`, `role`, and `predicate` are hardcoded below in Step 4 Pass 2, not read from `triples.json`. This is deliberate — the vocabulary is a design decision, and hardcoding in the skill prompt keeps it audited, guardrail-strong, and decoupled from whatever happens to be in the JSON. The lists here must stay byte-for-byte identical to those in `/auto-tag`.

## Step 4: Three-pass TAO analysis

Run the same three-pass method as `/auto-tag`. Weblinks are garden content too — they get tag suggestions, internal wiki-links, and Wikipedia links like any post. (Wiki-links and Wikipedia links are informational for weblinks since weblinks have no body — surface them for Maaike's reference.)

### Pass 1: Thematic read (wide angle)

Read the fetched content for the big picture. Ask:
- What are the 2-4 overarching themes?
- What intellectual tradition(s) does it draw from?
- What is the central argument or position?

Produces: theme list and framing for pass 2.

### Pass 2: TAO extraction (close read)

Re-read carefully for entities and relationships.

**Topics (T):** Extract all named things worth knowing about:
- People (researchers, philosophers, public figures)
- Technology (tools, products, systems, models)
- Concepts (theories, frameworks, methods, principles, phenomena)
- Design elements (metaphors, interaction models, disciplines)

Each topic is classified on four faceted dimensions (hardcoded — must stay in sync with `/auto-tag`):

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

Check existing topics in `triples.json` first. Reuse canonical IDs and labels where the concept matches. Only create new topics for genuinely new entities.

**Associations (A):** Extract 3–7 typed relationships between topics. Use **only** predicates from this controlled vocabulary (hardcoded — must stay in sync with `/auto-tag`):
`attributed-to` · `structured-as` · `counters` · `reinforces` · `contrasted-with` · `demonstrates` ·
`lacks` · `caused-by` · `metaphor-for` · `inaccessible-via` · `instance-of` · `characterised-as` ·
`coined-by` · `defined-as` · `theorised-by` · `exhibits` · `violates` · `presupposes` ·
`leads-to` · `breaks-down-for` · `better-fits` · `risks` · `incompatible-with` · `generates` · `requires`

If a needed predicate is genuinely absent (not just a synonym), propose adding it.

Good associations:
- Use canonical topic labels exactly as they appear in `triples.json`
- Connect to existing hub topics where natural
- Capture what the source actually argues, not generic background truths

**Occurrences (O):** Which existing garden posts cover these same topics?
These become the "Related garden posts" in the review block and the candidate list
for internal wiki-links.

**Tags:** Map Pass 1 themes + Pass 2 topics to the existing tag list (Step 3 item 1).
Suggest 2–5 tags. Reuse existing tags where they fit. Propose new tag slugs only for
concepts that are distinct, reusable, and would plausibly tag 2+ future posts.

**Internal wiki-links** (informational — weblinks have no body):
Garden posts that are also "about" the same topics. List them in the review block
so Maaike knows which of her posts could link back to this source.

**Wikipedia links** (informational — weblinks have no body):
Well-documented concepts/people/theories without a garden page. List them so Maaike
can add them to her own posts when she next edits them.

### Pass 3: Coherence check (wide angle again)

- Do the associations reflect what the source actually argues?
- Do new topics connect to existing graph hubs, or are they isolated leaves?
- Prune weak associations and orphan topics.

## Step 5: Generate summary

Based on the three-pass read, generate a 2-3 sentence summary of what this source argues or contributes. Focus on the central claim, not a description of the article. Write it as if explaining to someone who hasn't read it.

This summary becomes the weblink's `description` field in Step 10.

## Step 6: Overlap gate

Count how many of the extracted topics already exist in `triples.json`
(matching by topic ID or by label, case-insensitive).

**If fewer than 2 topics overlap:**
- Warn: "This source has fewer than 2 topics in common with your knowledge graph.
  It may be outside the garden's current scope."
- Ask (AskUserQuestion): "Proceed anyway, or skip?"
- If skip: stop here, do not write anything.

**If 2 or more overlap:** proceed.

## Step 7: Generate weblink slug

Create the weblink slug by slugifying the page title:
- Lowercase
- Replace non-alphanumeric characters with hyphens
- Trim leading/trailing hyphens
- Collapse consecutive hyphens
- No length cap (weblink filenames can be long)

This slug is the filename for Step 10 AND the `source` value in the Step 9 associations.

Check if a weblink with this slug already exists at `src/content/weblinks/<slug>.md`. If it does:
- Ask: "This source was already ingested. Re-ingest (replaces old associations + overwrites frontmatter) or skip?"
- If skip: stop.
- If re-ingest: continue (Step 9 will remove old associations).

## Step 8: Present everything for approval (canonical review block)

**Batch-mode bypass.** If this skill is being invoked as part of a batch flow (e.g. from `/check-inbox`, `/telegram-sync`, or any loop processing multiple drafts), **skip this step entirely** and proceed straight to Step 9. The dashboard at `http://localhost:8900/` is the proper review surface for batch-enriched drafts. Presenting a per-draft review block in chat during a batch flood the chat and duplicates the dashboard's job. See memory `feedback_dashboard_pre_enriched.md` and `feedback_no_per_item_gates_in_batch.md`.

You are in batch mode when:
- The skill was invoked from another skill's loop (caller is `/check-inbox`, `/telegram-sync`, or similar), or
- You are processing multiple drafts in sequence in the current session without explicit per-draft confirmation from Maaike.

For interactive single-draft use (Maaike invokes `/ingest-source <url>` directly), continue with the review block below.

Use this exact block shape — same field order and labels as `/auto-tag`. Fields that don't apply are shown as `n/a` but never reordered or removed.

```
**Identity**
- source-id: <id>
- url: <url>
- collection: weblinks
- date: <YYYY-MM-DD>

**Description / Summary**
<2-3 sentence summary from Step 5>

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

**Internal wiki-links** (informational — weblinks have no body)
- "phrase" → [[slug|phrase]] (collection: title)

**Wikipedia links** (informational — weblinks have no body)
- "concept" → [concept](https://en.wikipedia.org/wiki/Concept) — reason

**Graph fit**
- Overlap with existing graph: n topics
- Related garden posts: slug (collection), ...
```

Ask: "Accept all, or tell me what to skip/change."

## Step 9: Write to triples.json

Read `src/data/triples.json`.

Associations reference the weblink that will be created in Step 10 — no separate `sources` object is used (retired: every external URL becomes a weblink, so associations point to the weblink slug with `collection: "weblinks"`).

1. **New topics**: For each NEW topic, add to the `topics` object with the faceted schema:
   ```json
   "topic-id": {
     "label": "Topic label",
     "type": "type-from-vocabulary",
     "lens": ["lens-value"],
     "subject": ["subject-value"],
     "role": "role-value"
   }
   ```
   Omit `subject` and `role` when empty/not applicable. `lens` is always present (array, minimum one value).

2. **Associations**: For each accepted association, append to the `associations` array. The `source` field is the weblink slug that will be created in Step 10, and `collection: "weblinks"` matches it:
   ```json
   { "subject": "topic-id", "predicate": "predicate", "object": "topic-id", "source": "<weblink-slug>", "collection": "weblinks" }
   ```

3. **Re-ingestion**: If associations for this weblink slug already exist (matching `"source": "<weblink-slug>"`), remove the old ones before adding new ones.

Write the updated file back.

## Step 10: Create or promote the weblink

Default: publish a weblink file so the source appears in the stream with full knowledge graph enrichment.

**Slug:** same convention as Step 7 but without the 60-char truncation cap (weblink filenames can be longer). Slugify the page title: lowercase, non-alphanumeric to hyphens, collapse/trim hyphens.

**Tags:** use the extracted topics as tags. Skip person-type topics (they are in triples.json but not useful as tag filters). Check `src/content/tags/` for each tag and create a stub tag file (`---\ntitle: <tag>\n---`) for any that don't exist yet.

**Frontmatter template:**

```markdown
---
title: "<Page title — sentence case, keep subtitle if present>"
url: <url>
date: <publication date if known, else today YYYY-MM-DD>
updated: <today YYYY-MM-DD>
maturity: solid
tags:
  - <topic-id>
  - ...
themes:
  - "<theme 1 from Step 5 / Pass 1>"
  - "<theme 2>"
triples:
  - ["<Subject label>", "<predicate>", "<Object label>"]
  - ...
description: "<the 2-3 sentence summary from Step 5>"
ai: "generated"
draft: false
---
```

**Dual-write rule (per CLAUDE.md architecture):** the `triples` and `themes` fields in frontmatter mirror the central JSON data. PostLayout reads them from frontmatter to render the Mycelium section. Skipping these fields leaves the weblink with an empty Mycelium — the associations exist in `triples.json` but don't render on the page. ALWAYS include both.

**Also write themes to `src/data/themes.json`:** read the file, add an entry keyed by the weblink slug with the themes array. This powers the `/themes/` index page.

**On the `ai` field:** when the weblink is created through this skill, the description is always AI-generated (the Step 5 summary). So `ai: "generated"` is the correct value — NEVER `"100% Maai"`. The "100% Maai" value is reserved for weblinks Maaike writes by hand outside of this skill.

**If the source came from a draft weblink** (selected in Step 1): overwrite that file in place with the enriched frontmatter above (keep the same filename).

**If the source came from a pasted URL**: write a new file at `src/content/weblinks/<slug>.md`.

**Opt-out:** if the user only wants graph enrichment and no weblink (rare), ask (AskUserQuestion) before writing and skip this step on "no".

## Step 11: Done

Report what was added:
- Source entry: source-id (label)
- Topics: n new, n reused
- Associations: n added
- Weblink: path to the file (or "skipped" if opt-out)
- New tag files: list any that were created

Do not commit. The caller decides when to commit.
