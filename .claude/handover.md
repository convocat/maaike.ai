# Handover — 2026-05-01

## What we built this session

### 1. Admin dashboard: weblink enrichment via Anthropic API

Restored on-demand enrichment for draft weblinks in the dashboard (port 8900).

- **Button:** "Enrich" appears in the top bar on the weblinks tab
- **Flow:** select a weblink, click Enrich, the server fetches the URL and calls `claude-sonnet-4-5` for TAO analysis, the panel pre-fills with proposed description, tags, themes, and associations
- **Review:** you edit as usual, then Approve and publish — themes now also saved to `themes.json`
- **Route:** `POST /api/enrich-weblink` in `tools/admin/server.py`
- **Cost rule (MEMORY.md updated):** user-triggered, one at a time = allowed. CI/batch/loops = still forbidden.

### 2. Open questions in the Mycelium section

The TAO extractor generates 1-3 "open questions" per article. These are now shown on the post page.

**Files changed:**
- `src/content.config.ts` — added `open_questions: z.array(z.string()).optional()` to `baseSchema`
- `src/layouts/PostLayout.astro` — added "Questions this raises" block with italic `?`-prefixed items; updated Mycelium condition and hint text
- `src/pages/articles/[...slug].astro`, `field-notes/[...slug].astro`, `seeds/[...slug].astro` — pass `open_questions={entry.data.open_questions}`
- `tools/admin/server.py` — `apply_edits()` writes `open_questions` to frontmatter; `api_apply_proposal` collects and applies them
- `public/mockup-ingest-dashboard.html` — `collectEnrichAccepted()` now collects checked open questions from the enrich panel

**To see them:** apply a proposal from the Enrich tab with open questions checked. They appear in the Mycelium section under "Questions this raises".

## Current state

- Admin server: running on port 8900
- Dev server: check `.claude/launch.json` (port 4321)
- Build: clean, 1607 pages
- All current weblinks are published (no pending drafts)
- **Enrich tab: ~37 proposals pending** from the batch extractor — ready to work through
- No uncommitted changes

## Ready to do next

- Work through the proposal queue in the Enrich tab (http://localhost:8900)
- Run `/morning` for the daily ritual
- Continue with backlog items
