# Update release notes

Automatically update the changelog in `src/content/field-notes/building-this-garden.md` based on recent git activity.

## Step 1: Gather changes

Run these git commands to understand what changed:
1. `git log --oneline --since="midnight"` to see today's commits
2. If no commits today, use `git log --oneline -10` and ask the user which commits to include
3. For each relevant commit, run `git show --stat <hash>` to understand what files changed
4. If needed, run `git diff <hash>~1 <hash>` on key files to understand the actual changes

## Step 2: Read current release notes

Read `src/content/field-notes/building-this-garden.md` to understand:
- The existing structure and date headers
- What's already documented (avoid duplicates)
- The entry format: each day has an intro sentence followed by a bullet list

## Step 3: Draft new entries

Each day entry has two parts:

**Intro sentence** — one sentence capturing the theme or character of the day's work. Not a list of what was done; more like a mini headline that gives the reader a feel for the session. Examples:
- "The garden got its personality -- hover previews, hand-drawn icons, and the first real content."
- "A full day on the Toolshed, plus tablet support and a new article published."
- "Small fixes, but the stream finally felt right on a phone."

**Bullet list** — each bullet covers one feature or change:
- Format: `- **Bold label**: Brief description`
- Group related commits into single bullets where it makes sense
- Focus on user-visible changes and features, not internal refactors
- Keep descriptions concise (one line each)
- Never use em-dashes

**Header format:** `### <day> <month>` (e.g., `### 11 March`), no leading zeros on the day.

If today's date header already exists, add new bullets under it (and refine the intro sentence if the new work changes the day's character). Otherwise, create a new date header and entry at the bottom of the changelog, before the `## Related` section.

## Step 4: Show and confirm

Display the new entries to the user before writing. The user may want to:
- Rephrase the intro sentence
- Add or remove bullets
- Change the grouping

## Step 5: Write and optionally commit

After user approval:
1. Edit the file (insert new entries at the end of the changelog, before the `## Related` section)
2. Update the `updated` field in frontmatter to today's date
3. Ask if the user wants to commit with message: `Tend field-notes: building-this-garden`
