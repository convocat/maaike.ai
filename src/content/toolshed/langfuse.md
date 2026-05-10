---
title: Langfuse integration
date: 2026-05-10
maturity: solid
tags: [tooling, ai-tools, observability, chatbot]
description: How the garden chatbot is wired to Langfuse for trace analysis and prompt management. Both bots are observed; system prompts live in Langfuse with the .md files in the repo as fallback.
category: technical
section: Tooling
ai: co-created
---

The garden chatbot is wired to [Langfuse](https://langfuse.com) for two things: traces of every conversation turn, and runtime prompt management. Both run side-by-side: tracing is observe-only, prompt management is read-through with a file fallback so the bot never blocks on Langfuse availability.

## Files

- `tools/karpathy-wiki/tools/langfuse_integration.py`: thin wrapper over the Langfuse v4 Python SDK. Exposes `start_trace`, `end_trace`, `get_prompt`, `extract_usage`, `flush`. No-ops silently when env vars are missing.
- `tools/karpathy-wiki/tools/sync_prompts_to_langfuse.py`: one-shot CLI to push the prompt `.md` files into Langfuse under a `garden/` folder.
- `tools/karpathy-wiki/tools/serve.py`: the request handlers (`handle_ask_api_stream`, `handle_chat_api_stream`) open a trace per request and record retrieval + generation spans.
- `api/index.py` and `tools/karpathy-wiki/api/index.py`: thread `session_id` (frontend-minted) and a hashed-IP `user_id` through to the handlers.

## Env vars

`LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_HOST`. Local: `tools/karpathy-wiki/.env`. Production: Vercel project settings, all three environments. If any are missing, every Langfuse call short-circuits to a no-op.

## Trace shape

One trace per HTTP request (one user turn). Trace-level attributes are set via `propagate_attributes` so they flow to every child span:

- `name`: `ask` or `chat`
- `user_id`: SHA-256 prefix of the client IP, same hash used in stderr logs so the two correlate
- `session_id`: a UUID minted by the frontend on first chat-panel-open (`CHAT_SESSION_ID` in `chat-panel.ts`, `ASK_SESSION_ID` in `research/ask.astro`). Sent on every request body.
- `tags`: `bot:ask` or `bot:chat`, plus `prompt_id:<id>` for chat and `page:<collection>/<slug>` for chat. `refused:true` and `fallback:true` for ask when applicable.
- `input`: the user's question / message
- `output`: the assistant reply (visible text, with the chip marker stripped)

Inside the trace:

- `/api/ask` traces have a **`retrieval` span** with the question as input and a JSON output containing `matched_articles`, `matched_topics`, `fired_triples`, `matched_themes`, `fallback`. Comes straight from `_retrieve_articles`.
- Both have a **`generation` observation** of type `generation` with the model, the full message list, the system prompt text, the streamed output, and `usage_details` pulled from the Anthropic stream's final message (`input_tokens`, `output_tokens`, `cache_read_input_tokens`, `cache_creation_input_tokens`). Linked to the Langfuse prompt object via `prompt=...` so analytics can pivot by prompt version.

`flush()` is called in a `finally` block on every handler. This is **required on Vercel**: serverless freezes the function before the SDK's background thread can send.

## Prompt management

System prompts live in Langfuse under a `garden/` folder. Names are stable and match the `prompt_id` frontmatter in the local `.md` files:

- `garden/ask-system-prompt-v1` (used by `/api/ask`)
- `garden/garden-system-prompt-v0-2` (used by `/api/chat`, default)
- `garden/garden-system-prompt` (older v0.1, selectable from the cogwheel)
- `garden/wiki-system-prompt`

At runtime, `lf.get_prompt(name, fallback_text)` pulls the active version with a 60-second TTL cache. On any failure (network, auth, missing prompt) it returns the fallback text and `None` for the prompt object. Fallback text comes from the `.md` files in `tools/karpathy-wiki/SYSTEM_PROMPT.md` and `src/content/prompts/<prompt_id>.md`.

**Edit prompts in the Langfuse UI.** Save creates a new version, the bot picks it up within 60 seconds, no redeploy. The repo `.md` files are fallback only after the first sync.

To seed Langfuse from the repo:

```
python tools/karpathy-wiki/tools/sync_prompts_to_langfuse.py --dry-run
python tools/karpathy-wiki/tools/sync_prompts_to_langfuse.py
```

The CLI strips frontmatter and HTML comments, prefixes the name with `garden/`, and creates the prompt with labels derived from the frontmatter `prompt_status` (`active` becomes `production` + `active`).

## What this makes visible

- Cost / latency / quality per **prompt version**: filter the traces list by `prompt_id:...` tag.
- Retrieval health: how often the ask bot refuses on weak retrieval, which topics get hit, fallback rate.
- Multi-turn conversations: the **Sessions** view in Langfuse groups traces sharing a `session_id`.
- Caching behaviour: the generation's `usage_details` include the Anthropic prompt-cache hit ratio.

## Tradeoffs and limits

- The integration targets Langfuse SDK **v4**. The v4 API uses `start_as_current_observation(as_type=...)` and a module-level `propagate_attributes` context manager (different from v3). Pinned in `requirements.txt` as `langfuse>=3.0.0` for compatibility, but the wrapper assumes v4 shapes.
- Langfuse is a hard dependency for prompt edits taking effect at runtime, but a soft dependency for the bot itself: missing env vars means the `.md` fallbacks ship and tracing is silent.
- The wrapper does not retry. A network blip drops one trace. The bot keeps streaming.
