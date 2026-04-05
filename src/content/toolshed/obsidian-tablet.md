---
title: Writing on tablet with Obsidian
description: How Maaike uses Obsidian on her Samsung Tab to edit garden content, synced to GitHub via GitSync.
date: 2026-04-05
maturity: solid
tags: [workflow, obsidian, writing, mobile]
category: technical
section: Workflow
ai: co-created
---

Garden content can be edited on a Samsung Tab using Obsidian, with the repo synced via GitSync (a standalone Android app — the Obsidian Git plugin is too unstable on mobile).

## Setup

- **App**: Obsidian for Android on Samsung Tab
- **Sync**: GitSync — pulls from and pushes to the `main` branch on GitHub
- **Vault root**: `src/content/` inside the Digital-Garden repo
- **Sync frequency**: manual (do not use auto-sync)

## What to use the tablet for

The tablet is for **editing existing posts**: tending drafts, fixing typos, refining copy. It is not for creating new posts.

New posts are always created with `/new-post` in a Claude Code session on the desktop. That skill handles frontmatter validation, auto-enrichment, OG images, and correct collection placement — none of which are available in Obsidian.

## Workflow

1. Sync GitSync at the start of a session (pull latest from GitHub)
2. Edit existing posts in the relevant collection folder
3. Sync GitSync when done (push back to GitHub)
4. GitHub Actions deploys automatically

Avoid syncing from the tablet if a Claude Code session is also active on the desktop — simultaneous pushes from both sides cause merge conflicts.

## Templates

Templates live at `src/content/_templates/` and are available via the Templates core plugin. They exist as a reference for frontmatter field names, not as a new-post workflow.

See [content collections](/toolshed/content-collections) for the full frontmatter schema per type.
