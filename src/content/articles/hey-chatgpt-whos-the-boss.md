---
title: "Hey ChatGPT, who's the boss?"
date: 2023-01-14
updated: 2026-03-15
maturity: complete
tags:
  - conversation-design
  - prompt-design
description: "Why does ChatGPT seem to 'know' things it shouldn't? The reason might be much more mundane than you think."
draft: false
ai: "100% Maai"
---

Something interesting has happened this week. How can ChatGPT return that Elon Musk is Twitter's CEO when that happened long after its training cut-off date?

Let's start with my usual disclaimer: ChatGPT is a probabilistic model. It strings together words based on the probability that they may occur together. It doesn't know anything of the outside world. It doesn't understand.

OK, rephrase: why does ChatGPT generate this particular sequence of words?

The general opinion seems to be that ChatGPT somehow managed to access the internet to retrieve this one single nugget of information. This seems unlikely to me: ChatGPT's training model was cut off in September 2021.

Some people reacted that it might be because of mysterious forces having trained the model with this one single fact. That too, seems rather implausible in my eyes. ChatGPT's learning is heavily supervised, so just injecting new knowledge based on end user input doesn't sound like something that OpenAI would allow to happen.

Human error on the AI trainer side might be a more probable cause. There seems to be a lot of human work involved behind the scenes, and it sounds like the human jobs might be quite error-prone. So perhaps someone accidentally released a more recent dataset?

## Or might it be chance?

One cause that I haven't seen mentioned yet, is that this might be a case of pure chance (or rather probabilistic distribution). ChatGPT is a probabilistic model, which means that it strings words together, based on the likelihood that these words occur together in certain contexts in the training data.

Mightn't it be that CEO, Twitter and Elon Musk simply co-occur a lot in ChatGPT's training set?

- Elon Musk is a CEO of several companies, so there's definitely a high probability of those words co-occurring together.
- When I ask ChatGPT about Elon Musk, it spontaneously starts about how active Musk is on Twitter and how controversial his tweets often are. This too, is a sign that there's probably a lot of training data about Musk's Twitter behavior.

Could it be that a chance combination of these three words accidentally corresponded to a real life fact in 2023? The chances might be a million in one, but as my favorite author Terry Pratchett stated:

> Scientists have calculated that the chances of something so patently absurd actually existing are millions to one. But magicians have calculated that million-to-one chances crop up nine times out of ten.

## Related

- [[designing-for-doubt|Designing for doubt]]
