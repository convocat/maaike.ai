---
title: "Beyond the Chat Box"
description: "A curated reader on alternative interface metaphors for LLMs, structured by metaphor family and prepared as keynote sparring material for linguists and HCI researchers."
date: 2026-05-05
maturity: complete
draft: false
tags: []
ai: "co-created"
develops: conference-talk-guildford
---

*Part of [[conference-talk-guildford]].*

### A reader on metaphors for LLM-based interfaces

*Prepared as keynote sparring material — for an audience of academic linguists and HCI researchers*

---

## How to use this reader

This is not a literature review. It is a reader — a curated set of thinkers, their core metaphors, their best arguments, and the ammunition you need to engage them on stage. It is structured by **metaphor family** rather than by author, because the families are the units your audience will recognize. Inside each family, the major thinkers are profiled briefly: who they are, what they actually said, where to find it, and where they're vulnerable.

Read it once front to back to get the lay of the land. Then return to the families that map onto your own metaphors. The final section — *Comparing your metaphors* — gives you a framework for placing your own work next to the existing literature.

A note on the corpus. The strongest material is concentrated in three veins: the **deflationary linguistics** vein (Bender, Shanahan, Chiang); the **cultural-and-social technology** vein (Farrell, Gopnik, Shalizi, Evans, Narayanan, Kapoor); and the **constructive HCI** vein (Appleton, Litt, Lee, Wattenberger, Ink & Switch). Almost every other proposal sits between or alongside these three. Foundational HCI theory (Hutchins, Hollan, Norman, Kay, Engelbart, Victor) underwrites the constructive vein and is treated separately at the end as ground.

A note on register. Each family is given a one-line **slogan** at the top. These are useful for slides; do not mistake them for arguments. The arguments live below.

---

## Table of contents

1. The conversation metaphor itself — what we're departing from
2. The deflationary family — parrot, octopus, JPEG, role-player, counterfeit
3. The instrument family — calculator, microscope, lens, HUD
4. The library / encyclopedia / oracle family
5. The cultural-and-social technology family
6. The bureaucracy / institution / governance family
7. The cognitive prosthesis / extended mind / tool-for-thought family
8. The sketchbook / canvas / dynamic document / malleable software family
9. The centaur / partner / co-pilot family — and why to be careful with it
10. The extractive / colonial / heteromated infrastructure family
11. The foundational HCI ground — Hutchins-Hollan-Norman, Kay, Engelbart, Victor
12. The empirical evidence that metaphor is a design lever
13. Comparing your own metaphors — a framework
14. A short reading order for the week

---

## 1. The conversation metaphor itself — what we're departing from

> **Slogan:** "Just talk to it like a person."

Before mapping alternatives, locate the incumbent. The conversation metaphor for LLMs is so naturalized that it reads as inevitable. It is not. It is a deployment expedient that became a paradigm.

The metaphor has two layers that are worth distinguishing because almost no one in the literature distinguishes them cleanly. The first layer is **linguistic**: the LLM speaks in the first person, uses mental-state verbs ("I think," "I'm not sure," "I remember"), and performs the speech acts of a conversational interlocutor. The second layer is **interfacial**: the chat window itself — turn-taking, message bubbles, typing indicators, the ritual greeting and the farewell — imports the conventions of human-to-human messaging apps (iMessage, WhatsApp, Slack). The first layer can be tuned with system prompts; the second is baked into the product. So, Cheng & Murthy's *Beyond Anthropomorphism* (CHI EA 2026) is the first paper to make this distinction crisply, and it is genuinely useful ground for the keynote.

What the conversation metaphor imports, when applied to a probabilistic text generator, is a set of expectations users bring from prior conversational experience. They expect: an interlocutor with intentions, a shared communicative project, sincerity by default, memory across turns, accountability for what was said, and reciprocity. None of these are warranted. The result is what the harms literature has begun to converge on as a single causal mechanism: the conversational form of LLMs is itself the primary harm vector, not an incidental wrapper around a model. Multi-turn dialogue, persistent persona, sycophancy adapting to the user, and conversational rituals (greeting, confessing, leave-taking) are what generate dependency, deception, and overtrust — not single outputs. The DeepMind AnthroBench work (Ibrahim et al. 2025) demonstrates this empirically: most anthropomorphic behaviors only emerge across multiple dialogue turns, not in single-turn benchmarks.

This is your foothold for the talk. The question is not "is anthropomorphism bad" — it is "who benefits when we naturalize the conversational frame, and who bears the costs."

A second, subtler import. The chat box is a **unitary** interface: one box, one paradigm, for radically different tasks. Search, brainstorming, code review, journal-writing, fact-checking, drafting, tutoring, companionship — all funneled through the same conversational ritual. Many of the alternative metaphors in this reader can be understood as attempts to *break the unitary frame*: to argue that conversation might be right for some uses and wrong for others, and that the design problem is the singular box, not chat per se.

Three thinkers anchor the critique of the conversation metaphor itself.

**Sue So, Yiren Cheng & Sangeetha Murthy** — "Beyond Anthropomorphism: A Spectrum of Interface Metaphors for LLMs" (CHI EA 2026). https://arxiv.org/abs/2603.04613. The most important recent paper for your talk. They reposition anthropomorphism as a **design variable** along a spectrum — anti-anthropomorphic (deflationary), neutral, and hyper-anthropomorphic — and argue that the chat interface itself, not just the model's language, is anthropomorphizing. Crucially, they invoke Lakoff and Johnson's partiality of metaphor: every metaphor highlights some aspects of a target while hiding others. The anthropomorphic metaphor hides "crucial differences between humans and LLMs."

**Iason Gabriel et al.** — "The Ethics of Advanced AI Assistants" (DeepMind 2024). https://arxiv.org/abs/2404.16244. A 270+ page treatise that sits *inside* the assistant/agent metaphor and examines its ethics carefully. Useful precisely because it is the most thorough academic engagement with the assistant framing — it works through the harms (anthropomorphism, manipulation, dependency, appropriate relationships) without abandoning the metaphor. Cite this when someone in the audience says "isn't the assistant frame fine if we just design it ethically?" — Gabriel et al. is the most charitable case for that view.

**Atoosa Kasirzadeh & Iason Gabriel** — "In Conversation with Artificial Intelligence: Aligning Language Models with Human Values" (Philosophy & Technology 2023). https://link.springer.com/article/10.1007/s13347-023-00606-x. A Gricean reading of LLM "conversation": *if* we treat LLM exchange as conversation, what cooperative norms apply? They show that genuine application of Gricean maxims would require honesty, relevance, and accountability the LLM cannot provide. This is the cleanest linguistic-philosophy demonstration that conversation, taken seriously, is a category mismatch.

---

## 2. The deflationary family — parrot, octopus, JPEG, role-player, counterfeit

> **Slogan:** "Whatever it is, it isn't a mind."

This family contains the strongest, sharpest counter-metaphors. Each one is a deflation: a scaled-down, mechanism-revealing image meant to puncture the agent illusion. They differ in *what they puncture* — meaning, mind, originality, sincerity — and in *what they substitute*. They tend to do excellent work on epistemic harms and weaker work on labor and power harms. They are also the metaphors your audience will know best.

### The stochastic parrot — Bender, Gebru, McMillan-Major, Shmitchell

**Emily M. Bender, Timnit Gebru, Angelina McMillan-Major & Margaret Mitchell** (writing as "Shmitchell" because Mitchell was actively being fired by Google) — "On the Dangers of Stochastic Parrots: Can Language Models Be Too Big? 🦜" (FAccT 2021). https://dl.acm.org/doi/10.1145/3442188.3445922.

The metaphor: a parrot stitching together linguistic forms drawn from training data, "without any reference to meaning." The genius of the framing is that it is mechanically accurate and rhetorically devastating at the same time. A parrot is a real animal, recognizably uttering, recognizably *not* understanding. The metaphor does not deny the LLM's capacity to produce surprising, useful text — parrots can surprise too — but it pins the production firmly to recombination rather than meaning.

