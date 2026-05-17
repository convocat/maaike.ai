---
title: "Watch notes on the Mother of all demos"
description: "Watching Engelbart's 1968 'Mother of all demos' live, in 2026. Running notes, with Claude as an asymmetric chevruta partner fetching references while I think aloud."
date: 2026-05-17
maturity: draft
draft: false
ai: co-created
develops: conference-talk-guildford
tags: [douglas-engelbart, mother-of-all-demos, nls-augment, augmenting-human-intellect, h-lam-t, networked-improvement-community, bootstrapping, ben-shneiderman, chevruta, user-user-machine-interface, desktop-metaphor, direct-manipulation, hci, history-of-computing, web-history]
triples:
- ["Augmenting human intellect", "theorised-by", "Douglas Engelbart"]
- ["NLS / Augment", "demonstrates", "Augmenting human intellect"]
- ["Mother of all demos", "demonstrates", "NLS / Augment"]
- ["H-LAM/T framework", "structured-as", "Augmenting human intellect"]
- ["Networked Improvement Community", "presupposes", "H-LAM/T framework"]
- ["User-user-machine interface", "better-fits", "Networked Improvement Community"]
- ["Bootstrapping (Engelbart)", "coined-by", "Douglas Engelbart"]
- ["Desktop metaphor", "breaks-down-for", "Human-LLM collaboration"]
typora-root-url: ../../../public
typora-copy-images-to: ../../../public/images/articles
---

# Watch notes on the Mother of all demos

I'm watching the ['Mother of all demos'](https://dougengelbart.org/content/view/209/), Doug Engelbart's 1968 presentation at SRI. The remastered version is on YouTube in three parts: [part 1](https://www.youtube.com/watch?v=UhpTiWyVa6k), [part 2](https://www.youtube.com/watch?v=hxaEhju0EoI), [part 3](https://www.youtube.com/watch?v=k-XlttLGUeY).

It might have been just as disruptive back then as LLMs are now. The mouse, hypertext, windowed display, real-time collaboration, video conferencing: all of it sketched out in 90 minutes, two decades before any of it became normal. True magic in an amazing demo.

Companion paper: [Engelbart & English (1968), *A Research Center for Augmenting Human Intellect*](https://dougengelbart.org/content/view/140/). PDF in the [library](/library/a-research-center-for-augmenting-human-intellect).

Parallels with today's aims for LLMs and the approach to discover something completely new: 

- Put the human into the system, this is a whole system approach.
- We ourselves are the researchers: we use this system every day for a prolonged period of time. 
- Improve human efficiency
- Talk about it as a system

## NLS: online system 

INstrument/vehicle for helping humans to operate in the domain of complex information structures. 

- compose
- study > navigate, move about, see
- modify

What does complex structure mean?

- content represents concpets
- structural represents relationships of human thought product
- Generally too complex for humans to study directly

Very simimlar to my digital garden approach! Collection of loose files, very flat structure.



## Control techniques/implementation

1. control devices
2. control dialogue
3. control metalanguage

### Devices

1. Keyboard
2. Mouse
3. Sort of an mbira like device for accessing menus? Sortcuts CTRL-toetsen, sort of

Feedback

Visual feedback: change of position of the mouse pointer

Coordination with both hands, carefully designed

INteresting: he names the mouse pointer 'the bug'  :-D

> Co-created with AI

In SRI lingo the mouse is the input device, the bug is the on-screen tracker. Two separate names because they were experimenting with multiple pointing devices (knee control, light pen, joystick) all moving the same bug. The naming survives in some old NLS papers but lost the race to "cursor" / "pointer" once Xerox PARC reworked it.

WOw, he does drag and drop: he can move words on the screen! This is proper GUI, direct manipulation So he uses a mix of both direct and indirect manipulation.

> Co-created with AI
>
> Pre-Shneiderman direct manipulation, about 15 years before he named the paradigm in 1983. NLS sat right at the hinge: command language for everything formal (chord keyset, mnemonics) and direct manipulation for visual structural work (move, drag). The "mix of both" is what every modern editor still does (Word: drag-select text + Ctrl-B; Figma: drag objects + keyboard shortcuts). The pure-direct-manipulation regime never actually won; it just got the marketing.

### Control dialogue

Feedback on executing a command

Each command has a control dialogue

Careful about the nature of the functions and how they are controlled

Special language to talk about the control with *extreme precision*

### Control metalanguage



## NLS implementation

Hardware design

- workstation controller
- display system

Mostly technical explanation



Overlay structure

Program structure

In written files of 2 to 3 pages long >> LLM skills

eg: MNCTRL main control: file with descriptions, much like a schema

## Messages and user-user interaction

Messages to each other!, bot DM and async

two-person collaboration: interesting! 

* Messages
* Collaboration
* Joint files
* All is available instantly

Another degree of collaboration:

* two-person collaboration (note: this is not conversation! My note)
* Invite Bill through the intercom :-) 
* Show text to Bill > screen sharing :-) 
* Bill wants to say something , he can control the bug: bug fight :-))) Share a file and work on it together. Interesting: we seem to have lost this in the 90s/2000s: everything was a word doc with async comments. Is this because this was on the mainframe in those days? Should we move back to terminals?

