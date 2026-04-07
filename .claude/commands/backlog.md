# /backlog

Open a backlog grooming session. Proactively scan the board and surface what needs attention before asking what to work on.

## What this does

Reads the backlog, health report, and recent git activity, then presents a structured briefing: stale items, blockers, in-progress work that may have drifted, and a suggested focus for the session. At the end, writes any decisions back to the backlog.

This is the process mirror role: reflect what the board actually shows, not what feels urgent right now.

---

## Steps

### Step 1: Gather context

Read these files in parallel:
- `.claude/backlog.md`
- `.claude/health-report.md`
- Recent git log: `git log --oneline -15`
- List files in `src/content/_inbox/` (excluding `.gitkeep`)

### Step 2: Scan and surface

Analyse what you've read. Flag each of the following if present:

**Inbox items**: check `src/content/_inbox/` for `.md` or `.txt` files. The inbox is a persistent running note with date-stamped entries. Read it and surface any unprocessed entries prominently — they are the highest-priority quick win. Never delete the inbox file.

**Stale items** (last-touched date is 14+ days ago from today): list them with their last-touched date.

**In-progress items with no recent commits**: cross-reference 🔵 items with the git log. If no commit touches the item's key files in the last 14 days, flag it.

**Parked items with a resolved blocker**: if a 🟠 item has a `blocker:` and the blocker no longer applies (e.g. a decision was made in a recent session), surface it for promotion to 🟡 ready.

**Bundles**: if a 🟡 item contains more than one distinct deliverable, flag it for splitting.

**Open health issues**: list any items in the Garden health section that have been sitting unaddressed for more than 14 days.

### Step 3: Present the briefing

Output a short session briefing in this format:

```
## Backlog briefing — [date]

### Needs attention
[list of flags from Step 2 with one-line description each]

### Suggested focus for this session
[1-3 items, ranked by: unblocked + ready > stale in-progress > quick wins from health report]

### Board at a glance
[table: Item | Status | Last touched | Blocker]

---
🟡 ready · 🔵 in progress · 🟠 parked · ✅ done · 🧊 stale

**What you can do:** name an item to work on it · say "park [item]" to move it to parked · say "done [item]" to archive it · say "add [description]" to queue something new · say "update backlog" to write decisions to the file
```

Keep it tight. One line per flag. No preamble.

### Step 4: Confirm session intent

Ask (AskUserQuestion):

1. **What do you want to work on today?** — options pre-filled from "Suggested focus" above, plus "Something else"

### Step 5: Work the session

Proceed with the chosen item. Use the relevant skill if one exists (e.g. `/new-post` for articles, `/new-project` for project hubs).

### Step 6: Update the backlog

At a natural stopping point (end of session or when shifting focus), ask:

> "Should I update the backlog with what we decided?"

If yes:
- Update the relevant item's `status`, `last-touched` date, and `blocker` field
- Add a new entry if a new item was discovered during the session
- If an item was completed, move it to the Archive section
- Do NOT commit automatically — show the diff and let Maaike decide whether to commit now or bundle with other work

---

## Conventions

- Never use em-dashes
- Date format: YYYY-MM-DD
- Keep briefing output short: this is a signal, not a report
- The process mirror role: surface what the board shows, not what feels obvious
