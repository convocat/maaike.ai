---
title: "Experiment 1: scheduled garden health check"
date: 2026-03-21
maturity: developing
tags:
  - claude-code
  - scheduled-tasks
description: "Testing Claude Code's new scheduled tasks feature by automating weekly garden health checks."
ai: co-created
develops: claude-code-whats-new-for-the-garden
---

# Experiment 1: scheduled garden health check

**Feature under test:** Scheduled tasks (new in Claude Code, March 2026)
**Question:** Can Claude automatically flag broken links, stale drafts, and tag issues on a recurring schedule?

## Setup

1. Create the task with `create_scheduled_task` (natural language prompt + cron expression)
2. Set the task's permission mode to "Auto accept edits" in the UI. Without this, every tool call prompts for manual approval and the task is unusable unattended.
3. Add allow rules in `.claude/settings.local.json` for `Glob`, `Grep`, `Read`, and `Write`
4. Trigger immediately with `fireAt` to validate the output
5. Review, tune the prompt, set to recurring schedule

## Findings

**Finding 1: setup.** In my initial run, I didn't set the permission level right, which meant that I still needed to attend to the task for manual approval. On the other hand, automatically allowing edits requires you to really know what you're doing. So this begs the question: what kind of tasks would you want to schedule this way? My idea was to schedule weekly website maintenance & health check, but I'm not sure whether I'd offload that to a scheduled task right now.

**Finding 2: inconsistent results.** Four runs on the same content produced different results. All four runs found the broken wiki link. Only one run spotted the fictie/fiction language mismatch. Two runs spotted the voice tag fragmentation. Claude did not invent any findings. Every issue Claude flagged turned out to be real when verified against the actual files. But each run missed things the other runs caught. Two runs also miscounted the total number of files.

**Finding 3: open loop.** Scheduled tasks detect issues but can't act on them. The report lands in a sidebar session (or a file, if the prompt tells Claude to write one). There is no way to chain the output into a follow-up task, create an issue, or trigger remediation. I read the report and decide what to do next.

**Finding 4: natural language prompts don't control tool choice.** The prompt explicitly told Claude to use Glob, Grep, and Read tools, not Bash. Claude in the scheduled session ignored this and used Bash grep commands anyway, triggering additional permission prompts. For a structured, repeatable check like broken link detection, a coded script would probably have produced more consistent and controllable results than a natural language prompt.

**Finding 5: the serendipity trade-off.** On the other hand, one run spotted the fictie/fiction language mismatch across Dutch and English library entries. No prompt asked for this. Claude noticed it while scanning tags for something else. A coded script would never have caught that. So natural language prompts lose consistency but gain serendipity.