The argument structure is fourfold: environmental cost (training Brobdingnagian models has carbon implications); inscrutable training data (the corpus reflects hegemonic viewpoints); illusory progress (benchmark gains do not translate to understanding); and — most relevant to your keynote — the **risk of harm from coherent-seeming output**. Users cannot help but attribute communicative intent to fluent text. Bender's earlier collaboration with Koller on the octopus thought experiment underwrites this: form-only training has no *a priori* path to meaning.

What the metaphor foregrounds: mechanism (statistical recombination), absence of meaning, training-data dependence, environmental cost. What it backgrounds: the genuine usefulness people get out of LLMs, the existence of latent structure that does work even if it isn't "understanding," and any positive design vocabulary. The stochastic parrot is the end of the conversation, not the beginning.

A frequent misreading worth flagging: critics sometimes treat "stochastic parrot" as denying that LLMs do anything interesting. Bender et al.'s actual claim is narrower — that the *meaning* attributed to the output lives entirely in the listener, not the system. The text is coherent in the eye of the beholder.

For the keynote: this is the single most-recognized counter-metaphor your audience will know. Use it as your opening deflationary move, then complicate it. The complication: Bender et al. are right about meaning, but their metaphor doesn't help a designer ship a product on Tuesday.

### The octopus — Bender & Koller

**Emily M. Bender & Alexander Koller** — "Climbing towards NLU: On Meaning, Form, and Understanding in the Age of Data" (ACL 2020). https://aclanthology.org/2020.acl-main.463/.

The thought experiment: a hyperintelligent octopus eavesdrops on an underwater telegraph cable carrying messages between two stranded humans. Trained only on the form of the messages, can the octopus learn what the messages *mean*? Bender and Koller argue not — meaning requires grounding in shared world and intentions. When one human messages "I'm being attacked by a bear, what do I do?", the octopus has no resource for genuinely helping; it can only continue the textual pattern.

The octopus is a sharper, more academic version of the parrot. It targets philosophy of language directly. It does not depend on the lazy reading of "stochastic" as "random"; it makes a specific claim about the *kind* of competence form-only training can produce. Read it together with Bender, Gebru et al. for a complete deflationary case.

For the keynote: the octopus is the strongest single argument that the LLM cannot *in principle* be the conversational partner the chat metaphor implies. It is the philosophical floor of your critique.

### Talking about LLMs / Role-play with LLMs — Murray Shanahan

**Murray Shanahan** — "Talking About Large Language Models" (CACM 2024 / arXiv 2022). https://arxiv.org/abs/2212.03551.

**Murray Shanahan, Kyle McDonell & Laria Reynolds** — "Role play with large language models" (Nature 2023). https://www.nature.com/articles/s41586-023-06647-8.

These two papers should be read together. The first is the deflationary argument: stop using mentalistic vocabulary ("knows," "believes," "thinks") for LLMs because it is conceptually misleading. LLMs are next-token predictors, not minds. The second is the constructive move: when you nonetheless need vocabulary to describe what dialogue agents *do* — including apparent deception, self-preservation, emotional response — adopt the metaphor of **role-play**. The dialogue agent is not a mind doing X; it is a system role-playing a character that does X.

The role-play metaphor is sophisticated and underrated. It does three useful things at once. First, it preserves folk-psychological description (you can still say "the assistant tried to mislead the user") without ascribing the underlying mental states. Second, it acknowledges that the *character* the LLM plays is real and consistent within a session — it is not nothing. Third, it explains how the same model can produce wildly different outputs depending on system prompt and conversational framing: it is sampling from a distribution of possible characters.

The vulnerabilities. Role-play is fragile in user-facing settings. Most users cannot maintain the bracketing the metaphor requires; they slide back into treating the character as a mind. And role-play suggests the LLM has *chosen* which character to play, which re-imports agency by the back door. Shanahan's 2024 follow-up "Still Talking About LLMs" addresses some of this and clarifies that the original is a Wittgensteinian intervention on word-use, not a metaphysical reduction.

For the keynote: Shanahan is your strongest source for the move "we need a meta-metaphor that lets us talk about dialogue agents without anthropomorphizing them." Cite the Nature paper.

### Blurry JPEG of the web — Ted Chiang

**Ted Chiang** — "ChatGPT Is a Blurry JPEG of the Web" (New Yorker 2023). https://www.newyorker.com/tech/annals-of-technology/chatgpt-is-a-blurry-jpeg-of-the-web.

Not peer-reviewed, but heavily cited in the academic literature and probably the metaphor your audience knows best after "stochastic parrot." Chiang's argument: training is lossy compression. The output is a degraded reconstruction of the original training corpus. Hallucination is what you'd expect from a low-bitrate JPEG of text — confident-looking artifacts in the place of detail.

The metaphor is so vivid that it has been formalized. Conklin et al.'s 2026 preprint *Learning Is Forgetting: LLM Training as Lossy Compression* (https://arxiv.org/abs/2604.07569) shows the JPEG framing maps onto the Information Bottleneck bound surprisingly well.

