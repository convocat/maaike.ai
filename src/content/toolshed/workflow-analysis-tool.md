---
title: Workflow analysis tool
date: 2026-05-13
maturity: developing
draft: false
tags: [design, tools, role-based-collaboration, workflow]
description: "Interactive tool for mapping a workflow into ordered steps with an owner per step (Claude, Maaike, both), then visualising it as a swimlane diagram."
category: design
section: Mockups
ai: "co-created"
---

A standalone single-page tool for thinking through who does what in a recurring workflow. The user names a workflow (e.g. "Ingest dashboard"), then adds steps one at a time. Each step has a name, an optional description, and an owner: Claude, Maaike, or both.

The tool renders the steps as a swimlane diagram: one lane for Claude (moss-green), one lane for Maaike, with shared steps bridging both. The point is to make the division of labour visible at a glance, so it becomes obvious which workflows lean too heavily on one side and which are genuinely collaborative.

The mockup predates the May 2026 palette migration: Maaike's lane still uses the retired hot pink. If this tool moves from mockup to live status, that color needs to swap to the current accent-2 bronze.

[View the prototype](/workflow-tool.html)