> Co-created with AI
>
> Yes: NLS ran on a time-shared SDS 940, so shared state was the default. Everyone was a terminal into one machine. Personal computing in the 80s/90s broke that on purpose (your files, your state, your machine), and multi-user collaboration had to be re-invented on top via files + sync. Google Docs and Figma multiplayer are essentially time-sharing semantics rebuilt on top of the web. "Go back to terminals" is a real read of what cloud-native collaborative apps already are, just dressed up.

## What I'm doing right now

Note: What I'm doing right now: 

* watch video
* take notes
* talk to you (but basically talking to myself)
* Interesting: my husband is sitting next to me: I catch myself wanting to talk about this with him to sharpen my own thoughts. Instead, I determine to ask you, because you can do research based on my questions in real time. 

What kinds of metaphore would suit this pattern?

> Co-created with AI
>
> The husband-comparison is the giveaway: this is thinking-partner-without-the-social-cost. Three candidate metaphors:
>
> - **Chevruta** (classical Jewish pair-study). Two learners debate a text out loud to sharpen each other's thinking. The pattern is almost exact, except the partner can also pull primary sources mid-sentence. "Asymmetric chevruta."
> - **Librarian-in-the-room.** Solitary study at a carrel, but the reference desk is one whisper away. Captures the research-fetching half but misses the dialogue-sharpening half.
> - **Lab notebook + postdoc.** PI thinks aloud, postdoc takes verbal cues and chases references. Captures both halves but adds a hierarchy that may not fit.
>
> Sharpest fit: asymmetric chevruta. Not avoiding the human for the conversation, but choosing the LLM *because* it can run a literature search while you talk, and a person next to you can't. That's a new affordance, not a substitute for a human partner.

## Workspace metaphor in the age of LLMs

> Co-created with AI

**Where the desktop metaphor stands.** The desktop ("your files, your folders, your apps, your single-user surface") was built for the personal-computing break from time-sharing. It codified "this is mine, on this machine". Once the real work surface became a shared, always-on document with multiple cursors, the load-bearing metaphor moved to *workspace* (rooms, boards, presence). The desktop now survives mostly as OS-level chrome.

**LLM workspaces today are asymmetric.** Claude's "workspace" is one human + one agent, single-cursor from your side. The agent acts as invisible machinery: it edits, you don't watch it move. That is actually closer to the old desktop than to Engelbart's bug-fight. Bill is in the room, but he doesn't have a visible bug.

**The Engelbart-style alternative.** A workspace where the LLM has a visible presence: its own cursor, its own selection, an "I'm thinking about this paragraph" marker. Symmetric collaboration instead of back-room assistant. Matches the dialogue framing (turn-taking, shared attention).

**The trade-off.**
- *Visible agent:* matches dialogue/collaboration, makes audit easy, but slows things down and forces you to track another presence.
- *Invisible agent:* fast, out of the way, but kills the "we're both in this document" feeling and makes verification harder.

