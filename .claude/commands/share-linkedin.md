# Share to LinkedIn

Post an article or jotting to LinkedIn with the OG card image attached via the API.

**Only for articles and jottings.** Field notes, seeds, weblinks, videos, and project files are not shared to LinkedIn.

## Step 1: Select the post

Ask the user which post to share. Options:
- They can provide a file path or title
- Use "the most recent post" (find via `git log --diff-filter=A --name-only --pretty=format: -10 -- src/content/`)
- Show a short list of recent posts to pick from

Read the target post's full content (frontmatter + body).

## Step 2: Check the card image

1. Check if the OG card exists at `public/images/og/<collection>/<slug>.png`
2. If not, generate it by deleting any stale version and running `node scripts/generate-og-images.cjs`

## Step 3: Get the LinkedIn text

Check if the article contains a `<div class="linkedin">` block.

**If yes:** extract the text from inside it. This is what Maaike wrote while drafting the article. Show it to her for confirmation.

**If no:** open Typora for her to write the LinkedIn text:

1. Create `scripts/linkedin-draft.md`:

```markdown
# LinkedIn post: <title>

![Card](../public/images/og/<collection>/<slug>.png)

---

(write your post here)

---
```

2. Open in Typora: `"/c/Program Files/Typora/Typora.exe" "scripts/linkedin-draft.md" &`
3. Tell the user: "Typora is open. Write the post text, then come back here when you're done."
4. When she returns, read the file and extract text between the `---` lines.

## Step 4: Confirm and post

1. Show the final text and character count
2. After approval, verify the post is live by running:
   ```
   curl -s -o /dev/null -w "%{http_code}" https://www.maaike.ai/<collection>/<slug>/
   ```
   If the response is not `200`, stop and tell Maaike: "The page isn't live yet at maaike.ai. Wait for the deploy to finish (~2 min after push) and try again."
3. Once live, write the text to a temp file
4. Run: `node scripts/post-to-linkedin.mjs <temp-file> public/images/og/<collection>/<slug>.png "Read the full article: https://www.maaike.ai/<collection>/<slug>/"`
4. This posts the image + text, then automatically adds a comment with the clickable link
5. Show the result (post URL) to the user
6. Delete temp files

## Step 5: Record the share

Add a `linkedin_url` field to the post's frontmatter:
```yaml
linkedin_url: "https://www.linkedin.com/posts/..."
```

## How to add a LinkedIn block to an article

When writing an article in Typora, add this anywhere in the body (usually at the end):

```html
<div class="linkedin">
Your LinkedIn post text here. Write it while the article is fresh in your head.
</div>
```

In Typora this renders as a sage green card with a "LinkedIn" label. On the published site it's hidden. It's completely optional.
