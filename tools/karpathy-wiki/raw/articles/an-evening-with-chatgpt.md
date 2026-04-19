---
title: "An evening with ChatGPT"
date: 2022-12-04
updated: 2026-03-15
maturity: complete
tags:
  - conversation-design
  - prompt-design
description: "Part 1: you can call me Al. A conversation designer's first encounters with ChatGPT."
draft: false
ai: "100% Maai"
---

If you've been online in the CxD community over the last few days, you've probably heard people talking about ChatGPT, OpenAI's newest Large Language Model. It's the youngest branch on the GPT family that brought us GPT-3 and BlenderBot, and I must say, it's really impressive. Almost too impressive even?

I've been chatting with ChatGPT for a couple of evenings now, and there's a lot to unpack. In this article, I'll have a look at a classic basic, introductions, as well as how ChatGPT handles logic (spoiler: it's hilariously good).

## Basic intros

Assistant returns a nice intro that ticks all familiar convo design boxes: introduction, capability statement and a prompt. And when I ask for its name, it gives a hint that it's not a person, which is a nice touch for keeping it real and realistic. So far, so good.

## You can call me Al

Now let's try some context. I don't really like Assistant as a name, so I ask whether it's OK to change it. There are quite a few things happening here. First of all, ChatGPT understands who the 'you' is that I'm talking about. This might look trivial, but it's pretty amazing: many CUIs struggle with pronouns.

Also, adding 'if you like', indicates that it gets the subtleness of my request. Asking whether I can call something by a different name is a different game than asking 'where is the nearest Starbucks'; in the first case, there might be a chance of me losing face if the request is denied. ChatGPT handles this really gracefully.

And what strikes me after chatting with ChatGPT for a while is that every time I ask something that approximates a human-human conversation, it will consistently remind me that it's not a human. This is a great example of how a consistent bot persona can help instill trust (and also, that a bot persona doesn't equal 'human-like').

## Coreference

Things get even more impressive when I try to steer ChatGPT off the track a bit. ChatGPT recognises that I called it Al a few turns earlier (remembering the context), keeps in line with its persona, zooms in on my specific statement about talking to it yesterday and replies to that specific statement by saying it therefore can't have memories of talking to me. And then returns to its main storyline…can I finally help you with something please?

This means that ChatGPT is keeping track of the context of the turns (being named Al), the context of its persona (not being a human) and the context of being human (able to have memories, able to have a conversation) at the same time.

## Logic and inferences

At this point I wondered, if ChatGPT can handle coreference and context, how would it fare with inferences? The classic test for this is to offer a syllogism:

- Major premise: All pigs can fly
- Minor premise: John is a pig
- Conclusion: John can fly

Rather than solving the syllogism, ChatGPT gave me a bit of a lecture on the physical inability of pigs to fly! I had to phrase it as a hypothesis before getting a reluctant admission that the syllogism might be valid, with a slightly worried addition that in reality, pigs really, really, really can't fly.

Compared to Blenderbot, Facebook's GPT-3 implementation, this is quite remarkable. Blenderbot simply believed everything you told it. This response from ChatGPT is the closest that I've seen a large language model upholding a universal truth and refusing to go along with my narrative.

## Staying in character + keeping track of context = humor?

By consistently staying in character and taking everything I say for its literal meaning again and again, ChatGPT almost brings a sense of humor to the table. Unintentionally perhaps, but so much more palatable than some of the dad jokes that I come across.

## Related

- [[designing-for-doubt|Designing for doubt]]
