# Complete project

Mark a project as complete by checking deliverables, generating a completion report and slide deck, and updating the hub.

## Step 1: Select project

Ask which project to complete. Show the list of hub posts with `hub: true` and maturity not yet `complete`.

Read the hub post in full.

## Step 2: Check deliverables

Compare the hub's deliverables checklist against all posts with `develops: <hub-slug>`.

For each checklist item:
- Find a matching develops file (by slug or title similarity)
- Show the mapping:

```
✅ [[experiment-1]] → experiment-1.md (developing)
✅ [[analysis-1]]   → analysis-1.md (solid)
❌ [[write-up]]     → no file found
```

If any items are unchecked and have no corresponding file: stop and show what's missing. Do not proceed until Maaike confirms they're intentionally skipped or the files are added.

If all items are covered: confirm with Maaike and continue.

## Step 3: Generate completion report (DOCX)

Use parallel agents — one per project file — to read and synthesise each develops file. Each agent receives:
- The hub post (goal, context)
- Its assigned file
- The same output format (so all agents produce consistent sections)

Synthesise the agent results into a completion report draft covering:
1. Project goal
2. What was done (one section per deliverable)
3. Key findings and outcomes
4. Conclusions and next steps (if any)

Show the draft to Maaike for approval. Then generate the DOCX using the `/docx` skill.

Save to: `public/downloads/<hub-slug>-report.docx`

## Step 4: Generate slide deck (optional)

Ask: "Do you want a slide deck too?"

If yes: use the `/pptx` + `/ppt-sjabloon-mf` skills to generate a summary deck.

Save to: `public/downloads/<hub-slug>-slides.pptx`

## Step 5: Create completion field note

Create a new field note that serves as the "project complete" announcement:

```markdown
---
title: "<project name>: project complete"
description: "Summary of what was built and key findings."
date: <today>
maturity: complete
draft: true
tags: []
ai: "co-created"
develops: <hub-slug>
---

## What we built

<summary from report>

## Key findings

<key findings>

## Downloads

- [Full report (PDF)](/<hub-slug>-report.docx)
- [Slide deck](/<hub-slug>-slides.pptx) *(if generated)*
```

Show to Maaike for approval before writing.

## Step 6: Update hub post

Update the hub post:
- Set `maturity: complete`
- Tick any remaining unchecked items in the deliverables checklist
- Add a line at the bottom of the Log section: `*Project completed <date>.*`

Show the changes for approval.

## Step 7: Publish

Run `/publish` on:
- The completion field note
- The updated hub post
- The downloaded artefact files

LinkedIn sharing is optional and up to Maaike.
