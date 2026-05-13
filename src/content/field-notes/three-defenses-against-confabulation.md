---
title: "Three defenses against confabulation"
date: 2026-05-08
maturity: solid
tags:
  - critical-ai
  - llm-hallucinations
  - retrieval-augmented-generation
  - llm-as-judge
  - groundedness
  - transparency-over-suppression
  - llm-evals
  - confabulation
  - ai-transparency
  - epistemic-diversion
themes:
  - "Confabulation is the worst failure mode for a wiki built on personal voice"
  - "Three soft defenses (retrieval, system prompt, source attribution) all fail silently"
  - "Hard defenses can make hallucination visible, measurable, and refusable without suppressing the answer"
  - "Transparency over suppression: surface a verdict per claim, let the reader judge"
triples:
  - ["LLM hallucinations", "risks", "Confabulation"]
  - ["Retrieval-augmented generation", "lacks", "Groundedness"]
  - ["LLM-as-judge", "demonstrates", "Groundedness"]
  - ["Transparency over suppression", "counters", "Epistemic diversion"]
  - ["LLM-as-judge", "instance-of", "LLM evals"]
description: "Three soft layers between a user and hallucination all fail silently. Three hard defenses make confabulation visible, measurable, and refusable without suppressing the answer."
ai: "co-created"
draft: false
marginalia:
  - "Use this as opening: confabulation defenses are layered, like an immune system."
---

When a user asks the wiki a question, the server retrieves articles from the garden and sends them to Claude, which synthesises an answer. The natural question: how do we know the answer is true?

The honest answer used to be: we don't. Three soft layers were all that stood between the user and hallucination.

1. **Retrieval**, hopefully pulling the right articles so Claude had material to draw from.
2. **System prompt**, telling Claude to stick to the sources and refuse if it didn't know.
3. **Source attribution**, listing the retrieved articles, not the ones the answer actually used.

Each layer fails silently. Claude can invent content and cite any article; the UI doesn't know the difference. For a garden where the whole point is "this is what Maaike says", confabulation is the single worst failure mode. So: three additions. Two prevent or flag hallucination at runtime, one evaluates the system offline.

## Defense A: refuse when retrieval is weak

Before Claude is even called, the server checks the retrieval result. If zero topics matched, zero articles were retrieved, and zero themes hit any keywords, the server returns a canned refusal without making an API call: "I don't have material on this in the garden. The knowledge graph didn't surface any relevant articles."

This catches the worst hallucination mode: Claude free-styling on its training data when the corpus has nothing relevant. Cost: zero tokens, zero latency. Visible in the dashboard as a green "retrieval refused" banner.

The threshold is intentionally conservative. It only fires when the graph is completely empty. If any theme keyword matched, Claude still gets called. This avoids over-refusal on plausible questions where retrieval is partial.

## Defense B: verify claims after the answer

After an answer is produced, a second Claude call (the judge) reads the original source articles and classifies every factual claim in the answer into one of three buckets.

- **Verified**: directly supported by source material, with a supporting quote.
- **Inferred**: reasonable inference from sources, not explicit.
- **Unverified**: no basis in the sources. Possible hallucination.

Output is structured JSON with an overall verdict: grounded (more than 80% verified), mixed, or hallucinating. The dashboard renders a colour-coded summary plus every claim with its supporting quote when available.

The principle: this doesn't suppress the answer. The user still sees everything. But it makes hallucination visible per claim. Transparency over suppression.

## Phase 1: offline aggregate evaluation

Verification isn't only for individual answers. A Verify-all button runs the judge across every question in the 55-question golden test set. The report view aggregates verified claim rate, unverified claim rate (the actual hallucination metric), per-category breakdown, and the specific unverified claims so failures are inspectable.

This turns the test set from "vibes" into a real quality metric that drifts measurably when the system changes. Run it before a change, run it after, compare the unverified-claim rate. That comparison is the headline number.

## What is still not prevented

These defenses help but don't close every gap. Worth naming explicitly.

- **Plausible-but-wrong paraphrase**. If Claude paraphrases accurately, the judge says "verified". If the paraphrase subtly shifts meaning, the judge may miss it too. Both models have the same blind spots.
- **Missing-source confabulation**. If retrieval returns article A but the answer draws from training data about article B, the judge sees only A and may flag the claim as unverified even when it's correct elsewhere. This is a feature: groundedness in the garden, not in general knowledge.
- **Meta-statements and tone**. "This is an important question" is not a factual claim; the judge classifies these as inferred. That means style drift (answers becoming generic-chatbot-y) isn't caught here. That's what the human rubric is for.
- **Strategic hallucination**. A determined adversary can craft prompts that induce content that looks sourced but isn't. The adversarial questions in the test set probe this directly.

## One-line position

The system cannot guarantee truth. It can now make hallucination visible, measurable, and refusable when evidence is thin. That is what changed.

## Related

- [[building-this-garden|The History of Building This Garden]]
