# New project file

Add a new file (experiment, field note, file, or artefact) to an existing project hub.

## Step 1: Select project and file type

Ask the user (AskUserQuestion):

1. **Which project?** — scan `src/content/` for all posts with `hub: true` and `maturity` not `complete`. Show the list.
2. **File type:**
   - Experiment
   - Field note
   - File (structured project sub-document)
   - Artefact (design deliverable, downloadable output)

## Step 2: Show project context

Read the hub post. Show Maaike:
- The project goal
- The deliverables checklist (which items are still open)

Ask: "Which deliverable does this file address?" (optional — helps Claude fill in the title/description).

## Step 3: Open Typora

Create a temp file at `src/content/<collection>/new-draft.md` with this template:

```markdown
---
draft: true
description: ""
develops: <hub-slug>
---

# Title

Start writing here...
```

Note: no LinkedIn block — project files are not shared to LinkedIn.

Install/check Typora theme, then open:
`"/c/Program Files/Typora/Typora.exe" "<file-path>" &`

Tell the user: "Typora is open. Write your project file, then come back here when you're done."

## Step 4: User returns — metadata

Read the file. Extract the title from the first `# Heading`.

Ask (AskUserQuestion):
- **Maturity:** Draft / Developing / Solid / Complete
- **AI status:** 100% Maai / Assisted / Co-created / Generated

## Step 5: Build frontmatter and finalize

Build full frontmatter:
```yaml
---
title: "<title>"
description: "<generated or from frontmatter>"
date: <today>
maturity: <chosen>
draft: true
tags: []
ai: "<chosen>"
develops: <hub-slug>
---
```

Rename and move to `src/content/<collection>/<slug>.md`.

## Step 6: Insert wiki-link to hub

In the body of the file, insert a wiki-link back to the hub post near the top (after the intro paragraph if one exists, otherwise at the top):

```
This is part of the [[<hub-slug>]] project.
```

This is required for the file to appear in the hub's "Project files" sidebar via backlinks.

## Step 7: Update hub checklist

Read the hub post. If any checklist item matches this file's title or slug, update it:
- Change `- [ ]` to `- [x]`
- Replace placeholder slug with the actual slug

Show the change to Maaike for confirmation before writing.

## Step 8: Auto-tag

Run `/auto-tag` on the new file.

## Step 9: Done

Tell Maaike: "File saved as a draft. Run `/publish` when ready to make it live."
