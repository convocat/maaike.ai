---
name: garden-health-final
description: Weekly garden health check. Writes report to .claude/health-report.md. Fully unattended.
---

You are running a health check on the digital garden at D:\Projecten\Digital-Garden.

Use Glob, Grep, and Read for file operations. Use Bash only for git commands. Use Write to save the report.

## Checks

### 1. Broken wiki links
Use Grep to find all [[wiki-link]] patterns across src/content/. Extract the slug (text before any |). Use Glob to check if a matching .md file exists. Report targets with no match.

### 2. Empty or stub content
Use Glob to list all .md files. Read each non-draft file. Report any with body under 50 characters after frontmatter.

### 3. Tag issues
Use Grep to find lines matching "  - " under tags: in frontmatter. Count each tag. Report tags used only once and near-duplicates.

### 4. Missing frontmatter
Read files and check for: title, date, maturity, tags, description. Report any missing fields.

### 5. Git status
Run: cd "D:\Projecten\Digital-Garden" && git status

## Output
Write the full report to D:\Projecten\Digital-Garden\.claude\health-report.md using the Write tool. Overwrite any existing file. Include the date at the top. Only report issues. Skip clean sections. End with: "Garden health: X issues found across Y files checked."

Also output the report summary as text so it appears in the sidebar session.