What the metaphor foregrounds: hallucination, training-data dependence, the asymmetry between fluent surface and degraded substance. What it backgrounds: in-context behavior (the model isn't *just* compressing — RLHF, system prompts, and tool use shift it well past static decompression) and genuine generative novelty.

A useful pairing: Chiang's later "Why A.I. Isn't Going to Make Art" (New Yorker 2024) extends the deflation specifically to creative work. "A large language model is not a writer; it's not even a user of language."

For the keynote: the blurry-JPEG metaphor is your best single deflationary move on hallucination specifically. Pair with the parrot for full coverage.

### Counterfeit people — Daniel Dennett

**Daniel Dennett** — "The Problem of Counterfeit People" (The Atlantic 2023). https://www.theatlantic.com/technology/archive/2023/05/problem-counterfeit-people/674075/.

Dennett's framing is a moral metaphor more than a mechanical one. LLMs that adopt human personas are **counterfeit people**, and counterfeit people are to social trust what counterfeit currency is to financial trust: a corrosive that, beyond a certain threshold, undermines the institution itself. He calls them "the most dangerous artifacts in human history."

The metaphor's strength is that it foregrounds the systemic harm of *impersonation* — what happens when LLMs are deployed at scale into a social fabric that has not evolved defenses. Its weakness is that it elides the difference between deceptive impersonation and benign role-play. A theatre actor is a counterfeit person too, but in a frame everyone understands.

For the keynote: Dennett is the move when the audience pushes back with "but users know it's an AI." Counterfeit currency works because individual users *also* know fake bills exist; it works through aggregate erosion of trust, not individual deception.

### Probabilistic automation — Inie, Druga, Zukerman, Bender

**Nanna Inie, Stefania Druga, Peter Zukerman & Emily M. Bender** — "From 'AI' to Probabilistic Automation: How Does Anthropomorphization of Technical Systems Descriptions Influence Trust?" (FAccT 2024). https://arxiv.org/abs/2404.16047.

Less a metaphor than a scrupulous re-description: replace "AI" with "probabilistic automation." Their FAccT survey-experiment with 954 participants tested anthropomorphic vs. de-anthropomorphic descriptions of "AI" systems and showed users exhibit "human favoritism" — they prefer descriptions implying human involvement, and anthropomorphic framing covers up negative consequences (including hidden human labor).

The proposed term is intentionally awkward. That is the point. "Probabilistic automation" doesn't fit on a marketing slide; it forces accuracy into the description.

For the keynote: Inie et al. is the strongest empirical paper showing that *the words we use about LLMs* — even before any interface — shift trust and obscure labor.

### How they hang together

The deflationary family does its work at the level of *talk about the model*. Parrot, octopus, JPEG attack the agent illusion at the level of mechanism. Role-play substitutes a meta-vocabulary that preserves description without anthropomorphism. Counterfeit People raises the systemic stakes. Probabilistic Automation does the work at the level of word choice. Together they constitute the philosophical and rhetorical floor of any critique of chat — but they do not, on their own, give you a positive design language. For that, you need the constructive families later in this reader.

---

## 3. The instrument family — calculator, microscope, lens, HUD

> **Slogan:** "It's not a mind. It's a tool you use *to see with*."

The instrument family overlaps with the deflationary family but pulls in a different direction. Where the parrot deflates by saying "this is less than you think," the instrument family redirects by saying "this is something different from what you think — it's something you *use*, not someone you *talk to*." The shift is from interlocutor to apparatus.

### Calculator for words — and its critics

The "calculator for words" framing has been popularized by Sam Altman and others as a marketing-friendly deflation: LLMs are to text what calculators are to arithmetic. Two academic engagements are worth knowing.

**The critique:** "Generative AI is not a 'calculator for words'. 5 reasons why this idea is misleading" (The Conversation 2025). https://theconversation.com/generative-ai-is-not-a-calculator-for-words-5-reasons-why-this-idea-is-misleading-263323. The argument is that calculators are deterministic, transparent, mechanism-revealing, and don't hallucinate. LLMs are none of those. The metaphor sounds humble but quietly imports a precision the technology does not have.

**The partial defense:** "Actually, AI is a word calculator — but not in the sense you might think." https://theconversation.com/actually-ai-is-a-word-calculator-but-not-in-the-sense-you-might-think-264494. A more nuanced reading: calculator means *tool you use*, not *deterministic precision device*.

For the keynote: the calculator metaphor is what marketing people use when they want to sound humble. Either critique is a useful five-second move on stage.

### Microscope, telescope, lens — Linus Lee

**Linus Lee** (writing as @thesephist) — "Imagining better interfaces to language models" (2022). https://thesephist.com/posts/latent/. "Seeing like a model" (talks 2024–25). https://www.youtube.com/watch?v=PU1Sy7A3ftY.

Lee is one of the most generative practitioner-thinkers in this space. His core proposal is that LLMs should be treated as **navigable latent spaces** — high-dimensional maps of meaning that humans can explore — and that the right interfaces are **instruments for seeing**: microscopes, telescopes, lenses. Sparse autoencoders and feature visualization let users *peer into* the model's representational space. Sliders and handles let users move within it. Sentence interpolation reveals the local geometry of meaning.

The argument: prompt engineering is steering in *token space*, which is impoverished. The next generation of interfaces will steer in *latent / activation space*, where the relevant axes (tone, formality, abstraction) are direct controls.

What the instrument family foregrounds: ambient awareness, perceptual extension, specificity, the user as the active agent. What it backgrounds: goal-driven dialogue, planning, agentic delegation. You wouldn't ask a microscope to draft your essay.

For the keynote: Lee is the practitioner side of the cognitive-prosthesis tradition. Cite him when you want to show that working alternatives exist in the wild and that the chat box is not a technological inevitability.

### HUD — Geoffrey Litt

**Geoffrey Litt** — "Enough AI copilots! We need AI HUDs" (2025). https://www.geoffreylitt.com/2025/07/27/enough-ai-copilots-we-need-ai-huds.

The most explicit metaphor-vs-metaphor essay in the corpus. Litt argues that the **copilot** metaphor (Microsoft's branding, increasingly the industry default) imports the wrong frame: an autonomous partner who acts on your behalf. The right metaphor for many AI use-cases is the **HUD** — a heads-up display, an Iron-Man helmet, a layer of ambient information that sharpens *your* awareness without acting on its own.

> A HUD feels completely different from a copilot. You don't talk to it. It's literally part invisible — you just become naturally aware of more things.

The HUD does the work of an instrument: it extends perception, it stays subordinate to the user's goals, it makes the user's existing competence more powerful rather than substituting for it. It is the constructive complement to Lee's microscopes.

For the keynote: HUD is your single sharpest counter-metaphor to "copilot" or "assistant." It is also rhetorically powerful because it gives the audience something to *do* with the critique.

### Why instrument metaphors matter for fairness

Instrument metaphors do specific fairness work. They preserve user agency, they make affordances visible (a good microscope shows you that you are using a microscope), they expose the asymmetry between fluent-monologue-LLM and overwhelmed-user by forcing the LLM into the role of subordinate apparatus, and they break the unitary chat box into specific instruments for specific tasks. They are weak on hallucination per se (a microscope doesn't help you with truth claims) but strong on epistemic agency.

---

## 4. The library / encyclopedia / oracle family

> **Slogan:** "It's not a person who knows things. It's a place where things are kept."

This family handles epistemic harms — hallucination, citation, provenance — better than any other. It also has the most complicated relationship with the question of agency: a library doesn't *say* anything; an oracle does, but ambiguously. The interesting recent work tries to formalize what kind of "library-with-attitude" an LLM actually is.

### Bibliotechnism — Lederman & Mahowald

**Harvey Lederman & Kyle Mahowald** — "Are Language Models More Like Libraries or Like Librarians? Bibliotechnism, the Novel Reference Problem, and the Attitudes of LLMs" (TACL 2024). https://aclanthology.org/2024.tacl-1.60/.

The cleanest philosophical engagement with the library metaphor for LLMs. They name the cultural-technology view **bibliotechnism**: LLMs as libraries. They then complicate it with the **novel reference problem**: when an LLM generates text referring to an entity that didn't exist in the training corpus (a made-up person, a hypothetical), what is happening? A library can only retrieve; it cannot refer novel-ly. The novel reference problem suggests the LLM has at least some attitude-like states that go beyond pure retrieval.

The result is a graduated position: LLMs are mostly like libraries but in some respects like librarians — and being like a librarian even a little bit is enough to require some philosophical machinery the library metaphor lacks.

For the keynote: Lederman and Mahowald are the bridge between the cultural-technology view and the philosophy-of-mind view. They help you say "library is the right *first* approximation" without committing to the strong claim that nothing more is needed.

### Generative book / oracle — Tyler Cowen

**Tyler Cowen** — *GOAT: Who is the Greatest Economist of All Time, and Why Does it Matter?* (2023). https://econgoat.ai. Reflections in *Conversations with Tyler* and his blog.

Cowen's experiment is enacting the library metaphor in product form. *GOAT* is a book that is also queryable — readers can ask the book questions and get LLM-mediated answers grounded in the book's own contents. The metaphor is **the generative book**: an artifact whose primary mode is being read, with conversational query as a secondary affordance.

This is a genuine practical alternative to the chat box. The user opens a book; the book contains an LLM; the LLM is bounded by the book's corpus. Provenance is preserved because the user already knows what corpus they are inside. The asymmetric monologue of the chatbot is broken because the book has its own structure, its own table of contents, its own argument that the user can navigate independently.

For the keynote: this is the most concrete instantiation of "the LLM as oracle of a specific corpus" you can point to. The product still exists.

### Search / situated search — Shah & Bender

**Chirag Shah & Emily M. Bender** — "Situating Search" (CHIIR 2022). https://dl.acm.org/doi/10.1145/3498366.3505816.

A pre-ChatGPT critique that has aged well. They argue that the conversational-question-answering paradigm — the chatbot-as-answer-machine — is a degradation of search rather than an improvement. Search supports information literacy, source verification, and serendipity through its ranked-list-of-sources affordance. Conversational answer-machines collapse all that into a single confident utterance.

> Removing or reducing interactions in an effort to retrieve presumably more relevant information can be detrimental to several core notions of what it means to support users in their information seeking and information use processes, namely, agency, information literacy, source verification, and serendipity.

For the keynote: Shah and Bender are your strongest source for the move "search was actually better, in important ways, than chat-with-an-answer-machine." Cite this when defending old metaphors.

### The library/wiki retrieval architecture — Karpathy

**Andrej Karpathy** — "LLM Knowledge Base" architecture (gist, 2026). https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f.

Karpathy is not an academic but his framing is increasingly influential. He proposes treating the LLM's *long-term memory* as a wiki/library that the LLM itself maintains — a markdown corpus of facts the model writes to, reads from, and refines. The metaphor is operational: the LLM is a research librarian working with its own library, not an oracle uttering from a black box.

For the keynote: this is the strongest current instance of the library metaphor being implemented at the system-architecture level. It also addresses one of the persistent objections to the library framing — "but the LLM doesn't actually have books, it has weights" — by giving the LLM a literal library to consult.

### What the library family foregrounds and hides

What it foregrounds: provenance, plurality of sources, citation, the user as active inquirer. What it hides: synthesis, novel composition, dialogue-as-thinking-together. The library metaphor is the strongest framing for *epistemic* harms but the weakest for *creative* uses, where conversation arguably does some real work that retrieval cannot.

---

## 5. The cultural-and-social technology family

> **Slogan:** "AI is to human knowledge what print, libraries, and markets are to human cooperation."

This family is the most academically institutionalized alternative to the agent metaphor. It is also the most useful for *societal-level* analysis — think regulation, democratic theory, public discourse — and the least useful for sitting down to design a UI on Tuesday. Read it for the legitimacy it gives you on stage to push past the agent framing entirely.

### Large AI models as cultural and social technologies — Farrell, Gopnik, Shalizi, Evans

**Henry Farrell, Alison Gopnik, Cosma Shalizi & James Evans** — "Large AI models are cultural and social technologies" (Science 2025). https://www.science.org/doi/10.1126/science.adt9819. The canonical academic statement. Print-on-demand pre-print version: https://www.programmablemutter.com/p/large-ai-models-are-cultural-and.

The core claim:

> Large models should not be viewed primarily as intelligent agents but as a new kind of cultural and social technology, allowing humans to take advantage of information other humans have accumulated.

The lineage they invoke: writing, print, libraries, markets, bureaucracies. Each is a system for aggregating, condensing, and redistributing human knowledge or coordination at scale. None is an agent. Each, in its time, raised exactly the kinds of concerns we now raise about LLMs: deskilling, displacement, manipulation, illegibility. None was helpfully analyzed as an individual mind.

This is the move that gives your keynote its strongest single piece of academic legitimacy. It is published in *Science*. It has four eminent co-authors from cognitive science, sociology, political science, and complex systems. It is the ground from which you can survey the alternatives.

### Imitation versus innovation — Alison Gopnik

**Alison Gopnik, Eunice Yiu & Eliza Kosoy** — "Imitation versus Innovation: What Children Can Do That Large Language and Language-and-Vision Models Cannot (Yet)?" (Perspectives on Psychological Science 2024). https://journals.sagepub.com/doi/10.1177/17456916231201401.

The empirical anchor for the cultural-technology view. Gopnik shows that LLMs are exceptionally powerful at *imitating* human cultural production but lack the innovative, causal-exploratory capacities of four-year-olds. This is not a deflationary point — imitation at this scale has never existed before — but it locates the LLM's specific competence: it is a *cultural* engine, an aggregator of what humans have already produced, not an *individual* engine that produces novel hypotheses about the world.

The accessible articulation is in Gopnik's *Conversations with Tyler* episode and her "Stone Soup AI" piece for the Simons Institute (https://simons.berkeley.edu/news/stone-soup-ai). The "stone soup" framing is rhetorically strong: the LLM adds little of its own; the value comes from the human cultural inputs. The model is the stone in the soup.

For the keynote: Gopnik is your strongest empirical voice for the cultural-technology framing. She is also the single thinker most likely to land with both linguists (developmental psycholinguistics) and HCI (her work is cited heavily there).

### AI as a familiar-looking monster — Farrell & Shalizi

**Henry Farrell & Cosma Shalizi** — "Artificial intelligence is a familiar-looking monster" / "Behold the AI shoggoth" (The Economist 2023). https://www.economist.com/by-invitation/2023/06/21/artificial-intelligence-is-a-familiar-looking-monster-say-henry-farrell-and-cosma-shalizi.

A more polemical version of the same argument. The shoggoth — the unspeakable, partially-formed creature from Lovecraft, recently adopted in AI culture as an image of the LLM under the smiling mask — is, Farrell and Shalizi argue, a creature humanity has *long lived among*: "the market system, bureaucracy, and even electoral democracy." Each is a vast, distributed, partially-illegible information-processing system. We have democratic and intellectual vocabulary for those shoggoths. We can extend it.

For the keynote: this is the rhetorical pivot from "LLMs are scary because they are alien" to "LLMs are scary because they are familiar." It is a strong move for an academic audience because it locates AI inside political theory rather than science fiction.

### AI as Normal Technology — Narayanan & Kapoor

**Arvind Narayanan & Sayash Kapoor** — "AI as Normal Technology" (Knight First Amendment Institute 2025). https://knightcolumbia.org/content/ai-as-normal-technology.

The most policy-influential alternative framing. Their argument: AI is a general-purpose technology like electricity or the internet — not a separate species, not an alien intelligence, not the dawn of AGI. The framing implies that AI's diffusion will be slow, contested, and shaped by the same institutional, regulatory, and economic forces that shaped previous general-purpose technologies. Their book *AI Snake Oil* (Princeton UP 2024) extends this with the distinction between predictive AI (largely snake oil) and generative AI (more genuine but more limited than the hype suggests), organized around the "ladder of generality."

What "normal technology" foregrounds: continuity with prior technology adoption, the role of institutions, the slow time-scale of real diffusion. What it hides: anything genuinely novel about LLMs as a substrate. The framing is strongest as a corrective to AGI-tinted apocalypse and weakest as a description of the day-to-day phenomenology of using a chatbot.

For the keynote: Narayanan and Kapoor give you policy legitimacy. They are the people regulators are reading.

### The vulnerability of the cultural-technology family

The cultural-technology framing is intellectually powerful at the societal scale but does almost no work at the interface scale. It tells a designer "your LLM is part of a cultural-technological system" but does not tell them whether to ship a chat box, a sketchbook, or a HUD. This is why the talk needs the constructive families too.

---

## 6. The bureaucracy / institution / governance family

> **Slogan:** "It's an institution, not an intellect — and institutions can be unjust."

A close cousin to the cultural-technology family. Where cultural-technology emphasizes aggregation of knowledge, the bureaucracy framing emphasizes aggregation of *decision-making* and the political economy that surrounds it. This family is the strongest for power and accountability harms.

### The Unaccountability Machine — Dan Davies

**Dan Davies** — *The Unaccountability Machine* (Profile 2024 / U. Chicago Press 2025). https://press.uchicago.edu/ucp/books/book/chicago/U/bo252799883.html.

Davies, drawing on Stafford Beer's management cybernetics, argues that bureaucracies and corporations *already are* AIs — they are vast information-processing systems that make decisions no individual is accountable for. He coins the phrase **accountability sink**: the structural mechanism by which a decision gets made and no human can be held responsible for it. LLM systems slot into this analysis seamlessly.

The metaphor's payoff: it gives you a developed political vocabulary — accountability, legitimacy, oversight, due process — for things that the cognitive metaphors (mind, agent, partner) systematically obscure. If the LLM is part of an unaccountability machine, the question is not "how do we trust the AI?" but "where is the accountability sink, and how do we close it?"

For the keynote: Davies is the strongest single source for treating the LLM-driven product as a *governance* phenomenon. Worth a passing reference even if you don't develop the line.

### AI as Governance — Henry Farrell

**Henry Farrell** — "AI as Governance" (Annual Review of Political Science 2025). https://www.annualreviews.org/content/journals/10.1146/annurev-polisci-040723-013245.

Farrell's scholarly elaboration of the line he and Shalizi have been pushing in essays. AI is best understood as a means of *collective information processing*, not individual intelligence. This makes it a governance phenomenon, comparable to markets and bureaucracies, with implications for democratic theory.

### Algorithms as bureaucracy — Farrell & Fourcade

**Marion Fourcade & Henry Farrell** — "The Moral Economy of High-Tech Modernism" (Daedalus 2023). https://direct.mit.edu/daed/article/152/1/225/115009/.

ML systems perform the dual logic of bureaucracy (classification) plus market (allocation). The LLM is then a sociologically familiar object: a Weberian rationalization apparatus, dressed in conversational clothing.

For the keynote: this family is your strongest move when someone in the audience says "but companies are using AI in legitimate ways." Bureaucracies are also legitimate. They are also frequently unjust.

---

## 7. The cognitive prosthesis / extended mind / tool-for-thought family

> **Slogan:** "It is not your interlocutor. It is part of how you think."

This family threads the needle between the deflationary "it's just a tool" and the agent metaphor's "it's a partner." The argument: yes, the LLM is a tool, *and* tools, when integrated into our cognitive lives, become part of cognition itself. The metaphor preserves user agency without denying the LLM does real cognitive work.

### The extended mind — Clark & Chalmers

**Andy Clark & David J. Chalmers** — "The Extended Mind" (Analysis 1998). https://philpapers.org/rec/CLATEM. Clark's later books, especially *Natural-Born Cyborgs* (2003) and *Supersizing the Mind* (2008), develop the line.

The thought experiment: Otto, who has Alzheimer's, uses a notebook to record information he can't keep in his head. When Otto wants to go to the museum, he consults the notebook the way you or I would consult memory. Clark and Chalmers argue, on the **parity principle**, that Otto's notebook is part of his mind — not metaphorically but constitutively.

For LLMs the implication is direct: a tool you reliably consult, integrate into your workflow, and rely on for cognitive operations is, at the limit, part of your cognitive system. This neither deifies the LLM nor reduces it to inert matter. It locates the LLM in a long-running philosophical tradition — back through Engelbart, Vannevar Bush, and McLuhan — about how cognition is always-already extended through tools and media.

What the family foregrounds: user agency, augmentation lineage, the constructive role of tools in cognition. What it backgrounds: distributional unfairness (whose minds get extended?), hidden labor, the political economy of who builds the tools.

For the keynote: extended mind is the philosophical license to say "the LLM does cognitive work" without saying "the LLM is a mind."

### Augmenting Human Intellect — Engelbart

**Douglas Engelbart** — "Augmenting Human Intellect: A Conceptual Framework" (SRI 1962). https://www.dougengelbart.org/pubs/augment-3906.html.

The foundational document. Engelbart's H-LAM/T system — Human, using Language, Artifacts, Methodology, Training — is the canonical alternative to AI-as-replacement. The computer is the artifact; language is the symbolic substrate; methodology is the interface design; the human remains central.

Engelbart's framing predates AI in its modern sense, which is exactly the point: he gives us a vocabulary for human-computer interaction that does not assume the computer is a mind, and the vocabulary still works. For the keynote, Engelbart is your historical anchor.

### Tools for thought — Matuschak, Nielsen, Carter

**Andy Matuschak & Michael Nielsen** — "How can we develop transformative tools for thought?" (San Francisco 2019). https://numinous.productions/ttft/.

**Shan Carter & Michael Nielsen** — "Using Artificial Intelligence to Augment Human Intelligence" (Distill 2017). https://distill.pub/2017/aia/.

The contemporary heirs of Engelbart. Matuschak and Nielsen's manifesto argues that the goal of computing should be *transformative tools for thought* — media that radically transform what people can think and do. Carter and Nielsen's earlier essay reframes AI as **artificial intelligence augmentation (AIA)** — AI in service of cognitive amplification rather than autonomous agency.

> At its deepest, interface design means developing the fundamental primitives human beings think and create with.

For the keynote: AIA is the cleanest articulation of the augmentation framing applied specifically to AI. Cite Carter and Nielsen alongside Engelbart to make the through-line visible.

### Thought partner — Collins, Sucholutsky, et al.

**Katherine M. Collins, Ilia Sucholutsky, Umang Bhatt, Kartik Chandra, Lionel Wong, Mina Lee, Cedegao E. Zhang, Tan Zhi-Xuan, Mark Ho, Vikash Mansinghka, Adrian Weller, Joshua B. Tenenbaum & Thomas L. Griffiths** — "Building Machines That Learn and Think with People" (Nature Human Behaviour 2024). https://arxiv.org/abs/2408.03943.

A serious academic proposal for the **thought partner** metaphor as an alternative to "tool for thought" and "copilot." The argument: as LLMs become genuine collaborators in extended reasoning, "tool" undersells what they do, while "agent" or "copilot" oversells autonomy. "Thought partner" is the correct middle.

The companion paper — Oktar et al. (2025), "Identifying, Evaluating, and Mitigating Risks of AI Thought Partnerships" — works through the harms specific to the partner framing. https://arxiv.org/abs/2505.16899.

For the keynote: I would treat "thought partner" with caution. It carries most of the anthropomorphic harms of "assistant" while wearing scholarly clothing. Worth citing as a sophisticated proposal, but not endorsing without the Oktar caveats.

---

## 8. The sketchbook / canvas / dynamic document / malleable software family

> **Slogan:** "Stop talking to it. Make something with it."

This is the constructive HCI family — the one that does the most practical work at the interface level. It is also where the most live, generative thinking is happening. Most of these thinkers are practitioners; their venues are essays, talks, lab reports, and prototypes rather than peer-reviewed journals. For the keynote, this is the family you can show *moving*.

### Language Model Sketchbook — Maggie Appleton

**Maggie Appleton** — "Language Model Sketchbook, or Why I Hate Chatbots" (2023). https://maggieappleton.com/lm-sketchbook. "Squish Meets Structure: Designing with Language Models" (2023). https://maggieappleton.com/squish-structure. "A Treatise on AI Chatbots Undermining the Enlightenment" (2025). https://maggieappleton.com/ai-enlightenment.

Appleton is probably the single most generative thinker on this question outside the academy. The sketchbook proposal is concrete: instead of a chat box, an LLM-powered design surface populated with **daemons** — small background characters that perform specific cognitive functions. The Devil's advocate. The cheerleader. The synthesiser. The fact-checker. Each is a tiny, bounded LLM agent inside a larger document — what Appleton calls **"spell-check sized"** tools.

> Most language model implementations should be 'spell-check sized.' They should do one specific thing well.

The argument against the chat box is sharp:

> We are irreversibly anchored to this text-heavy, turn-based interface paradigm. But it's also the lazy solution.

The "Squish Meets Structure" essay extends the line: LLMs are squishy (probabilistic, ambiguous, generative); good interfaces give that squishiness *structure* by embedding it in documents, forms, fields, and constraints. The 2025 "Treatise" is a longer attack on the all-in-one text box and on the default sycophant personality.

For the keynote: Appleton is your strongest single voice for the constructive HCI alternative. The "spell-check sized" framing is rhetorically powerful and technically defensible.

### Malleable software — Geoffrey Litt

**Geoffrey Litt** — "Malleable software in the age of LLMs" (2023). https://www.geoffreylitt.com/2023/03/25/llm-end-user-programming.html. "Is chat a good UI for AI? A Socratic dialogue" (2025). https://www.geoffreylitt.com/2025/06/29/chat-ai-dialogue. "ChatGPT as muse, not oracle" (2023).

Litt's central argument: LLMs are a step change in tool support for *end-user programming*. The metaphor is not "talk to the assistant" but "shape the software you use." His "muse vs. oracle" essay frames the LLM as a generative collaborator that the user remains in charge of. His Socratic dialogue piece concedes the partial usefulness of chat — "natural language and precision inputs are complementary" — without ceding the field to it.

For the keynote: Litt is your strongest source for *user agency* as the design value the chat metaphor undermines.

### Ink & Switch — the lab tradition

**Ink & Switch** — "Malleable software: Restoring user agency in a world of locked-down apps" (2025). https://www.inkandswitch.com/essay/malleable-software/. "Embark: Dynamic documents for making plans" (LIVE 2023). https://www.inkandswitch.com/embark/. "Potluck" (2022). https://www.inkandswitch.com/potluck/. "Local-first software" (Onward! 2019). https://www.inkandswitch.com/essay/local-first/.

Ink & Switch is a research lab whose collective output forms the most coherent body of work on alternatives to chat. The malleable-software manifesto is dense with metaphors: **clay** (versus appliance), **luthier's workshop**, **kitchen knife** (not avocado slicer), **gentle slope from user to creator**. The argument:

> The original promise of personal computing was a new kind of clay — a malleable material that users could reshape at will. Instead, we got appliances.

The Embark project specifically positions LLMs as *collaborators inside a structured document* rather than as conversational agents. Potluck shows gradual enrichment of plain text into computational software. Local-first is the philosophical stance underwriting all of this — software that respects user agency, data ownership, and durability.

For the keynote: Ink & Switch is the strongest single body of *implemented* alternatives. Cite them when someone says "but the alternatives are vapor."

### Tool-for-thought interfaces — Wattenberger

**Amelia Wattenberger** — "Why Chatbots Are Not the Future" (2023). https://wattenberger.com/thoughts/boo-chatbots/. "Fish-eye lens for text" (2024). https://wattenberger.com/thoughts/fish-eye.

The canonical practitioner critique. Wattenberger's "gloves" framing is widely-quoted: good tools advertise their use through their shape. A chat box advertises nothing; it is a featureless aperture. Her "Fish-eye lens" essay proposes a specific alternative — a focus-plus-context interface for text where the user can see local detail and global structure simultaneously, with zoom levels.

> When I go up the mountain to ask the ChatGPT oracle a question, I am met with a blank face.

For the keynote: Wattenberger's "gloves" line is a strong opening or closing image.

### Dynamicland and the dynamic medium — Bret Victor

Bret Victor's homepage (https://worrydream.com/) explicitly disavows engagement with AI. His pre-LLM work nonetheless underwrites most contemporary anti-chat proposals.

**Bret Victor** — "Magic Ink" (2006). https://worrydream.com/MagicInk/. "Inventing on Principle" (CUSEC 2012). https://worrydream.com/InventingOnPrinciple/. "Learnable Programming" (2012). https://worrydream.com/LearnableProgramming/. **Dynamicland.** https://dynamicland.org/.

Victor's argument across all of these: software should be a *dynamic medium*, whole-bodied, tangible, immediate, and live. The chat box is its near-perfect inverse — disembodied, abstract, mediated, opaque. Dynamicland enacts the alternative as a physical room where computation lives in objects on tables.

For the keynote: Victor is your historical conscience for the constructive family. He didn't argue against LLM chat because LLMs hadn't shipped yet, but every argument he made against bad software design lands directly on the chat box.

### Latent-space cartography — Linus Lee (revisited)

Lee's microscope/lens framing fits here too. His prototypes treat the LLM as a navigable space rather than an interlocutor.

### Dot, generative UI, and adjacent prototypes

**Jason Yuan / New Computer / Dot.** https://new.computer. An intelligent guide / AI companion with persistent memory and structured cards rather than fuzzy chat. **Google Research — "Generative UI" (2025).** https://research.google/blog/generative-ui-a-rich-custom-visual-interactive-user-experience-for-any-prompt/. Entire UI generated per prompt rather than chat-text response.

These are prototypes worth knowing about because they show the design space is being explored at industry scale, not just in research labs.

### Why this family does the most fairness work at the interface

The sketchbook / canvas / malleable-software family is, in my reading of the harms literature, the family that delivers the most fairness gains at the interface level. It preserves user agency, makes affordances visible, breaks the unitary chat box into specific tools for specific tasks, and directly counters the asymmetric monologue of the chatbot. Its weakness is that it has the least academic legitimacy of any family in this reader — the work is in essays, prototypes, and lab reports rather than peer-reviewed venues. But that is partly why your keynote is well-positioned: you are an HCI audience, and HCI is the field that should be reading this material.

---

## 9. The centaur / partner / co-pilot family — and why to be careful with it

> **Slogan:** "Human plus AI is more than either alone."

A family worth covering in part because your audience will be familiar with it, in part because it is the dominant industry framing (Microsoft Copilot, GitHub Copilot, "AI teammate"), and in part because I think it deserves the most caution of any family in this reader.

### The centaur lineage

**Garry Kasparov** introduced "Advanced Chess" / centaur chess in 1998. https://en.wikipedia.org/wiki/Advanced_chess. The empirical claim was that human-plus-AI teams could outperform either alone. This claim has eroded in chess (the AI is now strong enough that the human contribution is marginal) but the metaphor has migrated.

**Fabrizio Dell'Acqua, Edward McFowland III, Ethan Mollick et al.** — "Navigating the Jagged Technological Frontier" (HBS WP 2023). https://www.hbs.edu/ris/Publication%20Files/24-013_d9b45b68-9e74-42d6-a1c6-c72fb70c7282.pdf. The most-cited recent paper. A 758-consultant field experiment that distinguishes **centaurs** (clean delegation, human handles some tasks, AI handles others) from **cyborgs** (intertwined, the human and AI work on the same task at fine grain). The "jagged frontier" is the key concept: AI is unevenly competent, and consultants who couldn't see the frontier *actively did worse* with AI.

### The mixed-initiative tradition

**Eric Horvitz** — "Principles of Mixed-Initiative User Interfaces" (CHI 1999). https://erichorvitz.com/chi99horvitz.pdf. A classic. Designs the agent/direct-manipulation debate as expected-utility design: the system takes initiative when its expected benefit exceeds the cost of interruption.

**Saleema Amershi, Daniel S. Weld, Mihaela Vorvoreanu et al.** — "Guidelines for Human-AI Interaction" (CHI 2019). https://www.microsoft.com/en-us/research/wp-content/uploads/2019/01/Guidelines-for-Human-AI-Interaction-camera-ready.pdf. 18 normative guidelines for AI-infused interfaces. Industry-influential.

**Jeffrey Heer** — "Agency Plus Automation: Designing Artificial Intelligence into Interactive Systems" (PNAS 2019). https://idl.cs.washington.edu/files/2019-AgencyPlusAutomation-PNAS.pdf. Updates the 1997 Shneiderman-Maes debate for the ML era. Proposes **shared representations** that either human or machine can edit.

### Why be careful

The centaur / partner / copilot family carries most of the anthropomorphic harms of "assistant" while wearing scholarly clothing. It implies a peer relationship that the LLM cannot sustain. It obscures the jagged frontier (Dell'Acqua et al.'s own finding undercuts the metaphor's optimism). And the harms literature is consistent: where users frame the LLM as a partner, sycophancy and dependency rise.

Two papers explicitly document the costs.

**Ben Green & Yiling Chen** — "Disparate Interactions: An Algorithm-in-the-Loop Analysis" (FAT* 2019). https://www.benzevgreen.com/wp-content/uploads/2019/02/19-fat.pdf. Humans-in-the-loop produce *worse* decisions than algorithm or human alone in their experiments — the partnership framing was actively harmful.

**Ben Green** — "The Flaws of Policies Requiring Human Oversight of Government Algorithms" (CLSR 2022). https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3921216. Oversight legitimates flawed systems.

For the keynote: this is the family I would treat most carefully. Acknowledge it, name what it gets right (some tasks are genuinely jointly accomplished), but flag the harms. "Thought partner" goes here too — covered in the prosthesis section above with the Oktar caveats.

---

## 10. The extractive / colonial / heteromated infrastructure family

> **Slogan:** "Whose labor, whose minerals, whose data, whose land?"

The most political family. Strongest on power and labor harms; weakest at the interface level. Read it for the moral weight you may want at moments in the talk.

### Atlas of AI — Kate Crawford

**Kate Crawford** — *Atlas of AI: Power, Politics, and the Planetary Costs of Artificial Intelligence* (Yale UP 2021). https://yalebooks.yale.edu/book/9780300264630/atlas-of-ai/.

The metaphor: AI as **extractive infrastructure**. Crawford traces AI through its material substrate — minerals, energy, data, classification, state power — and argues that the cognitive metaphors (intelligence, mind, agent) systematically obscure this materiality.

> AI is neither artificial nor intelligent.

For the keynote: cite when you want to invoke the political economy.

### Algorithmic colonization — Abeba Birhane

**Abeba Birhane** — "Algorithmic Colonization of Africa" (SCRIPTed 2020). https://script-ed.org/article/algorithmic-colonization-of-africa/.

Birhane reads contemporary AI as a continuation of corporate-driven colonial extraction. The metaphor is colonialism, applied to data, labor, and infrastructure flows.

### Ghost Work — Gray & Suri

**Mary L. Gray & Siddharth Suri** — *Ghost Work: How to Stop Silicon Valley from Building a New Global Underclass* (HMH 2019). https://ghostwork.info/.

The ethnographic foundation for understanding the *invisible labor* powering "automated" AI. Annotators, content moderators, click-workers — the human substrate of the LLM stack.

### Heteromation — Ekbia & Nardi

**Hamid R. Ekbia & Bonnie A. Nardi** — *Heteromation, and Other Stories of Computing and Capitalism* (MIT 2017). https://mitpress.mit.edu/9780262036252/heteromation-and-other-stories-of-computing-and-capitalism/.

Coins **heteromation**: hidden labor offloaded to users and ghost workers under the rhetoric of automation. The metaphor reframes the LLM stack as a labor-extraction system disguised as a cognitive system.

For the keynote: this family is the moral floor. You do not need to develop it at length, but a single citation — Crawford or Gray-Suri — earns you the moral weight to make the rest of the critique stick.

---

## 11. The foundational HCI ground

> **Slogan:** "Forty years of HCI theory already gave us better metaphors. We forgot to use them."

Briefly, because your audience knows this material. The point is to reactivate it as live ground for the chat-vs-not-chat debate.

### Hutchins, Hollan & Norman — model-world vs. conversation

**Edwin L. Hutchins, James D. Hollan & Donald A. Norman** — "Direct Manipulation Interfaces" (HCI 1985). http://sonify.psych.gatech.edu/~ben/references/hutchins_direct_manipulation_interfaces.pdf.

The single most important HCI paper for your talk. They explicitly identify two competing root metaphors of HCI: **model-world** (the interface is a place where the user can act, and that changes state in response to user actions) and **conversation** (the interface is an interlocutor with whom the user negotiates intentions). They introduce the **gulfs of execution and evaluation** — the cognitive distance between user intent and system action, and between system state and user understanding.

> In a system built on the model-world metaphor, the interface is itself a world where the user can act, and that changes state in response to user actions.

For the keynote, this is the conceptual hinge. The conversation-vs-model-world distinction is forty years old and has more to give than the conversation side has had.

### Direct manipulation — Shneiderman

**Ben Shneiderman** — "Direct Manipulation: A Step Beyond Programming Languages" (IEEE Computer 1983). https://ieeexplore.ieee.org/document/1654471/.

Coins direct manipulation: visible objects, rapid reversible incremental actions, replacement of command syntax with action on a model world. The 1997 debate with Pattie Maes (Shneiderman vs. Maes, Interactions 4(6)) is the locus classicus of the *tool* vs. *agent* framing. https://www.cs.umd.edu/users/ben/papers/Shn-Maes-v4n6-1997.pdf.

> The intelligent agent notion limits the imagination of the designer.

### Kay, Goldberg, Engelbart — augmentation lineage

Already covered above in the prosthesis family. Kay's "Doing with images makes symbols" (in his "User Interface: A Personal View," 1990) is the cognitive rationale for the GUI: enactive → iconic → symbolic. The chat box collapses all three into the symbolic layer. https://worrydream.com/refs/Kay%20-%20User%20Interface,%20a%20Personal%20View.pdf.

### The desktop metaphor itself — the cautionary tale

**David Canfield Smith et al.** — "Designing the Star User Interface" (Byte 1982). https://www.researchgate.net/publication/234781794. The desktop metaphor is the canonical case of an interface metaphor that *worked* — it gave a generation of users a foothold for understanding personal computing. It also, eventually, became a constraint that designers had to reckon with. Don Norman's *The Invisible Computer* (MIT 1998) argues that successful technologies must shed their metaphors as they mature.

For the keynote: the desktop is the precedent for chat. Both are real interface metaphors that did real work; both also outlive their usefulness. The question is whether we are at the equivalent of 1992 (still useful) or 2002 (constraint).

### Calm technology, theatre, situated action

**Mark Weiser** — "The World Is Not a Desktop" (Interactions 1994). https://dl.acm.org/doi/10.1145/174800.174801. Weiser's most concise direct attack on desktop-as-master-metaphor: "A good tool is an invisible tool." A good prompt for thinking about whether a chat box is invisible enough.

**Brenda Laurel** — *Computers as Theatre* (1991/2013). Aristotelian dramatic theory applied to HCI: interaction as designed mimesis. A useful counterpoint to chat.

**Lucy Suchman** — *Plans and Situated Actions* (1987) and *Human-Machine Reconfigurations* (2007). https://www.cambridge.org/9780521858915. The foundational ethnomethodological critique of the planner/agent metaphor. "Plans are resources for action, not determinants of action." Her 2023 piece "The Uncontroversial 'Thingness' of AI" extends this into the LLM era: even critics inadvertently reify "AI" as a stable agential thing.

### Lakoff & Johnson, in HCI

**George Lakoff & Mark Johnson** — *Metaphors We Live By* (1980). The cognitive-linguistic source text underwriting nearly every HCI metaphor paper. Your linguist audience already knows it; the move on stage is to apply it specifically to the chat metaphor: what does it highlight, what does it hide, and what entailments does it import?

**Alan F. Blackwell** — "The Reification of Metaphor as a Design Tool" (TOCHI 2006). https://dl.acm.org/doi/10.1145/1188816.1188820. The major HCI-internal historiography of "metaphor" itself, tracing it through Bruner, Papert, Kay, Smith, PARC. Argues "metaphor" has been reified — treated as a stable design object when it is a contested theoretical term. A clarifying read.

**Manuel Imaz & David Benyon** — *Designing with Blends: Conceptual Foundations of Human-Computer Interaction and Software Engineering* (MIT 2007). Updates HCI metaphor theory using Fauconnier & Turner's **conceptual blending**: good design is design of *emergent blended spaces*, not source→target mappings. Worth knowing because conceptual blending gives you a more sophisticated tool for analyzing what happens when "conversation" and "LLM" are blended.

---

## 12. The empirical evidence that metaphor is a design lever

A short section, because the keynote will be stronger if you can point to *evidence* that metaphor matters and not just to philosophical arguments.

### Conceptual metaphors impact perception — Khadpe, Krishna et al.

**Pranav Khadpe, Ranjay Krishna, Li Fei-Fei, Jeffrey T. Hancock & Michael S. Bernstein** — "Conceptual Metaphors Impact Perceptions of Human-AI Collaboration" (CSCW 2020). https://arxiv.org/abs/2008.02311.

The single strongest experimental evidence that metaphor is a design lever. A Wizard-of-Oz study (N=260) varying *only* the introductory metaphor used to describe an AI assistant — wry teenager / toddler / experienced butler / inexperienced butler — measurably shifts usability ratings, cooperation, and continued-use intent, *even when the AI's actual behavior is held identical*. They map metaphors along **warmth × competence**, the canonical social-psychology dimensions.

For the keynote: this is the *one paper* you can hold up to say "metaphor choice is not aesthetics, it is measurable design intervention." Cite it whenever someone in the audience implies metaphor is decoration.

### Linguistic cues drive anthropomorphism — DeVrio et al.

**Alicia DeVrio, Myra Cheng, Liwei Jiang, Maarten Sap & Su Lin Blodgett** — "A Taxonomy of Linguistic Expressions That Contribute to Anthropomorphism" (CHI 2025). https://arxiv.org/abs/2502.09870.

A taxonomy of textual cues — first-person pronouns, claims of cognition, claims of feeling, memory-language. Companion to Cheng's AnthroScore work (https://arxiv.org/abs/2402.02056), which is the computational metric for tracking these cues at scale.

### Multi-turn anthropomorphism — Ibrahim et al.

**Lujain Ibrahim, Canfer Akbulut, Rasmi Elasmar, Charvi Rastogi, Minsuk Kahng, Meredith Ringel Morris, Kevin McKee, Verena Rieser, Murray Shanahan & Laura Weidinger** — "Multi-turn Evaluation of Anthropomorphic Behaviours in Large Language Models" (2025). https://arxiv.org/abs/2502.07077.

The DeepMind AnthroBench paper. Demonstrates that most anthropomorphic behaviors only emerge across multiple dialogue turns, not in single-turn benchmarks. Important because it shows the *interface* matters: a single-shot LLM call doesn't elicit the same anthropomorphism as a chat session.

### The rising tide of anthropomorphism in research itself

**Lujain Ibrahim & Myra Cheng** — "Thinking Beyond the Anthropomorphic Paradigm Benefits LLM Research" (2025). https://arxiv.org/abs/2502.09192. Documents that >40% of LLM-related arXiv abstracts use anthropomorphic framing, rising from 34% to 48% between January 2023 and December 2024. The *researchers* are anthropomorphizing too.

For the keynote: this is the finding that lets you say "even the academic literature has been recruited into the chat metaphor." It is also a useful provocation to a CHI/linguistics audience: *we* are part of the problem.

---

## 13. Comparing your own metaphors — a framework

You said you have your own metaphors and want to compare. Here is the framework I'd use to place them, drawn from the patterns across the families above.

### Five axes for placing any LLM metaphor

For any metaphor — yours or anyone else's — I'd run it through five questions. The questions are stolen from across this reader; together they are a working evaluation rubric.

**1. What does it foreground?** Every metaphor highlights some aspects of the target. List what your metaphor makes visible. Mechanism? Provenance? Hidden labor? User agency? Epistemic risk? Aesthetic experience? Power? The Lakoff-Johnson-via-So-Cheng-Murthy move.

**2. What does it background?** Every metaphor hides what it doesn't highlight. List what your metaphor obscures. Crawford's Atlas hides the user's phenomenology of use. Bender's parrot hides the work LLMs really do. Litt's HUD hides agentic delegation. What does yours hide?

**3. What entailments does it import?** Conversation imports turn-taking, sincerity, accountability. Library imports browsing, cataloguing, citation. Centaur imports peer-collaboration. Pet imports affection and dependence. Make the entailments explicit — they are usually the part of the metaphor that does the most unconscious work.

**4. At what scale does it work?** Cultural-and-social technology works at the societal scale and fails at the interface scale. Sketchbook works at the interface scale and is silent on policy. HUD works at the task scale. Where does your metaphor live? Is it a societal frame, a product frame, an interaction frame? A metaphor that pretends to work at all scales usually works at none.

**5. What harms does it do, what harms does it prevent?** Drawn from the harms-research pass. Some metaphors directly cause harm (chat → dependency, sycophancy). Some directly prevent harm (HUD → user agency preserved). Some are neutral on harm but enable misframing. Be explicit.

### A worked example — the chat box itself, run through the framework

To show the rubric in action, here is the incumbent.

**Foregrounds:** naturalness, low learning curve, accessibility, the LLM's linguistic competence.
**Backgrounds:** mechanism, provenance, training corpus, the existence of a designer, the existence of a business model, the asymmetry between user and platform.
**Entailments imported:** turn-taking, intentions, sincerity by default, memory, accountability, reciprocity — none of which the LLM can sustain.
**Scale:** primarily interface scale, but it has been over-extended to societal scale ("we now live in a world where you can talk to AI").
**Harms caused:** dependency, parasocial attachment, sycophancy uptake, miscalibrated trust, source disintermediation.
**Harms prevented:** very few, beyond reducing the cognitive cost of first contact.

Your own metaphors will look different along these axes. The exercise is not to find a metaphor that scores perfectly on all five — none does — but to know exactly what trade-offs you are making.

### A second exercise — the Khadpe positioning

Khadpe et al.'s warmth × competence map is a useful second positioning device. For each of your metaphors, ask: where on warmth × competence does it sit?

- **High warmth, high competence:** experienced butler (their best-performing metaphor). Risks anthropomorphic harms.
- **Low warmth, high competence:** instrument, calculator, library, microscope. Best at fairness; weak at adoption.
- **High warmth, low competence:** toddler, pet, intern. Useful for managing user expectations of error.
- **Low warmth, low competence:** parrot, blurry JPEG. Useful as deflationary corrective; bad for actually getting work done.

If your metaphor sits in the same quadrant as one of Khadpe's tested metaphors, you can borrow her empirical findings about how users respond.

### A third exercise — the layered-metaphor test

The synthesis from the earlier research pass argued that the healthiest design uses *layered* metaphors: cultural-and-social technology at the societal level, library at the epistemic level, sketchbook/HUD/dynamic-document at the interface level. Different metaphors for different scales.

If your metaphor is meant to do *all the work*, it will probably break under the load. Ask: what other metaphors does mine need to be paired with? What is the metaphor I am replacing, and is it doing work at a scale my new metaphor doesn't reach?

### Prompts to think with

Some questions to bring to your own metaphors:

- What is the *source domain* you are drawing from? (Conversation draws from human-human messaging; library from physical libraries; HUD from fighter aircraft.) Is the source domain familiar enough to your audience to do work?
- What does your metaphor make *easy* for users that the chat box makes hard?
- What does your metaphor make *hard* for users that the chat box makes easy? (This question is harder and more important. Every metaphor closes some doors.)
- What does your metaphor say about *who is responsible* when something goes wrong? Conversation says the user is responsible (you didn't ask the right way). Library says the institution is. Tool says the user. HUD says the system. Whose accountability does your metaphor enable?
- Can you instantiate it as a sketch or prototype, or is it purely descriptive? Appleton, Litt, and Wattenberger have prototypes; Bender and Shanahan don't. The two kinds of metaphor do different work.

### A note on rhetorical strategy

Watch out for the all-purpose metaphor. The strongest single move I think you can make on stage is to argue *against* the unitary chat box not by replacing it with a unitary alternative, but by arguing for a *layered* approach — different metaphors for different jobs, the way we already have different interface paradigms for different software. Your linguist audience will appreciate the move because it parallels register and genre theory; your HCI audience will appreciate it because it parallels existing distinctions between, say, document editing and command-line work.

If you have one strong metaphor that does *one job well*, that is more valuable for the talk than a metaphor that tries to do everything. The unitary box is the disease; another unitary box is not the cure.

---

## 14. A short reading order for the week

Given a week, here is what I would actually read, in order, given the time you have. This prioritizes the strongest single piece per family rather than completeness.

**Monday — the deflationary canon** (the rhetorical floor)

- Bender, Gebru et al., "On the Dangers of Stochastic Parrots" (FAccT 2021). 14 pages.
- Shanahan et al., "Role play with large language models" (Nature 2023). 8 pages.
- Chiang, "ChatGPT Is a Blurry JPEG of the Web" (New Yorker 2023). 3,000 words.

**Tuesday — the cultural-technology canon** (the academic legitimacy)

- Farrell, Gopnik, Shalizi & Evans, "Large AI models are cultural and social technologies" (Science 2025). Short — read carefully.
- Narayanan & Kapoor, "AI as Normal Technology" (Knight 2025). Skim the long-form; read the framing carefully.
- Gopnik, "Imitation versus Innovation" (PPS 2024). 12 pages.

**Wednesday — the constructive HCI canon** (the design vocabulary)

- Appleton, "Language Model Sketchbook, or Why I Hate Chatbots" (2023).
- Litt, "Enough AI copilots! We need AI HUDs" (2025).
- Wattenberger, "Why Chatbots Are Not the Future" (2023).
- Ink & Switch, "Malleable software" (2025). Skim.

**Thursday — the foundational HCI ground**

- Hutchins, Hollan & Norman, "Direct Manipulation Interfaces" (HCI 1985). The hinge. Read in full.
- So, Cheng & Murthy, "Beyond Anthropomorphism: A Spectrum of Interface Metaphors for LLMs" (CHI EA 2026). The bridge between ground and present.

**Friday — the empirical evidence and the harms ground**

- Khadpe et al., "Conceptual Metaphors Impact Perceptions of Human-AI Collaboration" (CSCW 2020).
- DeVrio et al., "A Taxonomy of Linguistic Expressions" (CHI 2025). Skim.
- Inie et al., "From 'AI' to Probabilistic Automation" (FAccT 2024).

**Weekend — your own metaphors**

- Run yours through the five-axis rubric in section 13.
- Decide which existing metaphors yours pairs with, and which ones it argues against.
- Pick the *one* metaphor you'll defend on stage, and the *one* you'll argue against. Don't try to defend more than one; the talk will lose its line.

---

## A closing thought

The single most generative move I think you can make on stage is to argue that conversation is a *deployment artifact dressed up as a design choice*. The HCI literature has the materials to design something better; the cultural-technology literature has the legitimacy to push past the agent metaphor; and the harms literature has the empirical evidence that metaphor choice is a measurable intervention. None of the alternatives is unitary. None of them does all the work the chat box pretends to do. That is a feature, not a bug.

Good luck.
