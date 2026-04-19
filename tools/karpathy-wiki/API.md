# Wiki chat API

Four read-only endpoints that power the wiki chat. Deployed as a Vercel Python serverless function.

- **Production base URL:** `https://maaike-ai.vercel.app` (temporary — custom domain `wiki.maaike.ai` is planned)
- **Local base URL:** `http://localhost:8780` (run `python tools/serve.py` from this directory)

The API loads Maaike's wiki content (99 concepts/people/entities + 90 articles, field notes, and seeds) and exposes it as JSON, plus a question-answering endpoint backed by Claude.

---

## Endpoints

### `GET /api/topics`

Returns all wiki topics + article metadata. Used by the frontend to build the topic browser and linkify mentions in chat answers.

**Response**

```json
{
  "topics": [
    {
      "slug": "bullshit",
      "title": "Bullshit",
      "section": "concepts",
      "category": "philosophy",
      "type": "philosophical-concept",
      "desc": "Frankfurt's precise philosophical term for speech produced...",
      "href": "/concepts/bullshit"
    }
  ],
  "articles": [
    {
      "slug": "why-chatgpt-is-bullshit-and-why-we-should-design-for-that",
      "title": "Why ChatGPT is bullshit (and why we should design for that)",
      "section": "articles",
      "date": "2023-01-07",
      "desc": "...",
      "url": "https://maaike.ai/articles/why-chatgpt-is-bullshit-and-why-we-should-design-for-that"
    }
  ]
}
```

**Example**

```bash
curl https://maaike-ai.vercel.app/api/topics
```

---

### `GET /api/wiki/{section}/{slug}`

Returns the full markdown of a single wiki page.

**Path params**

- `section` → `concepts` | `people` | `entities`
- `slug` → filename without extension (e.g., `bullshit`, `harry-g-frankfurt`)

**Response**

```json
{
  "slug": "bullshit",
  "title": "Bullshit",
  "section": "concepts",
  "markdown": "# Bullshit\n\n**Type:** concept\n\n## Summary\n..."
}
```

**Error** (404-equivalent, still served with HTTP 200)

```json
{ "error": "not found: concepts/foo" }
```

**Example**

```bash
curl https://maaike-ai.vercel.app/api/wiki/concepts/bullshit
```

---

### `GET /api/article/{section}/{slug}`

Returns the full markdown of a single article, field note, or seed from Maaike's garden.

**Path params**

- `section` → `articles` | `field-notes` | `seeds`
- `slug` → filename without extension

**Response**

```json
{
  "slug": "why-chatgpt-is-bullshit-and-why-we-should-design-for-that",
  "title": "Why ChatGPT is bullshit (and why we should design for that)",
  "section": "articles",
  "desc": "...",
  "date": "2023-01-07",
  "markdown": "I'm really proud to announce...",
  "url": "https://maaike.ai/articles/why-chatgpt-is-bullshit-and-why-we-should-design-for-that"
}
```

**Example**

```bash
curl https://maaike-ai.vercel.app/api/article/articles/why-chatgpt-is-bullshit-and-why-we-should-design-for-that
```

---

### `POST /api/ask`

Sends a question to Claude with the full wiki + article content as context. Returns a structured markdown answer plus the sources the answer draws on.

**Request body**

```json
{ "question": "What does Maaike mean by bullshit?" }
```

**Constraints**

- `question` max 500 characters (returns HTTP 400 if longer)
- Any `key` field in the request body is ignored — only the server's own Anthropic key is used

**Response**

```json
{
  "answer": "## Bullshit as structural indifference\n\nMaaike's core move...",
  "sources": [
    {
      "kind": "article",
      "title": "Why ChatGPT is bullshit (and why we should design for that)",
      "href": "/raw/articles/why-chatgpt-is-bullshit-...",
      "url": "https://maaike.ai/articles/why-chatgpt-is-bullshit-...",
      "section": "articles",
      "date": "2023-01-07"
    },
    {
      "kind": "wiki",
      "title": "Harry G. Frankfurt",
      "href": "/people/harry-g-frankfurt",
      "section": "people"
    }
  ]
}
```

Sources come in two flavors: `"kind": "article"` (Maaike's own writing, with a `url` pointing at maaike.ai) and `"kind": "wiki"` (compiled concept summaries).

The answer is markdown with the following conventions (enforced in the system prompt):

- Paragraphs separated by blank lines, one idea per paragraph
- `##` subheadings for multi-part answers
- **Bold** for key terms, bulleted lists for enumerations
- Article and concept names quoted verbatim so the frontend can linkify them
- Closes with either a "Further reading" section or a "Question worth sitting with" section
- Flags what is explicit in the source material versus inferred

**Example**

```bash
curl -X POST https://maaike-ai.vercel.app/api/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What does Maaike think about why ChatGPT is bullshit?"}'
```

---

## Security posture

| Concern | Status |
|---|---|
| API key | Server-side only. In local `.env` (gitignored) for dev, in Vercel environment variables for production. Never in frontend code or git. |
| CORS | Whitelist: `https://maaike.ai`, `https://www.maaike.ai`, `https://wiki.maaike.ai`, plus localhost in non-production. Everything else is rejected. |
| Write endpoints | Not exposed. The private `/api/apply` route (wiki review workflow) lives only in the local `serve.py`, not in the Vercel deploy. |
| Input validation | Questions capped at 500 characters. Client-supplied `key` parameter stripped. |
| Error responses | No stack traces leak; generic "backend error" on unexpected failures. |

## Costs and limits

Currently there is **no rate limiting** on the API. A single attacker with curl could in principle consume Anthropic credits until the account balance is exhausted.

Mitigations in place:

- 500-char question cap limits per-request token cost
- Max 1024 output tokens per answer
- Anthropic console can be set with an account-level spend cap as a safety net

If abuse becomes an issue, options include:

- Add an in-process per-IP rate limiter (simple, ~60 lines)
- Put Cloudflare Turnstile in front of `/api/ask`
- Move rate-limit state to Upstash Redis for cross-invocation persistence

## Running locally

From `tools/karpathy-wiki/`:

```bash
# 1. Put ANTHROPIC_API_KEY in .env
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env

# 2. Start the server
python tools/serve.py
# → serves on http://localhost:8780
```

The local server exposes the same four API routes, plus HTML rendering for the wiki (not needed for the chat) and a `/api/apply` write endpoint used by the proposal-review workflow.

## Source of truth

- Serverless handler: [`api/index.py`](api/index.py)
- Shared business logic: [`tools/serve.py`](tools/serve.py)
- Deploy config: [`vercel.json`](vercel.json), [`requirements.txt`](requirements.txt)
