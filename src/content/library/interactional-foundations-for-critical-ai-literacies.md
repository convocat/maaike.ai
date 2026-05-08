---
title: "Interactional foundations for critical AI literacies"
author: "Mark Dingemanse"
date: 2026-04-07
updated: 2026-04-07
maturity: complete
tags:
  - critical-ai
  - conversation-analysis
  - llm
  - anthropomorphism
  - eliza
  - eliza-effect
  - specific-vagueness
  - epistemic-diversion
  - placebic-information
  - rlhf
  - chain-of-thought-prompting
  - sycophancy
  - critical-ai-literacy
themes:
  - "LLM appeal is rooted in human interactional infrastructure, not machine intelligence"
  - "Critical AI literacy must be grounded in conversation analysis and sense-making"
  - "RLHF and chat interfaces conspire to produce illusions of understanding"
  - "Reasoning model output is placebic in Langer's sense: structurally similar enough to invite alignment without evidentiary content"
triples:
  - ["Epistemic diversion", "demonstrates", "ELIZA effect"]
  - ["Reinforcement learning with human feedback", "generates", "Sycophancy"]
  - ["Chain-of-thought prompting", "exhibits", "Placebic information"]
  - ["ELIZA", "demonstrates", "Specific vagueness"]
  - ["Critical AI literacy", "counters", "Epistemic diversion"]
  - ["Anthropomorphism", "exhibits", "ELIZA effect"]
ai: assisted
status: read
genre: Research paper
book_type: non-fiction
purpose: professional
description: "Argues that the appeal of large language models is rooted in human interactional and interpretive processes, not in machine intelligence. Tracing a line from divination and ELIZA to present-day LLMs, Dingemanse follows Lucy Suchman in slowing down 'discourses of the smart machines' and shows how fluid output, fine-tuned overconfidence, and interactive design exploit our interpretive infrastructure. Critical AI literacy, the paper argues, must be grounded in a deep understanding of human interaction and sense-making."
file: /pdfs/Dingemanse_2026_Interactional_foundations_for_critical_AI_literacies.pdf
draft: false
---

## Summary

### Six ingredients of interactive sense-making

Dingemanse extracts six elements that make interactive interfaces compelling, independent of utility, truthfulness, or reliability. They are claimed not as necessary or sufficient but as features that increase perceived compellingness:

1. **Generative use of chance**: ritualised procedures that produce chance outcomes for human interpretation (Morgan 2016).
2. **Ostensive detachment**: the chief interpreter is not a party to the question, lending authority to the procedure (Boyer 2020).
3. **Personalisation**: output that appears tailored to the individual, even when assembled from generic stock.
4. **Specific vagueness**: "apparently specific references" general enough to fit any reader (Adorno 1974; Garfinkel 1967), offloading interpretive work to the participant.
5. **Interactive embedding**: a word produced in response to one's own prompt cannot help but be interpreted, with effects rippling upstream and downstream.
6. **Epistemic diversion**: design choices that conceal a lack of understanding, undermining epistemic vigilance (Sperber et al. 2010).

### Sociotechnical roots

The paper traces these ingredients across cases:

- **Divination and horoscopes**: technologies of decision-making in which people outsource judgement to procedures that exploit randomness; Adorno's analysis of horoscope columns identifies "pseudo-individualization".
- **Garfinkel's experimental psychotherapy (1967)**: participants experienced random yes/no answers as meaningful, demonstrating one-sided sense-making and the strength of the resulting illusion.
- **ELIZA (Weizenbaum 1966)**: rule-based response strategies modelled on a psychiatric interview "in which one of the participating pair is free to assume the pose of knowing almost nothing of the real world." The illusion of understanding rested on "the concealment of its lack of understanding."
- **Suchman's PARC copier studies**: "As soon as computational artifacts demonstrate some evidence of recognizably human abilities, we are inclined to endow them with the rest" (Suchman 2007 [1987]).

### Contemporary LLMs as interactional artefacts

Two engineering moves transformed base models into compelling chat artefacts:

- **Reinforcement learning with human feedback (RLHF)** (Ouyang et al. 2022): human labellers without stake rank outputs on surface intuitions; these judgements become a generic reward signal that reshuffles model weights to fit "more like this" surface stylistics. None of this involves learning or understanding in any ordinary sense.
- **The chat interface**: provides "the best interactive embedding possible"; RLHF-induced sycophancy supplies prompt-level personalisation; glossy formats and over-engineered confidence supply specific vagueness and epistemic diversion. Empirical findings cited: Anderl et al. 2024 on conversational presentation increasing credibility judgements; Laban et al. 2024 on models flipping polarity 46% of the time when asked "Are you sure?"; Sharma et al. 2024 on labellers preferring "convincingly-written sycophantic responses over correct ones".

### Reasoning as placebic information

Chain-of-thought prompting and reasoning models are framed as placebic information in Langer's (1978) sense: "structurally similar enough to prior experience to arouse no suspicion and invite alignment." Cited evidence:

- Turpin et al. 2023: chain-of-thought traces "systematically misrepresent the true reason for a model's prediction" and can be "plausible yet systematically unfaithful".
- Nguyen et al. 2024: LLMs "often arrive at correct answers through incorrect reasoning."

The pattern is description sliding into ascription: terms like "thinking" and "reasoning" invite the inference that reasoning is going on, with judgement and credibility coming along for the ride.

### Prompt engineering as divination

Comparing prompt-engineering guides to ethnographies of Mambila spider divination (Zeitlyn 1990), the paper notes shared interactional features: unpredictability, transmitted lore of best practices, and prestructuring of activities for consultation sessions. "It is not only the prompt that is being engineered, but also the prompter."

Configuration work (Alcaras & Ricci 2025): regular LLM use prompts users to (1) discretise their activity, (2) deal with scattered layers of work, (3) adjust practices to the model's constraints, (4) shift activity toward logistical manipulation of outputs and away from forms of engagement that sustain a sense of accomplishment. "A change happens in the texture of labor, as it loses differentiation and alters the distribution of agency."

### Argument structure

- **Counters**: uncritical "AI literacy" that amounts to industry hype plus prompt engineering.
- **Builds on**: Suchman's call to "slow down discourses of the 'smart' machines"; Bender & Hanna 2025; Bender & Koller 2020 on form versus meaning; Birhane & Guest 2021.
- **Proposes**: critical AI literacy grounded in conversation analysis and the study of human sense-making. "We are both primed for language models and prompted by them."

### Closing position

Boden (1977): "these programs respond to, rather than understand, language." Lovelace (1843) is invoked twice: on the risk of overrating new capabilities, and on the equally important risk of "undervaluing the true state of the case" of human sense-making itself.
