# New post

Create a new content post for the digital garden. Walk the user through each step using AskUserQuestion, then generate the file.

## Step 1: Collection and title

Ask two questions in a single AskUserQuestion call:

1. **Which collection?** (single select)
   - Articles — long-form pieces
   - Field notes — observations, logs, changelogs
   - Sparks — short ideas, seeds, questions
   - Weblinks — external links with commentary (requires URL)
   - Videos — video links with commentary (requires URL)
   - Library — books (requires author)
   - Principles — guiding beliefs

2. **What's the title?** (free text, "Other" option only)
   - Remind the user: sentence case (only capitalize first word + proper nouns)

## Step 2: Collection-specific fields

Only ask if the collection requires extra fields:

- **Weblinks or Videos**: ask for the URL
- **Library**: ask for author name, and reading status (to-read, reading, read)

Skip this step for articles, field-notes, sparks, and principles.

## Step 3: Maturity and AI status

Ask two questions in a single AskUserQuestion call:

1. **Maturity level?** (single select, default first)
   - 🌱 Draft — just planted
   - 🌿 Developing — growing, still rough
   - 🪴 Solid — well-shaped, mostly done
   - 🌳 Complete — fully grown

2. **AI status?** (single select)
   - 100% Maai — fully written by Maaike
   - Assisted — her ideas, AI helped refine
   - Co-created — AI wrote it based on her direction
   - Generated — fully AI-generated, reviewed by her

## Step 4: Tags and description (optional)

Ask whether the user wants to add tags and/or a description now, or skip and add later. If they want to add them, ask for:
- Tags (comma-separated)
- Description (one sentence)

## Step 5: Generate the file

Build the file path:
- Slug: take the title, lowercase it, replace non-alphanumeric characters with hyphens, trim leading/trailing hyphens
- Path: `src/content/<collection>/<slug>.md`

Build the YAML frontmatter based on collection type:

**Base fields (all collections):**
```yaml
---
title: "<title>"
date: <YYYY-MM-DD today>
maturity: <chosen maturity>
tags:
  - <tag1>
  - <tag2>
description: "<description>"
ai: "<ai status>"
---
```

**Extra fields by collection:**
- articles: `pruning` (omit, it's optional and rarely used)
- weblinks: add `url: "<url>"` after title
- videos: add `url: "<url>"` after title
- library: add `author: "<author>"` and `status: "<status>"` after title
- field-notes, sparks, principles: no extra fields

If tags are empty, use `tags: []`. If description is empty, omit it.

## Step 6: Show before committing

Display the full file content (frontmatter + empty body) in chat. Ask the user to confirm before writing the file. The user may want to tweak things or add initial body text.

## Step 7: Write and open in Typora

Only after the user approves:
1. Write the .md file to disk
2. Install the Typora theme if not already present:
   - Source: `.claude/typora/maaike-garden.css` (in this project)
   - Destination: `$APPDATA/Typora/themes/maaike-garden.css`
   - Copy command: `cp ".claude/typora/maaike-garden.css" "$APPDATA/Typora/themes/maaike-garden.css"`
   - Only copy if the destination is missing or outdated (compare with `diff`)
3. Open the file in Typora: `"/c/Program Files/Typora/Typora.exe" "<file-path>" &`
4. Confirm to the user with the file path and that Typora is open
5. Remind the user to select the "Maaike Garden" theme in Typora (Themes menu) if it's their first time
6. Ask if they want to commit and push now, or do that later (after writing in Typora)

## Conventions

- Never use em-dashes (—) in any content
- Sentence case for titles
- Content language is English
- Date is always today in YYYY-MM-DD format
- If a file with that slug already exists, warn the user and ask for a different title
