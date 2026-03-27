---
title: "Brain dump March 27"
description: "A raw capture of ideas, todos, and threads to follow up on: the return of the button, roles in small teams, stream redesign, Obsidian integration, and reading logs."
date: 2026-03-27
maturity: draft
draft: true
tags: []
ai: "100% Maai"
---

### The return of the button

Article on how Claude Code is moving away from the unstructured conversation paradigm toward structured input: limited user input that you can simply select (it even has numbers for quick selection: THIS IS ACTUALLY IVR!! :-)))))) )
Buttons and IVR are traditionally seen as something to move away from, relics from the past, that were all about friction, cloinkyness.

And now, Claude is reintroducing them.

Why?
Exactly for that: to introduce constraints on what people can input.
Key concept in my own thoughts: in GenAI, just talking to it is way to unstructured.
Annoying for people, because they need to know how to write to prompt effectively.
Annoying for systems & security, because unconstrained, free text input can pose a security threat, or upend the original working of the system.
Example: parts of the system prompt must be user editable. But just offering that part of the system prompt as an free text input field makes them vulnerable for prompt injections. Also, have to be careful: unbridled changes may change the core working of the AI application.

Deliverables: a quick LinkedIn post and an article

(another thought for the braindump: contrary to earlier instructions, I would like to be able to create a stand alone LinkedIn post from within the garden. Required structure: Text, Image, hashtags)

### My changing role in an ultrasmall development team

I am currently product owner, scrum master, prompt designer, tester, eval writer and UX designer in a team of 3. In such a setting, there's no other way than to rethink roles and processes on a daily, almost hourly basis. Typically my role was further constrained by the given: 'POs don't code, designers design blablabla

Real life example: we don't have a front-end designer and no time to do the whole wireframe stuff. Instead, I spec on data level, my developer codes something that is good enough, and I review. Which is a waste, because I do have design expertise, just not enough time to design it all upfront.

UX copy review: typically: table with screenshot with remarks.
Request: do review in GitLab, but still with comments.
Asked Claude Code: show me the UI preview and make that table.
Claude: If you like, I can make those changes for you in the code, and put them in a separate branch.
Asked my dev team what they thought of this.
Result: joint decision that I have clearance to review and PR editorial changes & UX copy.

Downside: it's easy for devs to just accept the changes, even though I still included the table. That way, the learning effect is lost, and we miss one pair of eyes that could have caught final issues.

### General todos

Redesign stream page so that it becomes a proper homepage, and we need to make it chronological in such a way that new posts do feature at the top.
Also: when do we change the hero post and the quotes? Quote: automatic rotation, but I need more quotes for that.
Fix filtering pills: filtering doesn't work for some pages, keep forgetting about this. Perhaps a general review on workings and consistency of the design.
Templates for obsidian: I want to be able to write on my tablet and publish to the garden. Got a whole integration working with Git and Obsidian (Typora not working on tablet), but I discovered that my post templates are not consistent in the metadata. Need to fix that and implement it. I already did talk about that with you, make sure you retrieve that and don't take any action until you've confirmed with me what the latest status is. Might be that I talked about it on another machine, so not sure.

Some kind of reading log on Bacteria to AI: and perhaps even a reminder to actually read?

Thread management: get a reminder when it might be time to start a new Claude thread. Different threads for different tasks and topics. How to make this feel natural rather than disruptive?
