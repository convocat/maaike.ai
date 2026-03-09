---
title: "Understanding speech — part 1"
date: 2020-02-13
maturity: complete
tags:
  - conversation-design
description: "A primer of voice and speech terms for conversation designers. Part 1 covers breath, prosody, pitch, tone and intonation."
draft: false
---

With voice assistants on the rise, you probably have heard of SSML as a way to make your voice assistant sound less robotic and more humanlike. To use SSML effectively, it really helps if you're familiar with some of the core concepts of speech. So I've put together a primer of voice and speech terms. Here's part 1, more to follow soon.

## Speech

Speech is the act of establishing communication between a sender and a receiver using sound. Speech is not written text.

'Duh…', I hear you say.

Yet, this is an important difference to note, because it influences the way you design your conversation. In written dialogue, a turn can be as long as you wish: your keyboard doesn't object, and as long as your customers don't mind a bit of reading, you can afford the extra text bubble.

In speech, not quite so. A turn in speech has a very different — and rather finite — boundary: breath.

## Breath

We cannot speak more words that our breath can carry. And we usually stop our speech way before that point. If we carry on too long, it gets really physically uncomfortable, both for the speaker and for the listener.

That's right, for the listener as well. And that's thanks to our mirror neurons: when we listen to someone else, we unconsciously tune in to their breathing. So if your conversation partner rambles on and on, chances are that you're holding your breath until he's finished.

Fortunately, we humans have a natural delimiter: there's a point in time where we have to breathe in again. But what about voice assistants that don't need to breathe?

So when you design your voice action, make extra, extra sure to use spoken sample dialog, to make sure that you're actually designing speech, rather than text. Create turns that pass the one-breath test, and use basic SSML to give your voice assistant some room to breathe.

## Prosody

Prosody refers to sound properties of entire utterances, rather than single words or sounds within a word. Examples of prosodic properties are intonation (the sentence melody), stress (where typical accent marks are placed) and the pitch (relative tone) of an utterance.

Prosody is a good term to remember, because this is what you'll be working with most when you apply SSML tagging.

## Intensity

Intensity is basically the volume of a voice; whether it's loud or weak, near or far away.

## Pitch

Pitch is what we perceive as a high or a deep voice. Pitch is determined by physical characteristics; it's what in technical terms is known as the perceived fundamental frequency. Women's vocal folds are typically shorter and thinner than men's, so they vibrate faster. Faster vibrating vocal folds lead to higher pitched voices.

Interesting fact: research into voice characteristics of transgender people has shown that pitch isn't the main characteristic that people use to recognise whether a voice is male or female. According to this research, a person's speech style plays a role too in determining a speaker's gender.

So, a high voice is not necessarily perceived as female if the speaker's speech style shows characteristics that are associated with male gender, or the other way round. This is interesting news for voice designers, because it opens up a world of possibilities to craft a wider, richer and more gradual palette of voices that do justice to the variety of people and voices that we meet all around us.

## Intonation

Intonation is what we recognise as the melody of someone's speech. It's also what makes languages so recognisable and characteristic. Each language has its own and unique intonation pattern.

When I studied English, way back in time, one of my tutors said that you really don't have to worry about the individual sounds of a foreign language: as long as you get the intonation right, you're virtually there.

English uses a three-steps-down sentence melody. Dutch moves in a smaller range than English, so we tend to sound a bit monotonous in English speaking ears.

To be continued in part 2, which covers backchannelling, discourse markers, and deixis.
