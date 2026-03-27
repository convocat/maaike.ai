# Session backlog

What's queued up. Each entry is a ready-to-paste opening message for a new thread.

Status: 🟡 ready · 🔵 in progress · 🟠 parked · ✅ done

---

## 🟡 The return of the button
*2026-03-27 · article*

I want to write an article called "The return of the button". The seed is at `src/content/seeds/the-return-of-the-button.md` — read it first, that has my literal thinking.

The core idea: Claude Code is reintroducing structured, constrained input (buttons, numbered options) which is essentially IVR. Traditionally seen as a UX relic. But in GenAI, unconstrained free text is actually the problem: hard for users, and a security risk (prompt injection). Constraint is a feature, not a regression.

Deliverables: one article and one LinkedIn post. Use `/new-post` to start. I will write it myself in Typora — just help me structure and develop the idea first.

---

## 🔵 Fix stream UI
*2026-03-27 · redesign/stream-ui*

Branch `redesign/stream-ui` exists and is pushed. The stream is now the homepage (`/`), with the old collections overview moved to `/collections`. Known issue: filter pills are not working consistently. The duplicate hub posts bug was fixed directly on main via cherry-pick (already done). Start by checking out the branch and reproducing the filter pill issue in the browser.

Key files:
- `src/pages/index.astro` — stream homepage
- `src/components/Header.astro` — mega menu with Stream, Map, Collections
- `src/pages/collections.astro` — old homepage, now at /collections

Do a full review of filtering behaviour across all pages before touching anything.

---

## 🟠 Claude LabBook project
*2026-03-27 · new project*

Research done, project hub planned but not yet created. Claude LabBook is a system for logging code changes as scientific trials: what was tried, why, what happened, what was learned. Trials are chained so the agent can trace the full evolution of a problem. Includes pre-change safety checks that pull up prior trials on the same component.

Start with `/new-project` to create the hub, then plan the implementation.

Reference: LinkedIn post by https://www.linkedin.com/in/aimarketerguy, repo at https://lnkd.in/eRGsqYYF

---

## 🟠 Standalone LinkedIn posts
*2026-03-27 · feature*

Currently LinkedIn posts must be tied to a garden post. Maaike wants to be able to create a standalone LinkedIn post from within the garden. Required structure: text, image, hashtags. Design and build this as a new workflow.

---

## 🟠 Obsidian templates
*2026-03-27 · housekeeping*

Maaike has a working Git + Obsidian integration for writing on tablet. Post templates are not consistent in metadata. Before touching anything: check previous conversation history (possibly on another machine) to understand current status. Do not take action until confirmed with Maaike.

---
