---
title: An evening with ChatGPT - the september 2023 edition
date: 2023-10-01
updated: 2026-03-11
maturity: complete
tags:
- ai-ethics
- conversation-design
- llm
- data-consent
- chatgpt
- generative-ai-design
- role-of-ai
- critical-thinking
- llm-hallucinations
themes:
- Framing a useful feature as a data-extraction mechanism is a deliberate design choice, not an oversight.
- The entanglement of chat history access, the browse feature, and training-data consent in a single toggle exposes a cynical bundling strategy.
- Naivety about AI products is understandable but increasingly costly — users must read the fine print of every new feature.
- The browse feature's poor quality makes the data trade-off even harder to justify, undermining OpenAI's implicit value proposition.
- Grounding and factuality in LLMs are being instrumentalised as marketing levers rather than genuinely addressed as epistemic problems.
triples:
- [ChatGPT browse feature, requires, Data consent toggle]
- [Data consent toggle, leads-to, Training data collection]
- [ChatGPT, violates, Consent design]
- [ChatGPT browse feature, lacks, Usability]
- [Browse feature, requires, Training data collection]
- [Browse feature, requires, Chat history]
- [Browse feature, characterised-as, Data collection mechanism]
- [ChatGPT, lacks, Ground truth]
- [Browse feature, counters, LLM hallucinations]
- [Browse feature, risks, User data privacy]
description: Did I get this right? I can only use the ChatGPT browse feature when I let OpenAI collect my data?
draft: false
ai: 100% Maai
---

So much is happening with ChatGPT this month that I thought it would be interesting (and way faster) to record some sessions with ChatGPT and me again! In this first recording, I have a look at the new browse feature. Or at least, that's what I planned. Until I stumbled upon this little toggle.

It may look quite innocuous, but by switching it on, you allow ChatGPT to use all your conversations as training data for their models. And ironically, this toggle needs to be switched on, not only to access your chat history, but to enable the browse feature.

## Give me your data please

So what looked like an exciting new feature that might help to bring some kind of grounding and factuality into our interactions with this LLM, turns out to be basically yet another way to collect data for model improvement. Because of course, when we can browse the internet through ChatGPT, and perhaps move away from our traditional search engines, that will cause a spike in data input, right?

## Naive

Call me naive, but I really wasn't aware of this. Were you? Fortunately for now, the browse experience within ChatGPT is subpar, to say the least. So if browsing is your main reason to turn on this data toggle, I wouldn't bother if I were you. But more on that in a next video.

*(This was originally published as a video post on Substack.)*
