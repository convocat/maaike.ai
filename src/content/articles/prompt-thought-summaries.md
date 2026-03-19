---
title: "Prompt thought: summaries"
date: 2023-12-16
updated: 2026-03-15
maturity: complete
tags:
  - prompt-design
description: Our human-centered way of thinking about the writing process might not necessarily be the most logical for prompting LLMs.
draft: false
ai: "100% Maai"
---

Intuitively, you'd think that a summary presupposes the existence of a piece of content that needs to be summarized. The Dutch word for summary, 'samenvatting', reflects that quite beautifully: samen (together) + vatten (grasp/contain): you bring together the key concepts of your original text. You go from large to small.

But what if you flip the paradigm and start from nothing? I tried prompting an LMM into generating summaries in 2 ways: one with a core text to summarize, and one with just a few keywords. I prompted both with a target audience and the purpose of the summary. And the results were very, very similar. I'd even say that the second prompt performed better.

This is not very surprising, since summarizing evolves around the same core task: identifying key concepts, and writing a succinct piece of text around those concepts. Whether you come from a reductionist starting point (having a full text and needing to condense it), or from a constructionist starting point (writing something from just the keywords) doesn't matter that much. From a generative perspective, a summary is basically the shortest text form that still contains all they key concepts.

Even more, I find that LLMs struggle more with reduction tasks than with construction tasks. We humans have an extreme talent for summarizing in a way that makes sense; we apply all kinds of semantic & rethoric principles like foregrounding/backgrounding, identifying topic sentences and semantic roles, interpreting cohesion/coherence...lots of things that help us to deeply understand a text. LLMs, in comparison, basically take a container and try to condense the source text into that container no matter what. If it doesn't fit, LLMs (at least in my experience) resort to rather superficial condensation techniques, like switching to bulleted lists, rather than full texts. They don't automatically leave out irrelevant information. It takes quite a bit of linguistic prompting to explain them how to generate richer, denser, more useful summaries (I tried Chain of Density, but that doesn't really work that well for really long documents). And guess what? The prompt that eventually gave me the best summary, was the one where I deconstructred the entire source text until I identified just the key concepts and built the summary from there:

- key concepts
- short definition
- how are concepts related

Here, I basically told the model to disregard the text and start from scratch. But if that works, is there a need to include the source text in the first place? Not really. So if you're stuggling with generating accurate, rich summaries, try prompting for keyword extraction instead, and let the LLM take it from there.

It totally makes sense, and at the same time sounds so counterintuitive :-)

## Related

- [[prompt-scaffolding|Prompt Scaffolding]]
