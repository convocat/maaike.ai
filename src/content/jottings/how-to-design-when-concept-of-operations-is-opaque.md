---
title: "How to design when the concept of operations is opaque?"
date: 2026-05-05
maturity: complete
draft: false
type: post
tags: [llm, mental-models, agentic-ai, thinking-in-public, future-of-work, concept-of-operations]
description: "On working with Claude: unlike traditional software, LLMs have no pre-baked concept of operations. You have to define it yourself, and that requires an expert-level mental model."
ai: "100% Maai"
develops: conference-talk-guildford
triples:
  - ["LLMs", "lacks", "Concept of operations"]
  - ["Traditional software", "contrasted-with", "LLMs"]
  - ["Agentic AI", "requires", "Concept of operations"]
  - ["Context engineering", "reinforces", "Concept of operations"]
---

*Part of [[conference-talk-guildford]].*

I think I'll start calling Claude 'Maxim 4' from now on. The challenge with Claude: it will just assume a concepts of operations and act on it. Even if that doesn't align to what you're used to, or to what makes sense. In this case, when I asked it to move a file, it defaulted to deleting it and creating a new one with the same contents. Or just deleting the old one. Or rewriting it, overwriting my own texts. 

The beauty of traditional software is that it typically comes with a concept of operations that's quite explicit and very much pre-baked, so you can start working on the actual task straight away, rather than having to build half of your application first. Of courese, there's things like macros and templates that will give you even more superpowers if you know how to design them. But in an average text processor, you can pretty much rely on the fact that 'Save'  will save your document. And nothing else. You don't have to explain the basics. 

The annoying & amazing thing with Claude and others, is that it's up to you to define the concept of operations: what it is, what it's supposed to do, and also: how it's supposed to do it. At least, if you want to build something that's even slightly more than a simple prompt-output pattern. 

On the one hand it's great, because it gives you designer & developer super powers: envision it, and you can build it. 

But only if you know what it is that you want to build, and only if you understand the underlying workings and first order principles of how software behaves. Which means that you need an expert-level mental model of the systems that you're working with: actualy hands-on experience, a good grasp of commands and operations, and conceptual knowledge of how objects and artefacts in your system behave. 

And never assume that Claude will do the obvious, or the thing that makes sense. Always check on how even the most basic operations are performed. 

With that, there's a real question hanging in the air: if I need to keep checking even the most basic operations and build guardrails, harnesses, evals, and what-have-you, will I ever reach the point where I have an LLM-based system that proactively does the sensible thing? And if I am getting more productive, is that because of the LLM, or me consciously deciding to 'never mind, I'll do it myself so I at least know it's done correctly?' 

I'm striking a pretty good balance at the moment: I do spend more time writing and researching. But it's very easy to imagine a reality where we spend so much time harnessing Claude that the actual work doesn't get done. 

Mind you, I don't think this is an LLM-specific problem: something similar happened with the rise of bureaucracy and outsourcing common sense to 'the process' and hierarchical decision making. I've worked in situations where the correction of a typo in a manual required three signoffs and so much administration that forgetting to do the actual correction was a real risk. 

Hm

![](/images/guildford-session-note-2026-05-05.png)
