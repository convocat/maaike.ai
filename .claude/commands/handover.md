# /handover

Generate a session handover and add it to the backlog.

## What this does

Produces two distinct outputs:

1. **Session sign-off** — what was done, decided, and wrapped up in the current session. This closes out the session.
2. **Handover to next session** — remaining or new work, framed as a backlog entry with a ready-to-paste opening message for the next thread.

These are kept separate. The session signing off writes its own close. The handover addresses the next session as a distinct recipient.

## Steps

### Step 1: Gather info

Ask the user (AskUserQuestion):

1. **What was this session about?** (short title, e.g. "Return of the button article") — pre-fill with a suggestion based on recent conversation if possible
2. **What's the status of the remaining work?** (single select, no ambiguity — pick the one that fits):
   - 🟡 **Ready**: there's a clear next step and the next session can start on it immediately
   - 🔵 **In progress**: work is ongoing and the next session picks up mid-task
   - 🟠 **Parked**: no follow-up needed right now (blocked, deprioritized, or waiting on something)
   - ✅ **Done**: everything from this session is wrapped up, no backlog entry needed

### Step 2: Generate the handover

If the user selected ✅ **Done**: output only Part 1 (sign-off), skip Part 2 and Step 3. No backlog entry needed.

Otherwise output both parts clearly labelled:

**Part 1 — Session sign-off**

A short paragraph: what was shipped, what was decided, what was left open. This closes the current session. No backlog entry needed.

**Part 2 — Handover to next session**

A backlog entry in this format:

```markdown
## [STATUS EMOJI] [Title]
*[Date]*

[2-4 sentences: what the next session should pick up, what to do first, any blockers]

Key files: [list any relevant files]

**Opening message for next session:**
> Run `/telegram-sync` first, then: [1-2 sentence version of the above, ready to paste as the first message in a new thread]
```

Status emojis: 🟡 ready · 🔵 in progress · 🟠 parked · ✅ done

Show both parts to the user and ask: **"Add to backlog?"**

### Step 3: Prepend to backlog

Read `.claude/backlog.md`. Insert the new entry after the header block (before the first existing `---` entry). Write the file.

### Step 4: Commit

```
git add .claude/backlog.md
git commit -m "Handover: [title]"
git push
```

### Step 5: Update release notes

Run `/update-release-notes` to document what was shipped in this session. This keeps `building-this-garden.md` current and ensures the Garden Ops page reflects the work.

### Step 6: Toolshed check

Briefly scan the Toolshed posts in `src/content/toolshed/` for any that describe features or workflows touched in this session. Flag any that are now outdated and need updating before closing out. Update them if the changes are small; add a backlog note if they need more work.

### Step 7: Done

Tell the user the handover is in the backlog at `/backlog` on the garden. Remind them to copy the entry text as their opening message for the new thread.

## Conventions

- Keep handover text tight: enough to resume, not a full summary
- Never use em-dashes
- Date format: YYYY-MM-DD
