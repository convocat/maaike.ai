---
title: "CLAUDE.md: Giving Your AI Assistant Project Memory"
date: 2026-03-10
maturity: draft
tags:
  - ai-tools
  - claude-code
  - developer-experience
description: How a simple markdown file lets Claude Code understand your project from the first message.
---

*This field note was co-created with Claude.*

## The problem

Every time you start a new conversation with an AI coding assistant, you start from zero. It doesn't know your project structure, your design decisions, or that hot pink is your brand color and absolutely non-negotiable.

You end up repeating yourself: "This is an Astro site. There are 7 content collections. The accent color is #D6006C. No, don't change it."

## The solution

Claude Code looks for a `CLAUDE.md` file in your project root. If it finds one, it reads it at the start of every conversation. It's like a briefing document — project context that persists across sessions and machines.

It's not magic. It's just a markdown file. But it means the AI starts every conversation already knowing:

- How to run the project
- What the architecture looks like
- Which decisions have been made (and why)
- What not to touch

## What goes in it

Here's roughly what I put in mine for this digital garden:

- **Quick start** — the commands to install and run
- **Architecture overview** — content collections, layouts, routing patterns
- **Design system** — color tokens, typography, spacing (and which colors are sacred)
- **Deployment** — how the site gets published
- **Preferences** — aesthetic direction, things to preserve

It's not documentation for humans (though humans can read it fine). It's documentation for the AI — optimized for the kind of context an assistant needs to be useful immediately.

## Why it matters

The value isn't just convenience. It's about **continuity**. Without it, every session is a first date. With it, the AI already knows what you've built together and what you care about.

It also travels with your code. Push it to git, clone the repo on another machine, and the context comes with it. No setup, no re-explaining.

## The meta bit

This very field note was written in a session where we'd just finished integrating hand-drawn SVG icons into the site, and I asked Claude to create the CLAUDE.md before switching machines. The AI wrote the file based on everything it had learned across our conversations — then I asked it to write this note about the experience.

Turtles all the way down.
