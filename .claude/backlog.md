# Session backlog

What's queued up. Each entry is a ready-to-paste opening message for a new thread.

**Status:** 🟡 ready · 🔵 in progress · 🟠 parked · ✅ done · 🧊 stale (not touched in 14+ days)

**Groomed:** 2026-03-28 · Items marked with `blocker:` are waiting on a decision or input before they can move forward.

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

## 🟡 Verify: stream filter pills
*added: 2026-03-27 · last-touched: 2026-03-28*

The original "Fix stream UI" item referenced branch `redesign/stream-ui`, but that branch is now stale — all stream work happened directly on main. The filter pills issue (not working consistently) may have been resolved as part of the stream redesign, or may still be open.

**First step:** open the stream page on desktop and mobile and verify filter pill behaviour before doing anything. If still broken, scope a fix. If working, close this item.

Key files: `src/pages/index.astro`, `src/components/MosaicCard.astro`

---

## 🟠 Stream + collections redesign
*added: 2026-03-28 · last-touched: 2026-03-28*

Mobile stream cleanup is done (body preview removed, sidebar cards hidden, filter replaced with icon + dropdown). Next step is a more substantial redesign of the stream and collections pages: layout, hierarchy, and visual direction.

**blocker:** scope is too vague to start a session. Needs a dedicated scoping conversation: what does "redesign" mean here, what's wrong, what's the target?

Key files: `src/components/MosaicCard.astro`, `src/pages/index.astro`

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

### ✅ Stack page: browsable card browser
*2026-03-28 — completed*

Physical card browser at `/stack`. Pick a card, browse connections as a stacked deck. Box-shadow trick simulates peek cards. Top connected suggestions + A-Z sequential mode. Search across titles, descriptions, and tags. Resolved the Zettelkasten interaction model question: physical card metaphor won over grid/graph.

### ✅ Stream page redesign: index cards + sidebar
*2026-03-27 — completed*

Redesigned the stream page around an index card metaphor. Each card has a coloured bookmark strip on the left, a double-line separator, and a horizontal meta bar with collection label, date (year, all caps), maturity emoji and AI indicator. Articles and jottings show a body preview with "Read more". Hero card replaced by a pinned LATEST badge. Sidebar has three portrait cards (About, Currently reading, Projects) with greige strip and brand-pink double lines. Two-column layout, sidebar collapses on mobile.
