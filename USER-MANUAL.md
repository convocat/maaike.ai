# Tending the garden: a user manual

This is the reference manual for maaike.ai, a digital garden built with Astro 5.
It's organised by task. Find the thing you want to do, follow the steps.

---

## Start the dev server

1. Open a terminal in the project folder.
2. Run `npm run dev`.
3. Open `localhost:4321` in your browser.

The site rebuilds automatically when you change a file.

To build for production: `npm run build`. The output goes to `dist/`.

---

## Write a new post

### Option A: via Claude Code

1. Type `/new-post` in the Claude Code terminal.
2. Typora opens with a blank template. Write your piece.
3. Fill in the `description` field in the frontmatter. For articles, always write this yourself.
4. Save and close Typora. Come back to Claude Code.
5. Pick the collection, maturity level, and AI transparency label.
6. Claude generates the full frontmatter, renames the file, and moves it to the right folder.

### Option B: via the command line

1. Run `npm run new article My Title Here` (or `field-note`, `seed`, `weblink`, `experiment`).
2. Edit the generated file in any editor.

### Option C: manually

1. Create a `.md` file in `src/content/<collection>/`.
2. Add the frontmatter block:

```yaml
---
title: "Your title here"
description: "One-liner summary"
date: 2026-03-20
maturity: developing
draft: false
tags: []
ai: "100% Maai"
---
```

3. Write your content below the frontmatter.

### If something goes wrong

- **YAML parse error on build**: check for unquoted colons in your title or description. Wrap the value in quotes: `title: "This: needs quotes"`.
- **Post doesn't show up**: check that `draft` is not `true`.
- **File not recognised as content**: make sure it's in the right `src/content/<collection>/` folder and has valid frontmatter between `---` markers.

---

## Choose the right collection

| Collection | Use when... | Extra fields |
|---|---|---|
| Articles | You've thought it through. It's been mulled over. | `pruning` (optional) |
| Field notes | You built, tried, or documented something hands-on. | — |
| Seeds | It's an idea, a question, a hunch. Not fully formed yet. | — |
| Weblinks | You found something elsewhere worth remembering. | `url` (required) |
| Videos | Same, but it's a video. | `url` (required) |
| Library | It's a book. | `author`, `status` (reading/read/to-read), `cover` |
| Experiments | You're testing something. | — |

---

## Set maturity and AI transparency

### Maturity

Set the `maturity` field in frontmatter:

| Level | Emoji | When to use |
|---|---|---|
| `draft` | 🌱 | Just planted. Might not make sense yet. |
| `developing` | 🌿 | Taking shape, still growing. |
| `solid` | 🪴 | Well-formed. You'd show this to someone. |
| `complete` | 🌳 | Done. Fully grown. |

Most things start at `developing`. Seeds are usually `draft`. Articles should be at least `solid` before you set `draft: false`.

### AI transparency

Set the `ai` field in frontmatter. Optional: leave it out to show no label.

| Value | Meaning |
|---|---|
| `100% Maai` | Fully your words, no AI involved. |
| `assisted` | Your ideas and structure, AI helped refine. |
| `co-created` | AI generated based on your ideas and direction. |
| `generated` | Fully AI-generated, reviewed by you. |

---

## Tag a post

### Automatically (recommended)

1. Type `/auto-tag` in Claude Code.
2. Point it to the post (file path, title, or "the most recent post").
3. Review the suggested tags (2-5) and wiki-links (2-5).
4. Accept, reject, or modify each suggestion.

Tags come from a fixed set in `src/content/tags/`. The auto-tagger only suggests existing tags, never invents new ones.

### Manually

Add tag slugs to the `tags` array in frontmatter:

```yaml
tags: [ai, conversation-design, digital-gardens]
```

### If something goes wrong

- **Tag page 404**: the tag slug must match a file in `src/content/tags/`. Check that the `.md` file exists.

---

## Add wiki-links

Wiki-links connect posts to each other. Use double brackets:

```markdown
I explored this in [[putting-the-design-in-prompt-design]].
```

If the display text should differ from the slug:

```markdown
I explored this in [[putting-the-design-in-prompt-design|my article on prompt design]].
```

The `/auto-tag` command also suggests wiki-links. Backlinks (posts linking *to* your post) appear automatically in the sidebar.

### If something goes wrong

- **Link renders but leads to 404**: the slug doesn't match any existing post. Check spelling.
- **Link shows with a different style**: non-existent links get a `.wiki-link--new` CSS class. This is intentional: it shows you the link target doesn't exist yet.

---

## Organise projects with hub and develops

1. On the project's main post, set `hub: true` in frontmatter. This makes it appear on the `/projects` page.
2. On related posts, set `develops: <hub-slug>`. These will show "Part of: [Project name]" in their sidebar.
3. The hub post automatically shows all its related files under "Project files."

A post can be both a hub *and* develop another hub (sub-projects within larger projects).

**Do not** use a `project` tag for this. Use `hub` and `develops` only.

---

## Rebuild the explore map

The explore map lives at `/explore`. Every post is a dot, positioned by semantic similarity.

### Incremental build (default)

```bash
node scripts/build-explore-data.cjs
```

Uses pinned positions from `scripts/map-roots.json`. New posts get placed near similar content. Existing posts stay put.

### Gentle nudge (relax)

```bash
node scripts/build-explore-data.cjs --relax
```

