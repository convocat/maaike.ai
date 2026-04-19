# Context window

**Type:** concept
**First seen:** 2024 (context-engineering-lets-call-it-design)
**Last updated:** 2026-04-12

## Summary
The context window is the working memory of an LLM: the total input (prompt, history, system instructions, retrieved context) available to the model at inference time. Maaike's context design concept is fundamentally about what goes into this window and how it is structured.

## Appearances
- [context-engineering-lets-call-it-design](../raw/articles/context-engineering-lets-call-it-design.md) — context window structured-as semantic information types; the object of context design

## Related concepts
- [[context-design]] — the design discipline focused on context windows
- [[context-engineering]] — what context engineering shapes
- [[system-prompt]] — part of the context window
- [[semantic-information-types]] — the structural vocabulary for context window design
- [[llms]] — the technical entity that uses context windows

## Open questions
- As context windows grow (128k, 1M tokens), does context design become more or less important?
