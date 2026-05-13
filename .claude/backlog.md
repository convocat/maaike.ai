# Session backlog

What's queued up. Each entry is a ready-to-paste opening message for a new thread.

**Status:** [READY] · [IN PROGRESS] · [PARKED] · [DONE]

**Groomed:** 2026-05-10 · Items marked with `blocker:` are waiting on a decision or input before they can move forward.

---

## 🟡 GraphRAG chatbot (course deliverable)
*2026-05-11*

The MindStudio University bot is live at https://genai-design-tools.vercel.app/, repo at https://github.com/convocat/genai-design-tools. Four small follow-ups: (1) narrow CORS in `mindstudio-rag/serve.py` from `["*"]` to `["https://genai-design-tools.vercel.app", "https://mindstudio.maaike.ai"]`; (2) add `mindstudio.maaike.ai` as a custom domain in Vercel + add a CNAME record at the DNS provider; (3) ask one question on prod and confirm Langfuse shows a single `bot:mindstudio-ask` trace (the orphan-generation fix was pushed in commit `c39f125`); (4) manually delete `Digital-Garden/tools/mindstudio-rag/` once VS Code / antivirus releases the lock.

Key files: `genai-design-tools/mindstudio-rag/serve.py`, `genai-design-tools/mindstudio-rag/vercel.json`, Vercel project settings.

**Opening message for next session:**
> Run `/telegram-sync` first, then: tighten up the genai-design-tools deploy — lock CORS in mindstudio-rag/serve.py to the prod domains, add mindstudio.maaike.ai as a Vercel custom domain (CNAME on the DNS side), and check Langfuse to confirm conversations now produce a single trace per turn.

---

## [PARKED] Library + draft field-notes await enrichment
*2026-05-10*

Two leftover groups want enrichment when convenient: (a) 63 library stubs that have no triples yet, mostly fiction (fantasy, romance, literary fiction) and philosophy of mind / posthumanism books, where the existing controlled vocabulary doesn't cover their tags; (b) 6 draft field-notes (brain-dump-march-27, claude-labbook, conversational-patterns-for-human-machine-interaction, growing-the-digital-garden, how-i-tend-this-garden, karpathy-comparison) that were skipped because they're `draft: true` and filtered out of retrieval anyway. Two paths: extend the topic vocabulary (add `posthumanism`, `science-fiction-literature`, `philosophy-of-mind`, `behavioural-economics`, etc.) and re-run the metadata-only pass, or write your own short reading notes on the books and let the full TAO pass pick them up. No urgency.

Key files: src/data/triples.json (topics, associations), src/content/library/, src/content/field-notes/, the auto-tag skill.

**Opening message for next session:**
> Run `/telegram-sync` first, then: pick up library + draft field-note enrichment. The 63 unenriched library stubs are mostly fiction/philosophy with no current topic match. Either extend the topic vocabulary in src/data/triples.json (posthumanism, philosophy-of-mind, science-fiction-literature, behavioural-economics) and re-run a metadata pass, or add short reading notes to selected books for full TAO treatment. The 6 draft field-notes need to be published before re-tagging.

---

## [READY] Karpathy-wiki cleanup + retire wiki v6 + working-tree housekeeping
*2026-05-06 · bumped 2026-05-08*

Lift chatbot runtime out of `tools/karpathy-wiki/` into `api/`, switch `_ASK_SYSTEM_PROMPT` and `_VERIFY_SYSTEM_PROMPT` to `load_prompt(...)`, delete dead Vercel files, `git mv tools/karpathy-wiki tools/wiki-eval`, rewrite the relevant CLAUDE.md section. Now also includes:

- **Retire wiki v6** at maaike.ai/wiki (`public/wiki/index.html`). Homepage chat replaces it.
- **Working-tree housekeeping**. Commit `vercel.json` + `api/` if prod-needed. Decide which `tools/admin/_*.py` and `tools/karpathy-wiki/tools/extract-batch.py` helpers ship. Gitignore `__pycache__/`. Delete the 5 handoff zips at repo root. Triage `public/wiki-v*.html` + `workflow-tool.html` + `preview-server.py`. Leave `public/user-manual.html` (Maaike WIP).

