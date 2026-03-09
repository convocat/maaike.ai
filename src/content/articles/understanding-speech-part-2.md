---
title: "Understanding speech — Part 2"
date: 2020-04-04
maturity: complete
tags:
  - conversation-design
description: "Want to know what you can do to make your voice action sound more speech-like? Part 2 covers backchannelling, discourse markers, and deixis."
draft: false
---

Want to know what you can do to make your voice action sound more speech-like? Let's continue with part 2 of my [[understanding-speech-part-1|speech primer]] for conversation designers, in which I discuss backchannelling, discourse markers, and deixis.

## Incomplete sentences and backchannelling

When we talk, we hardly ever speak in full sentences, as anyone who has ever tried to analyze a dataset of phone recordings can testify. We stop mid-sentence, change our minds, take a different turn, stammer, cough, retrace our steps…

And miraculously enough, this doesn't pose too much of a problem in most conversations. This is partly due because of something we call backchanneling. In his seminal article *On getting a word in edgewise* (1970), linguist Victor Yngve posed the idea that when we engage in conversation, we don't use one, but two communication channels at the same time.

### Front and back channel

The speaker communicates through the front channel. This is the channel of the person that 'has the turn' and directs the primary direction of the conversational flow. The listener, however, also communicates. By making sounds of approval, understanding, doubt, encouragement anger or surprise, listeners indicate that they're still following the speaker, and provide active encouragement for the speaker to go on talking (or stop when we're fed up :-) ). Providing this kind of cues without actually taking the turn in a conversation is called backchannelling.

### Backchanneling cues: types and categories

In their paper *The Effect of Back-Channeling Cues on Motivation to Continue Human-Machine Textual Interaction*, Naeun Lee and Sangwon Lee refer to four types of backchanneling cues:

1. **Basic Interjection:** general, non-verbal cues for acknowledgment, like Yes, Yeah, Hmm…
2. **Linguistic response:** verbal cues for expressing agreement, like I see, Indeed, OK
3. **Emotive Interjection:** cues for expressing certain emotion, like surprise (A-ha!) or disbelief (Really? No way!)
4. **Repetition:** repetition of a part of speaker's utterance (I went to town yesterday. — To town?)

These four types can be grouped into two categories:

- **Recognition cues:** basic interjections and linguistic responses, which both signal acknowledgement of what the speaker said through the front channel.
- **Continuers:** emotive interjections and repetition are both used to sympathize with the speaker.

### So…why is this important for my chatbot or voice assistant?

Having a bit of knowledge of how backchanneling works, can help you improve your bot in so many ways: add some recognition cues for instant conversational content. Design a continuer strategy for your bot, which specifies which vocabulary your bot uses to keep people engaged. When to drive the conversation a bit more, and when to double down.

## Discourse markers

Discourse markers are the signposts of your conversation. We use them to show the other that it's their turn to speak or to get confirmation. To shift focus or call for attention.

- *Well, now that you mention it, yes, we do have a cheaper one available!*
- *Right, let's get you all set up!*
- *So we'll leave it at this, ok?*
- *Let's move on, and select your pizza toppings.*

### Discourse markers vs. backchannelling cues

Discourse markers and backchanneling cues can look really similar. Yet, there's an important difference to make: discourse markers are ways of structuring your conversation. They are typically used on the front channel, by the person/bot who has the turn, and is speaking.

Backchanneling cues, on the other hand, are means of encouraging and acknowledging what the speaker says, without taking over the turn. They are means for a listener.

### Not all discourse markers are equal

Mind you, there's a whole category of discourse markers that refer to visual characteristics of written text, like 'above, below, in conclusion, next, before'. These don't work very well for speech, because in conversation, there are no pages to refer to.

## Deictic markers

Deixis literally means 'pointing at something with your finger'. And deictic markers do just that: they replace familiar concepts with reference words like 'here', 'there', 'this', 'that', 'closer' or 'further away'.

The main characteristic of a deictic marker is that it refers to something relative to the speaker. And that makes it a great means for connecting with your conversational partner, even if it's a voice assistant.

Deictic markers come in three flavours:

- **Person deixis:** reference to the person that's involved in the utterance. These are usually pronouns, like you, me, they.
- **Space deixis:** locations that are relevant to the utterance, like this, that, here, there.
- **Time deixis:** words that refer to time, like now, then, when, but also yesterday or tomorrow.

Deictic markers are great because you can use them for both your user and your voice bot: they both have a space around them, relative to themselves. So by using deictic markers, you can build a truly conversational space in which the action is happening!

Deixis also helps you keeping your bot persona consistent:

- Is your bot an I or a we? Does it speak as a single person, or on behalf of your team?
- What is your bot's physical space? Do you have an idea of where your voice bot, skill or action will be used? And what does this mean for the deictic markers your bot can use?
- Keep in mind that the main reference ideally is the user, rather than the bot. So use more you's than I's, and refer to the user's deictic space, rather than your bot's. This keeps your bot from becoming too self-absorbed.
