---
title: "Evals for a RAG bot: a hands-on loop for conversation designers"
description: "A field-tested workflow for catching hallucinations, citation drift, and unsafe outputs on a Langfuse-traced bot, written for designers who have never run an eval before."
date: 2026-05-24
maturity: developing
tags: [evals, langfuse, rag, prompt-engineering, mindstudio, teaching]
ai: co-created
themes: [quality-monitoring, conversation-design, prompt-engineering]
open_questions:
  - "At what dataset size does LLM-as-judge agreement stop improving?"
  - "What's the cheapest way to keep a multi-turn dataset honest, given that you can't run pairs in isolation?"
  - "Which categories should *never* be promoted to a judge, even with calibration?"
---

# What this is

A bundle of teaching material on running evals for the [MindStudio University RAG bot](https://github.com/convocat/genai-design-tools/tree/main/mindstudio-rag). Built up over one working session with a conversation designer who had never used Langfuse. The materials assume the bot is traced in Langfuse — every user turn is a trace, every conversation a session — and use that as the substrate for the whole loop.

Try the live bot: **TODO add deployment URL** (the Vercel URL — fill in once handy).

## Why this matters

LLM products fail in three ways unit tests cannot catch:
1. **Hallucination** — confident invention of facts not in the sources.
2. **Instruction drift** — the model gradually stops following rules you set in the system prompt (citations, refusals, format).
3. **Unsafe output** — compliance with prompt injections or leading questions.

`assertEqual(...)` can't detect any of these because the failures are about meaning, not exact strings. Evals fill that gap by treating the bot as a semantic system: define a dataset, run it, score the outputs against a rubric, and compare runs over time.

## The loop, in one diagram

```
Dataset  →  Run  →  Score  →  Compare runs  →  Fix prompt  →  Run  →  …
```

The comparison is what matters. Absolute scores are less interesting than the delta between yesterday's run and today's after you changed the prompt.

## The three pieces, concretely

| Piece | What it is | In this toolkit |
|---|---|---|
| **Dataset** | Fixed list of inputs (and an *expected behavior*, not an expected string) | [test_questions.csv](/eval-toolkit/test_questions.csv) — 70 items across 12 error-mode categories |
| **Run** | Execute the bot on every dataset item, record the output, link the traces | Triggered from the Langfuse UI or via a tiny Python runner |
| **Score** | Grade each item against a rubric, manually or with an LLM judge | Three score configs: `correctness`, `citation`, `safety` |

## Error-mode categories the dataset covers

Out of scope, hallucination bait, prompt injection, ambiguous, multi-hop, procedural, conceptual, negation, follow-up reference resolution, language/format edge cases, citation discipline, and a hard **problematic** group (harm, PII, sensitive advice, offensive framing, manipulation, copyright, security, self-harm proximity, contradiction, loaded framing, recursion, meta-extraction).

The `problematic_*` group is the one that gates a release. If any of those score `harmful` after a prompt change, the change does not ship.

## Manual scoring before LLM-as-judge

The order matters more than people expect. The reason to score manually first is not perfectionism — it's that the rubric isn't real yet. You discover the rubric *by* scoring 15 traces by hand, finding edge cases that surprised you, and writing them down. Only then can you encode that rubric into a judge prompt. Skipping the manual phase produces a judge that confidently grades the wrong things.

| | Manual | LLM-as-judge |
|---|---|---|
| Cost | high (your time) | low (model tokens) |
| Speed | slow | fast |
| Accuracy | highest once rubric is stable | 85–95% if the judge prompt is good |
| When to use | learning what "good" looks like; safety-critical categories on every release | regression sweeps after the rubric is stable |

## The demo flow (≈ 30 minutes)

1. Stage a deliberately broken system prompt in Langfuse (the [DEMO-BROKEN prompt](/eval-toolkit/answer-system-prompt-DEMO-BROKEN.md) strips citations, encourages confident guessing, allows emoji and em-dashes).
2. Import [demo_baseline_questions.csv](/eval-toolkit/demo_baseline_questions.csv) (15 items, hand-picked to expose the sabotage).
3. Run the dataset against the broken bot.
4. Score 5–6 traces live with the audience. Observe: every non-refusal trace fails `citation`; out-of-scope questions get fabricated answers; the bot is suspiciously enthusiastic.
5. Restore the good prompt in Langfuse, save as a new version.
6. Re-run the dataset.
7. Use Langfuse's compare-runs view to walk the audience down the rows — Improved / Unchanged / Regressed.
8. Promote the rubric to an LLM judge; calibrate against the manual scores from step 4.

The visible before/after is the entire pedagogical move. Designers see what "improving the bot" actually means in practice instead of as an abstraction.

## Rules of thumb

- **Fix the prompt or the retrieval, not the answer.** One bad answer is noise; a pattern across three traces is signal.
- **One variable at a time.** If you edit two prompts at once and a regression appears, you won't know which caused it.
- **Trust retrieval before blaming the model.** ~80% of "bad answer" cases turn out to be "the right doc wasn't retrieved." Look at `matched_articles` in the retrieval span before you start rewriting prompts.
- **Be honest about scope.** If users keep asking things outside the corpus, the answer is to add docs, not to coach the model into guessing.
- **The bot must always cite.** Uncited claims are a bug in the answer prompt, not a stylistic preference.

## Toolkit (downloads)

- [DEMO_GUIDE.md](/eval-toolkit/DEMO_GUIDE.md) — theory + 8-step hands-on demo script + reset checklist + FAQ talking points.
- [LANGFUSE_DATASET_TUTORIAL.md](/eval-toolkit/LANGFUSE_DATASET_TUTORIAL.md) — full reference manual: importing datasets, running, scoring, comparing, multi-turn handling, and three paste-ready LLM-judge prompts.
- [SLIDES_OUTLINE.md](/eval-toolkit/SLIDES_OUTLINE.md) — 28-slide, 40-minute teaching deck outline with per-slide bullets and speaker notes.
- [MONITORING.md](/eval-toolkit/MONITORING.md) — day-to-day workflow: sample sessions, walk the trace tree, fix prompts, track changes.
- [test_questions.csv](/eval-toolkit/test_questions.csv) — the full 70-item dataset.
- [demo_baseline_questions.csv](/eval-toolkit/demo_baseline_questions.csv) — 15-item teaching subset.
- [answer-system-prompt-DEMO-BROKEN.md](/eval-toolkit/answer-system-prompt-DEMO-BROKEN.md) — sabotaged prompt for the demo's "before" state.

## Source

All materials live in [`mindstudio-rag/eval/`](https://github.com/convocat/genai-design-tools/tree/main/mindstudio-rag/eval) inside the genai-design-tools repo. Edits in either repo are easy to copy across; the Digital Garden version is the polished teaching surface.

## What I still want to figure out

- A lightweight way to keep multi-turn follow-up pairs honest inside a dataset (current setup forces them to be run manually with shared session IDs).
- Whether it's worth automating "drift detection" — scheduled judge runs that flag when scores trend down without anyone editing the prompt.
- A version of this for non-RAG bots, where there's no retrieval step to inspect when an answer is wrong.
