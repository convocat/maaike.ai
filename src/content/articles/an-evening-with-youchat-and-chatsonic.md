---
title: "An evening with YouChat and Chatsonic — with a bit of a twist"
date: 2023-02-15
maturity: complete
tags:
  - conversation-design
  - ai-ethics
description: "Both can access the internet and retrieve recent information. Let's take them for a test drive."
draft: false
---

With the hype on ChatGPT hardly over, January 2023 saw 2 new GPT3.5 models: YouChat and Chatsonic. Both can access the internet and retrieve recent information, a feature that ChatGPT is still lacking. This means that, in theory, these models could be Google killers. Let's take them for a test drive and see how well they do.

Spoiler alert: something crazy happened right at the end of my test drive.

## Retrieving information from the internet

So, with Internet access as the unique selling point for both models, this is of course what I'd like to try out first. Let's ask a question that needs the model to understand context, and to retrieve recent information: 'Hi, can you tell me yesterday's news?'

I chuckled when I got YouChat's reply. It seems like it took 'yesterday's news' a bit too figuratively, and returned a list of old, non-relevant news. This is a nice example of semantic ambiguity or connotation/denotation: words can have a literal meaning or a figurative one, and when we talk to one another, we humans are true masters in detecting which of the two is meant.

For machines, this is a lot more difficult. I suspect that YouChat interpreted my question in the figurative way, which meant that it didn't return news from the day before yesterday, but *yesterday's news*; that is, news that's no longer relevant. Creative for sure, but useful…not so much.

Even though YouChat can generate a statement that includes a correct source date, it seems to struggle with dates as single entities that should be linked to something else. Which makes me wonder: does it even know when yesterday was then? Apparently not.

## How does an LLM know which day it is today?

And what seemed like a defect in ChatGPT just a few days ago, now all of a sudden looks like a rather smart move. An LLM doesn't have an underlying database, or any kind of timestamp logic. It's an on-the-fly generation of a text string, based on probability. An LLM can't refer to anything in the outside world. For ChatGPT, this doesn't matter, because it doesn't pretend to be up-to-date and therefore doesn't have to know the date.

Chatsonic and YouChat, on the other hand, do claim that they can return recent information. And as you can see in the examples, both models really struggle with cohesively and consistently determining the absolute value of an adverb of time, like *yesterday*. To know which date yesterday refers to, you need to have internal knowledge of the logic of yesterday, i.e. that it is the day before today. And if you don't know that today can refer to a date, well, then you're basically kind of lost.

## Non-existing links: with stochastic parrots, truth is optional

So let's ask Chatsonic to give some links to video reports. A whole list of links for me to follow and learn more. So I clicked every one of them and…

These links don't exist. Not a single one of them. They're made up. By a stochastic parrot.

Unfortunately, YouChat doesn't fare much better. These links too are made up and don't exist on the internet.

## And here's where it got crazy

I asked about my own website. YouChat did another stochastic parrot: it made up a website that doesn't exist and provided a nice backstory to go with it. But Chatsonic... seriously???

*"Sorry, I made a typo"*

I mean, seriously? An LLM saying it made a typo? What kind of lousy excuse is that? An LLM can't type, it can't make mistakes (because it doesn't know right from wrong), and an apology feels so inappropriate here, like it actually cares about giving me the correct information, whereas in all LLMs, truth is optional.

I'm quite surprised by my own reaction to be honest. This felt very different from ChatGPT's stubborn refusals to answer, or some of the hallucinations that I've seen in most LLMs. In those cases, there was a clear contract between me and the LLM: the model doesn't care about truth, it basically strings together words on a probabilistic basis and that's it.

In this case, something was different. It felt like someone manipulating my own reality. Here we have a LLM that pretends to care about truth. It not only apologises, but by stating it made a mistake, it gives the impression that it did know the correct answer, but it simply made a typo.

And thanks to the wonderful essays of Harry Frankfurt, I can give words to that experience: this little conversation came across as a lie.

## So why does this matter?

A hyperlink is a reference to a document that lives on the internet. That link is a link to an anchor point: the document is either there, or it's not. But it's not just documents that are referenced in this way: people, places, entities, events, things…they're all uniquely identifiable on the internet by a hyperlink. This is the beating heart of what makes the internet and most parts of the connected digital world. And these links are our safeguard against fake news. Fake information. Fake reality. They are our anchor point to reality.

So if there's a whole wave of bots entering the web sphere that happily and carelessly messes up the digital reality that has become such a major part of everybody's lives by making up fake identifiers, and then pretends to lie about it, that should be a concern. Especially because I'm not sure if we can solve this challenge by staying on the LLM path.
