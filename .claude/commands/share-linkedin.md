# Share to LinkedIn

Generate a LinkedIn-ready post from garden content, copy the OG card image to clipboard, and provide the post text.

## Step 1: Select the post

Ask the user which post to share. Options:
- They can provide a file path or title
- Use "the most recent post" (find via `git log --diff-filter=A --name-only --pretty=format: -10 -- src/content/`)
- Show a short list of recent posts to pick from

Read the target post's full content (frontmatter + body).

## Step 2: Prepare the card image

1. Check if the OG card exists at `public/images/og/<collection>/<slug>.png`
2. If not, generate it: `node scripts/generate-og-images.cjs` (delete the existing one first to force regeneration if needed)
3. Copy the card image to clipboard:
   ```
   powershell.exe -command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Clipboard]::SetImage([System.Drawing.Image]::FromFile('C:\Users\MaaikeGroenewege\Documents\Pythonprojecten\digital-garden\public\images\og\<collection>\<slug>.png'))"
   ```
4. Tell the user: "Card image copied to clipboard. Paste it into your LinkedIn post with Ctrl+V."

## Step 3: Generate LinkedIn text

Create a LinkedIn-friendly post that:
- Opens with a compelling hook (first 1-2 lines are visible before "see more")
- Summarizes the key idea in 3-5 short paragraphs
- Sounds like Maaike, not like a corporate announcement
- Ends with a link to the garden: `https://www.maaike.ai/<collection>/<slug>/`
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

## Step 5: Copy text and post

1. Copy the final text to clipboard: `echo "<text>" | clip`
2. Tell the user: "Text copied. Note: this replaced the card image on your clipboard. Paste the text first, then I'll re-copy the image for you."
3. After user pastes the text, re-copy the card image to clipboard using the PowerShell command from Step 2.
4. User pastes the image into the LinkedIn post.

Alternatively, if the user prefers, copy just the text and let them download the image manually from `public/images/og/<collection>/<slug>.png`.

## Step 6: Record the share

After the user confirms they posted, add a `linkedin_url` field to the post's frontmatter:
```yaml
linkedin_url: "https://www.linkedin.com/posts/..."
```

This creates a record that the content also lives on LinkedIn.
