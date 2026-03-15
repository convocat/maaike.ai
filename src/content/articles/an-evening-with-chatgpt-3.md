---
title: "An evening with ChatGPT (3)"
date: 2022-12-11
maturity: complete
tags:
  - conversation-design
  - prompt-design
description: "Can ChatGPT take over some of my work as a conversation designer? Can it create an intent model for me?"
draft: false
ai: "100% Maai"
---

In my previous articles I had a look at some core CxD components, and showed how you can let ChatGPT think it's a pretty good pizzabot. In this third installment, let's explore whether it can help me with NLP tasks, like, I don't know, creating an intent model from scratch. After all, it's an LLM, so some of this should sound familiar.

## Let's revisit the pizza bot

When I built the 'Hello world pizzabot' in ChatGPT, I provided quite a lot of prompts and logic, with pretty amazing results. Some of you asked whether ChatGPT would be able to be a pizzabot straight out-of-the-bot, with just the prompt 'Pretend you're a chatbot for ordering pizzas'. And what do you know — it produced a very plausible and usable bot, without me specifying anything in advance.

## List the intents and entities

ChatGPT listed a number of very useful intents. Like adding additional toppings, and some change intents as well. These might seem trivial, but in practice, they do often make a difference in usability.

Considering that there's been no input from my side, this means that it's really good at spitting out familiar use cases at the right level of granularity. Either that, or we've been putting some really great pizza bots out there for ChatGPT to train on!

## Training phrases

Well, I guess that if intents are possible, ChatGPT might as well populate them with some training phrases. Of course, the training phrases were a bit monotonous and formulaic, and when I tried to make them more user-like, it struggled. Perhaps I wasn't specific enough and should have asked for intra-intent variation.

## So what do you know about language then?

After some initial hiccups, I got ChatGPT to start some basic text processing, like counting the number of words. And from there, let's check some basic grammar knowledge. This shouldn't be a problem for an LLM, I think. And indeed, ChatGPT did really well: parsing a sentence, identifying phrase-level analysis, two prepositional phrases. Easy peasy.

But when I tried rewrites, something interesting happened. ChatGPT was capable of doing a rewrite without prepositions, but it only applied it to the first prepositional phrase. It correctly identified 2 prepositional phrases earlier on, so I'd assume that it identified two prepositions, right? Wrong.

That's the entire problem with ChatGPT. It can appropriate stuff really nicely, but it can't nail down logic, language or facts very well.

## Recap

- ChatGPT can generate a list of obvious and less obvious intents and entities for a non-existing, but familiar chatbot quite easily.
- It won't give you a lot of real-life training data, nor solve some of your real-life recognition problems straight out of the bot, but it looks promising enough to keep exploring further.
- When it comes to grammatically parsing sentences, I can't get my finger behind why ChatGPT does the things it does yet. More to explore here too!

## Related

- [[designing-for-doubt|Designing for doubt]]
