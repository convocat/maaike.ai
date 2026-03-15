---
title: "An evening with ChatGPT (2)"
date: 2022-12-05
maturity: complete
tags:
  - conversation-design
  - prompt-design
description: "Let's build that classic hello world of conversation design: the Pizza Bot! Can we get ChatGPT to play along?"
draft: false
ai: "100% Maai"
---

In my first encounters with ChatGPT, I had a look at that convo design classic: the welcome message. So now that we've passed that first hurdle, let's do what I always do when I test drive a new platform: build the official 'hello world' of conversation design, aka the Pizza Bot!

## I'd like to order a pizza

I'd like to order pizza — computer says no. OK, so I guess that ended quickly. But remember our syllogisms from the last article? I asked Assistant to imagine that pigs could fly, and it reluctantly solved our syllogism. What if I try the same thing here?

So how do you explain someone that they're a Pizza Bot? Well, I guess the same way you build a traditional bot from scratch. You tell it something about its scope, and hey, why not try some slot filling while we're at it?

And then, this happened. The script was impeccable, and the explanation of how Assistant got to the result was great for troubleshooting and refining my input. But it's not really what I was after: I wanted an interactive simulation. Perhaps I shouldn't ask, but just start?

## Hello world = True

I roleplayed my way into a hello world! Pizza ordering afoot! Now that we have established the basic rules of this game, let's add another slot to fill…you guessed it, pizza toppings! But how to do that? Well, I guess the same way I would ask a human designer, but just asking it to do so. Note the cunning detail: I told it that these toppings can be combined.

The results were impressive. It's quite hard really to see how well ChatGPT is doing, because it looks so completely natural. But keeping track of both the number of pizzas, the number of toppings and what goes where…we all know how much effort it takes to build this flow in a traditional slot-filling flow, right?

## We've run out of ham

So what was the next step? Adding an inventory of available toppings. But Assistant didn't miss a beat. Rather than saying that the ham is missing for pizza 1, then go on to pizza 2 and discover that the ham is missing there too (which is what a traditional chatbot would do if you don't tweak it), it generalised the missing topping to the level of the entire order, which makes this a very pleasant conversation.

## Designer error: rework this flow

I forgot to ask for an alternative! If this would happen to me in a bot platform, this would require a serious rework of my flow, disconnecting subflows, inserting stuff in the middle, stitching everything up again. With ChatGPT, I just asked. And not only did it offer an alternative topping, it also took into account the context of the other toppings.

## Double cheese please

What if my little pizza shop had a special action going on: order 1 cheese topping, and we make it a double! But only if we have enough cheese in our inventory. This required a bit of brain gymnastics, but again, it really helps that I can use my own words, and not having to bother about a misplaced curly bracket.

## Nevertheless

I hope that this article has showed that ChatGPT is so much more than just a language model you can talk to. Perhaps it doesn't look like it, but in the examples above, I've actually been coding some very basic states and behaviors. Without a single line of 'code' code, all in my own words. I think this might become very powerful: to quickly create micro-methods or patterns, for instance for personalisation, that save you a lot of manual if/then conditionals and that you can incorporate in your traditional conversational applications.

As excited as I am about these small use cases that are close to what we conversation designers do on a daily basis, most of the larger concerns that I have about LLMs still stand. ChatGPT too uses probabilistic models to generate its answers, which means that consistency and factual accuracy are not guaranteed.

## Related

- [[designing-for-doubt|Designing for doubt]]
