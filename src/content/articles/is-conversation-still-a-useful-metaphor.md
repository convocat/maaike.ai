---
title: "Is conversation still a useful metaphor for human-machine interaction?"
date: 2026-03-15
updated: 2026-04-01
maturity: developing
tags:
  - human-machine-interface
  - interaction-model
  - design-metaphor
  - conversation-design
  - generative-ai-design
  - philosophy
  - llm
  - metacognition
  - anthropomorphism
  - conversational-grounding
  - agentic-ai
themes:
  - "Conversation metaphor as increasingly inadequate for GenAI"
  - "Anthropomorphism as a structural side effect of conversation design"
  - "Alternative interaction metaphors: delegation, thinking, note-taking"
  - "Metacognition and inner dialog as possible paradigms for human-AI interaction"
triples:
  - ["Conversation metaphor", "breaks-down-for", "GenAI"]
  - ["LLMs", "lacks", "Conversational grounding"]
  - ["Conversation metaphor", "presupposes", "Conversational grounding"]
  - ["Delegation metaphor", "better-fits", "Agentic AI"]
  - ["Conversation design", "risks", "Anthropomorphism"]
  - ["Indifference to truth", "incompatible-with", "Conversational grounding"]
  - ["Conversational grounding", "attributed-to", "Herbert Clark"]
  - ["Conversational grounding", "attributed-to", "Susan Brennan"]
  - ["Conversation metaphor", "leads-to", "Anthropomorphism"]
  - ["Conversation design", "leads-to", "Emotional labor"]
  - ["Note-taking metaphor", "better-fits", "GenAI"]
  - ["Metacognition", "better-fits", "GenAI"]
  - ["Situated action", "attributed-to", "Lucy Suchman"]
  - ["Inner dialog metaphor", "better-fits", "GenAI"]
  - ["LLMs", "lacks", "Situated action"]
description: "A collection of thoughts & ideas on alternative metaphors for human-GenAI-interaction."
ai: 100% Maai
linkedin_url: "https://www.linkedin.com/feed/update/urn:li:share:7440674715867766784/"
---

# Is conversation still a useful metaphor for human-machine interaction? Loose thoughts

<div class="tended">

Tended March 21: added sections on the problem with conversation and delegation as metaphor.

</div>

## Before generative AI

- chatbots and voice assistants were the primary conversational interfaces
- primary tasks: answering questions and self service, primary use cases: mostly CX and marketing
- rigid interaction model: turn taking/input-processing-output
- interaction metaphor closest to human experience: conversation/turn-taking
- goal: reduce friction in an experience that's so cloinky that no-one can be tricked into thinking this is a human. 
- rationale: the more the interaction between human and machine resembles human-human conversation, the easier it gets to talk to a machine, the more people will trust the interface.

## After generative AI

- chatbots become a generic name for all kinds of tasks and use cases: answering questions, performing tasks, generating content, workflow management, coding 
- different use cases require different input types: traditional question & answer/turn taking, but also simple data ingestion, or command line inputs. 
- and different types of output: often still answers to questions, but also deliverables, end results of a workflow: a summary, a document, a video, an image. That's not part of a conversation per se. Unless you consider a conversation about, say, holidays where someone shows you holiday pictures. Or if you consider your manager asking for a report and you handing over that report a few days later, a conversation. That's really stretching things. 

## Generative AI as a mimicry of human conversation

