# Share to LinkedIn

Generate a LinkedIn-ready post from garden content and copy it to the clipboard.

## Step 1: Select the post

Ask the user which post to share. Options:
- They can provide a file path or title
- Use "the most recent post" (find via `git log --diff-filter=A --name-only --pretty=format: -10 -- src/content/`)
- Show a short list of recent posts to pick from

Read the target post's full content (frontmatter + body).

## Step 2: Generate LinkedIn text

Create a LinkedIn-friendly post that:
- Opens with a compelling hook (first 1-2 lines are visible before "see more")
- Summarizes the key idea in 3-5 short paragraphs
- Sounds like Maaike, not like a corporate announcement
- Ends with a link to the garden: `https://maaike.ai/<collection>/<slug>/`
- Adds 3-5 relevant hashtags at the bottom

Rules:
- Never use em-dashes
- Keep it under 1300 characters (LinkedIn's sweet spot for engagement)
- Don't start with "I'm excited to share" or similar cliches
- Match the tone of the original: if it's reflective, keep it reflective
- The post should make people want to read the full piece, not replace it

## Step 3: Show and refine

Display the generated LinkedIn text to the user. They may want to:
- Rephrase parts
- Change the hook
- Add or remove hashtags
- Adjust the tone

Iterate until they're happy.

## Step 4: Copy to clipboard

Copy the final text to the clipboard using:
```
echo "<text>" | clip
```

Tell the user: "Copied to clipboard. Paste it into LinkedIn when ready."

## Step 5: Record the share (optional)

Ask if they want to add a `linkedin_url` field to the post's frontmatter after they publish on LinkedIn. If yes, ask for the LinkedIn post URL and add it:
```yaml
linkedin_url: "https://www.linkedin.com/posts/..."
```

This creates a record that the content also lives on LinkedIn.
