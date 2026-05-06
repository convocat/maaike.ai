# Session backlog

What's queued up. Each entry is a ready-to-paste opening message for a new thread.

**Status:** 🟡 ready · 🔵 in progress · 🟠 parked · ✅ done · 🧊 stale (not touched in 14+ days)

**Groomed:** 2026-05-05 · Items marked with `blocker:` are waiting on a decision or input before they can move forward.

---

## 🟡 Cleanup karpathy-wiki Vercel artefacts
*2026-05-06*

The Vercel deploy moved to the repo root and is now live in prod. Two files in tools/karpathy-wiki/ are dead code now and should be deleted to avoid confusion: `tools/karpathy-wiki/api/index.py` (the old Vercel handler, no longer deployed) and `tools/karpathy-wiki/vercel.json` (the old Vercel config). Verify after the cleanup commit deploys: `/api/chat` should still stream a real response. The local dev server (`tools/karpathy-wiki/tools/serve.py`) stays.

Key files: `tools/karpathy-wiki/api/index.py` (delete), `tools/karpathy-wiki/vercel.json` (delete), `api/index.py` (keep, the live one), `vercel.json` (keep, the live one).

**Opening message for next session:**
> Run `/telegram-sync` first, then: delete `tools/karpathy-wiki/api/index.py` and `tools/karpathy-wiki/vercel.json` (now dead code, the Vercel deploy moved to the repo root). Commit + push. Verify `/api/chat` still works in prod after the deploy.

---

## 🔵 The Garden chatbot v0.1
*2026-05-05*

The chatbot ships and works end-to-end (mycelium + taxonomy + earth-tone meta pills). Pick up where we paused: write the system-prompt design artefact at `src/content/artefacts/the-garden-voice-v0-1.md` (Maaike approved Option B body format: prose + design notes), backfill the 2 missing `ai:` fields, make `ai` required in the Zod schema, then unconditionally render the pill in `src/layouts/PostLayout.astro`. Also: the Sources block in chat replies is unreliable (model often skips it under length pressure). Library exemption decision still open.

Key files: `src/components/ChatPanel.astro`, `src/scripts/chat-panel.ts`, `src/layouts/PostLayout.astro`, `tools/karpathy-wiki/tools/serve.py` (handle_chat_api_stream + system prompt), `api/index.py` (Vercel /api/chat route), `src/content.config.ts` (where `ai:` needs to become required), `public/preview-meta-line.html` (preview file, can delete).

Local API: `python tools/karpathy-wiki/tools/serve.py` (port 8780). Astro dev: `npm run dev` (port 4321).

**Opening message for next session:**
> Run `/telegram-sync` first, then: pick up The Garden chatbot v0.1. Write the system-prompt design artefact at `src/content/artefacts/the-garden-voice-v0-1.md` (prose + design notes format), backfill the 2 missing `ai:` fields (`field-notes/new-draft`, `weblinks/saga-knowledge-platform`) with values I sign off on, then make `ai` required in the Zod schema and drop the conditional render in `src/layouts/PostLayout.astro`. After that, tighten the Sources block enforcement in the chat (model often skips it). Local API is `python tools/karpathy-wiki/tools/serve.py` on port 8780.

---

## 🟡 About page: content rewrite
*2026-05-05*

The about page structure is fully in place — PostLayout, frontmatter, editable in Typora at `src/pages/about.md`. What's still needed: Maaike rewrites the actual content (bio, what grows here, how maturity works, etc.) to reflect where the garden is now. Once done, update the sidebar bio blurb in `src/pages/index.astro` to match.

Key files: `src/pages/about.md`, `src/pages/index.astro` (sidebar bio)

**Opening message for next session:**
> Open `src/pages/about.md` in Typora and rewrite the about page content. The structure and frontmatter are already in place. Once the text is done, update the sidebar bio blurb in `src/pages/index.astro` to match.

---

## 🟡 Stream redesign follow-ups (May 5 session)
*2026-05-05*

Three small items left from the stream redesign + e-reader jotting session. All are independent and can be picked in any order. Photos in stream is a feature request; the PDF stubs and inbox book entry are inbox hygiene.

See individual backlog entries added 2026-05-05:
- "Photos in stream cards"
- "Process two PDF stubs"
- "Telegram inbox: unnamed book entry (Apr 29)"

Key files: `src/content.config.ts`, `src/components/MosaicCard.astro`, `src/content/files/`, `src/content/_inbox/telegram.md`

**Opening message for next session:**
> Three small follow-ups from the stream redesign session. Pick any order: (1) add photo preview to jotting stream cards (`src/components/MosaicCard.astro`); (2) run `/summarize-pdf` on the two stubs in `src/content/files/`; (3) ask Maaike what the unnamed Apr 29 book was and run `/new-book`.

---

## 🟡 Photos in stream cards
*2026-05-05*

When a jotting has inline images, they don't appear in the stream card preview. Maaike asked whether they could. Feasible: add optional `image` frontmatter field to jottings schema, pass it through MosaicCard.astro, and display it in the card body for `type: post` jottings.

Key files: `src/content.config.ts`, `src/components/MosaicCard.astro`

