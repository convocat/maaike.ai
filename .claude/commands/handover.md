# /handover

Generate a session handover and add it to the backlog.

## What this does

Captures what was worked on in this session as a ready-to-paste opening message for a new thread. Appends it to `.claude/backlog.md` and commits it so it appears on the garden's `/backlog` page.

## Steps

### Step 1: Gather info

Ask the user (AskUserQuestion):

1. **What was this session about?** (short title, e.g. "Return of the button article") — pre-fill with a suggestion based on recent conversation if possible
2. **Status** (single select): Ready to start / In progress / Parked

### Step 2: Generate the handover entry

Write a concise handover in this format:

```markdown
## [STATUS EMOJI] [Title]
*[Date] · [collection or branch if relevant]*

[2-4 sentences: what was decided, what the starting point is, what to do first]

Key files: [list any relevant files]

---
```

Status emojis: 🟡 ready · 🔵 in progress · 🟠 parked · ✅ done

Show the entry to the user and ask: **"Add to backlog?"**

### Step 3: Prepend to backlog

Read `.claude/backlog.md`. Insert the new entry after the header block (before the first existing `---` entry). Write the file.

### Step 4: Commit

```
git add .claude/backlog.md
git commit -m "Handover: [title]"
git push
```

### Step 5: Done

Tell the user the handover is in the backlog at `/backlog` on the garden. Remind them to copy the entry text as their opening message for the new thread.

## Conventions

- Keep handover text tight: enough to resume, not a full summary
- Never use em-dashes
- Date format: YYYY-MM-DD
