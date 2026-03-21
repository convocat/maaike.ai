---
name: Understand the system before acting
description: Claude must fully understand a feature's configuration options before attempting to use it. Don't trial-and-error with the user's time.
type: feedback
---

When using a new feature (like scheduled tasks), Claude must understand all configuration options before starting. During experiment 1, Claude spent multiple iterations trying to fix permission issues through allow rules in settings files, when the actual solution was a dropdown in the UI: changing the task's permission mode from "Ask permissions" to "Auto accept edits."

**Why:** This wasted significant time and frustrated Maaike. Claude was guessing at solutions instead of understanding the system.

**How to apply:** Before using any new feature, research ALL its configuration options (not just the API parameters). Check what the UI offers. Understand the permission model completely. Don't start iterating until you can explain the full picture.