**Opening message for next session:**
> Add photo preview to jotting stream cards. Add optional `image: /path/to/img.jpg` field to the jottings content schema in `src/content.config.ts`, update `MosaicCard.astro` to display it below the body text for `type: post` jottings. Test with `src/content/jottings/latest-addition-to-my-thinking-tools-a-tiny-e-reader.md` (has three images in `public/images/jottings/`).

---

## 🟡 Process two PDF stubs
*2026-05-05*

Two PDF stubs in `src/content/files/` are still unprocessed from the telegram sync (need `/summarize-pdf`):
- `src/content/files/dingemanse-2026-interactional-foundations-for-crit.md`
- `src/content/files/s44271-025-00376-6.md`

**Opening message for next session:**
> Run `/summarize-pdf` on the two pending PDF stubs: `dingemanse-2026-interactional-foundations-for-crit` and `s44271-025-00376-6` in `src/content/files/`. Match each to a library entry or create one, generate a structured summary, run `/auto-tag`, delete the stub.

---

## 🟡 Telegram inbox: unnamed book entry (Apr 29)
*2026-05-05*

`src/content/_inbox/telegram.md` has an Apr 29 entry: "This is not a weblink, but a book" — no title given. Needs Maaike to provide the book title before a library entry can be created.

blocker: Maaike to provide book title/author

**Opening message for next session:**
> There's an Apr 29 inbox entry: "This is not a weblink, but a book" with no title. What book was it? Once confirmed, run `/new-book` to add it to the library.

---

## 🟡 Working-tree housekeeping: Vercel + admin tooling + prototypes
*2026-04-30*

After the inbox-enrichment thread closed (commits f5775b5, 62af0b7, c808105 pushed), the working tree still has untracked items in three categories. Each needs a quick decision: ship, gitignore, or delete. Independent of any feature work.

**Production-looking (likely commit):**
- `vercel.json` (deploy config, never tracked)
- `api/` (likely Vercel serverless functions)

**Admin tooling (decide ship vs keep local):**
- `tools/admin/_batch_plan.py`
- `tools/admin/_generate_topic_views.py` (feeds /research topic-view cache)
- `tools/karpathy-wiki/tools/extract-batch.py`

**Clutter (delete or gitignore):**
- `tools/admin/__pycache__/`: gitignore
- 5 handoff zip files at repo root: "Research dashboard.zip", "Research dashboard-handoffv1-0.zip", "esearch-wiki-v0.3-handoff-2026-04-19.zip", "final handoff research assistant v 5.zip", "handoff_v0.4_collections_2026-04-19.zip..zip" (delete or move out)
- `public/preview-server.py`, `public/wiki-v1.html` through `wiki-v5.html`, `public/workflow-tool.html`: decide keep or archive each
- `public/user-manual.html`: leave in place per prior backlog (Maaike WIP)

**Opening message for next session:**
> Run `/telegram-sync` first, then: housekeeping pass on the working tree. Three groups, each independent: (1) commit `vercel.json` + `api/` if prod-needed, (2) decide which `tools/admin/_*.py` and `tools/karpathy-wiki/tools/extract-batch.py` helpers ship, (3) gitignore `__pycache__/`, delete the 5 handoff zips at repo root, and triage the `public/wiki-v*.html` + `workflow-tool.html` + `preview-server.py` prototypes (keep or archive). Leave `public/user-manual.html` alone (Maaike WIP).

---

## 🟡 Inbox enrichment + check-inbox skill
*2026-04-27*

Previous session published 4 enriched weblinks (commit 640c12f) and codified the inbox review workflow as a new /check-inbox skill. The skill file is on disk but uncommitted. Pending: commit the skill, fix misleading dashboard copy, and decide what to do with the un-staged dashboard/server tweaks from earlier work (still showing as modified).

Key files:
- `.claude/commands/check-inbox.md` (new, uncommitted)
- `public/mockup-ingest-dashboard.html` (modified, line 875-901 has stale "Enriching…" / "Sync + auto-tag complete" copy that lies to the user; the button does NOT auto-enrich)
- `tools/admin/server.py` (modified)
- `scripts/run_auto_tag_on_drafts.py` (modified)
- `src/content.config.ts` (modified)

**Opening message for next session:**
> Run `/telegram-sync` first, then: commit the new `.claude/commands/check-inbox.md` skill file, and fix the misleading "Enriching…" / "Sync + auto-tag complete" copy in `public/mockup-ingest-dashboard.html` (lines ~875-901). The dashboard's Sync Telegram button does not auto-enrich (workflow intentionally skips API enrichment per memory rule), so the copy should say something like "Pull complete, run /check-inbox in Claude Code to enrich". Also triage the other modified files (server.py, run_auto_tag_on_drafts.py, content.config.ts) to decide if they ship or revert.

---

## 🟠 Re-evaluate the /research + admin dashboard work
*2026-04-25*

The shell, endpoints and citation system are live but the work was rushed and went off-spec several times before landing. Before adding more, audit what's actually in the repo: do the six `/research` routes match the v0.5 SPEC; is the `tools/karpathy-wiki/raw/` snapshot drift from `src/content/` causing stale answers; are there dead-code remnants from the wiki-v6 detour; do the four committed admin-dashboard endpoints (approve, mark-reviewed, delete, sync-telegram) all behave correctly. blocker: trust before scope.

