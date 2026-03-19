---
title: Conversational interfaces are not easy
date: 2023-09-29
updated: 2026-03-11
maturity: complete
tags:
  - conversation-design
  - prompt-design
description: "Usability challenges of writing with AI: let people write!"
draft: false
ai: "100% Maai"
---

Here's a little bit of fun and a small Sunday afternoon rant on trying to write with AI :-) TLDR: it takes forever before I have Jasper.ai writing me something that even remotely resembles what I have in my head, and by the time I do, I might as well have written the entire thing myself, because, hey, they're not my words.

Interesting, no? What does it mean when I say 'my words'? If ChatGPT writes in 'my style', does that make the words in the text my words? I don't feel like that's the case at all. Also, generating a text requires me an important extra task: I need to read the entire text to check what's in there, what it is that I want to say. This takes forever, especially because I need to do it each time I generate a text. This turns what might have been a 10 minute quick-write up into a long, tedious and totally inefficient 1-hour-long review, re-generate, repeat exercise. And to be honest: I don't enjoy it at all.

## Norman & Nielsen: early generative AI user behaviors

And what do you know, the next day, Norman & Nielsen published a very interesting study on early generative AI user behaviors. Even though the goal of this study was to research people's interaction with generative AI in chatbot interfaces in general (with no specific focus on article writing), there's quite some overlap with the more specific task of writing a blog or an article. Their findings show that the review-regenerate-repeat process that I experienced this Sunday, is one of two emerging new user behaviors: accordion editing and apple picking.

## Accordion editing

Accordion editing is basically the generation process itself: shortening or lengthening the text through a prompt.

The study further found that people use particular strategies for shortening and lengthening:

**Shortening:**
- **Forced ranking:** reduce the generated content by asking for 'the top 3', 'only the first five bullets'.
- **Reducing word count:** shortening the text by prompting for 'maximum 100 words', or 'cut in half'.

**Lengthening:**
- **Expand an existing idea:** for instance, when ChatGPT generates a list, users ask for elaboration on one specific list item.
- **Addition of missing content:** users use their own knowledge to point out that a generated answer might be incomplete and ask for that missing information.

## Articulation barrier

As this NN study shows, generating content with AI requires us to be specific about the desired output, especially the specific aspects. And that's not easy; to be able to prompt for exactly what you want, you need to know how to write a pretty good prompt first. This is what NN calls the articulation barrier, and it's a daunting threshold to cross, especially for novice users. But also for experienced writers!

I guess that my own frustration throughout the generative AI writing process stems from the fact that I want to do much more than shortening or lengthening: I want to change the cadence of a text, I want to stress other concepts, create other perspectives, change the word order in a text…in short: I want to write :-)

This is also one of the recommendations of the study: give users the possibility to directly edit the generated text, instead of only manipulating it indirectly through prompts.

## Apple picking: is AI making our work harder?

Apple picking is when a user wants to use previously generated content to create a new prompt for a new iteration of text. There's two ways in which users do this: either use the previous content as context for creating a new text, or use the previous content as the actual text that needs to be changed.

And here's where conversational interfaces show their real limitation: they're completely linear, so performing a non-linear task like brainstorming, writing, editing takes an excessive amount of scrolling to find, collect and synthesize the relevant pieces of text between lots of superfluous information that's also part of the conversation. And this takes its toll on user's cognitive load. So that in the end we might actually end up with AI not doing the work for us, but making our work a lot harder.

In my own daily use of AI, I always ask it to collect everything it generated in that session, and put it together in a well structured overview. But even then, it's still up to me to transform that into something that I might have written. And you'll probably recognise it when I say that I find rewriting someone else's text a lot harder than starting over from scratch.

## Recommendations: let people write

Norman & Nielsen ends their article by providing some usability recommendations to mitigate the current limitations of generative AI tools. And these might sound more straightforward than you might expect. They basically all boil down to: let humans write.

- Enable direct text manipulation, rather than just prompts.
- Allow for editing just a portion of a generated response (especially handy for long-form responses, like blog posts).
- Make text directly selectable.

Basically: give us word processor capabilities and let us write!

I love how usability studies like this one bring a lot more nuance to the user experience of AI-driven conversational interfaces. I'm looking forward to more, especially with more focus on actual writing tasks and professional writers as the target audience.

A little bit of historic perspective: this is not the first paradigm shift for writing. Obviously, the introduction of the printing press was one, but also the rise of personal computers in the 80s, and the introduction of the internet in the 90s. There's extensive research from that period on how people write. *The new writing environment* is a great publication for anyone interested in how those technologies changed our writing.
