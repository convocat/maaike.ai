# /morning

Session-start ritual. Run this first thing when Maaike opens a new session.

## What this does

Two-step orientation:

1. `/backlog` — board briefing, inbox flags, suggested focus
2. `/check-inbox` — telegram sync, enrich drafts, start dashboard

Then hand back the dashboard URL and a pointer to today's suggested focus.

This skill is a thin orchestration shell. It delegates everything to existing skills — do not reimplement their logic.

## Step 1: Backlog briefing

Invoke `/backlog`. Show its full briefing output (Needs attention, Suggested focus, Board at a glance).

Remember the top item from "Suggested focus for this session" — you will reference it again in Step 3.

Do not skip this step. The briefing is what Maaike picks up after the dashboard work.

## Step 2: Inbox pipeline

Invoke `/check-inbox`. It handles:

- `/telegram-sync` (workflow dispatch, poll, pull, ingest new drafts)
- Backfill enrichment for any drafts left with `triples: []`
- Start the Flask dashboard at `http://localhost:8900` if it's not already up
- Report the count of unprocessed drafts

## Step 3: Hand-off

After both steps complete, post a short summary in this shape:

```
Morning. You're set up.

Dashboard: http://localhost:8900/
N draft(s) waiting to review.

Suggested focus once you're done in the dashboard:
<top item from Step 1>

Pick: review inbox first, jump to the suggested item, or something else from the briefing.
```

Then wait. Do not start any work until Maaike picks.

## Notes

- Memory rule: always show the clickable URL.
- If `/telegram-sync` reports nothing new and the dashboard already had no drafts, still show the URL — Maaike may want to re-review yesterday's already-published items in the greyed-out feed.
- If Step 2 fails (server won't start, telegram dispatch fails), report the error and still show the briefing from Step 1. Don't block the session on dashboard issues.
