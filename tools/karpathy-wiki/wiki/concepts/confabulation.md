# Confabulation

**Type:** concept
**First seen:** 2023 (llm-hallucinations-knowledge-as-missing-fundamental)
**Last updated:** 2026-04-12

## Summary
Confabulation is Maaike's preferred term for what is commonly called LLM hallucinations. Borrowed from neuropsychology, where it describes unconscious gap-filling without intent to deceive, it more precisely captures what LLMs do: fill knowledge gaps with plausible-sounding fabrications as a structural consequence of their mechanism, not as errors or failures.

## How Maaike uses this concept
The terminological shift from "hallucination" to "confabulation" is analytically important for Maaike. "Hallucination" implies a departure from normal function — something going wrong. "Confabulation" describes the normal function of a system that fills gaps with plausible patterns. LLMs don't hallucinate when they malfunction; they confabulate as their default mode of operation. This sharpens the design problem: you are not dealing with occasional errors but with structural gap-filling.

## Appearances
- [llm-hallucinations-knowledge-as-missing-fundamental](../raw/articles/llm-hallucinations-knowledge-as-missing-fundamental.md) — introduced as more precise alternative to hallucination

## Related concepts
- [[llm-hallucinations]] — confabulation is a more precise characterisation of LLM hallucinations
- [[probabilistic-word-prediction]] — the mechanism that produces confabulation
- [[ground-truth]] — what confabulation lacks access to
- [[indifference-to-truth]] — the underlying epistemic property
- [[missing-fundamental]] — the acoustic metaphor in the same article

## Open questions
- The neuropsychological term "confabulation" has a specific clinical meaning (patients filling memory gaps unconsciously) — does importing it to LLMs help or mislead?
