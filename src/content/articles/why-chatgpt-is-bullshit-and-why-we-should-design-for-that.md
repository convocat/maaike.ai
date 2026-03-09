---
title: "Why ChatGPT is bullshit (and why we should design for that)"
date: 2023-01-07
maturity: complete
tags:
  - conversation-design
  - ai-ethics
description: "Surprisingly few people mention the fact that ChatGPT is, in the end, one big word-string-generator on steroids."
draft: false
---

One thing that strikes me in the general communication on ChatGPT, is that surprisingly few people mention the fact that it's, in the end, one big word-string-generator on steroids (or a Stochastic Parrot, as Timnit Gebru and Emily Bender called it in their 2021 paper outlining the risks of LLMs). Much like the autocomplete on your phone, ChatGPT will take a word and calculate which next word is likely to fit best. It does so based on an incredibly huge set of training data.

The upside of this approach is that ChatGPT is outstandingly conversational: each output is unique, in that it's a probabilistic concatenation of different words. And because ChatGPT has also been trained on conversations, it knows how to talk. Very convincingly. It recalls context, and switches topics so easily that, at times, it's easy to forget that you're not talking to a human.

The downside may take a while to digest. ChatGPT (and any other large language model) doesn't write. It doesn't design. It doesn't copy a text from one source and then returns it in a conversational format. Instead, it simply strings together words based on the chances that these words might co-occur in a data set. This means that it literally doesn't know what it's talking about. It doesn't know what's true.

This will not change with better training. And this should be high on our 'what-to-think/worry/be-critical-about-in-2023' to do list.

## Grice and all…

OK, I hear you think, now why is this a problem? I can go and fact check the output myself, right?

In theory, yes, you could. But the conversational talent of ChatGPT will make it very unlikely that you will. That's because when you and I talk, we try to stick to Paul Grice's co-operative principle. Especially maxim number 2, the maxim of quality, which states that we're trying to be truthful, and won't give information that is false or that is not supported by evidence.

So in human conversation, we don't feel the need to fact check everything the other person says. Because we don't have to, we can rely on the given that in most of our conversations we'll be talking to someone who cares about truth.

Add the fact that we're naturally lazy in our conversations. We tend to optimise for short and effective communication, so the less energy spent on conversations, the better. This doesn't sit well with learning a whole new habit of fact-checking a conversational AI.

## Me, myself and I

This means that we're left with unreliable information in a format that's evolved to be deemed reliable. While Google isn't a very objective search engine, there's one thing that sets it apart: it shows multiple results. The user interface is an open invitation to compare and explore. It is a reminder that there might be multiple perspectives on your question.

## But all that doesn't make ChatGPT bullshit! Or…does it?

Well, in a very specific sense, it does. It's the sense of bullshit that Harry G. Frankfurt uses in his lecture and essay *On Bullshit*, that he wrote 20 years ago.

> "Bullshit is the lack of concern about the difference between truth and falsity. Motivation of the bullshitter is not to say things that are true, or even to say things that are false. It's serving some other purpose. The question of whether what he says is true or false is irrelevant to that ambition."

This, in a nutshell, is where my more existential concerns about LLMs stem from: an indifference to truth.

## Design Challenge: Concern & care about truth

ChatGPT, as an LLM, cannot have any concerns, it literally can't care about truth. So when I'm saying it's indifferent to truth, that's a very literal statement, not a judgement. Being concerned, caring about truth, that's our domain, that of the humans. And it's up to us to design for that.

And here of course, it's where it gets interesting. Because I don't believe LLMs will go away. So it's up to us, humans, designers, to start designing technology that can keep us caring about truth.

This might sound very abstract, but it can start with a very concrete thought experiment: what kind of interaction model might allow for the conversational advantages of LLMs, while at the same time supporting us in exploring information, checking facts and tracking sources? What interaction model might support us in recognising true from false? In staying naturally curious? This is what I explore in [[designing-for-doubt]].
