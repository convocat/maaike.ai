# LLM hallucinations

**Type:** concept
**First seen:** 2023 (llm-hallucinations-knowledge-as-missing-fundamental)
**Last updated:** 2026-04-12

## Summary
LLM hallucinations are outputs by LLMs that are confidently stated but factually incorrect. Maaike argues they are not errors in the ordinary sense — not failures of a system that normally gets things right. They are structural consequences of probabilistic word prediction without access to ground truth. The hallucination is not a bug; it is the system behaving exactly as designed, in a domain where design is inadequate.

## How Maaike uses this concept
Maaike's intervention here is terminological and conceptual: she prefers "confabulation" to "hallucination" because confabulation (borrowing from neuropsychology) more precisely captures what is happening — unconscious gap-filling with plausible fabrications, without intent to deceive. The hallucination metaphor implies a kind of dreamlike disconnection; confabulation implies a more systematic, structural process. She also uses the "missing fundamental" analogy from acoustics: you can never quite hear the ground truth in an LLM output, even though the output sounds complete and coherent.

## Appearances
- [llm-hallucinations-knowledge-as-missing-fundamental](../raw/articles/llm-hallucinations-knowledge-as-missing-fundamental.md) — the primary article analyzing hallucinations as structural and offering confabulation as better framing
- [bye-bye-alpaca-knowledge-as-the-missing-fundamental](../raw/articles/bye-bye-alpaca-knowledge-as-the-missing-fundamental.md) — related exploration using the missing fundamental analogy
- [why-chatgpt-is-bullshit-and-why-we-should-design-for-that](../raw/articles/why-chatgpt-is-bullshit-and-why-we-should-design-for-that.md) — hallucinations as a manifestation of bullshit behavior

## Related concepts
- [[probabilistic-word-prediction]] — caused-by; the mechanism that produces hallucinations
- [[ground-truth]] — what is absent from LLM outputs; makes hallucinations structurally unavoidable
- [[confabulation]] — a more precise characterisation of LLM hallucinations
- [[missing-fundamental]] — the acoustic metaphor Maaike uses
- [[bullshit]] — the Frankfurt-based framing of the same structural problem
- [[indifference-to-truth]] — the underlying epistemic property

## Open questions
- Do improved retrieval-augmented systems (RAG) change the structural argument about hallucinations, or do they just shift where the failure can occur?
- Is the TRUE/FALSE binary genuinely impossible in probabilistic systems, or just more difficult to implement?
