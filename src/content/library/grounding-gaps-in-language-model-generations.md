---
title: "Grounding gaps in language model generations"
author: "Omar Shaikh, Kristina Gligorić, Ashna Khetan, Matthias Gerstgrasser, Diyi Yang, Dan Jurafsky"
date: 2026-04-02
status: read
maturity: complete
file: /pdfs/2311.09144v2__1_.pdf
tags:
  - conversational-grounding
  - conversational-ai
  - common-ground
  - communication
  - llm
  - instruction-tuning
  - preference-optimization
  - grounding-gap
  - clarification
  - acknowledgment
  - omar-shaikh
  - diyi-yang
  - dan-jurafsky
triples:
  - ["LLMs", "lacks", "Conversational grounding"]
  - ["Grounding gap", "caused-by", "Preference optimization"]
  - ["Preference optimization", "leads-to", "Indifference to truth"]
  - ["Common ground", "presupposes", "Conversational grounding"]
  - ["LLMs", "characterised-as", "Presumptive grounding"]
description: "LLMs produce fewer grounding acts than humans and tend to presume common ground rather than actively establishing it, exposing a structural gap between human and machine conversation."
ai: "100% Maai"
book_type: non-fiction
genre: research-paper
url: "https://arxiv.org/abs/2311.09144"
---

LLMs produce fewer grounding acts than humans and presume common ground rather than actively establishing it. Where human speakers check understanding, repair misalignments, and signal confusion, LLMs skip these moves and proceed as if shared understanding were already in place. The gap is not incidental but structural.

Published 2023. Accepted at NAACL 2024.

## Summary

**The grounding gap**
LLMs generate language with significantly fewer conversational grounding acts than humans. Compared to human expert speakers, LLMs are on average 77.5% less likely to contain grounding acts. Instead of establishing shared understanding, LLMs presume common ground and proceed directly to task completion.

**Three grounding acts studied**
1. Clarification requests: seeking clarification on a prior utterance to avoid future misunderstanding (e.g. "Did you mean...?"). Distinguishable from follow-ups via the "O.K. test": if prefixing a potential clarification with "O.K." sounds awkward, it is likely a clarification.
2. Acknowledgment: explicitly signaling understanding (e.g. "I understand," "I see"). Only utterances whose sole purpose is acknowledgment are counted.
3. Followup questions: asking for elaboration on a prior utterance, implicitly signaling understanding while seeking additional information. Distinct from clarification: followups continue the interaction, clarifications verify it.

**Expert listener framing**
The study takes the perspective of an expert listener: the LLM plays the role of the expert (teacher, therapist, persuader) whose task is to verify grounding before completing a task. Users come with underspecified tasks; the onus of establishing common ground lies initially with the model.

**Datasets and domains**
Three datasets, chosen because grounding is critical and LLMs are already deployed in these domains:
- Emotional Support Conversations (ESConv): one-to-one crowdsourced mental health support.
- Teacher Student Chatroom Corpora (TSCC): one-to-one English language lessons.
- Persuasion for Good: one-to-one persuader/persuadee conversations about charitable donation.

**Simulation method**
For each conversation turn, all prior messages are fed to an LLM, which generates a counterfactual response in the expert role. Each human ground-truth utterance has a controlled LLM-generated counterpart conditioned on the same conversational history. Grounding acts are classified using GPT-4 with few-shot prompting (avg. Macro F-1 = 0.89).

**Metrics**
- Base rate: overall frequency of a grounding act in utterances.
- Cohen's kappa: agreement between human and LLM grounding acts at the same conversational position. Adjusts for chance; values below 0 indicate worse than random agreement.

**Key findings**
- GPT-3.5 shows large base-rate decreases: followup -64.3%, acknowledgment -83.4%, clarification approaches 0% in two of three datasets.
- Cohen's kappa agreement between LLMs and humans is poor to fair across all models (κ < 0.3 in most cases).
- Human-human kappa on the same task averages κ ≈ 37.5, confirming that LLM-human disagreement is not an artifact of the measurement.

**Role of training: SFT and preference optimization**
- Supervised fine-tuning (SFT): no correlation with grounding agreement (Pearson R ≈ 0, p > 0.1). SFT-only models nonetheless achieve the highest kappa for acknowledgment and clarification across all evaluated models.
- Direct preference optimization (DPO): significant negative correlation with grounding agreement across all acts (R = −0.79 avg., p < 0.05). Increased DPO training erodes grounding acts.
- Preference data source: UltraFeedback explicitly signals that asking questions is dispreferred: questions are significantly less frequent in preferred (13.77%) than dispreferred (18.35%) examples (χ² = 484.08, p < 0.00001).

**Prompting mitigation**
A system prompt instructing the model to use clarification, followup, and acknowledgment substantially increases base rates (followup nearly quadruples) but yields minimal improvement in Cohen's kappa and can decrease it for clarification (0 → −1.65). The grounding gap is not addressable by prompting alone.

**Error typology (qualitative)**
LLM supporters fail to use:
- Acknowledgment to show empathy (43.94% of errors)
- Followup questions for more information (26.52%)
- Followup questions to continue conversation (12.88%)
- Clarification to verify understanding (9.09%)
- Clarification to resolve specific ambiguity (7.58%)

**Alignment implications**
Current RLHF-trained models optimize for single-step interaction. Preference raters, who evaluate individual responses rather than multi-turn dialogues, favor direct answers over grounding moves. Grounding is multi-turn by nature. Proposed directions: augmenting SFT and preference datasets with grounding acts, training reward models across multi-step interactions, contextualizing preferences by domain.

## Related

- [[is-conversation-still-a-useful-metaphor|Is conversation still a useful metaphor?]]
