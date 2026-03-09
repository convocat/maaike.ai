---
title: "Context engineering? Let's call it design"
date: 2025-07-06
maturity: complete
tags:
  - prompt-design
  - conversation-design
description: So...should we all go and explore context engineering? Yes, we should. And chances are that you've been doing it forever already.
draft: false
---

So...should we all go and explore context engineering? Yes, we should. And chances are that you've been doing it forever already. Why? Because it's not engineering. It's design.

## What is context engineering

To quote Andrej Karpathy: "People associate prompts with short task descriptions you'd give an LLM in your day-to-day use. When in every industrial-strength LLM app, context engineering is the delicate art and science of filling the context window with just the right information for the next step."

## Why is this design?

**Simple example: cookbook recipe**

The core of a recipe for apple pie would be the instructions: the step-by-step explanation of things you have to do. This is how most people prompt: do this, do that.

However, a good recipe tells you more:

- what do you need to get started, like ingredients, what utensils and tools you need
- preparations you need to take before you start following the instructions, like preheating the oven
- explanation of concepts, like dough rising, and the workings of yeast
- checks and balances that allow you to see whether you're still on track, and compare your outcomes to the desired end state
- factual information, like the exact amount of each ingredient, baking times, oven temperature
- cautions and warnings
- recommendations and tips

## Structured and semantic building blocks

These are what we call semantic information types, the building blocks that make up a good recipe. Recipe itself is an information unit as well: a container that holds the blocks that bring together all pieces of information that you need to create delicious food. This is what I typically teach my students to include in their system prompts as well: include any relevant information that will make the prompt outcome more succesful. And include it in a structured way, with clear headings.

## Advantages

The big advantage of this approach: if designed well, each block and map forms a self-contained, semantically labelled, machine readable, re-usable and traceable piece of information. This makes troubleshooting and managing your prompts way easier.

## Not new

What's interesting, is that we've been context designing for humans for a very long time already. It's commonly known as information architecture, user-task analysis, instructional design, topic-based writing, information mapping, use case analysis, technical authoring, flow design (especially when designing for API-integration). And we've been doing this for humans for a long time already.

So let's call it context design or context architecture from now on. So that we recognise that this is not new, and take the opportunity to invite authors and designers to the table. That way, your GenAI solution will really start to fly.
