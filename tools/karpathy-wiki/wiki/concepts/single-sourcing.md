# Single sourcing

**Type:** concept
**First seen:** 2024 (air-canadas-bot-mishap-pre-dates-chatgpt)
**Last updated:** 2026-04-12

## Summary
Single sourcing is the practice of maintaining one canonical version of content that is repurposed across multiple channels and formats — a principle from content strategy and technical authoring. Maaike uses it in the context of LLM knowledge freshness: when an AI chatbot's training data goes stale, the failure is a content lifecycle management problem, not merely a technology problem.

## How Maaike uses this concept
The Air Canada bot case illustrates that chatbot failures are often content failures. When a bot gives outdated policy information, the root cause is not the bot's reasoning — it's that content wasn't updated in the source and the bot has no mechanism to query a live, single-sourced truth. Single sourcing is the technical authoring principle that would prevent this: maintain one source of truth, update it, and have all channels draw from it.

## Appearances
- [air-canadas-bot-mishap-pre-dates-chatgpt](../raw/articles/air-canadas-bot-mishap-pre-dates-chatgpt.md) — content lifecycle management and single sourcing as framing for bot mishap

## Related concepts
- [[semantic-information-types]] — structured content is what single sourcing requires
- [[technical-authoring]] — single sourcing is a technical authoring principle
- [[context-design]] — context design must account for content freshness
- [[llm-hallucinations]] — stale content produces similar failure modes to hallucination

## Open questions
- How does single sourcing apply to RAG (Retrieval-Augmented Generation) architectures? Is RAG effectively single sourcing for LLMs?
