---
title: Putting the design in prompt design
date: 2023-05-22
updated: 2026-03-15
maturity: complete
tags:
  - prompt-design
  - conversation-design
description: "Blind prompting vs. prompt engineering — and what it means for conversation designers."
draft: false
ai: "100% Maai"
---

I stumbled across this really insightful article by Mitchell Hashimoto the other day, and I think this is such an eye-opener for all us conversation designers who wonder where to go next in this LLM hype! This article is a great intro into what sets aside prompt designers (or engineers as Hashimoto calls them) from the incidental prompter. Keyword: conscious, deliberate and verifiable design choices that are experiment based. Sounds familiar? That's no coincidence, it's what we do all the time!

## A brief summary

Hashimoto starts out by making an important point: what most people seem to call prompt engineering nowadays, he calls 'blind prompting': a "crude trial-and-error approach, paired with minimal or no testing and very surface level knowledge of prompting". He uses the rest of his article to argue that prompt engineering is a real and experiment-driven skill, one that's important to master when we want to get real value out of LLMs. *(I later extended this thinking in [[context-engineering-lets-call-it-design]].)*

The real difference between blind prompting and prompt engineering is one that will probably sound familiar to us: it's a matter of being able to design prompts that are reliable, repeatable, reusable and robust. Rather than leaving things to chance or creativity, engineering is about prompts that can be tested & verified.

## Prompt clarity

This means that each prompt needs to be clear in terms of:

- **Input:** what's the expected input that this prompt should be able to handle, both in terms of scope and format?
- **Output:** what output do we expect from this prompt? And how can we check & test whether this output is correct — all the time? Often, the output of a prompt serves as input for another step or action. So we need to make sure that output satisfies the output criteria again and again.
- **Examples:** What kind of examples does this prompt need (if any)? If we're using few-shot prompting (giving the prompt a few examples, not very different from giving an intent a few training phrases), what examples would be usable? How do we keep bias out of our examples?

## Step 1: create a demonstration set

To get a quick insight in prompt clarity and our expectations, Hashimoto suggests developing a demonstration set. A demonstration set contains an expected input, along with an expected output. The goal of this set is to:

- measure the accuracy of the prompts we design
- specify what the input and output should look like, so that we can determine whether that's the right shape for the problem we're trying to solve
- serve as example sets for a few-shot prompt approach (where you basically give the prompt some examples to learn from on the fly)

If this sounds slightly familiar, that might be because this is also how we traditionally tend to test our NLU models in our bots! When we label our customer questions with intents, we're basically telling it which input should lead to which classification (i.e. output). And when we clean our training data, we're basically telling the classifier what is relevant info, and what not.

## Step 2: design suitable prompt candidates

Often, your first prompt doesn't immediately yield the best result, so you may need to design various variants of that prompt (again, very much like shuffling around training phrases between intents, your first training set hardly ever is the perfect one!)

Hashimoto suggests some guidelines for designing high-quality prompts that return consistent results, but doesn't go into much detail here. For now, it suffices to say that the suggested way to go is to first design some zero-shot prompts, and then use these to further design some few-shot prompts.

## Step 3: use the demonstration set and the candidate prompts to measure prompt accuracy

Next, you can use your demonstration set to calibrate the accuracy of each candidate prompt. Very much like we use our confusion matrices for calibrating the accuracy of our NLU models!

In the case of LLMs, accuracy is just one of the things we want to test. Other things that also play a role: number of tokens that were used (since this is a pay per token model, and the tokens in your prompt count towards the total number!), requests used etc. So whereas accuracy does of course play an important role, it's certainly not the only metric you want to keep an eye on!

And in that respect, again, there's quite some similarity between prompt engineering and optimising your NLU. I'm sure that you've asked yourself that one question so often: "Do I fix this by finetuning my intent architecture, and spending a lot of time training a lot of granular intents? Or do I train one broader intent, and solve the routing in the flow. Time and cost vs. usability and user-centeredness?"

![Systems thinking in optima forma](/images/articles/putting-the-design-in-prompt-design/systems-thinking.jpeg)

## Step 4: choose the optimal prompt to use in your application

Based on the metrics that are most important for your use case, select the prompt that best meets all the criteria for those metrics. Or...decide that you might want to investigate other methods and technologies to increase accuracy, like good old-fashioned NLU, or a rule based approach. Knowing that your solution is fit-for-purpose is perhaps one of the most important aspects that sets aside prompt engineering from blind prompting.

## Step 5: Trust but verify

Again, something that should sound familiar to you: because generative AI is probabilistic in nature, even a 100% accurate demonstration set will yield unpredictable results once put out there in the wild, where the action is. This means that we should always keep an eye on prompt performance.

Some examples of verification methods:

- If the output is a verifiable fact, we could ask the user whether the output was correct (a bit like our explicit confirmations in CxD). Or we could keep track of the number of manual corrections that a user applies after getting the result from our prompt.
- If the output is code, try to parse it, so that you at least know that the syntax is correct (whether the code will return semantically/functionally relevant results is another matter).

## What does this mean for us, conversation designers?

Well, first of all, that our jobs are not going to disappear anytime soon! :-) In terms of skills, I can see the following happening:

- **Designing robust prompts** requires a solid knowledge of language, and of structuring language. If you've ever designed templates or worked with structured content like DITA, you should feel quite at home with how prompt engineering works.
- **Process thinking** is THE skill to master. To think, not so much in conversations, but in terms of logical steps in a process and input-output pairs is greatly going to improve the robustness of your prompts (I believe this to be true for 'traditional conversation design' as well, by the way).
- **Persona is everything.** This article didn't mention it explicitly, because it mostly focused on prompt engineering as an organised, methodical way of working. But persona, in terms of the 'System role', the 'you' in every prompt, and the keeper of relevant global information about your bot's scope and capabilities is going to be the beating heart of every generative AI bot.

