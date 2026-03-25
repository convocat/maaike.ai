# New post

Create a new content post. Writing first, metadata later.

## Step 1: Select type (first question, before opening Typora)

Ask the user using AskUserQuestion with these 4 options:

- **Article** — long-form piece, will be shared on LinkedIn
- **Jotting** — short note, thought, or observation, will be shared on LinkedIn
- **Field note or seed** — reflection or early idea (no LinkedIn)
- **Other** — weblink, video, book, or project file

**If they choose "Field note or seed":** ask a follow-up with 2 options: Field note / Seed.

**If they choose "Other":** ask a follow-up with 4 options: Weblink / Video / Library / File or artefact.
  - If **Library**: tell them "Use `/new-book` to add a book — it fetches metadata from Open Library automatically." Stop here.
  - If **File or artefact**: tell them "Use `/new-project-file` to create a project file — it links it to the right project hub." Stop here.
  - If **Weblink** or **Video**: ask for the URL now before opening Typora.

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

3. Open in Typora. Try these paths in order until one works:
   - `"/c/Users/$USERNAME/AppData/Local/Programs/Typora/Typora.exe" "<file-path>" &`
   - `"/c/Program Files/Typora/Typora.exe" "<file-path>" &`

4. Tell the user: "Typora is open. Write your post, then come back here when you're done."

## Step 3: User returns after writing

When the user comes back, read the file they wrote. Extract the title from the first `# Heading` in the body.

The collection is already known from Step 1. Ask only:

1. **Maturity** (single select): Draft, Developing, Solid, Complete
2. **AI status** (single select): 100% Maai, Assisted, Co-created, Generated

For **Jottings**: also ask for `type` (note / quote / event / link / post) as a follow-up.

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
