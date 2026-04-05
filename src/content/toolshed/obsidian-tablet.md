---
title: Writing on tablet with Obsidian and Samsung Notes
description: How Maaike uses her Samsung Tab to edit garden content and capture quick notes, synced to GitHub via GitSync.
date: 2026-04-05
maturity: solid
tags: [workflow, obsidian, writing, mobile, samsung-notes]
category: technical
section: Workflow
ai: co-created
---

Garden content can be edited on a Samsung Tab using two apps: **Obsidian** for editing existing posts, and **Samsung Notes** for capturing quick inbox notes with the S-Pen. Both sync to the repo via GitSync.

## Setup

- **Sync**: GitSync — pulls from and pushes to the `main` branch on GitHub
- **Vault root** (Obsidian): `src/content/` inside the Digital-Garden repo
- **Sync frequency**: manual (do not use auto-sync)

## What to use each app for

**Obsidian**: editing existing posts — tending drafts, fixing typos, refining copy.

**Samsung Notes**: capturing quick inbox notes with the S-Pen. Samsung Notes has better S-Pen support (handwriting recognition + stylus interaction) than Obsidian. Notes are exported as `.txt` files directly to `_inbox/`.

New posts are always created with `/new-post` in a Claude Code session on the desktop. That skill handles frontmatter validation, auto-enrichment, OG images, and correct collection placement.

## Workflow: editing in Obsidian

1. Sync GitSync (pull latest from GitHub)
2. Edit existing posts in the relevant collection folder
3. Sync GitSync when done (push back to GitHub)

Avoid syncing from the tablet if a Claude Code session is also active on the desktop — simultaneous pushes cause merge conflicts.

## Workflow: quick notes in Samsung Notes

1. Write the note in Samsung Notes using the S-Pen
2. Export as `.txt` → save to `src/content/_inbox/` in the repo folder
3. Sync GitSync when done

## Inbox

`src/content/_inbox/` is a scratchpad for quick notes from the tablet. Drop anything here: half-formed ideas, links, observations. No frontmatter needed — `.md` and `.txt` files both work.

At the start of each Claude Code session, the inbox is checked automatically. Any files there get the `/new-post` treatment: Claude reads them, suggests a collection and title, and turns them into proper posts.

## Templates (Obsidian only)

Templates live at `src/content/_templates/` and are available via the Templates core plugin:

- **Inbox note**: minimal template for quick notes (date + title)
- **Article, Jotting, Field note, Seed, Weblink, Video**: reference templates with full frontmatter (for editing existing posts, not creating new ones)

See [content collections](/toolshed/content-collections) for the full frontmatter schema per type.
