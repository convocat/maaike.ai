---
title: The publishing routine
date: 2026-04-05
maturity: solid
tags: [technical, publishing, workflow, process]
description: Every step a post goes through from draft to live on maaike.ai, and why each step exists.
category: technical
section: Workflow
ai: co-created
---

Every post follows the same path from draft to live. The `/publish` skill handles steps 3 through 8 automatically. The `/new-post` skill handles the enrichment step (below) as part of content creation.

---

## Content enrichment (on creation)

Before a post is published — usually right after it's written — `/auto-tag` runs a structured analysis of the full content and enriches it with semantic metadata. This is the most intellectually complex step in the workflow: everything else is mechanical.

### The three-pass read

**Pass 1: Thematic read (wide angle).** Read the full text once for the big picture: 2-4 overarching themes, the intellectual tradition it draws from, the central argument or position. This produces the theme list used for tag suggestions and sets the frame for pass 2.

**Pass 2: TAO extraction (close read).** A systematic entity-and-relationship scan using the TAO method: Topics, Associations, Occurrences.

**Pass 3: Coherence check (wide angle again).** Step back and ask whether the extracted associations reflect what the text actually argues, or whether they are technically true but miss the point. Prune weak associations and orphan topics before presenting suggestions.

### TAO: Topics

Every named thing worth knowing about is extracted as a topic: people, technologies, tools, frameworks, concepts, theories, design elements, interaction metaphors.

Each topic is assigned a type from a controlled vocabulary: `person`, `technology`, `technology-category`, `technical-mechanism`, `technical-phenomenon`, `philosophical-method`, `philosophical-framework`, `philosophical-concept`, `epistemological-concept`, `epistemic-stance`, `cognitive-tendency`, `belief-type`, `linguistic-concept`, `linguistic-principle`, `communication-type`, `theoretical-concept`, `interaction-metaphor`, `design-discipline`, `acoustic-concept`.

Before creating a new topic, the existing topic registry in `src/data/triples.json` is checked for near-duplicates. Canonical IDs and labels are reused rather than creating fragmented duplicates of the same concept.

### TAO: Associations

3-7 typed relationships between topics are extracted, using only predicates from a controlled vocabulary: `attributed-to`, `structured-as`, `counters`, `reinforces`, `contrasted-with`, `demonstrates`, `lacks`, `caused-by`, `metaphor-for`, `inaccessible-via`, `instance-of`, `characterised-as`, `coined-by`, `defined-as`, `theorised-by`, `exhibits`, `violates`, `presupposes`, `leads-to`, `breaks-down-for`, `better-fits`, `risks`, `incompatible-with`, `generates`.

If a genuinely needed predicate is absent (not just a synonym for an existing one), it can be proposed for addition to the vocabulary.

Good associations connect to existing hub topics in the graph (LLMs, Conversational grounding, Epistemic bias, etc.), and capture what the post actually argues, not generic background truths.

### TAO: Occurrences

Which other garden posts are also "about" these same topics? Those posts become occurrence links: candidates for internal wiki-links. All content from all eight collections is scanned for matching topics in frontmatter and body.

### Tag suggestions

Themes and topics from pass 1 are mapped against the full existing tag list. Existing tags that fit are ranked by relevance. New tags are proposed only if the theme is significant, reusable (plausibly fits 2+ future posts), and distinct enough to stand alone. Padding with weak tags is avoided: 2-5 total is the target.

### Wiki-links (internal)

Candidate occurrences from pass 2 become internal link suggestions. Each suggestion is a phrase in the text that is genuinely about the linked post's topic and where the link adds real reader value. Format: `[[slug|display phrase]]` if the phrase differs from the slug, otherwise `[[slug]]`. 2-5 per post maximum; existing links are never re-suggested.

### Wikipedia links

For named concepts, people, or theories that are significant, well-documented on Wikipedia, and not already covered by garden content, a Wikipedia link is suggested. Higher bar than internal links: only suggested where Wikipedia is the natural reference point.

### What gets written

After review and approval:

- **Frontmatter tags** — updated with accepted tags
- **New tag files** — created at `src/content/tags/<slug>.md` for any newly proposed tags
- **Frontmatter triples** — `triples:` array updated with accepted associations in canonical label format
- **`src/data/triples.json`** — the central graph registry. New topics are appended to the `topics` object. Accepted associations are appended to the `associations` array (with `source` and `collection` fields). If the post has existing associations in the registry, they are replaced, not duplicated.
- **Body text** — plain phrases replaced with `[[slug|phrase]]` wiki-link syntax and Wikipedia links wrapped in markdown anchor syntax

---

## 1. Detect new vs updated

`git status` on the file reveals the post's state:

- `A` (added/untracked) = new post: set `draft: false` only
- `M` (modified) = update: set `draft: false` and `updated: today`

The `updated` field is set automatically — no need to remember. It feeds the "Tended [date]" label on cards and the sort-by-last-tended option in the stream.

## 2. Validate frontmatter

```
npm run validate
```

Checks required fields (`title`, `date`, `maturity`, `tags`), valid enum values, slug hygiene, description length, and presence of the `ai` field. Errors halt the process. Warnings (missing description, missing AI) are shown but don't block.

Running validation before commit catches broken frontmatter early — before Astro's own build-time validation, and faster.

## 3. Generate OG images

```
node scripts/generate-og-images.cjs
```

Runs for articles and jottings only. Writes a 1200x627 PNG to `public/images/og/<collection>/<slug>.png` using satori (text layout) and sharp (image compositing). Skipped if the image already exists. See [OG image generation](/toolshed/og-images).

## 4. Rebuild the explore map

```
node scripts/build-explore-data.cjs
```

Updates `public/explore-data.json` with the new post's position in the map. The script runs incrementally: existing positions are pinned in `scripts/map-roots.json`, new items are placed near their most similar existing neighbor (based on embeddings). See [Explore map](/toolshed/explore-map) for how the positioning works.

Flags available: `--relax` nudges items toward linked neighbors; `--recompute` triggers a full UMAP rebuild and territory reset.

## 5. Commit

Only the relevant files are staged: the post itself, its OG image, the updated explore data, and any release notes. Commit message format:

```
Publish articles: My post title    ← new post
Tend articles: My post title       ← update
```

## 6. Push

```
git push
```

Triggers GitHub Actions. The site is live on maaike.ai in approximately 2 minutes.

## 7. Share to LinkedIn

Articles and jottings only. New posts only — updates are never shared.

If the post contains a `<div class="linkedin">` block, the `/share-linkedin` skill is called automatically. If no block exists, it asks. Field notes, seeds, weblinks, videos, and project files never trigger LinkedIn.

## 8. Update the backlog

If the published post matches an open backlog item (by title or topic), that item is moved to the Archive section with today's date and a one-line summary.

---

## One-click publishing

In practice, `/publish` runs steps 1 through 8 with a single command, pausing only to confirm the push in manual mode or when a LinkedIn block is missing. Auto mode runs straight through.

Content enrichment (`/auto-tag`) runs earlier, during `/new-post`. The only thing that requires preparation before running `/publish` is having the LinkedIn draft block written if you want to share. Everything else is automated.
