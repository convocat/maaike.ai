# LLMs

**Type:** entity
**First seen:** 2022 (why-chatgpt-is-bullshit-and-why-we-should-design-for-that)
**Last updated:** 2026-04-12

## Summary
LLMs (large language models) are the central subject of Maaike's analytical writing. She approaches them not as a technology enthusiast but as a conversation designer and analyst: what are they, structurally, and what does that mean for how interfaces should be designed around them? Her core argument is that LLMs lack three things that matter for interaction design: ground truth access, conversational grounding, and situated action.

## How Maaike uses this concept
Maaike's LLM analysis is consistent and structural: she is not critiquing specific models or implementations but the underlying mechanism (probabilistic word prediction). LLMs generate text by predicting likely next tokens based on training patterns — they do not look things up, reason from facts, or track truth. This structural feature explains hallucinations, bullshit behavior, and the failure of the conversation metaphor. It also guides her design prescriptions: you have to design around what LLMs are, not pretend they are something else.

## Appearances
- [why-chatgpt-is-bullshit-and-why-we-should-design-for-that](../raw/articles/why-chatgpt-is-bullshit-and-why-we-should-design-for-that.md) — LLMs as structurally indifferent to truth
- [llm-hallucinations-knowledge-as-missing-fundamental](../raw/articles/llm-hallucinations-knowledge-as-missing-fundamental.md) — LLMs lack ground truth; hallucinations as structural
- [is-conversation-still-a-useful-metaphor](../raw/articles/is-conversation-still-a-useful-metaphor.md) — LLMs lack conversational grounding and situated action
- [context-engineering-lets-call-it-design](../raw/articles/context-engineering-lets-call-it-design.md) — LLMs require context design to work well
- [thinking-in-action-precision-matters](../raw/articles/thinking-in-action-precision-matters.md) — LLMs reinforce epistemic bias; generate rhetoric not argument

## Related concepts
- [[probabilistic-word-prediction]] — the core mechanism of LLMs
- [[ground-truth]] — what LLMs lack
- [[llm-hallucinations]] — structural consequence of lacking ground truth
- [[stochastic-parrot]] — Bender and Gebru's characterisation of LLMs
- [[indifference-to-truth]] — LLMs exhibit this
- [[conversational-grounding]] — LLMs lack this
- [[situated-action]] — LLMs lack this
- [[epistemic-bias]] — LLMs reinforce this
- [[context-window]] — the interface through which LLMs receive information
- [[cognitive-assemblage]] — Hayles's framing: LLMs as instance-of cognitive assemblage

## Open questions
- Maaike's LLM critique is largely structural and negative — does she articulate a positive vision for what well-designed LLM-based systems could be?
- Does the emergence of reasoning models (o1, o3) that chain inference steps change her structural argument?