- [[why-chatgpt-is-bullshit-and-why-we-should-design-for-that|Large Language Models don't contain language]]
- General purpose chatbots like ChatGPT don't have agency, consciousness, an inner locus. Yet the surface form takes the shape of something that is familiar to humans: conversation.
  Without fullfilling the underlying contract that underpins human-human conversation:
- grounding in truth, shared sense making, sensory experience, [deixis](https://en.wikipedia.org/wiki/Deixis)
- so even in chat interfaces, the interaction happening is not a proper conversation.

## The problem with conversation

Conversations between humans rely on a lot more than two-way interaction: having equal stakes in the exchange, relying on an underlying contract with a lot of subtleties and intricacies, and a lot of non-verbal communication, implicature, and assumed trust.

Calling a human interaction with a chatbot a conversation has always been a bit of a misnomer, but with so many different use cases opening up with GenAI, we're really stretching that metaphor beyond usefulness.

There's also the anthropomorphism problem: conversation is inherently human-shaped. For many GenAI use cases, you don't want that. You don't need your code editor to feel like a person. You don't need your document processor to have a personality. Yet the conversation metaphor smuggles in [anthropomorphism](https://en.wikipedia.org/wiki/Anthropomorphism) by default.

And then there's the emotional labor dimension: when we design chat agents that converse, we're also designing agents that perform emotional work. See Helena Rodemann's [Personality is a labor system](https://thebodycopy.substack.com/p/personality-is-a-labor-system) on emotional labor by chat agents.

## Metaphor: delegation and delivery

Imagine having a large document set, and you need to perform a number of actions on it. With agent AI, yes, you might be inputting things through language, but chances are that most of the time, you'll be using a mix of language, traditional GUI elements like forms, upload fields etc.

After that, chances are that a small swarm of agents will take your request and run with it, leaving you standing with no clue of what's happening, and then returning you your requested deliverable. That's not a conversation anymore, that's more of a parcel delivery service :-) Of course, you could argue that after that, you could use turn taking to tweak the results, but nine out of ten, you'd be doing that directly in the deliverable, not through conversation.

## Alternatives to talking

Instructing, Commanding, Inputting, Entering, Prompting, Directing, Delegating, Dictating, Querying, Requesting, Dispatching, Steering, Cueing

## Who do we talk to? 

When we talk to a chatbot, does it help us to think we're talking to something else? 

Instructing: asking someone else to do something. Out of your hands, out of your brain.

What is the voice that we hear in our head when we chat with a textbot? Do we hear someone else's voice, or our own? And does it matter?

## Metaphor: thinking & inner dialog

What if we build an interaction model metaphor around thinking? With an audience of one: ourselves? What would such an interface look like? Assuming it's language based, a thought-centered interface would be very minimal, with no distractions, so you can focus on capturing thoughts and giving words to them. Thinking activates us, invites us to explore and expand mental models and to find words for new ideas. It helps us reflect on emotions, take actions, keep track, and discern true from false. All this is something that we typically do alone, in an [[writing-as-a-conversation-with-yourself|inner dialogue]]. Not in a conversation. 

## Metaphor: note-taking and meta-cognition

Note taking is an interesting concept in this light: it's what we do as a connected aside next to our main thinking or task: taking notes while talking, while reading, while studying. In this garden, I write on an empty canvas. Nothing there, not even a menu bar. But while writing, I also use AI for note-taking and task execution. Not as a conversation with another thing, but as a stream-of-thought note while writing: research this, create a new card for that, update my project in the background while I keep writing here. I'm not moving to the page margin or a separate entity for note taking, but do it right here, in my task domain. 

Front-end back-end doesn't really cover this, it's front-end front-end, or perhaps core-marginal. 
Also the notes become executionable. 

## Research papers

**Conversational grounding and its absence in AI:**
- Clark & Brennan, [Grounding in Communication](https://web.stanford.edu/~clark/1990s/Clark,%20H.H.%20_%20Brennan,%20S.E.%20_Grounding%20in%20communication_%201991.pdf) (1991): the foundational framework for how conversational participants establish mutual understanding
- Shaikh et al., [Grounding Gaps in Language Model Generations](https://arxiv.org/abs/2311.09144) (2023): LLMs produce fewer grounding acts than humans and presume common ground
- Suchman, *Plans and Situated Actions* (1987/2007): machines designed on planning models miss the situated nature of human communication

**The conversation metaphor and its limits:**
- [The Bewitching AI: The Illusion of Communication with LLMs](https://link.springer.com/article/10.1007/s13347-025-00893-6) (2025, Philosophy & Technology): Wittgensteinian analysis showing LLMs lack constancy for genuine dialogue
- Gvozdiak, [Pragmatics Beyond Humans](https://arxiv.org/pdf/2508.06167) (2025): pragmatic meaning relies on communicative situatedness that LLMs lack
- [Beyond the Illusion: Pragmatic Cues in Conversation](https://dl.acm.org/doi/10.1145/3719160.3737614) (2025, ACM CUI): should agents mimic pragmatic cues or use them purposefully?

**Alternative metaphors:**
- [Beyond Anthropomorphism: A Spectrum of Interface Metaphors for LLMs](https://arxiv.org/html/2603.04613) (2026): proposes metaphors beyond the anthropomorphic default
- [Toward Metaphor-Fluid Conversation Design for VUIs](https://arxiv.org/html/2502.11554v2) (2025): VUIs should dynamically shift metaphorical framing based on context
- [Interpretative Interfaces](https://arxiv.org/html/2603.15863) (2026, CHI workshop): tangible interaction metaphors as alternatives to chat

**Thinking and metacognition as interaction paradigms:**
- [Thought as a Substrate in Human-AI Interaction](https://dl.acm.org/doi/10.1145/3746058.3758466) (2024, ACM UIST): thought as a new substrate, challenging chat-as-default
- [Interacting with Thoughtful AI](https://arxiv.org/html/2502.18676v1) (2025): AI as continuously thinking entity, not reactive prompt-response
- [Tools for Thought](https://arxiv.org/abs/2508.21036) (2025, CHI workshop): 34 papers on how GenAI affects metacognition





