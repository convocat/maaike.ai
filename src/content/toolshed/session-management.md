---
title: Session management: working with Claude across sessions
description: How the garden is tended across sessions: the backlog, handovers, and the editorial moment.
date: 2026-04-05
maturity: solid
tags: [workflow, process, claude]
category: technical
section: Workflow
ai: co-created
---

Each working session has a focused scope. The Claude Code session is the editorial moment: content is reviewed before it's written to a file, diffs are reviewed before committing, and commits are reviewed before pushing. Nothing goes live without explicit sign-off.

## The session structure

Sessions start with context loading: Claude reads the handover from the previous session, the backlog, and any relevant files. Sessions end with a handover.

A handover has two parts:

1. **Session close**: what was done, what decisions were made, what was left open.
2. **Next session brief**: what to pick up, what context to load, what to do first.

The `/handover` skill generates this. Each handover card includes a ready-to-paste opening message for the next session. The two parts are kept distinct: the session closing out writes its own close, and addresses the next session as a separate recipient.

## The backlog

A flat list of items at `.claude/backlog.md`. Each entry has:

- A status: 🟡 ready, 🔵 in progress, 🟠 parked, ✅ done, 🧊 stale
- A last-touched date
- An optional `blocker:` field when something is waiting on a decision
- A ready-to-paste opening message for the next session

The backlog is groomed regularly using `/backlog`, which scans for stale items, unresolved blockers, in-progress work that has drifted, and inbox notes from the tablet — then asks what to work on.

## The inbox

`src/content/_inbox/` holds a persistent running note written on the tablet (Samsung Notes). Each entry is date-stamped. At the start of every session, Claude checks for unprocessed entries and offers to turn them into posts or backlog items. The file is never deleted.

## Persistent context

Two mechanisms carry context across sessions:

**CLAUDE.md** holds project-level instructions: architecture, preferences, content guidelines, and workflow rules. It's version-controlled and loaded at the start of every session.

**Memory** (at `.claude/memory/`) stores accumulated preferences and feedback. Corrections ("don't do X") and confirmations ("yes, keep doing that") are saved so they don't need to be repeated.
