---
title: "The proof layer LLMs are missing"
description: "LLMs solved the language-translation half of knowledge interop. The verification half is largely unbuilt: provenance, claim attribution, signed assertions, grounding evals, shared verification standards."
date: 2026-05-17
maturity: draft
draft: false
ai: co-created
develops: conference-talk-guildford
tags: []
triples: []
---

# The proof layer LLMs are missing

Engelbart in 2004: knowledge bases across organisations should not have to differ, and you still have to communicate and *prove* things. Two requirements, often conflated.

LLMs solve half of this. The half that's still unbuilt is where the value actually compounds.

## The communication half (mostly solved)

A model can read company A's knowledge base and answer questions in company B's vocabulary without a shared schema. Statistical translation dissolved much of the ontology problem that ate research for thirty years. Knowledge bases no longer need to share format to interoperate. The model bridges.

## The proof half (largely unsolved)

To "prove" a claim from a knowledge base you need:

- **Claim-level attribution.** Which source supports this sentence, not which document.
- **Source authority.** Who wrote it, when, with what credentials, under what review.
- **Audit trails.** What did the model see, what did it select, what did it generate?
- **Reproducibility.** Can the same claim be reconstructed by another reader using the same sources?
- **Signed assertions.** Cryptographic provenance so a claim can travel across orgs without losing its credentials.
- **Grounding evals.** Tests that measure how often a model's output is supported by the cited material.
- **Shared verification standards.** Cross-organisational protocols so a claim verified in company A holds in company B.

Current RAG + citation stacks gesture at some of these. None delivers all of them reliably.

## What Engelbart already had

NLS in 1968: every piece of content was author-signed, date-stamped, and structurally linked to its provenance. The Journal was an addressable archive of every interaction, every memo, every decision, with full attribution. Not a research prototype. The actual working environment.

That infrastructure is largely missing from today's LLM stack. We have the inverse problem of 1968: more powerful language machinery, weaker provenance machinery.

## Why this matters

Without a proof layer:

- Cross-organisational knowledge sharing can't be trusted.
- LLM output can't be safely used in regulated work (legal, medical, financial, scientific).
- Cultural memory mediated by LLMs accumulates errors silently.
- C-activity at scale becomes impossible because no one can audit what the improvement process actually did.

## What to build

Provenance graphs under the model. Claim attribution as a first-class output. Signed assertions as a transport format. Grounding evals as continuous tests. Verification standards as inter-org protocol.

LLMs handle the language. The provenance fabric handles the trust. Both are required. The second one is the one almost nobody is building.
