# Probabilistic word prediction

**Type:** concept
**First seen:** 2023 (llm-hallucinations-knowledge-as-missing-fundamental)
**Last updated:** 2026-04-12

## Summary
Probabilistic word prediction is the core mechanism of LLMs: given a context, predict the most likely next token based on patterns in training data. Maaike uses this as the mechanistic explanation for why LLMs are structurally indifferent to truth: they predict likely text, not true text. Ground truth is inaccessible via this mechanism.

## Appearances
- [llm-hallucinations-knowledge-as-missing-fundamental](../raw/articles/llm-hallucinations-knowledge-as-missing-fundamental.md) — the mechanism that causes hallucinations; makes ground truth inaccessible
- [why-chatgpt-is-bullshit-and-why-we-should-design-for-that](../raw/articles/why-chatgpt-is-bullshit-and-why-we-should-design-for-that.md) — leads-to indifference to truth

## Related concepts
- [[llms]] — the technology built on probabilistic word prediction
- [[ground-truth]] — inaccessible via probabilistic word prediction
- [[llm-hallucinations]] — caused-by probabilistic word prediction
- [[indifference-to-truth]] — leads-to indifference to truth
- [[confabulation]] — the behavioral manifestation of this mechanism

## Open questions
- Does probabilistic word prediction describe all LLM architectures, or only next-token prediction models? Does this matter for Maaike's argument?
