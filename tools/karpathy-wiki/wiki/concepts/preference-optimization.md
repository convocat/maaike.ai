# Preference optimization

**Type:** concept
**First seen:** 2024 (grounding-gaps-in-language-model-generations)
**Last updated:** 2026-04-12

## Summary
Preference optimization (RLHF and similar techniques) is a training method where LLM outputs are shaped by human preferences — raters score outputs and the model is trained to produce highly-rated outputs. Maaike encounters research arguing this training approach leads to indifference to truth: models learn to sound good to human raters, not to be accurate.

## Appearances
- [grounding-gaps-in-language-model-generations](../raw/field-notes/grounding-gaps-in-language-model-generations.md) — grounding gap caused-by preference optimization; leads-to indifference to truth

## Related concepts
- [[grounding-gap]] — caused-by preference optimization
- [[indifference-to-truth]] — leads-to indifference to truth
- [[llms]] — trained via preference optimization
- [[instruction-tuning]] — related training technique

## Open questions
- Is the claim that preference optimization leads to indifference to truth empirically established, or a theoretical concern? How does Maaike handle this uncertainty?
