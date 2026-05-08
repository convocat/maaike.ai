---
title: "Metaphors of AI indicate that people increasingly perceive AI as warm and human-like"
author: "Myra Cheng, Angela Y. Lee, Kristina Rapuano, Kate Niederhoffer, Alex Liebscher, Jeffrey Hancock"
date: 2026-04-22
updated: 2026-04-22
maturity: complete
tags:
  - ai-perception
  - metaphor
  - anthropomorphism
  - llm
  - public-perception-of-ai
  - warmth-competence
  - metaphor-analysis
  - computers-as-social-actors
  - anthroscore
  - trust-in-ai
  - ai-adoption
themes:
  - "Public perception of AI is shifting toward warmth and human-likeness, not competence"
  - "Metaphors reveal implicit perceptions that demographic variables alone cannot capture"
  - "Warmth and competence predict trust and adoption over and above demographics"
  - "Anthropomorphism is rising fastest among women, older adults, and people of colour"
triples:
  - ["Public perception of AI", "characterised-as", "Anthropomorphism"]
  - ["Metaphor analysis", "demonstrates", "Public perception of AI"]
  - ["Warmth and competence (social perception)", "theorised-by", "Computers as social actors"]
  - ["Warmth and competence (social perception)", "leads-to", "Trust in AI"]
  - ["Trust in AI", "leads-to", "AI adoption"]
  - ["Anthropomorphism", "leads-to", "Trust in AI"]
  - ["AnthroScore", "instance-of", "Metaphor analysis"]
ai: assisted
status: read
genre: Research paper
book_type: non-fiction
purpose: professional
description: "Collects over 12,000 open-ended metaphor responses from a nationally representative US sample across 12 months, developing a systematic framework to quantify how people conceptualise AI. Finds that Americans increasingly perceive AI as warm, competent, and human-like, with attributions of warmth and human-likeness rising significantly in the year after ChatGPT's release. Demographic variation matters: women, older individuals, and people of colour are more likely to attribute human-like qualities, and these perceptions strongly predict trust and willingness to adopt AI."
file: /pdfs/s44271-025-00376-6.pdf
draft: false
---

## Summary

### Research questions

The paper poses three questions:

1. How do members of the public conceptualize AI, and how do these conceptualizations vary across demographics?
2. Are public perceptions of AI evolving over time, and if so, in what ways?
3. Can examinations of metaphors of AI help us understand who chooses to trust and adopt AI?

### Method

- 12,933 participants recruited from Prolific between May 2023 and August 2024, approximately 1,000 per month over 12 months. Sample weighted as nationally representative of the US population for gender, ethnicity, education, and age.
- Open-ended elicitation: "AI is like __________ because __________."
- 11,790 valid responses after excluding 276 high-similarity-to-ChatGPT outputs (cosine similarity > 0.85 to embeddings of 100 GPT-3.5 generations) and 30 invalid completions.
- Three measured constructs:
  - **Anthropomorphism**, via AnthroScore: relative log-probability that "AI" in the metaphor would be replaced by human versus non-human pronouns (RoBERTa).
  - **Warmth**: cosine similarity between the metaphor's embedding and a contextualized semantic axis built from validated warmth lexicons (all-mpnet-base-v2).
  - **Competence**: same method, with a competence axis.
- Hierarchical multiple regression on trust and willingness to adopt AI, entering blocks: (1) demographics + AI familiarity, (2) dominant metaphors, (3) implicit perceptions.

### Twenty dominant metaphors

Identified via clustering plus manual refinement, capturing 10,629 of 11,789 responses. Top categories with frequency:

- Tool (10%): calculators, hammers, Swiss Army knives.
- Biological brain (10%): external brain capable of reasoning.
- Search engine (9%): database navigator, Google-like.
- Work assistant (8%): personal assistant who delegates tasks.
- Humanoid robot (8%): Terminator-style embodied AI.
- Intelligent computer (7%): powerful computer program with enhanced data processing.
- Library (5%): source of extensive knowledge.
- The future (5%): force shaping the future, positively or negatively.
- Magic genie (4%): mystical being.
- Mirror (4%): reflects, imitates, or mimics humans.
- Child (4%): developing entity that learns.
- Creative synthesizer (3%): combines elements to form something new.
- Teacher (3%): provider of knowledge and advice.
- Friend (2%): with varying levels of reliability.
- Living nature (~2%): wilderness, ecosystems, plants.
- Pet, thief, god, and other lower-frequency clusters.

### Temporal findings (12 months)

- **Anthropomorphism +34%** (r₁₀ = 0.80, p = 0.002).
- **Warmth +41%** (r₁₀ = 0.62, p = 0.030).
- **Competence −8%** (r₁₀ = −0.60, p = 0.039).
- Rising metaphors: teacher (r₁₀ = 0.75), friend (r₁₀ = 0.75), assistant (r₁₀ = 0.60), god (r₁₀ = 0.64).
- Falling metaphors: computer (r₁₀ = −0.92), synthesizer (r₁₀ = −0.91), mirror (r₁₀ = −0.70), search engine (r₁₀ = −0.63).

### Demographic variation

Women, older individuals, and people of colour are more likely to attribute human-like qualities to AI. The paper interprets this as helping to explain disparities in trust and adoption rates.

### Hierarchical regression results

For trust:

- Baseline (demographics + AI familiarity): R² = 0.184, F(14, 9480) = 152.39, p < 0.001.
- + Dominant metaphors: R² = 0.207, ΔR² = 0.023, p < 0.001.
- + Implicit perceptions: R² = 0.264, ΔR² = 0.057, p < 0.001.

For willingness to adopt AI:

- Baseline: R² = 0.148, F(14, 9480) = 117.92, p < 0.001.
- + Dominant metaphors: R² = 0.167, ΔR² = 0.018, p < 0.001.
- + Implicit perceptions: R² further improved.

Implicit perceptions (anthropomorphism, warmth, competence) explain additional variance over and above demographics and AI familiarity for both outcomes.

### Theoretical framing

- Metaphors as cognitive and linguistic tools for distilling complex concepts into accessible analogies (Lakoff, Thibodeau & Boroditsky).
- Warmth and competence as the two foundational dimensions of social perception (Fiske et al.); applied here to AI as anthropomorphized non-human entity.
- Computers-as-social-actors framework (Reeves & Nass): people intuitively treat technologies as humanlike, applying politeness norms.
- Trust as a multi-dimensional construct: ability, benevolence, integrity (adapted from the Organizational Model of Trust).

### Stated implications

- Implicit perceptions drive trust and adoption decisions over and above demographic predictors.
- The shift toward seeing AI as warm without a corresponding rise in perceived competence indicates an evolving but ambivalent public relationship.
- Scalable metaphor analysis is offered as a tool for tracking public attitudes to inform AI governance.
