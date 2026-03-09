---
title: Prompt Design Patterns
date: 2026-02-15
maturity: complete
tags:
  - llm
  - prompting
  - patterns
description: A catalogue of reusable patterns for structuring prompts effectively.
---

After working with language models extensively, several recurring patterns emerge. These aren't rigid templates — they're flexible patterns that can be adapted to different contexts.

## 1. The Scaffold Pattern

Start with the broadest possible instruction, then progressively add constraints and context. This builds shared understanding between you and the model.

See [[prompt-scaffolding]] for more on this idea.

## 2. The Persona Pattern

Give the model a specific role or perspective. This focuses its responses and reduces generic answers.

## 3. The Chain Pattern

Break a complex task into a sequence of simpler steps. Each step builds on the output of the previous one.

## 4. The Reflection Pattern

Ask the model to review and critique its own output before producing a final version. This often catches errors and improves quality.

## When to use which pattern

The choice depends on the task complexity and the desired output format. Simple questions rarely need scaffolding. Complex creative tasks benefit from chaining and reflection.