Plan: `~/.claude/plans/hi-claude-i-want-abundant-candle.md`. Risk: Vercel deploy break if `includeFiles` glob misses runtime files. Single-commit revert if broken.

**Opening message:**
> Run `/telegram-sync` first. Pick up the karpathy-wiki cleanup. Plan at `~/.claude/plans/hi-claude-i-want-abundant-candle.md`. Move chatbot runtime to `api/`, refactor `KARPATHY_ROOT` to `API_ROOT`, switch the two system-prompt loads to `load_prompt(...)`. Update vercel.json, the research [slug] cache path, admin server .env path, eval scripts, .gitignore. Delete dead Vercel files. Retire `public/wiki/` (wiki v6). Triage the working-tree zips and prototypes. `git mv tools/karpathy-wiki tools/wiki-eval`. Rewrite the CLAUDE.md section. Verify all 8 plan steps. Stop and show diff before pushing.

---

## [IN PROGRESS] The Garden chatbot v0.1
*2026-05-05 · worktree: `claude/chatbot` at `.claude/worktrees/chatbot`*

Chatbot ships and works end-to-end. Remaining v0.1 polish:

- Backfill 2 missing `ai:` fields (`field-notes/new-draft`, `weblinks/saga-knowledge-platform`)
- Make `ai` required in the Zod schema
- Drop the conditional render in `src/layouts/PostLayout.astro`
- Tighten the Sources block enforcement in chat replies
- Library exemption decision still open
- **NEW:** add "What should I write about?" starter button surfacing themes from `src/data/themes.json` as writing prompts (folded from old "Themes as writing prompts" item)

Note: `tools/karpathy-wiki/tools/serve.py` is moving to `api/server.py` per the cleanup item. Do that first.

**Opening message:**
> Run `/telegram-sync` first. Finish chatbot v0.1 polish: backfill the 2 missing `ai:` fields, make `ai` required in the Zod schema, drop the conditional render in PostLayout. Tighten the Sources block enforcement. Add a "What should I write about?" starter button surfacing themes as writing prompts. System prompt: `src/content/prompts/garden-system-prompt.md`.

---

## [READY] About page: content rewrite
*2026-05-05 (was also 2026-03-27, duplicate merged)*

Structure in place at `src/pages/about.md`. Editable in Typora. Maaike rewrites bio, what grows here, how maturity works. Once done, update sidebar bio in `src/pages/index.astro`.

**Opening message:**
> Open `src/pages/about.md` in Typora and rewrite the about page content. Once done, update the sidebar bio blurb in `src/pages/index.astro` to match.

---

## [READY] Photos in stream cards
*2026-05-05*

Add optional `image` field to jottings schema, pass through `MosaicCard.astro`, display below body for `type: post` jottings. Test post: `latest-addition-to-my-thinking-tools-a-tiny-e-reader.md` (3 images in `public/images/jottings/`).

Files: `src/content.config.ts`, `src/components/MosaicCard.astro`.

**Opening message:**
> Add photo preview to jotting stream cards. Add optional `image: /path/to/img.jpg` field to the jottings content schema in `src/content.config.ts`, update `MosaicCard.astro` to display it below the body text for `type: post` jottings. Test with `src/content/jottings/latest-addition-to-my-thinking-tools-a-tiny-e-reader.md`.

---

## [IN PROGRESS] Verify nightly-inbox-enrichment
*re-registered 2026-05-08, next run 2026-05-09 05:04*

