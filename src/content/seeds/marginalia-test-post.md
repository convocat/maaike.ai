---
title: "Marginalia test post"
description: "Temporary post used to demo hover-anchored marginalia. Safe to delete."
date: 2026-05-10
maturity: draft
tags: [test]
draft: true
ai: "100% Maai"
marginalia: []
---

# What changes when reading becomes annotated

Reading on a screen used to mean clicking through; reading in a garden means sitting with a piece and letting it talk back. The difference is small at first, then suddenly large: the moment the text knows what you marked, the loop closes.

Most reading interfaces treat a post as a finished object. Highlight, save, move on. But a garden post is never quite finished, and the most useful highlight is the one that's still asking a question. Annotation is how you keep that question alive without forking the article.

So the question for the prep dashboard isn't "where do my notes go" but "what is a note for". A note is half an argument with the post, written down so you can find it later. The post is the half it argues with.

## Doing this on a static site

Anchoring text on a static site is mechanically simple. You walk the prose for a literal quoted string and wrap the first match. The marginalia field is a flat array of strings, each beginning with the quote that anchors it. Hover on the underlined span; the comment appears.

The constraint is honest: quotes have to be exact. Paraphrases drift. But that's a small price for keeping the data model trivial and the rendering deterministic.
