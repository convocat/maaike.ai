---
name: Setup instructions before running
description: Always provide setup steps and prerequisites before triggering new features, not after they fail.
type: feedback
---

When demonstrating or using a new feature, always document and execute the setup steps (permissions, config, prerequisites) *before* triggering the feature, not after it fails.

**Why:** During the scheduled tasks experiment, Claude triggered a health check task without first configuring allow rules in settings.local.json. The task stalled on permission prompts every 10 seconds, requiring Maaike to approve each one manually. This was frustrating and avoidable.

**How to apply:** For any new feature, write a "Prerequisites" section first. Configure permissions, install dependencies, check compatibility. Then run the experiment. This applies especially to scheduled tasks, MCP tools, and anything that runs in a separate session.
