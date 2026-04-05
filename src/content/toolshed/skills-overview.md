---
title: Skills overview
description: The Claude Code skills built for the garden and what each one does.
date: 2026-04-05
maturity: solid
tags: [workflow, process, claude, automation]
category: technical
section: Workflow
ai: co-created
---

Skills are saved Claude Code prompts that encode multi-step workflows. They are invoked with `/skill-name` in a session. The garden has two kinds: skills built here for the garden, and general-purpose skills from Anthropic.

## Garden skills

| Skill | What it does |
|---|---|
| `/new-post` | Drafts a new article, jotting, field note, seed, or Toolshed post. Opens Typora for content posts; Toolshed posts are drafted inline for review. Runs auto-enrichment and gets sign-off before writing. |
| `/new-book` | Adds a book to the library. Fetches metadata from Open Library automatically. |
| `/new-project` | Creates a project hub: a field note marked `hub: true` that appears on the Projects page. |
| `/new-project-file` | Adds a post that belongs to a project hub via the `develops:` frontmatter field. |
| `/complete-project` | Closes out a project and generates a completion report. |
| `/auto-tag` | Runs the three-pass TAO analysis on a post and enriches it with tags, triples, themes, wiki-links, and Wikipedia links. See [The publishing routine](/toolshed/publishing-routine) for how TAO works. |
| `/publish` | Full publishing routine: validate frontmatter, generate OG images, rebuild the explore map, commit, push, and share to LinkedIn if applicable. |
| `/share-linkedin` | Generates and shares a LinkedIn post from a published article or jotting. |
| `/backlog` | Opens a backlog grooming session: scans for stale items, flags blockers, checks the tablet inbox for unprocessed notes, and suggests session focus. |
| `/handover` | Writes a session close and a brief for the next session. |
| `/update-release-notes` | Appends a summary of recent changes to the release notes. |

## Anthropic skills

General-purpose skills not specific to the garden, available in any Claude Code session:

| Skill | What it does |
|---|---|
| `/pdf` | Read, extract, combine, split, or create PDF files. |
| `/docx` | Create or edit Word documents. |
| `/pptx` | Create or edit PowerPoint presentations. |
| `/xlsx` | Read or edit spreadsheet files. |
| `/skill-creator` | Create new skills, modify existing ones, or run evals to test them. |
