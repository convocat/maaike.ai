---
title: Writing on tablet with Samsung Notes
description: How Maaike uses Samsung Notes on her Samsung Tab to capture quick notes and sync them to the garden via GitSync.
date: 2026-04-05
maturity: solid
tags: [workflow, samsung-notes, writing, mobile]
category: technical
section: Workflow
ai: co-created
---

Quick notes and observations are captured on a Samsung Tab using Samsung Notes and synced to the garden repo via GitSync.

## Setup

- **Writing app**: Samsung Notes — best S-Pen support on Samsung devices
- **Sync**: GitSync — pushes to the `main` branch on GitHub
- **Sync frequency**: manual, after finishing a writing session

## Workflow

1. Write in Samsung Notes using the S-Pen
2. Export as `.txt` → save to `src/content/_inbox/` in the repo folder
3. Open GitSync and sync to push to GitHub

## Inbox

`src/content/_inbox/` is a scratchpad for notes from the tablet. Drop anything here: half-formed ideas, links, reading notes, observations. No frontmatter needed.

Multiple entries in one file are fine — date-stamp each one (e.g. `2026-04-05:`) and they can be split into separate posts when processed.

Each morning, Claude checks the inbox automatically. Any files there are pulled into the backlog or given the `/new-post` treatment.

## Creating new posts

New posts are always created with `/new-post` in a Claude Code session on the desktop. The tablet is for capture only.
