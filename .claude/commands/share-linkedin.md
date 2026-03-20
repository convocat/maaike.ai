# Share to LinkedIn

Generate a LinkedIn post with the OG card image attached, and post it directly via the API.

## Step 1: Select the post

Ask the user which post to share. Options:
- They can provide a file path or title
- Use "the most recent post" (find via `git log --diff-filter=A --name-only --pretty=format: -10 -- src/content/`)
- Show a short list of recent posts to pick from

Read the target post's full content (frontmatter + body).

## Step 2: Check the card image

1. Check if the OG card exists at `public/images/og/<collection>/<slug>.png`
2. If not, generate it by deleting any stale version and running `node scripts/generate-og-images.cjs`
3. Show the card image to the user for confirmation.

## Step 3: Generate LinkedIn text

Create a LinkedIn-friendly post that:
- Opens with a compelling hook (first 1-2 lines are visible before "see more")
- Summarizes the key idea in 3-5 short paragraphs
- Sounds like Maaike, not like a corporate announcement
- Includes the link: `https://www.maaike.ai/<collection>/<slug>/`
- Adds 3-5 relevant hashtags at the bottom

Rules:
- Never use em-dashes
- Keep it under 1300 characters (LinkedIn's sweet spot for engagement)
- Don't start with "I'm excited to share" or similar cliches
- Never use AI tropes (see style rules)
- Match the tone of the original: if it's reflective, keep it reflective
- The post should make people want to read the full piece, not replace it

## Step 4: Show and refine

Display the generated LinkedIn text to the user. They may want to:
- Rephrase parts
- Change the hook
- Add or remove hashtags
- Adjust the tone

Iterate until they're happy.

## Step 5: Post with image

After user approval:

1. Write the final text to a temp file
2. Run: `node scripts/post-to-linkedin.mjs <temp-file> <image-file>`
   - The image file is `public/images/og/<collection>/<slug>.png`
3. Show the result (post URL) to the user
4. Delete the temp file

## Step 6: Record the share

Add a `linkedin_url` field to the post's frontmatter:
```yaml
linkedin_url: "https://www.linkedin.com/posts/..."
```

This creates a record that the content also lives on LinkedIn.
