---
title: "YAML-safe frontmatter from external sources"
description: "How the Telegram sync escapes strings before writing YAML frontmatter, and why raw interpolation breaks builds."
date: 2026-04-10
maturity: solid
tags: [digital-gardens, patterns]
category: technical
section: Infrastructure
ai: co-created
---

# YAML-safe frontmatter from external sources

When the Telegram bot fetches a page title or description from an external URL, it writes those strings directly into a Markdown frontmatter file. The problem: external strings can contain double quotes, backslashes, or unresolved HTML entities. If written raw into a YAML double-quoted scalar, they produce invalid YAML and fail the build silently until deploy time.

## Root cause

`telegram_sync.py` was doing this:

```python
f'description: "{description}"\n'
```

A description like `Discover "Algorithmic Epistemic Injustice" and why...` produces:

```yaml
description: "Discover "Algorithmic Epistemic Injustice" and why..."
```

Which is invalid YAML.

## Fix

A `yaml_str()` helper escapes backslashes and double quotes before insertion:

```python
def yaml_str(text):
    return text.replace('\\', '\\\\').replace('"', '\\"')
```

Used on every string field that goes into a double-quoted YAML scalar:

```python
f'title: "{yaml_str(title)}"\n'
f'description: "{yaml_str(description)}"\n'
```

## Also fixed

`decode_html_entities()` was missing `&mdash;`, `&ndash;`, `&hellip;`, and their numeric equivalents. These now resolve to `-`, `-`, and `...` respectively before the string is written to file.

## Rule

Any string sourced from outside the garden (web scrape, API, user input) must pass through `yaml_str()` before being written into a YAML double-quoted scalar.
