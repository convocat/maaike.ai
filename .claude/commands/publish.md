# Publish

Take one or more draft posts from local to live on maaike.ai, with optional LinkedIn sharing.

## Step 1: Select what to publish

Ask which post(s) to publish:
- User can name a post (title or file path)
- Or: show a list of posts where `draft: true` that have been modified recently (via `git status` and `git diff`)

Read the target post(s).

## Step 2: Auto or manual mode

Ask the user how they want to proceed (AskUserQuestion):

- **Auto** — validate, generate, push, and share automatically. Only pauses for release notes approval.
- **Manual** — confirm each major step (push to main, share to LinkedIn) separately.

## Step 3: Pre-publish housekeeping

Run these in order, halting on any error:

1. **Set draft: false** on the selected post(s)

2. **Validate frontmatter:**
   ```
   npm run validate
   ```
   If errors: show them, fix if possible, otherwise stop and ask Maaike.

3. **Generate OG images** for any post that doesn't have one yet:
   ```
   node scripts/generate-og-images.cjs
   ```
   Only needed for articles and jottings.

4. **Rebuild explore map:**
   ```
   node scripts/build-explore-data.cjs
   ```

5. **Update release notes** — run `/update-release-notes`, show draft, wait for approval.

## Step 4: Commit

Stage only the relevant files (the post, OG image, explore data, release notes). Commit with:
```
Publish <collection>: <title>
```

## Step 5: Push

- **Manual mode:** Ask "Push to main now?"
- **Auto mode:** Push immediately.

```
git push
```

GitHub Actions will deploy to maaike.ai in ~2 minutes.

## Step 6: Share to LinkedIn (articles and jottings only)

Skip this step for field notes, seeds, weblinks, videos, and project files.

Check if the post has a `<div class="linkedin">` block with content.

- **Manual mode:** Ask "Share to LinkedIn now?"
- **Auto mode:** If LinkedIn block exists, share automatically. If no block, ask.

If sharing: run `/share-linkedin` with the post already identified (skip the "select post" step).

## Step 7: Done

Confirm what happened:
- Post live at: `https://www.maaike.ai/<collection>/<slug>/`
- LinkedIn URL (if shared)
- Remind Maaike: token expires in 2 months if LinkedIn was just used.
