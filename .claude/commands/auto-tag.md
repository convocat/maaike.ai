# Auto-tag and link

Analyze a post's content and automatically suggest tags and wiki-links based on the entire content base.

## Step 1: Select the post

Ask the user which post to analyze. Options:
- They can provide a file path
- They can provide a title
- Use "the most recent post" (find via `git log --diff-filter=A --name-only --pretty=format: -10 -- src/content/`)

Read the target post's full content (frontmatter + body).

## Step 2: Build context

Read the content base to understand what's available:

1. **All existing tags**: Glob `src/content/tags/*.md` and extract all tag slugs. These are the canonical tags.

2. **All post titles and slugs**: For each collection (articles, field-notes, seeds, weblinks, videos, library, experiments), glob `src/content/<collection>/*.md` and extract `title` from frontmatter. Build a map of title-to-slug for wiki-link candidates.

3. **Current post's tags**: Note which tags the post already has (if any).

4. **Current post's wiki-links**: Find existing `[[...]]` links in the body.

## Step 3: Analyze and suggest tags

Compare the post's content (title, description, body text) against the canonical tag list. Suggest tags that:
- Match the post's topic and themes
- Are already used in similar posts
- Are not already on the post

Rules:
- Only suggest tags from the existing canonical tag list (don't invent new tags)
- Suggest 2-5 tags maximum
- Rank by relevance

## Step 4: Suggest wiki-links

Scan the post's body text for opportunities to link to other posts. A good wiki-link candidate is:
- A concept, title, or phrase in the body that matches or closely relates to another post's title
- A reference to a topic that has its own dedicated post

Build suggestions as:
- The phrase in the body text to wrap in `[[]]`
- The target post title and collection
- If the phrase doesn't exactly match the target slug, use alias syntax: `[[target-slug|display text]]`

Rules:
- Don't over-link. 2-5 wiki-links per post is ideal.
- Only link to existing posts (check the title map from Step 2)
- Don't suggest links that already exist in the post
- Prefer linking to the most relevant/related posts

## Step 5: Present suggestions

Show the user:

**Suggested tags:**
- `tag-name`: reason for suggestion

**Suggested wiki-links:**
- "phrase in text" -> `[[target-slug]]` (collection: target title)

Ask the user which suggestions to accept. They can accept all, some, or none. They can also modify suggestions.

## Step 6: Apply changes

For accepted tags:
- Add them to the frontmatter `tags:` list

For accepted wiki-links:
- Replace the plain text phrase with the wiki-link syntax in the body
- Use `[[slug]]` if the phrase matches the slug, or `[[slug|phrase]]` if it doesn't

## Step 7: Save

Write the updated file. Ask if the user wants to commit.
