---
title: "Bye bye Alpaca...knowledge as the missing fundamental?"
date: 2023-03-26
maturity: complete
tags:
  - ai-ethics
  - prompt-design
description: "Wow, that went down fast!"
draft: false
---

You don't have to be a machine learning model to discover a pattern here…Stanford Alpaca apparently has joined the ranks of Tay, Galactica, and Sydney/Venom. Alpaca was announced last week as a model that fine-tunes Meta's LLaMA AI using OpenAI's text-davinci-003 at an incredibly low price of $600, and needing only a few hours.

However, the public demo apparently suffered from hallucinations so much that the creators decided to shut it down again (cost was another factor). The model and training data are still available on GitHub.

## Hallucinations

I'm really curious: can we ever 'solve' hallucinations if we don't change the underlying concept of operations of an LLM? I don't think so, tbh. In most of my test runs with LLMs, I found that, as soon as an LLM runs short of data, it starts to confabulate stuff, rather than saying that it doesn't know.

And I guess it can't tell you 'I don't know', because that would require an absolute state of TRUE/FALSE. And an LLM can only approximate that point. Yes, we can train it to say 'I don't know' whenever the probability is below a certain level, but that's just not the same as having this as an inherent capability, is it?

## Missing fundamental

Bit of a weird comparison, but for me, chasing truth in a LLM feels like having to tune a pair of timpani/kettle drums. Because of their parabolic shape, they don't have a well-articulated fundamental pitch. So you have to tune them on their (inharmonic) overtones. Which only gives you a tuning by approximation. You suspect it's there, but you can never quite catch it.

![Set of timpani](/images/articles/bye-bye-alpaca/timpani.png)

Knowledge as a missing fundamental…I know, but hey, it's Sunday :-) *(I revisited this idea later in [[llm-hallucinations-knowledge-as-missing-fundamental|a follow-up post]].)*
