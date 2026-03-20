# New post

Create a new content post. Writing first, metadata later.

## Step 1: Open Typora immediately

No questions. Just do this:

1. Create a temporary file at `src/content/articles/new-draft.md` with minimal frontmatter and a writing template:
   ```markdown
   ---
   draft: true
   description: ""
   ---

   # Title

   Start writing here...

   <div class="linkedin">

   </div>
   ```
   If `new-draft.md` already exists, use `new-draft-2.md`, `new-draft-3.md`, etc.

2. Install the Typora theme if needed:
   - Compare `.claude/typora/maaike-garden.css` with `$APPDATA/Typora/themes/maaike-garden.css`
   - Copy if missing or outdated: `cp ".claude/typora/maaike-garden.css" "$APPDATA/Typora/themes/maaike-garden.css"`

3. Open in Typora: `"/c/Program Files/Typora/Typora.exe" "<file-path>" &`

4. Tell the user: "Typora is open. Write your post, then come back here when you're done."

## Step 2: User returns after writing

When the user comes back, read the file they wrote. Extract the title from the first `# Heading` in the body.

Then ask metadata questions in a single AskUserQuestion call:

1. **Which collection?** (single select)
   - Articles
   - Field notes
   - Sparks
   - Weblinks / Videos (requires URL)

2. **Maturity and AI status** (single select each)
   - Maturity: Draft, Developing, Solid, Complete
   - AI: 100% Maai, Assisted, Co-created, Generated

If they chose Weblinks/Videos, ask for the URL in a follow-up question.

## Step 3: Build frontmatter and finalize

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

## Step 4: Auto-tag

Automatically run the `/auto-tag` skill on the new post. This will scan the content base and suggest tags and wiki-links.

## Step 5: Commit

After auto-tag is done, ask if the user wants to commit and push.
- Commit message: `Add <collection>: <title>`

## Conventions

- Never use em-dashes
- Sentence case for titles
- Content language is English
- Date is always today in YYYY-MM-DD format
