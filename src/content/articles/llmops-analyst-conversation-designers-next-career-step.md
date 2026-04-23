---
reviewed: 2026-04-23
title: "LLMOps analyst: conversation designer's next career step"
description: "How conversation designers are evolving into LLMOps analysts, and why linguists are uniquely suited for monitoring, evaluating, and improving GenAI systems in production."
date: 2026-04-14
maturity: solid
draft: false
tags:
  - conversation-design
  - generative-ai-design
  - llm
  - evaluation
  - systems-thinking
  - future-of-work
  - llmops
triples:
  - ["Conversation design", "leads-to", "LLMOps"]
  - ["LLMOps", "requires", "Systems thinking"]
  - ["LLM evals", "requires", "Linguistics"]
  - ["LLM evals", "counters", "LLM hallucinations"]
  - ["LLM observability", "instance-of", "LLMOps"]
ai: "100% Maai"
---

# LLMOps analyst: conversation designer's next career step

In yesterday's [Convoclub](https://luma.com/convo-club), one of the questions we discussed: where is conversation design heading, and what do we call that?

What I see happening in my own work: I'm slowly turning into what I'd call an LLMOps analyst/architect. Someone who monitors the quality and effective workings of GenAI systems that are live in production.

What I do:

- I design effective [[putting-the-design-in-prompt-design|system and node prompts]] and functional GenAI architectures. Devs and architects can decide on using [GraphRAG](https://en.wikipedia.org/wiki/Retrieval-augmented_generation), but I'm the one who points out the need for a classifier and disambiguation node, based on my experience with user journeys and conversation design.
- I design the metadata structure that determines which information from [traces and spans](https://en.wikipedia.org/wiki/Tracing_(software)) needs to be available as datapoints for evals and analytics.
- I define functional and qualitative evals for both technical health, model behavior ([[llm-hallucinations-knowledge-as-missing-fundamental|hallucination]]), user journey analysis, resolution rate, tone of voice, but also compliance and transparency. I'm basically writing the unit tests for my own system and node prompts.
- I do log analysis and troubleshooting, which is basically convo log analysis on steroids.
- I provide dashboarding and insights for both business and content folks to make sure they have actionable insights that help them reach their user and business goals.

Why is that me, a linguist and conversation designer, and not necessarily an engineer?

- I understand how people interact with language-based interfaces (whether they're human or machines). To get good insights, many evals need to be slightly fuzzy, domain specific and context-aware by nature, but still lead to binary evaluation results.
- Good prompts and evals require precise, specific and intentional language. In other words, you need to know how to write. There's no shortcut for that.
- Most evals are not so much about testing system behavior but about validating and guardrailing user behavior. Understanding human psychology, language and HMI patterns is crucial here.
- And most of all: linguists are systems thinkers by default. Being able to zoom in into the nitty gritty details of a child span in a trace and then abstracting all the way to your GenAI architecture is not much different from, say, a linguist looking at the peculiarities of a certain intonation pattern in declarative statements and then researching how that's shaping a whole subculture of language users.

So yeah, in short: want to make sure that what you want to build with GenAI is what you actually get, and have data and insights to prove it? Get a conversation designer/linguist on board.
