# AI bias

**Type:** concept
**First seen:** 2024 (de-biassing-dall-e)
**Last updated:** 2026-04-12

## Summary
AI bias refers to systematic patterns in AI outputs that reflect and amplify biases present in training data — including cultural, demographic, and representational biases. Maaike examines it through the lens of DALL-E's prompt rewriting behavior, which introduced Dutch stereotypes she hadn't asked for, revealing that "de-biasing" interventions can themselves introduce new biased framings.

## How Maaike uses this concept
Maaike's experience with DALL-E is concrete: she asked for a neutral image, DALL-E rewrote her prompt in ways that introduced cultural stereotypes. The incident illustrates that AI bias is not just a training data problem — it's embedded in the post-processing pipeline too. Her observation is design-focused: users who don't inspect the rewritten prompt have no visibility into what bias was added on their behalf. Transparency is a design requirement.

## Appearances
- [de-biassing-dall-e](../raw/articles/de-biassing-dall-e.md) — primary case study: DALL-E rewriting prompts with cultural stereotypes

## Related concepts
- [[llm-hallucinations]] — both are structural outputs, not bugs
- [[indifference-to-truth]] — bias shares the structural-indifference quality with bullshit
- [[designing-for-doubt]] — bias requires users to maintain skepticism
- [[anthropomorphism]] — users trust AI outputs partly because of anthropomorphic attribution

## Open questions
- Is DALL-E's prompt rewriting a form of bias or a form of confabulation? Both involve outputs that diverge from intent.
- How should designers surface model-side prompt modifications to users?
