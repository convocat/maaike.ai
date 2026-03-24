# New project

Create a new project hub post — the single post that defines what a project is and tracks its deliverables.

## Step 1: Gather project details

Ask the user (AskUserQuestion):
1. **Project name** — becomes the title and slug
2. **What is the goal?** — one sentence describing what this project will produce or answer
3. **What are the deliverables?** — list the files this project will produce (experiments, analyses, write-ups, artefacts). These become the checklist in the hub post.

## Step 2: Draft the hub post

Show Maaike this draft for approval before writing:

```markdown
---
title: "<project name>"
description: "<goal sentence>"
date: <today>
maturity: draft
draft: true
tags: []
ai: "100% Maai"
hub: true
---

## Goal

<goal sentence>

## Deliverables

- [ ] [[<slug-1>]] — <deliverable 1 description>
- [ ] [[<slug-2>]] — <deliverable 2 description>
...

## Log

*Project started <date>.*
```

Slugs in the checklist are placeholders — they'll be filled in as files are created via `/new-project-file`.

## Step 3: Write the file

After approval, save to `src/content/field-notes/<slug>.md`.

Tell Maaike: "Hub created. Use `/new-project-file` to add files to this project, and `/complete-project` when all deliverables are done."
