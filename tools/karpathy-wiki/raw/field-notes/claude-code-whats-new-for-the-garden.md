---
title: "Claude Code: what's new for the garden"
date: 2026-03-21
maturity: draft
tags:
  - claude-code
  - digital-gardens

hub: true
description: "Five short experiments validating new Claude features (March 2026 release) on the digital garden. Practical demos for conversation designers."
ai: co-created
---

# Claude Code: what's new for the garden

A mini project to explore new features from the March 2026 Claude release by applying them to real garden tasks. Each experiment maps to a specific new capability and doubles as a practical demo for conversation designers and AI practitioners.

## Why

Every Claude release brings new capabilities. But what do they actually mean for a practitioner? Instead of reading changelogs, test each feature on something real: this garden.

## Design constraints

- **Each experiment must map to a feature that's new in this release** (Opus 4.6 / Sonnet 4.6 / Claude Code March 2026)
- **Short validations, not deep builds**: 10-20 minutes each, enough to show what's possible
- **Practical**: tasks that a real user (content creator, knowledge worker) would actually want to do
- **Documented**: findings go in this hub, slide deck captures the highlights for a video

## Experiments

| # | Experiment | New feature | What it validates |
|---|---|---|---|
| 1 | Scheduled garden health check | **Scheduled tasks** (Claude Code) | Can Claude automatically flag broken links, stale drafts, and tag issues on a recurring schedule? |
| 2 | Thematic analysis across all content | **1M context window** (standard pricing) | Load 170+ content files in one pass and apply thematic analysis to discover existing and emerging themes across the garden |
| 3 | Research companion | **Web search with dynamic filtering** (Opus/Sonnet 4.6) | Pick a developing article and find new relevant papers/sources, with Claude filtering for quality before surfacing results |
| 4 | Adaptive content analysis | **Adaptive thinking** (Opus/Sonnet 4.6) | Let Claude decide when to think deeply vs. quickly across different types of content analysis tasks |
| 5 | Parallel batch analysis | **Parallel subagents** (Opus 4.6) | Spin up multiple agents to analyze different collections simultaneously and cross-reference findings |

## Setup per experiment

### Experiment 1: scheduled tasks
**Prerequisites:**
- Add broad read-only allow rules to `.claude/settings.local.json`: `Bash(grep:*)`, `Bash(find:*)`, `Bash(git status:*)`, `Bash(git log:*)`, `Glob`, `Grep`, `Read`, plus `mcp__scheduled-tasks__*` tools
- Without these, every scheduled run stalls on permission prompts for each individual command variant

**Steps:**
1. Create the task with `create_scheduled_task` (prompt + cron expression)
2. Trigger immediately with `fireAt` to validate the output
3. Review the sidebar session, tune the prompt if needed
4. Set back to recurring cron schedule

### Experiment 2: 1M context window
**Prerequisites:**
- Opus 4.6 or Sonnet 4.6 model (1M context enabled by default on Max/Team/Enterprise)
- All content files must be readable (allow rules for `Read` and `Glob` already configured)

**Steps:**
1. Glob all .md files across src/content/
2. Read all files into context in a single pass
3. Apply thematic analysis: identify codes, group into themes, note emerging patterns
4. Report themes with supporting evidence from specific articles

### Experiment 3: web search with dynamic filtering
**Prerequisites:**
- `WebSearch` already allowed in settings
- Pick a developing article as the research target

**Steps:**
1. Read the target article to understand its current scope and references
2. Use web search with targeted queries
3. Observe how Claude filters results before surfacing them
4. Compare quality of findings to a naive search

### Experiment 4: adaptive thinking
**Prerequisites:**
- Opus 4.6 model (adaptive thinking enabled by default)

**Steps:**
1. Give Claude a mix of simple and complex content analysis tasks in one conversation
2. Observe when Claude decides to think deeply vs. respond quickly
3. Compare output quality across task types

### Experiment 5: parallel subagents
**Prerequisites:**
- Allow rules for `Read`, `Glob`, `Grep` (already configured)

**Steps:**
1. Launch 3+ agents simultaneously, each analyzing a different collection
2. Collect results and cross-reference findings
3. Compare wall-clock time to sequential analysis

## Deliverables

- Documented findings per experiment (each as a field note linked to this hub)
- Write-up report summarizing findings and recommendations
- Slide deck for feedback video
- New seed: [[thematic-analysis-as-interaction-model-and-research-method]]

## Observations

### Backend bias
When proposing experiments, Claude defaulted to infrastructure tasks (scheduled checks, tag consolidation, build analysis) over content-oriented ones (finding connections, thematic gaps, research companionship). Safe tasks with clear success criteria, low subjective risk. Maaike noticed, chose backend-first anyway, but flagged the pattern as worth examining.

### Experiment 1: scheduled tasks
See [[experiment-1-scheduled-garden-health-check]].

### Thematic analysis as interaction model
Started as a typo ("interaction model" instead of "research method"), turned into a new idea connecting to the [[is-conversation-still-a-useful-metaphor]] exploration. See the seed.

## Project log

### 2026-03-21: kickoff

- [x] Created project hub
- [x] Created seed: thematic analysis as interaction model and research method
- [x] Experiment 1: scheduled garden health check
- [x] Experiment 2: thematic analysis with 1M context ([[experiment-2-thematic-analysis-with-1m-context|field note]])
- [ ] Experiment 3: research companion with dynamic filtering
- [ ] Experiment 4: adaptive content analysis
- [ ] Experiment 5: parallel batch analysis
- [ ] Instruction manual: parallel agent design for conversation designers
- [ ] Write-up report
- [ ] Slide deck for feedback video