Nudges linked items slightly toward each other using wiki-link and tag connections. Maximum displacement: 8% of the map. Use this after adding a batch of new links.

### Full reset (recompute)

```bash
node scripts/build-explore-data.cjs --recompute
```

Recalculates everything from scratch: new UMAP projection, new territories, new positions. **All positions change.** Only use this when you want a completely fresh layout.

### Fix a specific position

Edit `scripts/map-roots.json`. Find the item by slug and change its `x` and `y` values (0.0 to 1.0). Or add an entry to the `overrides` section to pin it precisely.

### If something goes wrong

- **Map shows no items**: check that `public/explore-data.json` exists. Run the build script.
- **Items overlap**: run with `--relax` or re-run without flags (collision detection runs automatically).
- **Positions all scrambled**: you probably ran `--recompute` by accident. Restore from git: `git checkout scripts/map-roots.json`.

---

## Run the link discovery pipeline

This finds posts that are semantically similar but not yet connected.

### 1. Generate embeddings

```bash
python scripts/full-scale-embeddings.py
```

Embeds all content using bge-m3. Output: `scripts/embeddings-bge-m3.json`.

### 2. Re-embed with enriched input (optional)

```bash
node scripts/re-embed-normalized.cjs
```

Adds keyphrases and reason fields for better accuracy.

### 3. Generate link candidates

```bash
node scripts/generate-candidates.cjs
```

Compares all embeddings pairwise. Output: `scripts/link-candidates.json` with scored candidate pairs. Adjust threshold with `--threshold 0.55` (default: 0.50).

### 4. Review and apply

Review the candidates manually or in batches. Approved links go to `scripts/approved-links.json`.

```bash
node scripts/apply-links.cjs --preview     # dry run
node scripts/apply-links.cjs --related     # add Related sections
node scripts/apply-links.cjs --inline      # add inline wiki-links
```

---

## Generate OG images

Social media cards (1200x630px) for articles, field notes, and seeds.

```bash
node scripts/generate-og-images.cjs
```

- Generates one PNG per post in `public/images/og/<collection>/<slug>.png`.
- Skips posts that already have an image (incremental).
- To regenerate all, delete the existing PNGs first.

Images are referenced automatically in PostLayout via the `og:image` meta tag.

---

## Share on LinkedIn

### Via Claude Code

1. Type `/share-linkedin`.
2. Pick the post to share.
3. Review and refine the generated LinkedIn text.
4. Copy to clipboard or post directly.

### Manual sharing

Each post has a LinkedIn share button. It opens LinkedIn with the post URL and title pre-filled. The OG card image shows up automatically if it exists.

---

## Update the changelog

```
/update-release-notes
```

Scans today's git commits, drafts changelog entries for `building-this-garden.md`. You review before anything gets written.

Format: `### <day> <month>` headers with `- **Feature**: description` bullets.

---

## Validate content

```bash
npm run validate
```

Checks all content files for:
- YAML syntax errors
- Missing required frontmatter fields
- Unquoted colons in values
- Invalid maturity or status values
- Date format issues

---

## Enrich thin content

Some content types (videos, books) start with minimal text. These scripts add substance for better embeddings and discoverability.

```bash
node scripts/fetch-video-transcripts.cjs    # fetch transcripts for videos
node scripts/fetch-book-summaries.cjs       # generate book summaries
node scripts/fetch-book-covers.cjs          # download cover images
node scripts/suggest-book-tags.cjs          # suggest tags for library items
```

---

## Publish

### Quick publish

```
publish.bat
```

Pulls latest changes, stages everything, commits with a date-stamped message, and pushes. The site rebuilds automatically via GitHub Actions. Live in about two minutes.

### Manual publish

```bash
git add <files>
git commit -m "Your message"
git push
```

### If something goes wrong

- **Build fails on GitHub**: check the Actions tab. Common cause: YAML frontmatter error in a new post. Run `npm run validate` locally first.
- **Site doesn't update**: check that you pushed to `main`. Other branches don't trigger deployment.
- **Changes visible locally but not on the site**: check `git status`, you may have forgotten to push.

---

## Quick reference: slash commands

| Command | What it does |
|---|---|
| `/new-post` | Opens Typora, handles frontmatter and filing when you're done writing. |
| `/auto-tag` | Suggests tags and wiki-links for a post. |
| `/share-linkedin` | Drafts a LinkedIn post from garden content. |
| `/update-release-notes` | Updates the changelog from recent git commits. |

## Quick reference: build scripts

| Script | What it does |
|---|---|
| `build-explore-data.cjs` | Builds the explore map (flags: `--relax`, `--recompute`). |
| `generate-og-images.cjs` | Generates social media card images. |
| `generate-candidates.cjs` | Finds semantic link candidates. |
| `re-embed-normalized.cjs` | Re-embeds content with enriched input. |
| `apply-links.cjs` | Applies approved wiki-links to content files. |
| `validate-content.mjs` | Checks frontmatter across all collections. |
| `fetch-book-covers.cjs` | Downloads book cover images. |
| `fetch-book-summaries.cjs` | Generates book summaries. |
| `fetch-video-transcripts.cjs` | Fetches video transcripts. |
| `suggest-book-tags.cjs` | Suggests tags for library items. |
| `new-content.mjs` | CLI content scaffolding (`npm run new`). |
| `post-to-linkedin.mjs` | Posts to LinkedIn via API. |
