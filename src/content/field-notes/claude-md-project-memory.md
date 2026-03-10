---
title: "CLAUDE.md: Project Memory for AI Assistants"
date: 2026-03-10
maturity: draft
tags:
  - ai-tools
  - claude-code
  - developer-experience
description: A markdown file in your repo root that gives Claude Code persistent project context.
---

*Co-created with Claude.*

## What

`CLAUDE.md`: a markdown file in your project root. Claude Code reads it at the start of every conversation. Persistent context across sessions and machines.

## Why

Without it: every session starts from zero. You re-explain architecture, conventions, preferences. "This is Astro." "There are 7 collections." "Don't touch the hot pink."

With it: the AI already knows. First message is productive.

## What goes in

- **Setup**: install, run, build commands
- **Architecture**: collections, layouts, routing, key directories
- **Design system**: color tokens, typography, sacred values
- **Deployment**: how the site ships
- **Preferences**: aesthetic, brand constraints, things not to change

Not human docs. AI docs. Optimized for the context an assistant needs to be immediately useful.

## Key insight

It travels with the code. `git clone` on a new machine → context is already there. No re-explaining.

Continuity > convenience. Every session builds on previous decisions instead of rediscovering them.

## Meta

This note was written during a session where Claude had just built the CLAUDE.md for this garden, based on everything we'd worked on together across multiple conversations. Then I asked it to write about the experience.

Turtles all the way down.