Task `nightly-inbox-enrichment` registered today at cron `0 5 * * *`. Earlier registration was lost (scheduled-tasks MCP doesn't persist across restarts, see memory `reference_scheduled_tasks_persistence.md`). Tomorrow morning: scan `tools/admin/nightly-enrichment-log.md` for the first real entry, spot-check one in the dashboard at `localhost:8900`. If missing or failed, debug.

**Opening message:**
> Check `tools/admin/nightly-enrichment-log.md` for last night's nightly-inbox-enrichment run. Confirm enriched drafts pushed cleanly, spot-check one in the dashboard at localhost:8900. If skipped or failed, debug. Verify task is still in `mcp__scheduled-tasks__list_scheduled_tasks` first.

---

## [PARKED] Re-evaluate the /research + admin dashboard work
*2026-04-25 · blocker: trust before scope*

`/research` route audit against v0.5 SPEC.md still not done. Admin dashboard half is largely worked out commit-by-commit (now 19 endpoints, far past the 4 originally noted). Single item, not split.

**Opening message:**
> Audit each `/research` route (`/`, `/ask`, `/stream`, `/[slug]`, `/map`, `/log`) against `v0.5 SPEC.md`. Surface dead code, spec drift, and any regressions before any new feature work.

---

## [READY] Research wiki at /research/ — polish + open ends
*2026-04-25*

Pick a polish target:
(a) wire `tools/karpathy-wiki/raw/` snapshot to refresh from `src/content/`,
(b) generate sparse topic views for 46 orphan topics,
(c) port Tweaks panel for theme/density toggling,
(d) wire the search field.

**Opening message:**
> Pick a polish target on `/research/`. Options: (a) wire the karpathy `raw/` snapshot to refresh from `src/content/`, (b) generate sparse topic views for the 46 orphan topics, (c) port the Tweaks panel for theme/density toggling, (d) wire the search field. Pick one, scope, then build.

---

## [READY] Formal ontology + topic + tag cleanup
*2026-04-22 · bumped 2026-05-08*

Three threads, naturally one item:

1. **Formal ontology research (RDF / SKOS / schema.org).** Effort + benefit of publishing the faceted graph as linked data. Output: written recommendation, no code. Context: the graph is now in a clean faceted shape (types, lenses obligatory-array, subjects obligatory-array, roles optional, 25 predicates).
2. **Topic cleanup pass.** Review `src/data/triples.json` for duplicate / near-synonymous topics. We've been adding without checking reuse — there are likely under-reused near-duplicates.
3. **Tag cleanup.** Voice/HMI fragmentation still active: `voice` (4) + `voice-design` (13) + `voice-ux` (1) + `voice-user-interface-design` (1) + `voice-user-interfaces` (3); `human-machine-interface` (9) + `human-machine-interface-design` (8); `chatbots` (1) vs `conversational-ai` (20); `testing` (1), `user-interfaces` (1).

**Opening message:**
> Three connected jobs: research the effort and benefits of formalising the faceted graph as RDF / SKOS / schema.org linked data (written recommendation, no code); pass over `src/data/triples.json` for duplicate or under-reused topics; consolidate the voice/HMI/conversational-ai tag fragmentation. Output recommendations before any consolidation merges.

---

## [READY] Integrated admin dashboard (features 2/3/4)
*2026-04-22 · feature 1 done*

Feature 1 (inbox watcher + ingest review) is shipped on `localhost:8900` (19 endpoints). Three features remain:

2. **Chatbot eval embed** — embed the existing eval dashboard. Inputs: keep the 55-question test set + methodology from the retired wiki-eval item.
3. **Interactive data model inspector** — visual of the full pipeline (inbox → ingest → triples.json → frontmatter → Mycelium → graph → chat retrieval), per-step detail panel.
4. **Conversation logs + business KPIs** — persistent chat logs (chat is currently stateless), KPI panel (questions, verified-claim rate, refusal rate, retrieval-miss rate, return visitors, most-asked topics), privacy-aware.

Six open questions block the next spec session: hosting model, auth, chat-log storage, framework, priority order, scope of feature 3 (internal vs public). Plan: `~/.claude/plans/first-lets-do-a-eventual-zephyr.md`.

**Opening message:**
> Answer the six open questions in the dashboard scoping plan (`~/.claude/plans/first-lets-do-a-eventual-zephyr.md`). Once answered, pick one of features 2/3/4 (2 is smallest, suggested first) and write the mini-spec together. No code this session.

---

## [PARKED] User manual HTML mockup
*2026-04-07 · blocker: Maaike finishing the content*

`public/user-manual.html` — Maaike finishing herself. Leave the file in place.

---

## [READY] User manual deliverables
*2026-04-06 · last-touched 2026-04-12*

Six approved deliverables to write: TOC, full chapter outline, user/task analysis, persona, pitch deck structure, JTBD journey. Three verbatim Maaike quotes in `_inbox/telegram.md` (2026-04-06) feed in directly. Plan: `~/.claude/plans/smooth-mapping-gizmo.md`.

**Opening message:**
> Write the six user manual deliverables to file (TOC, outline, user/task analysis, persona, pitch deck, JTBD journey) — all approved last session. Three verbatim quotes in `src/content/_inbox/telegram.md` (dated 2026-04-06) feed directly into the content.

---

## [IN PROGRESS] Karpathy comparison project
*2026-04-12 · bumped 2026-05-08 · partial draft moved to main*

Hub at `src/content/field-notes/karpathy-comparison.md` (not yet on disk). Partial draft of Version B (technical side-by-side, "How we actually compare") moved out of worktree to `src/content/articles/how-we-actually-compare.md`, still `draft: true`. Worktree at `.claude/worktrees/karpathy` can be removed when ready.

Deliverables:

- [ ] Version A: "The compiler and the gardener" (metaphor-forward, 600-900 words). Not started.
- [partial] Version B: "How we actually compare" (technical side-by-side, 700-1000 words). Draft in main, finish in Typora.
- [ ] LinkedIn post for Version A
- [ ] LinkedIn post for Version B
- [ ] Karpathy implementation on the garden's content
- [ ] Create the hub field-note `karpathy-comparison.md`

**Opening message:**
> Continue the Karpathy comparison project. Hub field-note `karpathy-comparison.md` not yet created. Version B draft is at `src/content/articles/how-we-actually-compare.md` (still draft). Pick: (a) finish Version B in Typora, (b) start Version A "The compiler and the gardener", or (c) create the hub first.

---

## [READY] Growing the digital garden
*2026-04-05 · bumped 2026-05-08*

Project hub at `src/content/field-notes/growing-the-digital-garden.md`. Two deliverables remaining:

- `field-notes/garden-lifecycle-weeds`. Formalise the greenhouse/compost/soil lifecycle model.
- `field-notes/pruning-field-investigation`. How to use the pruning field systematically.

Already shipped: `articles/garden-as-metaphor`. Use `/new-project-file` to add files, `/complete-project` when done.

---

## [READY] Toolshed: missing elements
*2026-04-05 · bumped 2026-05-08 · blocker: review list with Maaike before writing*

Toolshed content design section missing posts on: way of working with Claude, Claude skills overview. Maaike to review candidates before any are written.

---

## [IN PROGRESS] The return of the button
*2026-03-27 · last-touched 2026-05-04*

Working file: `src/content/seeds/the-return-of-the-button.md` (53 lines, draft). Core idea: Claude Code reintroduces structured input (buttons, numbered options) which is essentially IVR. Constraint as feature, not regression. Deliverables noted in the seed: a quick LinkedIn post and an article. Maaike writes herself in Typora.

**Opening message:**
> Open `src/content/seeds/the-return-of-the-button.md` in Typora. The seed has the full thinking. Deliverables noted at the bottom: a quick LinkedIn post and an article.

---

## [READY] Skill fix: suppress /ingest-source per-item review in batch flows
*added 2026-05-08*

`/check-inbox` runs `/ingest-source` per draft, but `/ingest-source` Step 8 presents a chat review block. That's the wrong surface for batch backfill. The dashboard is. Update either:
(a) drop `/ingest-source` from `/check-inbox` (let the dashboard Enrich button handle), or
(b) keep it but suppress Step 8 inside batch flows.

Memory rule already saved: `feedback_dashboard_pre_enriched.md`.

**Opening message:**
> Pick (a) or (b) for the `/check-inbox` + `/ingest-source` interaction. Read memory `feedback_dashboard_pre_enriched.md`. Update the relevant skill file under `.claude/commands/`. Verify: a fresh `/check-inbox` run no longer floods chat with per-draft review blocks.

---

## [PARKED] Claude LabBook project
*2026-03-27*

System for logging code changes as scientific trials. Want to work on it but too big right now. Reference: LinkedIn post by aimarketerguy, repo at https://lnkd.in/eRGsqYYF.

---

## Archive

### [DONE] Three defenses against confabulation (field note)
*2026-05-08* — generated from `tools/karpathy-wiki/TRUTH-AND-VERIFICATION.md`, published to `src/content/field-notes/three-defenses-against-confabulation.md`.

### [DONE] Process two PDF stubs
*2026-05-08* — Dingemanse 2026 + Cheng et al 2026 to library entries with structured `## Summary`, auto-tag enrichment applied (13 new topics, 13 associations).

### [DONE] Telegram inbox: unnamed book entry (Apr 29)
*2026-05-08* — book already in library, inbox entry marked discarded.

### [DONE] Reading radar: GenAI directions 2026
*2026-05-08* — 3 weblinks added as drafts: `from-generative-to-agentic-ai-a-roadmap-in-2026`, `state-of-rag-genai`, `agentic-ai-design-patterns-2026-edition`.

### [DONE] Inbox enrichment + check-inbox skill
*committed 62af0b7* — `/check-inbox` skill committed. Misleading dashboard copy fix superseded by per-draft Enrich button (already exists in dashboard, see memory `reference_dashboard_features.md`).

### [DONE] Auto-tag all 100% Maai articles
*verified 2026-05-08* — 49 total, 48 enriched. The 1 outlier is `how-we-actually-compare` (still draft).

### [DONE] Newsletter: distribute Creative Prompts, April 2026
*2026-05-08*

### [DONE] Garden housekeeping
*2026-05-08*

### [DONE] Garden health: broken wiki link `[[ai-feedback-loops]]`
*verified gone 2026-05-08*

### [DONE] Garden health: library descriptions
*verified 2026-05-08* — 97 to 2 missing.

### [DONE] Stream redesign follow-ups bundle
*pointer removed, sub-items stand alone (Photos in stream cards is still active above)*

### [DONE] Working-tree housekeeping
*folded into Karpathy-wiki cleanup*

### [DONE] Wiki chat: polish items after launch
*folded into Karpathy-wiki cleanup as wiki v6 retirement*

### [DONE] Wiki eval dashboard: run the baseline
*folded into integrated admin dashboard, feature 2*

### [DONE] Themes as writing prompts
*folded into chatbot v0.1 polish as starter button*

### [DONE] Ingestion architecture: build the Karpathy layer
*won't do. `/ingest-source` skill built and in active use; `sources` section of triples.json was retired by skill spec; weblink auto-enrich is partially in place*

### [DONE] Sources ingestion layer + topic wiki
*discarded as useless experiment*

### [DONE] Convoclub meetup: garden demo topics
*discarded*

### [DONE] Standalone LinkedIn posts
*discarded. Easier to write in LinkedIn directly*

### [DONE] Content: thin cards
*discarded*

### [DONE] Obsidian templates
*discarded*

### [DONE] Rhetoric/Argument triples + Thematic-TAO field note review
*2026-04-04*

### [DONE] Tagging, triples, and auto-enrichment
*2026-03-31*

### [DONE] Telegram weblinks: LinkedIn redirect URLs
*2026-04-07*

### [DONE] Tablet + Telegram integration
*2026-04-06*

### [DONE] Tablet setup + inbox workflow
*2026-04-06*

### [DONE] Toolshed redesign: three-collection structure
*2026-04-05*

### [DONE] Library redesign: stream aesthetic, three views, mobile filters
*2026-04-04*

### [DONE] Review: Thematic-TAO method post
*2026-04-02*

### [DONE] Stream refinement: index card aesthetic, filter sidebar
*2026-03-29*

### [DONE] Stack page: browsable card browser
*2026-03-28*

### [DONE] Stream + collections redesign: homepage v2
*2026-03-29*

### [DONE] Stream page redesign: index cards + sidebar
*2026-03-27*
