---
title: "The return of the button"
description: "Claude Code is reintroducing structured, constrained input: buttons, numbered options, limited choices. Which is actually IVR. And that might be exactly right."
date: 2026-03-27
maturity: draft
draft: false
tags:
  - conversation-design
  - generative-ai-design
  - prompt-design
  - claude-code
themes:
  - Structured input as safety measure
  - Constraints versus open chat
  - IVR patterns returning in GenAI
triples:
  - ["Claude Code", "demonstrates", "Structured input"]
  - ["Structured input", "counters", "Prompt injection"]
  - ["IVR", "metaphor-for", "Structured input"]
  - ["Structured input", "contrasted-with", "Conversational interface"]
ai: "100% Maai"
---

> Seed planted: March 27th, 2026 Claude Code is moving away from the unstructured conversation paradigm toward structured input: limited user input that you can simply select. It even has numbers for quick selection: THIS IS ACTUALLY IVR!! :-) )
>

When I just pivoted to conversation design in early 2018, voice was the big hype: Alexa was making waves, and Google smart speakers turned up in many households. As a result, most of our design practise focused on conversational and 'voice first': frictionless interfaces were considered those that you could talk to in your own words. VUI over GUI. The popular consensus, at least for a while, was that buttons were a no-go: cloinky relics of a past that included endless IVRs and 'Press 0 to talk to an operator'. A frictionless interface was an interface that you could talk to, from beginning to end.

And there was something to say for that of course. Focusing on conversational taught a generation of designers how to design clear, unambiguous, granular content that was accessible and easy to understand. It helped us to focus on what really matters: our customers and their problems. Meeting them where they are. And I still think that user's ability to explain their problems in their own words, forcing us to really understand, is one of the biggest shifts forward in UI design. 

### Conversationl = effective?

But I'm not so sure whether conversational interfaces necessarily improve the task completion rate or the user success rate: human language is notoriously ambiguous, so we spent hours and hours on training NLU models to recognise even more varieties and nuances of the same question. Did we get it right? Possibly; I've certainly seen conversational user interfaces that did a great job. 

So I'm wondering whether their success was because of them being conversational per se (note to self: research whether any study has been done on the correlation between conversational and task completion rate or customer success rate). Rather, these bots tend to do something really well: solving real problems, instead of just answering questions and leaving the customer to still figure things out from there. 

Interface-wise, 

Back to the future: the reintroduction of GUIs?

Buttons and IVR are traditionally seen as something to move away from, relics from the past, that were all about friction, cloinkyness.

And now, Claude is reintroducing them.

Why? Exactly for that: to introduce constraints on what people can input.

### Back to the future: GenAI introduces more and more GUI elements

Key concept in my own thoughts: in GenAI, just talking to it is way too unstructured. Annoying for people, because they need to know how to write to prompt effectively. Annoying for systems & security, because unconstrained, free text input can pose a security threat, or upend the original working of the system.

Example: parts of the system prompt must be user editable. But just offering that part of the system prompt as a free text input field makes them vulnerable for prompt injections. Also, have to be careful: unbridled changes may change the core working of the AI application.

Deliverables: a quick LinkedIn post and an article.
