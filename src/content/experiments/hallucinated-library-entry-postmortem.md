---
title: "Hallucinated library entry: post-mortem and safeguard"
date: 2026-04-07
maturity: complete
tags:
  - ai-tools
  - digital-gardens
  - developer-experience
description: "How Claude invented a book by my competitor, why it happened, and the rule added to prevent it."
draft: false
ai: "co-created"
develops: building-this-garden
---

## What happened

During a library import session in March 2026, a Claude session added a book entry to the garden library titled "Tech skills for conversation designers" with author "Hans van Dam." Neither the book nor the author attribution is real. Hans van Dam is a direct competitor of mine in the conversation design space.

The entry was discovered in April 2026 during a library audit triggered by an unrelated check.

## Root cause

The import session scraped my public Notion library page and treated every page entry as a potential book. "Tech skills for conversation designers" is actually a Notion resource page I built myself — a curated list of courses and articles, not a book. Its Author field in Notion was empty ("Leeg").

When Claude encountered a plausible-sounding title with no author, it did not stop or flag the gap. It generated a plausible-sounding author name instead. Hans van Dam is a known name in conversation design: that is almost certainly how his name surfaced. The hallucination was confident and structurally valid — a complete frontmatter entry with description, tags, reason, and status — which is exactly what makes it dangerous.

## Why this is serious

A hallucinated book entry is bad. A hallucinated book attributed to a competitor, published on my professional site, is a professional integrity failure. The `ai: assisted` label on the entry was correct in form but meaningless as a safeguard: it flagged that AI helped, not that AI invented.

## The safeguard

A non-negotiable rule has been added to `CLAUDE.md`:

> **NEVER generate, hallucinate, or invent factual fields for library entries.** If the source has no author, write `author: "Unknown"`. Never generate a plausible-sounding name. Before writing any new library entry, verify the book and author exist on Open Library. If unverifiable, stop and ask.

Empty fields are always better than hallucinated ones.

## Still to do

- Full audit of all `ai: assisted` library entries against the original Notion source
- Check "Bacteria to AI" (attributed to N. Katherine Hayles, status: reading) — may be real, needs verification
- Add Open Library verification step to the `/new-book` skill