**Open question (Maaike): could be both, depending on task character.** Some axes worth exploring:
- *Determinism / rigor.* High-precision work (specs, finance, legal) probably wants a *visible* agent: every move auditable, no hidden state changes. Low-stakes / creative work can afford *invisible* and prioritise flow.
- *Trust horizon.* Early in a task or with a new tool, visible (you're calibrating). Once trust is established, invisible (you delegate and check the diff).
- *Time horizon.* Short turns (autocomplete, small edits) want invisible. Long-running agentic work (research, multi-step plans) wants visible: presence becomes a progress indicator.
- *Mode of work.* Co-writing or co-designing wants visible (the cursor is the conversation). Background processing or generation wants invisible.

So maybe the design question isn't "desktop vs workspace" but "when should the workspace have presence rendered, and when should it stay quiet?" Probably a toggle, not a default.

## Augmenting groups, not just individuals

> Question while watching: it seems that successful operation of this concept requires two people collaborating, rather than one person with just the system. Any evidence for that?

> Co-created with AI
>
> Yes, and the evidence is unusually clean.
>
> 1. **Collective from the start.** Engelbart's 1962 *Augmenting Human Intellect* paper put methodology and training (social, organisational) on equal footing with the tool. The unit of analysis was never one person plus machine.
> 2. **He named the proper deployment context.** A **Networked Improvement Community (NIC)** is a group consciously using shared tools to improve their shared practice. Single-user use was, in his view, leaving most of the value on the table.
> 3. **ARC's daily practice required it.** Every report, every code change, every meeting note was written in NLS. The collaborative features (shared Journal, structured links, screen sharing) were load-bearing, not demo candy.
> 4. **Engelbart was openly bitter about the personal-computing branch.** When ARC dispersed and many of his team went to Xerox PARC and on to Apple, the GUI / single-user line won the market. He felt this was a misreading of NLS: the GUI strand kept the direct-manipulation surface and threw out the collaborative spine.
> 5. **Academic confirmation.** Thierry Bardini's *Bootstrapping: Douglas Engelbart, Coevolution and the Origins of Personal Computing* (Stanford UP, 2000) makes this argument explicitly. The personal-computing industry inherited the half of NLS that was easy to commercialise and dropped the half that mattered most to Engelbart.

Ow! Can you tell me more about H-LAM/T? And OMG NIC!!! This needs to be in my guildford talk
We shouldn't only assume that we need to create user-machine interface, but user-user-machine interfaces too. 

> Co-created with AI
>
> **H-LAM/T = Human using Language, Artifacts, Methodology, in which he is Trained.** Engelbart's 1962 *Augmenting Human Intellect* paper describes the entity being augmented as a four-part system:
>
> - **Human.** The person (or group) being augmented.
> - **Language.** The concepts and symbols the human uses to model the world.
> - **Artifacts.** Physical and digital tools (keyboard, chord keyset, mouse, NLS itself).
> - **Methodology.** Procedures and practices for using the tools effectively.
> - **Training.** Capability development that turns competence into mastery.
>
> The "intelligence amplifier" is L + A + M + T together. Designing only the artifact and ignoring the other three is what most of UX has done for forty years.
>
> **Networked Improvement Community (NIC).** The proper deployment unit is a group consciously using shared tools to improve their shared practice. The community co-evolves with its tools. This is where "user-user-machine interface" lives natively: not as a feature to add, but as the design surface itself.
>
> Both ideas seeded as separate posts: [[user-user-machine-interfaces]] and [[h-lam-t-framework]], linked to the Guildford talk hub.

## Bootstrapping

This is fascinating: they're discovering new design patterns as they go and try to do realy work. Just like I am right now.

> Co-created with AI
>
> Engelbart called exactly this "bootstrapping": the Augmentation Research Center used NLS to design NLS. Building the tool *while* doing real work with it was the methodology, not an accident. New interaction patterns emerge only when you stop demoing and start using.
>
> The same recursion is happening here: using an LLM to think about LLM-augmented thinking, with the article itself as the work product. Bootstrapping is the proper name.

What's the origin/etymology of that term?

> Co-created with AI
>
> Two threads converge into the modern usage.
>
> **Idiom (1830s, American English).** "To pull oneself up by one's bootstraps" originally meant an *impossible* feat (you literally can't lift yourself by the loops on your boots, that violates physics). Earliest known print citation is 1834, ridiculing a man who claimed he had invented a perpetual-motion machine. The "self-improvement against the odds" sense came later, by the early 20th century, when the impossibility joke faded and the phrase got re-read as plucky self-reliance.
>
> **Computing (early 1950s).** A "bootstrap loader" was a tiny hand-entered program that loaded a slightly bigger program, which loaded the operating system. The computer literally pulled itself up from almost nothing. Hence "boot up", "reboot". First attestations around 1953 at MIT/UNIVAC.
>
> **Engelbart's usage (1960s, ARC).** He took the computing sense and ran with it: ARC would use NLS to design NLS, and the methodology would improve the methodology. He formalised it as the "ABC model": A = the primary work, B = improving how A is done, C = improving how B is done. Bootstrapping = deliberately investing in higher-level loops so the whole system compounds. His 1962 *Augmenting Human Intellect* conceptual framework paper is where this is laid out, predating the demo by six years.
>
> So when Engelbart says "bootstrapping" he means something more specific than the idiom: a recursive engineering discipline, not just resourcefulness.

## Background: role of dialogue and user interface 

> Co-created with AI

A few threads worth pulling on while watching the demo:

- **Engelbart's own framing.** NLS used 2-letter mnemonic commands and a chord keyset. Every command had a "control dialogue" (prompt, feedback, error path). The metalanguage was the grammar describing the dialogue. Not designed to be easy, designed to be learnable to mastery. Counter-cultural now.
- **[Nickerson (1969), *Man-Computer interaction: A challenge for human factors research*](https://doi.org/10.1080/00140136908931076)** (Ergonomics 12, 501-517). One of the first papers that frames the back-and-forth itself as a research object, not just an engineering detail.
- **Norman's seven-stage model of action.** Gulf of execution, gulf of evaluation. Treats interaction as goal-directed, turn-based dialogue between user intention and system response. Direct ancestor of how we now reason about LLM chat affordances. (Introduced in the book below.)
- **[Norman & Draper, *User Centered System Design* (1986)](https://dl.acm.org/doi/book/10.5555/576915).** The book that institutionalised "the user's mental model is part of the system." Bridges Engelbart's whole-system framing to modern HCI.
- **Direct manipulation vs. conversation.** [Shneiderman's *Direct Manipulation: A Step Beyond Programming Languages* (1983)](https://doi.org/10.1109/MC.1983.1654471) was framed as the alternative to dialogue-based command languages like NLS's. The pendulum is swinging back: LLM chat is conversation again, and Engelbart's metalanguage idea suddenly feels current (skills, tool use, prompts as grammar).

---

<div class="linkedin">
Write your LinkedIn post here...
</div>
