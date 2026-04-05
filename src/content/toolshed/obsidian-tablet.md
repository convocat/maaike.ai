---
title: Writing on tablet with Obsidian
description: How Maaike uses Obsidian on her Samsung Tab to write and edit garden content, synced to GitHub via GitSync.
date: 2026-04-05
maturity: solid
tags: [workflow, obsidian, writing, mobile]
category: technical
section: Workflow
ai: co-created
---

Garden content can be written and edited on a Samsung Tab using Obsidian, with the repo synced via GitSync (a standalone Android app — the Obsidian Git plugin is too unstable on mobile).

## Setup

- **App**: Obsidian for Android on Samsung Tab
- **Sync**: GitSync — pulls from and pushes to the `main` branch on GitHub
- **Vault root**: `src/content/` inside the Digital-Garden repo
- **Sync frequency**: manual, with scheduling options available in GitSync

## How it works

GitSync keeps the local copy of the repo in sync with GitHub. After writing or editing in Obsidian, GitSync commits and pushes back to `main`. GitHub Actions picks up the push and deploys the site.

The vault root is `src/content/`, so all content collections (articles, field notes, seeds, etc.) are visible as folders in Obsidian.

## Templates

Obsidian's built-in Templates plugin is enabled. Templates live at `src/content/_templates/` and provide pre-filled frontmatter for each content type, so new posts start with the right fields.

To use: open the command palette in Obsidian, choose "Templates: Insert template", and pick the type. The template inserts the full frontmatter with today's date pre-filled.

See [content collections](/toolshed/content-collections) for the full frontmatter schema per type.