Key files: `src/pages/research/`, `src/layouts/ResearchLayout.astro`, `src/styles/research-port.css`, `tools/karpathy-wiki/api/index.py`, `tools/karpathy-wiki/tools/serve.py`, `tools/admin/server.py`, `.claude/plans/calm-roaming-frog.md`, `.claude/backlog.md`

**Opening message for next session:**
> Run `/telegram-sync` first, then: do a thorough re-evaluation of what was committed during the 25 April session. Audit each /research route against the v0.5 SPEC.md, the live citation flow on /research/ask, and the four admin-dashboard endpoints. Surface dead code, spec drift, and any regressions before any new feature work.

---

## 🟡 Research wiki at `/research/` — polish + open ends
*added: 2026-04-25*

Shipped: full three-pane shell at `/research/` per the v0.5 design handoff. Routes: `/research/`, `/ask`, `/stream`, `/[slug]`, `/map` (links out to `/explore`), `/log`. Shared layout: `src/layouts/ResearchLayout.astro`, components in `src/components/research/`, styles in `src/styles/research.css` + `research-port.css`. Left rail: collapsible Concepts/People/Entities under a single TOPICS header. Stream uses MosaicCard with filters in the right rail. Topic reading view pulls from triples.json + cached topic-views in `tools/karpathy-wiki/cache/topic-views/` (426 of 472 topics). Ask streams from `https://maaike-ai.vercel.app/api/ask` with three-way citations (pink inline links for own writing, sage-green chips for topics, blue chips for external sources) and source-rail accumulating across the thread. Sources stream up-front so the rail populates before the answer finishes.

**Loose ends and known issues:**
- The `tools/karpathy-wiki/raw/` snapshot of garden content is what the chatbot reads for retrieval and context — it's a copy, not a live read of `src/content/`. No mechanism currently keeps it in sync. New articles won't show up in chat until the snapshot is regenerated.
- 46 topics didn't get a cached topic-view (no posts touch them). Rendering on those slugs is sparse — just type/lens/relations, no synthesis sections. Decide: prune from taxonomy, or generate a thin view from the topic label alone.
- Map page is a static placeholder linking to `/explore`. Not integrated.
- Tweaks panel (theme/density/logo cycling from prototype) wasn't ported — the layout still reads `[data-theme]` and `[data-density]` from localStorage so it works manually, no UI to toggle.
- Search field in the topbar is a placeholder, no query logic.

**Working with Claude this session was painful** — same instructions repeated multiple times before they landed; layout fundamentals re-broken between fixes; sub-tasks tackled before they were asked for. Logged in `building-this-garden.md` 25 April entry. Worth reflecting on what to change in the project's interaction patterns.

**Opening message for next session:**
> Pick a polish target on `/research/`. Options: (a) wire the karpathy `raw/` snapshot to refresh from `src/content/` so chat sees fresh posts, (b) generate sparse topic views for the 46 orphan topics, (c) port the Tweaks panel for theme/density toggling, (d) wire the search field. Pick one, scope, then build.

---

## 🟡 Formal ontology layer research (RDF / SKOS)
*2026-04-22*

Flagged two days ago as "tomorrow's research" and never picked up. Research-only task, no implementation: what's the effort and benefit of publishing the faceted knowledge graph as formal linked data (RDF / SKOS / schema.org)? Tradeoffs to weigh: interoperability and linked-data-cloud participation vs. tooling/serialization/maintenance overhead for a personal garden. Output is a short written recommendation, not code.

Context: the graph is now in a clean faceted shape (types, lenses obligatory-array, subjects obligatory-array, roles optional, 25 predicates). That makes a formal serialization more feasible than before, since topics already have structured metadata that maps onto RDF classes and properties.

Key files: `src/data/triples.json`, `.claude/commands/auto-tag.md`, `.claude/commands/ingest-source.md`

**Opening message for next session:**
> Research the effort and benefits of formalising the garden's faceted knowledge graph as RDF / SKOS / schema.org linked data. Output is a written recommendation with tradeoffs, not implementation. The graph schema is now clean (faceted, fully migrated) so the analysis can use the real structure. Draw conclusions on whether it's worth doing for a personal garden.

---

## 🟡 Integrated admin dashboard (requirements scoping)
*added: 2026-04-22*

Big multi-feature project. Four functions brought together in one admin surface:

1. **Inbox watcher + ingest review** — actively monitors `src/content/_inbox/`, runs `/ingest-source` on new URLs, presents each ingestion (metadata, summary, topics, associations) for review, Maaike corrects/approves before anything is written
2. **Chatbot eval** — embed the existing `tools/karpathy-wiki/eval.html` dashboard (no new functionality, just integration)
3. **Interactive data model inspector** — visual of the full pipeline (inbox → ingest → triples.json → frontmatter → Mycelium → graph → chat retrieval), per-step detail panel, intended as learning/onboarding tool
4. **Conversation logs + business KPIs** — persistent chat logs (net-new, chat is currently stateless), KPI panel (questions, verified-claim rate, refusal rate, retrieval-miss rate, return visitors, most-asked topics), privacy-aware

