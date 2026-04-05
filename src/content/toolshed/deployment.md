---
title: Deployment
date: 2026-04-05
maturity: solid
tags: [technical, deployment, github-actions, ci-cd]
description: How the garden is built and deployed to GitHub Pages via GitHub Actions, and how the LinkedIn publish trigger works.
category: technical
section: Infrastructure
ai: co-created
---

The garden is a static Astro site deployed to GitHub Pages. Every push to `main` triggers a build and deploy. There are no staging environments — main is production.

## Build pipeline

GitHub Actions workflow:

1. Checkout `main`
2. Install Node dependencies (`npm ci`)
3. Run `npm run build` → outputs to `dist/`
4. Upload `dist/` as a Pages artifact
5. Deploy the artifact to GitHub Pages

The Astro build is fully static: no SSR, no server functions. Everything is pre-rendered to HTML at build time.

## LinkedIn publish trigger

A separate workflow (`share-link.yml`) handles optional LinkedIn publishing. It runs on:
- Push to `main` (checking if any new posts were added)
- Manual dispatch

The workflow uses `git diff` to check the status of content files between the current commit and the previous one. A file with status `A` (added) is a new post — it triggers LinkedIn publishing. A file with status `M` (modified) is an update — it skips LinkedIn.

```bash
git diff --name-status HEAD~1 HEAD -- src/content/articles/ src/content/jottings/
```

Only articles and jottings trigger LinkedIn. Other collections (seeds, field notes, weblinks, projects) don't.

## publish.bat

`publish.bat` is a Windows convenience script that wraps the git workflow:

```bat
git add -A
git commit -m "%~1"
git push
```

Run as: `publish.bat "Commit message here"`. It's a shortcut for the common case of committing everything and pushing. The Claude Code `/publish` skill handles the full publishing workflow (validate, OG images, explore map, then push).

## Custom domain

The site deploys to `maaike.ai`. The `CNAME` file in `/public/` contains the domain. GitHub Pages reads this during deploy and configures the DNS binding.

## OG image generation

OG images are generated locally (not in CI) before pushing. The `/publish` skill runs `node scripts/generate-og-images.cjs` which writes PNGs to `public/images/og/`. These are committed and pushed as static assets — GitHub Actions doesn't regenerate them.

## No branch strategy

Everything goes directly to `main`. There are no feature branches, no PRs, no staging. The Claude Code session is the editorial moment: Maaike reviews diffs before committing, and commits before pushing.

For large experimental changes (redesigns, structural refactors), a git worktree is used instead — a second folder on disk mapped to a separate branch. This avoids uncommitted changes bleeding into main during long-running experiments.
