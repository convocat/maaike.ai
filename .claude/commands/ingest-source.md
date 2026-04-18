# Ingest source

Analyze an external URL and mine it for knowledge graph enrichment.
The source is added to `triples.json` (topics, associations, source entry)
without creating a content page in any collection.

Use this when you want to extract knowledge from an external article, paper, or post
but don't need it as a published weblink in the garden.

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

Read `src/data/triples.json`. Extract:

1. All topic IDs, labels, and types from the `topics` object.
   These are the canonical entities already in the graph.
2. The full `_types` object (controlled vocabulary for topic types).
3. The full `_predicates` object (controlled vocabulary for predicates).
4. All existing source IDs from the `sources` object (to check for duplicates).
5. Count the number of existing topics for the overlap gate in Step 5.

## Step 4: Three-pass TAO analysis

Run the same three-pass method as `/auto-tag`, but without tags, wiki-links, or Wikipedia links
(since there is no content page to annotate).

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

For each topic, assign a **type** from the controlled vocabulary in `_types`
(read from `triples.json` in Step 3, not hardcoded).

Check existing topics in `triples.json` first. Reuse canonical IDs and labels
where the concept matches. Only create new topics for genuinely new entities.

**Associations (A):** Extract 3-7 typed relationships between topics. Use **only**
predicates from `_predicates` in `triples.json`. If a needed predicate is genuinely
absent (not just a synonym), propose adding it.

Good associations:
- Use canonical topic labels exactly as they appear in `triples.json`
- Connect to existing hub topics where natural
- Capture what the source actually argues, not generic background truths

**Occurrences (O):** Which existing garden posts cover these same topics?
Note these for Maaike's reference (she may want to add wiki-links to those posts later).

### Pass 3: Coherence check (wide angle again)

- Do the associations reflect what the source actually argues?
- Do new topics connect to existing graph hubs, or are they isolated leaves?
- Prune weak associations and orphan topics.

## Step 5: Generate summary

Based on the three-pass read, generate a 2-3 sentence summary of what this source argues or contributes. Focus on the central claim, not a description of the article. Write it as if explaining to someone who hasn't read it.

This summary will be stored in `triples.json` and displayed on the `/sources` page.

## Step 6: Overlap gate

Count how many of the extracted topics already exist in `triples.json`
(matching by topic ID or by label, case-insensitive).

**If fewer than 2 topics overlap:**
- Warn: "This source has fewer than 2 topics in common with your knowledge graph.
  It may be outside the garden's current scope."
- Ask (AskUserQuestion): "Proceed anyway, or skip?"
- If skip: stop here, do not write anything.

**If 2 or more overlap:** proceed.

## Step 7: Generate source ID

Create a source ID by slugifying the page title:
- Lowercase
- Replace non-alphanumeric characters with hyphens
- Trim leading/trailing hyphens
- Collapse consecutive hyphens
- Truncate to 60 characters

Check that the ID does not already exist in `sources`. If it does:
- Ask: "This source was already ingested. Re-ingest (replaces old associations) or skip?"
- If skip: stop.
- If re-ingest: continue (Step 8 will remove old associations).

## Step 8: Present everything for approval

Show in one block:

```
**Source:**
- ID: <source-id>
- Label: <page title>
- URL: <url>
- Date: <today YYYY-MM-DD>

**Summary:** <2-3 sentence summary from Step 5>

**Themes:** theme 1, theme 2, ...

**Topics (n new, n reused):**
- topic-id | Label | type [NEW] or [reused]

**Associations (n):**
- ["Subject label", "predicate", "Object label"]

**Overlap:** n topics already in graph

**Related garden posts:** (from occurrences)
- post title (collection)
```

Ask: "Accept all, or tell me what to skip/change."

## Step 9: Write to triples.json

Read `src/data/triples.json`.

1. **Source entry**: Add to the `sources` object:
   ```json
   "source-id": { "label": "Page title", "url": "https://...", "date": "YYYY-MM-DD", "summary": "2-3 sentence summary." }
   ```

2. **New topics**: For each NEW topic, add to the `topics` object:
   ```json
   "topic-id": { "label": "Topic label", "type": "type-from-vocabulary" }
   ```

3. **Associations**: For each accepted association, append to the `associations` array:
   ```json
   { "subject": "topic-id", "predicate": "predicate", "object": "topic-id", "source": "source-id" }
   ```
   Note: NO `collection` field. Sources are not a content collection.

4. **Re-ingestion**: If associations for this source ID already exist
   (matching `"source": "source-id"`), remove the old ones before adding new ones.

Write the updated file back.

## Step 10: Handle the draft weblink (if applicable)

If this source came from a draft weblink file (selected in Step 1):
- Ask (AskUserQuestion): "Delete the draft weblink file, or keep it for later?"
- If delete: remove the file from `src/content/weblinks/`
- If keep: leave it as-is (`draft: true`)

If the source was a pasted URL (not from a draft weblink), skip this step.

## Step 11: Done

Report what was added:
- Source entry: source-id (label)
- Topics: n new, n reused
- Associations: n added

Do not commit. The caller decides when to commit.