**Rules of engagement set by Maaike:** requirements first, involve her every step, document everything, no code without permission. Each sub-feature gets its own mini-spec signed off before anything is built.

**Six open questions block the first spec session:** hosting model (main domain, subdomain, local-only), auth (magic-link, password, IP allowlist, none), chat-log storage (Vercel KV, Upstash, SQLite, JSON), framework (Astro page, separate app, plain HTML, SPA), priority order (proposed: 2 → 1 → 4 → 3), and scope of feature 3 (internal tool vs public-facing).

**Full project framing:** `C:\Users\mgroe\.claude\plans\first-lets-do-a-eventual-zephyr.md` — existing building blocks, what's reusable, what's net-new.

**Opening message for next session:**
> Answer the six open questions in the dashboard scoping plan (`C:\Users\mgroe\.claude\plans\first-lets-do-a-eventual-zephyr.md`). Once answered, pick one sub-feature (2 is smallest, suggested first) and we'll write the mini-spec together. No code this session.

---

## 🟡 Wiki eval dashboard: run the baseline
*added: 2026-04-20*

Full eval stack shipped this session. What got built:

- **Server side** (`tools/karpathy-wiki/tools/serve.py`): graph-based retrieval using the existing semantic layer (triples, taxonomy, themes — no embeddings); **Defense A** (refuse-weak-retrieval: zero LLM call when nothing matched); **Defense B** (`/api/verify` — LLM-as-judge claim classification returning verified/inferred/unverified buckets with a verdict); `/api/health` with feature flags; ThreadingTCPServer, no `SO_REUSEADDR`, so zombies become loud errors.
- **Dashboard** (`tools/karpathy-wiki/eval.html`): 55-question golden test set across 7 categories (relevant topics + people, ambiguous, out-of-scope, adjacent, adversarial injection + hallucination); live retrieval trace per question (topics matched, triples fired, score breakdown, themes matched); sources with type columns; 10-criterion yes/no HITL rubric; claim verification UI; **automated diagnosis** from the methodology decision tree (retrieval miss / prompt issue / grounding drift / tone-scoping / healthy); editable `expected_source` per question (my original guesses are editable from the UI — if one feels wrong, fix it in place, don't touch Python); **Start fresh** with auto-backup.
- **Infrastructure**: `scripts/eval-dev.sh` (canonical start, kills-before-start, health-gated), `scripts/eval-smoke-test.sh` (7 checks including dead-DOM detector — catches the class of bug that broke the Run button mid-session).
- **Docs** all served at `localhost:8782`: `manual.html` (task-based, Information Mapping), `methodology.html` (how to actually evaluate with worked examples), `truth-report.html` (architecture of the three defenses), `TRUTH-AND-VERIFICATION.md`.

**Loose ends:**
- The `runCurrent` race-condition fix landed late in the session. Verify it in a fresh browser session before trusting results. Any Q3-style cross-contaminated localStorage from earlier should be caught by Start fresh + re-run.
- Expected-source values are my guesses; correct them from the UI as you evaluate.
- Dashboard state is in `localStorage`, not committed. Export JSON before big changes.

**Next session should:** run the 55-question baseline, hand-score it, click Verify all, read the Report view. The headline metric for any future system change is the **unverified-claim rate** from Verify-all. First real test of whether Defense A + B actually work in practice.

Key files: `tools/karpathy-wiki/eval.html`, `tools/karpathy-wiki/tools/serve.py`, `tools/karpathy-wiki/tools/eval.py`, `scripts/eval-dev.sh`, `scripts/eval-smoke-test.sh`, `tools/karpathy-wiki/{manual,methodology,truth-report}.html`, `tools/karpathy-wiki/TRUTH-AND-VERIFICATION.md`

**Opening message for next session:**
> Run the wiki eval dashboard baseline. Start the stack with `bash scripts/eval-dev.sh`, open http://localhost:8782/eval.html, click **Run all** to fire all 55 questions, hand-score with 1/2/3 + rubric, click **Verify all**, then open **Report** for aggregates and the diagnosis breakdown. If any of my expected-source guesses feel wrong, correct them inline (edit button next to the expected source). Export JSON when done — that's your baseline for any future system change. Read `tools/karpathy-wiki/methodology.html` before scoring if you want the calibration guide.

---

## 🔵 Sources ingestion layer + topic wiki
*2026-04-18*

The ingestion pipeline and topic wiki are live but the wiki page design isn't finalized. Three redesign prototypes are in `public/prototypes/` (dashboard, narrative, hub): pick one, adapt it into `src/pages/topics/[topic].astro`. The current topic page works but uses a plain text layout without the mycelium radial or argument map visualizations. Also: `/telegram-sync` now auto-runs `/ingest-source` on new links, but this hasn't been tested end-to-end with a real Telegram sync yet.

Key files: `src/pages/topics/[topic].astro`, `src/pages/topics/index.astro`, `src/pages/sources.astro`, `.claude/commands/ingest-source.md`, `.claude/commands/telegram-sync.md`, `src/data/triples.json`, `public/prototypes/wiki-redesign-*.html`

**Opening message for next session:**
> Pick a wiki page redesign (dashboard, narrative, or hub) from `public/prototypes/` and implement it as the real `/topics/[topic].astro` page. Prototypes are at `localhost:4321/prototypes/wiki-redesign-*.html`. Also test `/telegram-sync` end-to-end with a real Telegram link to verify the auto-ingest flow works.

---

## 🟡 Wiki chat: polish items after launch
*added: 2026-04-19*

Chat is live at maaike.ai/wiki. Four small follow-ups, any order: (1) point the frontend `API` constant at `https://wiki.maaike.ai` instead of `https://maaike-ai.vercel.app` — one-line edit, kills Chrome's lookalike warning for good; (2) decide where the chat gets a nav link on maaike.ai (footer? header?); (3) upgrade in-memory rate limiter to Upstash Redis so it survives Vercel cold starts (free tier, ~2 hrs, rationale in `tools/karpathy-wiki/API.md`); (4) self-host Lora + Roboto in the chat instead of Google Fonts, or add SRI hashes.

Key files:
- `public/wiki/index.html` — frontend, line with `const API = ...` near the top of the `<script>` block
- `tools/karpathy-wiki/api/index.py` — current in-memory rate limiter (`_rate_state` + `_check_rate_limit`)
- `tools/karpathy-wiki/SYSTEM_PROMPT.md` — editable prompt; test on the live chat after each push

**Opening message for next session:**
> Run `/telegram-sync` first, then: polish items on the wiki chat. Swap the frontend `API` constant in `public/wiki/index.html` to `https://wiki.maaike.ai`, decide on a nav link to `/wiki` somewhere on maaike.ai, and (if time) upgrade the in-memory rate limiter in `tools/karpathy-wiki/api/index.py` to Upstash Redis.

---

## 🟡 Ingestion architecture: build the Karpathy layer
*added: 2026-04-14*

Agreed architecture from today's session. The garden already has the right shape — three concrete things to build:

**1. `sources` section in `triples.json`**
External references that contribute associations but have no content page. Format:
```json
"sources": {
  "source-id": { "label": "...", "url": "...", "date": "YYYY-MM-DD" }
}
```
Update the concept graph page (`/graph`) to show source nodes alongside post nodes.

**2. Weblink enrichment step**
When a weblink arrives via Telegram (or on `/publish`), offer to fetch + run TAO extraction and add associations to `triples.json` using a source ID (not a post slug). Optional, per link, never automatic.

**3. `/ingest-source` skill**
Takes a URL or PDF, extracts TAO, checks overlap with existing topics in `triples.json` (gate: 2+ existing topics must match), creates a source entry, adds associations. Calls existing `/auto-tag` logic internally.

Full architecture in memory: `project_ingestion_architecture.md`.

**Opening message for next session:**
> Build the Karpathy ingestion layer. Three deliverables: (1) add `sources` section to `triples.json` and update `/graph` page to show source nodes; (2) add optional weblink enrichment step to telegram-sync; (3) build `/ingest-source` skill. Full architecture in `C:\Users\mgroe\.claude\projects\C--Sharing-Maaike-Digital-Garden\memory\project_ingestion_architecture.md`.

---

## 🟡 Newsletter: distribute Creative Prompts, April 2026
*added: 2026-04-14*

Published to the garden at `/jottings/creative-prompts-april-2026/`. Still needs manual copy-paste to the other channels. Typora has the file open.

- [ ] Substack
- [ ] Mighty Networks
- [ ] LinkedIn article
- [ ] Mailchimp

---

## 🟡 Convoclub meetup: garden demo topics
*added: 2026-04-13*

Six demo topics ready to pull during the meetup. Each stands alone — pick one depending on what the audience is most curious about.

- [ ] **The garden as a second brain for conversation designers** — show the seed/field note/article maturity arc as an analogy for how ideas develop in practice
- [ ] **Wiki-links as a thinking tool** — pick a topic (e.g. "conversation repair") and trace its connections across notes. Visible argument map.
- [ ] **Auto-tagging with TAO** — show how Claude extracts Topics, Angles, Observations from a piece of writing and turns them into semantic tags. Linguistically interesting.
- [ ] **B1 checker skill** — paste a bot utterance or content fragment and check it for B1 compliance live. Directly relevant to conversation designers.
- [ ] **AI transparency field** — show how every post is labeled (100% Maai / assisted / co-created / generated). Opens a conversation about authorship.
- [ ] **Live: ask the garden a question** — pick a topic Maaike has written about and let Claude synthesize across her notes and respond in her framework.

---

## 🟡 Reading radar: GenAI directions 2026
*added: 2026-04-11*

Three articles to read and scan. Personal orientation, not for publishing.

- From generative to agentic AI: a roadmap in 2026
  https://medium.com/@anicomanesh/from-generative-to-agentic-ai-a-roadmap-in-2026-8e553b43aeda
- State of RAG & GenAI
  https://squirro.com/squirro-blog/state-of-rag-genai
- Agentic AI design patterns: 2026 edition
  https://medium.com/@dewasheesh.rana/agentic-ai-design-patterns-2026-ed-e3a5125162c5

---

## 🟠 User manual HTML mockup
*2026-04-07*

`public/user-manual.html` — a work-in-progress mockup for "How to grow your own digital garden". Maaike is finishing it herself. Leave the file in place.

blocker: Maaike finishing the content

---

## 🟡 User manual deliverables
*2026-04-06 · last-touched: 2026-04-12*

Six deliverables approved and ready to write: TOC, full chapter outline, user/task analysis, persona, pitch deck structure, and JTBD journey.

Inbox quotes from Maaike (2026-04-06 in `src/content/_inbox/telegram.md`) feed directly into this: why the garden, audience/approach, learning philosophy.

Key files: `src/content/seeds/how-to-build-a-digital-garden.md`, `src/content/field-notes/building-this-garden.md`, `src/content/field-notes/garden-user-manual.md`, plan file: `C:\Users\mgroe\.claude\plans\smooth-mapping-gizmo.md`

**Opening message for next session:**
> Write the six user manual deliverables to file (TOC, outline, user/task analysis, persona, pitch deck, JTBD journey) — all were approved last session. Three verbatim Maaike quotes in `src/content/_inbox/telegram.md` (dated 2026-04-06) feed directly into the content.

---

## 🔵 Karpathy comparison project
*added: 2026-04-12 · worktree: `claude/karpathy`*

Project hub at `src/content/field-notes/karpathy-comparison.md`. Two articles comparing Maaike's approach to Andrej Karpathy's, plus a practical implementation on the garden's content.

Deliverables:
- [ ] Version A: "The compiler and the gardener" — metaphor-forward, 600-900 words
- [ ] Version B: "How we actually compare" — technical side-by-side, 700-1000 words
- [ ] LinkedIn post for Version A
- [ ] LinkedIn post for Version B
- [ ] Karpathy implementation — apply his approach to the garden's content (separate page)

Work in worktree `C:\Sharing\Maaike\Digital-Garden\.claude\worktrees\karpathy` on branch `claude/karpathy`.

**Opening message for next session:**
> Continue the Karpathy comparison project. Hub is at `src/content/field-notes/karpathy-comparison.md`. Start with whichever article version you want first — Version A (metaphor-forward: "The compiler and the gardener") or Version B (technical side-by-side: "How we actually compare"). Use `/new-project-file` to add each article.

---

## 🟡 Morning inbox + telegram schedule
*2026-04-07*

Two daily schedules to set up via `/schedule` (connection keeps failing — retry when available):
1. Daily 8:00 AM: surface new entries from `src/content/_inbox/` and offer to turn them into posts
2. Daily telegram sync: run `/telegram-sync` to pull new captures (removed from `/backlog` step 0 — now runs independently)

Key files: `src/content/_inbox/telegram.md`, `src/content/_inbox/`, `.claude/commands/backlog.md`

**Opening message for next session:**
> Retry /schedule — it's failed three times due to connection errors. Two tasks: (1) daily 8:00 AM inbox check surfacing new entries from `src/content/_inbox/`; (2) daily telegram sync running `/telegram-sync`. Both were removed from the /backlog skill and need their own schedules.

---

## 🟡 Garden housekeeping
*2026-04-05*

Weeded the garden (deleted untitled-draft, test-quote, thin ChatGPT article stub), kept Convoclub as living history. ✅ Weeding confirmed done. Pinned the 3 most recent articles at the top of the stream (first as hero, next two with "Recent" badge). Added the publishing routine to Tech specs in the Toolshed, with a detailed section on the auto-tag enrichment process (TAO method, triples registry, wiki-links). Broken wiki link in chatgpt-presentation-prep was already plain text — closed.

Remaining: decide on thin seeds, review Toolshed Workflow section gaps (way of working with Claude, skills overview). Growing the digital garden project files moved to their own backlog item.

Key files: `.claude/backlog.md`, `src/content/toolshed/publishing-routine.md`, `src/pages/index.astro`, `src/components/MosaicCard.astro`

---

## 🟡 Growing the digital garden
*added: 2026-04-05*

Project hub at `src/content/field-notes/growing-the-digital-garden.md`. Documenting the garden's evolution: how it grows, how it's tended, and what it's becoming.

Deliverables:
- [x] `articles/garden-as-metaphor` — published
- [ ] `field-notes/garden-lifecycle-weeds` — formalise the greenhouse/compost/soil lifecycle model
- [ ] `field-notes/pruning-field-investigation` — how to use the pruning field systematically

Use `/new-project-file` to add files, `/complete-project` when done.

---

## 🟡 Toolshed: missing elements
*added: 2026-04-05*

The Toolshed content design section is missing posts on: way of working with Claude, Claude skills overview. Maaike to review a list of candidates before any are written.

blocker: review list with Maaike before writing

---

## ✅ Rhetoric/Argument triples + Thematic-TAO field note review
*2026-04-04*

Closed two loose ends from the TAO graph session. Added 3 bridge associations to `src/data/triples.json` connecting Rhetoric and Argument into the GenAI cluster (LLMs generates Rhetoric, Rhetoric exhibits Indifference to truth, Argument requires Ground truth) plus predicates `generates` and `requires`. Reviewed the Thematic-TAO field note — already published and good as-is. Backlog groomed and archived both items.

Key files: `src/data/triples.json`, `src/content/field-notes/thematic-tao-three-pass-method.md`, `.claude/backlog.md`

---

## 🟡 Auto-tag all 100% Maai articles
*added: 2026-03-31*

Run `/auto-tag` on every article with `ai: "100% Maai"` in frontmatter. Five have already been done (see completed auto-enrichment item). Find the remaining ones, process one by one, and update `taxonomy.json`, `themes.json`, and `triples.json` as each one is tagged.

To find candidates: `grep -rl "100% Maai" src/content/articles/` — then cross-check against posts that already have `triples:` and `themes:` in their frontmatter.

---

## 🟡 Themes as writing prompts
*added: 2026-03-31*

The `themes` field (now in each post's frontmatter and in `src/data/themes.json`) stores per-post thematic summaries from the TAO analysis. These read like writing prompts: concise, opinionated one-liners about what a post argues. Explore using them as: seed ideas for new posts, newsletter prompts, LinkedIn angle generators, or a "what this garden is really about" overview page.

Key files: `src/data/themes.json`, post frontmatter (`themes:` array)

---

---

## ✅ Tagging, triples, and auto-enrichment
*2026-03-29 · completed: 2026-03-31*

Ran `/auto-tag` on 5 existing articles. Built `src/data/taxonomy.json` (40+ canonical entities with types and term-definitions), `src/data/themes.json` (per-post thematic summaries), and `src/data/triples.json` (30+ topics, 27+ associations). Added `themes:` to content schema. Added **Mycelium** section to PostLayout: a collapsible serif drawer containing tags, Relations, and "What this post argues" — all three collapsed by default. 15 new tag files created.

---

## 🔵 The return of the button
*added: 2026-03-27 · last-touched: 2026-03-28 · article*

I want to write an article called "The return of the button". The seed is at `src/content/seeds/the-return-of-the-button.md` — read it first, that has my literal thinking.

The core idea: Claude Code is reintroducing structured, constrained input (buttons, numbered options) which is essentially IVR. Traditionally seen as a UX relic. But in GenAI, unconstrained free text is actually the problem: hard for users, and a security risk (prompt injection). Constraint is a feature, not a regression.

Deliverables: one article and one LinkedIn post. Use `/new-post` to start. I will write it myself in Typora — just help me structure and develop the idea first.

---

## 🟡 Content: About page rewrite
*added: 2026-03-27 · last-touched: 2026-05-05*

Structure is now in place: `about.astro` replaced by `src/pages/about.md` with full frontmatter (date, maturity, tags, description, ai). Editable in Typora. Renders with PostLayout like all other garden posts. What's still needed: Maaike rewrites the actual content (bio, what grows here, etc.) to reflect where the garden is now. Also update the sidebar bio blurb in `src/pages/index.astro` once the About page is done.

Key files: `src/pages/about.md`, `src/pages/index.astro` (sidebar bio)

---

---


## 🟠 Claude LabBook project
*added: 2026-03-27 · last-touched: 2026-03-28 · new project*

A system for logging code changes as scientific trials: what was tried, why, what happened, what was learned. Trials are chained so the agent can trace the full evolution of a problem. Includes pre-change safety checks that pull up prior trials on the same component.

**Next step:** use `/new-project` to create the hub, then plan the implementation.

Reference: LinkedIn post by https://www.linkedin.com/in/aimarketerguy, repo at https://lnkd.in/eRGsqYYF

---

## 🟠 Standalone LinkedIn posts
*added: 2026-03-27 · last-touched: 2026-03-28 · feature*

Currently LinkedIn posts must be tied to a garden post. Maaike wants to create standalone LinkedIn posts from within the garden. Required structure: text, image, hashtags.

**blocker:** define the workflow before touching code. Does this live in the garden at all, or is it a separate skill that writes to a staging file?

---

## 🟠 Content: thin cards
*added: 2026-03-27 · last-touched: 2026-03-28*

Some garden cards are thin on content and need tending. No urgency — address opportunistically when working on related content.

---

## 🟠 Obsidian templates
*added: 2026-03-27 · last-touched: 2026-03-28 · housekeeping*

Post templates in Obsidian are not consistent in metadata. **blocker:** check previous conversation history (possibly on another machine) to understand current status. Do not take action until confirmed with Maaike.

---

## Garden health (from report: 2026-03-21)

Outstanding issues from the last health scan. Run `/health` (or manually inspect) to refresh.

- **Broken wiki link:** `[[ai-feedback-loops]]` in `articles/chatgpt-presentation-prep.md:37` — quick fix
- **Library descriptions:** 97 books in `src/content/library/` missing `description` field — ongoing
- **Tag cleanup:** 8 single-use tags recommended for merging; voice/HMI/LLM tag clusters have near-duplicates

---

## Archive

### ✅ Telegram weblinks: LinkedIn redirect URLs
*2026-04-06 · completed: 2026-04-07*

Three weblinks arrived via Telegram with LinkedIn safety redirect URLs. Decided to delete rather than resolve — links didn't lead anywhere useful.

### ✅ Tablet + Telegram integration
*2026-04-06*

Full Telegram capture pipeline delivered: @MaaikGardenBot, GitHub Actions sync on 15-min cron, links auto-published as weblinks, text notes to `_inbox/telegram.md`. `/telegram-sync` skill added. Book recommender ported from Python to Node.js, all 110 books scored, "include books I already read" toggle added, 20-test suite written. Tests section added to Toolshed. YAML build failure in `session-management.md` fixed. ViewTransitions removed. Morning inbox schedule still pending (see active item above).

### ✅ Tablet setup + inbox workflow
*2026-04-05 · completed: 2026-04-06*

Samsung Notes → GitSync → `_inbox/` pipeline set up and working. Telegram pipeline also shipped this session.

### ✅ Toolshed redesign: three-collection structure
*2026-04-04 · completed: 2026-04-05*

Full Toolshed mini-site shipped. Three sections: Visual design (`/toolshed/design`, 20+ pattern posts), Content design (`/toolshed/content-design`, garden metaphor + prose/attribution/OG posts), Tech specs (`/toolshed/technical`, 5 architecture posts). Megamenu added to header. Mobile header fixed (no auto-expand, full-width triggers, wrapping views row). Content schema extended with `content` category.

### ✅ Library redesign: stream aesthetic, three views, mobile filters
*2026-04-04 · completed: 2026-04-04*

Full rewrite of `src/pages/library/index.astro`. Book cards now use the stream index card aesthetic: bookmark strip, double-line meta bar, collection label, maturity emoji. Three display modes (Cards / List / Covers) with pill bar toggle. Filter sidebar with folder-tab panels (Status / Format / Topic). Sort toolbar (Date added / Title / Author / Last tended). Pagination (12 per page desktop, 6 mobile). Mobile filter bar with toggle button and active-count badge, syncing to sidebar via `data-filter-group` / `data-mobile-group`. Fixed view-switch bug where `.view-btn` selector caught sort spans. Live in production.

Key files: `src/pages/library/index.astro`

### ✅ Rhetoric/Argument: connect to GenAI cluster in triples.json
*2026-03-30 · completed: 2026-04-04*

Added 3 associations to `src/data/triples.json`: LLMs generates Rhetoric, Rhetoric exhibits Indifference to truth, Argument requires Ground truth. Added predicates `generates` and `requires` to `_predicates`. Rhetoric and Argument now connect into the main GenAI cluster rather than hanging as an isolated pair.

### ✅ Review: Thematic-TAO method post
*2026-03-30 · completed: 2026-04-02*

Published field note at `/field-notes/thematic-tao-three-pass-method`. Typos fixed, ai field promoted to 100% Maai, Hackos Wikipedia link added.

### ✅ Stream refinement: index card aesthetic, filter sidebar
*2026-03-29 — completed*

Extended the index card metaphor throughout the stream. Featured hero card: white paper, blue ruled lines, FEATURED rubber stamp, full-height bookmark strip. All cards: white background, washed-out red double line on meta bar. Page background: barely-there greengrey tint (#FCFCFB) so white cards pop. Filter sidebar: three separate cards each with a protruding folder tab (Collection, Maturity, Written by). Legend panel below filters: collapsible, covers maturity and written by definitions with emoji (✍️ ✏️ ✨ ⚙️). Hero visual: large leaf SVG with organic greengrey blob behind it. Doodle icon library (300+ SVGs) added to repo at `public/images/doodle-icons/`. No-em-dash rule extended to all UI copy.

### ✅ Stack page: browsable card browser
*2026-03-28 — completed*

Physical card browser at `/stack`. Pick a card, browse connections as a stacked deck. Box-shadow trick simulates peek cards. Top connected suggestions + A-Z sequential mode. Search across titles, descriptions, and tags. Resolved the Zettelkasten interaction model question: physical card metaphor won over grid/graph.

### ✅ Stream + collections redesign: homepage v2
*2026-03-29 — completed*

Full homepage redesign. Hero section (50vh, warm #F5F4F0, leaf SVG, serif heading). Header merged into hero background. 3px double border divider. Stream column (10 items/page with pagination) + filter sidebar (Collection/Maturity/Written by checkboxes with All/Clear, hover-reveal animation from design specs). Currently reading + Projects sidebar cards in deeper green. Stay updated / webring / under construction footer sections. "Latest article" badge in teal. Back button on all post pages. Filter pills replaced entirely by checkbox panels. Library excluded from stream and filters.

### ✅ Stream page redesign: index cards + sidebar
*2026-03-27 — completed*

Redesigned the stream page around an index card metaphor. Each card has a coloured bookmark strip on the left, a double-line separator, and a horizontal meta bar with collection label, date (year, all caps), maturity emoji and AI indicator. Articles and jottings show a body preview with "Read more". Hero card replaced by a pinned LATEST badge. Sidebar has three portrait cards (About, Currently reading, Projects) with greige strip and brand-pink double lines. Two-column layout, sidebar collapses on mobile.
