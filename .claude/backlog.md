# Session backlog

What's queued up. Each entry is a ready-to-paste opening message for a new thread.

**Status:** 🟡 ready · 🔵 in progress · 🟠 parked · ✅ done · 🧊 stale (not touched in 14+ days)

**Groomed:** 2026-04-02 · Items marked with `blocker:` are waiting on a decision or input before they can move forward.

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
*added: 2026-03-27 · last-touched: 2026-03-28*

The About page is due for a rewrite (flagged during stream redesign session). The sidebar bio blurb in `src/pages/index.astro` is a placeholder and should be updated to match once the About page is done. Start with `/new-post` or direct editing.

Key files: `src/pages/about.astro`, `src/pages/index.astro` (sidebar bio)

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
