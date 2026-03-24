# New post

Create a new content post. Writing first, metadata later.

## Step 1: Select type (first question, before opening Typora)

Ask the user which type of content they want to create using AskUserQuestion:

- **Article** — long-form piece, will be shared on LinkedIn
- **Jotting** — short note, thought, or observation, will be shared on LinkedIn
- **Field note** — process note, observation, or reflection (no LinkedIn)
- **Seed** — early idea or question (no LinkedIn)
- **Weblink** — external link with annotation (requires URL)
- **Video** — video with annotation (requires URL)
- **Library** — book or resource → redirect to `/new-book` skill instead
- **File** — project sub-document → redirect to `/new-project-file` skill instead
- **Artefact** — design deliverable → redirect to `/new-project-file` skill instead

If they choose **Library**, tell them: "Use `/new-book` to add a book — it fetches metadata from Open Library automatically." Stop here.

If they choose **File** or **Artefact**, tell them: "Use `/new-project-file` to create a project file — it links it to the right project hub." Stop here.

If they choose **Weblink** or **Video**, ask for the URL now before opening Typora.

## Step 2: Open Typora

1. Create a temporary file at `src/content/articles/new-draft.md`.
   If `new-draft.md` already exists, use `new-draft-2.md`, `new-draft-3.md`, etc.

   **Template for Articles and Jottings** (includes LinkedIn block):
   ```markdown
   ---
   draft: true
   description: ""
   ---

   # Title

   Start writing here...

   ---

   <div class="linkedin">
   Write your LinkedIn post here...
   </div>
   ```

   **Template for Field notes, Seeds, Weblinks, Videos** (no LinkedIn block):
   ```markdown
   ---
   draft: true
   description: ""
   ---

   # Title

   Start writing here...
   ```

2. Install the Typora theme if needed:
   - Compare `.claude/typora/maaike-garden.css` with `$APPDATA/Typora/themes/maaike-garden.css`
   - Copy if missing or outdated: `cp ".claude/typora/maaike-garden.css" "$APPDATA/Typora/themes/maaike-garden.css"`

3. Open in Typora: `"/c/Program Files/Typora/Typora.exe" "<file-path>" &`

4. Tell the user: "Typora is open. Write your post, then come back here when you're done."

## Step 3: User returns after writing

When the user comes back, read the file they wrote. Extract the title from the first `# Heading` in the body.

The collection is already known from Step 1. Ask only:

1. **Maturity and AI status** (single select each)
   - Maturity: Draft, Developing, Solid, Complete
   - AI: 100% Maai, Assisted, Co-created, Generated

2. For **Jottings**: also ask for `type` (note / quote / event / link / post)

2. **Maturity and AI status** (single select each)
   - Maturity: Draft, Developing, Solid, Complete
   - AI: 100% Maai, Assisted, Co-created, Generated

If they chose Weblinks/Videos, ask for the URL in a follow-up question.

## Step 4: Build frontmatter and finalize

Build the full YAML frontmatter:
```yaml
---
title: "<title from heading>"
description: "<from frontmatter if filled in, otherwise generate a suggestion and ask Maaike>"
date: <YYYY-MM-DD today>
maturity: <chosen>
draft: true
tags: []
ai: "<chosen>"
---
```

**Description rules:**
- If the user already filled in `description` in the draft frontmatter, use it as-is
- If `description` is empty or missing, generate a suggestion and show it to Maaike for approval before writing
- For articles: always expect the user to write this themselves (remind them if empty)

Extra fields by collection:
- weblinks: add `url: "<url>"` after title
- videos: add `url: "<url>"` after title
- library: add `author: "<author>"` and `status: "<status>"` after title

Replace the minimal frontmatter in the file with the full version. Keep all body content intact.

Rename the file:
- Slug: title lowercased, non-alphanumeric replaced with hyphens, trimmed
- Move to correct collection: `src/content/<collection>/<slug>.md`
- If a file with that slug already exists, warn and ask for alternative

## Step 5: Auto-tag

Automatically run the `/auto-tag` skill on the new post.

## Step 6: Done

Tell the user the post is saved as a draft. To publish it, run `/publish`.

## Conventions

- Never use em-dashes
- Sentence case for titles
- Content language is English
- Date is always today in YYYY-MM-DD format
