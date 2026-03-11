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
- The writing style: `- **Feature name**: Short description`

## Step 3: Draft new entries

Summarize the changes into bullet points following the existing format:
- Use `### <day> <month>` headers (e.g., `### 11 March`), no leading zeros on the day
- Each bullet: `- **Bold label**: Brief description`
- Group related commits into single bullets where it makes sense
- Focus on user-visible changes and features, not internal refactors
- Keep descriptions concise (one line each)
- Never use em-dashes

If today's date header already exists, append new bullets under it. Otherwise, create a new date header at the bottom.

## Step 4: Show and confirm

Display the new entries to the user before writing. The user may want to:
- Rephrase items
- Add or remove entries
- Change the grouping

## Step 5: Write and optionally commit

After user approval:
1. Edit the file (append new entries at the end, before any trailing newline)
2. Update the `date` field in frontmatter to today's date
3. Ask if the user wants to commit with message: `Update release notes`
