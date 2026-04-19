# Wiki chat architecture

What happens end-to-end when someone asks the chat a question.

## The whole stack, in one diagram

```
┌──────────────────────────────────────────────────────────────────┐
│  BROWSER (maaike.ai/wiki)                                        │
│                                                                  │
│  public/wiki/index.html — single HTML file, served static         │
│   ├── UI: chat pane + tabbed context (Wiki / Article)           │
│   ├── Markdown renderer (bold, headers, bullets)                 │
│   ├── Entity linkifier (scans answer for known titles)           │
│   └── JavaScript fetch → POST /api/ask with {question}           │
│                                                                  │
│                        ↓ HTTPS                                   │
└──────────────────────────────────────────────────────────────────┘
                         │
                         │ (currently)  https://maaike-ai.vercel.app
                         │ (target)     https://wiki.maaike.ai
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  VERCEL  (Python 3 serverless function)                          │
│                                                                  │
│  tools/karpathy-wiki/api/index.py                                │
│   ├── Receives POST /api/ask                                     │
│   ├── Validates (500 char cap, CORS origin check)                │
│   └── Delegates to serve.handle_ask_api()                        │
│                                                                  │
│  tools/karpathy-wiki/tools/serve.py                              │
│   ├── Reads 99 wiki pages (concepts/people/entities) from disk   │
│   ├── Reads 90 raw articles (articles/field-notes/seeds)         │
│   ├── Builds a ~40k-token prompt with ALL content + question     │
│   └── Calls Anthropic SDK                                        │
│                                                                  │
│                        ↓ HTTPS                                   │
└──────────────────────────────────────────────────────────────────┘
                         │
                         │  api.anthropic.com
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  ANTHROPIC API                                                   │
│                                                                  │
│   ├── Model: claude-sonnet-4-6                                   │
│   ├── System prompt: format rules + epistemic stance             │
│   ├── max_tokens: 1024                                           │
│   └── Returns a markdown answer                                  │
│                                                                  │
│                        ↓ back to Vercel                          │
└──────────────────────────────────────────────────────────────────┘
                         │
                         │ Vercel picks matching sources from answer text
                         │ (articles by title match, then wiki concepts)
                         ↓
                   back to browser as JSON
                   { answer, sources: [...] }
```

## Request lifecycle

A single question takes roughly this amount of time:

| Phase | Cold start | Warm request |
|---|---|---|
| Vercel function bootstrap | ~800ms | 0ms |
| Python module imports | ~300ms | 0ms |
| Load 189 markdown files from disk | ~400ms | ~400ms |
| Build context string (~40k tokens) | ~50ms | ~50ms |
| Anthropic API call (Sonnet, 1024 output tokens) | 2-5s | 2-5s |
| Response assembly + JSON encode | ~20ms | ~20ms |
| **Total** | **3.5-8s** | **2.5-5.5s** |

Cold starts happen when the function has been idle for a few minutes. Warm requests are faster because Vercel reuses the container.

## Where the content lives

All content is deployed as flat files inside the serverless function bundle:

```
tools/karpathy-wiki/     ← Vercel "root directory"
├── wiki/
│   ├── concepts/     73 markdown files
│   ├── people/       18 markdown files
│   └── entities/      8 markdown files
└── raw/
    ├── articles/     47 markdown files
    ├── field-notes/  25 markdown files
    └── seeds/        18 markdown files
```

Every serverless invocation reads all of these into memory. No database.

## What's NOT in this stack

Things you might expect but aren't here:

- **No database** — all content is flat markdown files deployed with the function
- **No retrieval / semantic search** — the full corpus is sent on every question
- **No streaming** — the browser waits for the complete answer before showing anything
- **No prompt caching** — every request re-sends the same 40k-token context
- **No auth or rate limiting** — 500-char input cap is the only throttle; anyone can hit the endpoint and spend Anthropic credits
- **No logging of questions** — nothing is persisted between requests

## Secrets and trust boundaries

| Where | What is there | Trust level |
|---|---|---|
| Browser / public HTML | No secrets | Untrusted |
| Vercel env vars | `ANTHROPIC_API_KEY` | Trusted (Vercel-managed) |
| Local `.env` | `ANTHROPIC_API_KEY` (dev) | Trusted (gitignored) |
| Git repo | No secrets | Public |

The API key never leaves the Vercel function — the browser only sees questions going in and answers coming out.

## Why this architecture

**Simple to reason about.** One file per content unit, no sync logic, no migration scripts. When Maaike edits an article, the next deploy includes the new content automatically.

**Cheap.** Vercel free tier covers low traffic. Anthropic only charges per actual question.

**Slow and token-hungry.** Sending the entire corpus every time is wasteful — both in latency (network transfer, tokenization) and in cost (every question pays for 40k input tokens). See `API.md` for optimization options.

## Files involved

- [`api/index.py`](api/index.py) — Vercel entry point, route gating, input validation
- [`tools/serve.py`](tools/serve.py) — business logic, Anthropic call, also the local dev server
- [`vercel.json`](vercel.json) — routes `/api/*` to the handler
- [`requirements.txt`](requirements.txt) — Python dependencies (just `anthropic`)
- [`.vercelignore`](.vercelignore) — keeps `.env` out of deploys
- [`API.md`](API.md) — endpoint reference with curl examples
