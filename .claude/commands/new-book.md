# New book

Add a book to the library using Open Library metadata.

## Step 1: Get book info

The user provides a book title (and optionally author) as the argument to this command. If no argument is provided, ask for the title.

## Step 2: Search Open Library

Use WebFetch to query: `https://openlibrary.org/search.json?title=<encoded-title>&limit=5`

If the user also provided an author, add `&author=<encoded-author>`.

Parse the JSON response. For each result in `docs[]`, extract:
- `title`
- `author_name[0]`
- `first_publish_year`
- `cover_i` (cover ID, may be absent)

Show the top 5 matches in a numbered list: title, author, year. Ask the user to pick one.

## Step 3: Download cover

If the selected book has a `cover_i`, ask the user for permission to download the cover image.

Download from: `https://covers.openlibrary.org/b/id/<cover_id>-L.jpg`
Save to: `public/images/library/<slug>.jpg`

The slug is the title lowercased, spaces and non-alphanumeric characters replaced with hyphens, leading/trailing hyphens removed.

## Step 4: Generate frontmatter

Build the markdown file content:

```yaml
---
title: "<title>"
author: "<author>"
cover: "/images/library/<slug>.jpg"
date: <YYYY-MM-DD today>
maturity: draft
status: to-read
tags: []
description: ""
draft: true
---

```

If no cover was downloaded, omit the `cover` field.

## Step 5: Show draft and get approval

Show the generated frontmatter to Maaike. Wait for her approval before writing.

## Step 6: Create file

Write to `src/content/library/<slug>.md`.

## Step 7: Follow up

Run `/auto-tag` on the new file if Maaike wants.

## Rules

- Never use em-dashes in any generated content
- Sentence case for titles (only capitalize the first word and proper nouns)
- Date is always today
- Default status: to-read
- Default maturity: draft
- Set draft: true so it doesn't publish until reviewed
- Always show content to Maaike before writing
