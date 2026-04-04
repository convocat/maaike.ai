---
title: Mycelium section
date: 2026-04-04
maturity: solid
tags: [design, components, navigation, knowledge-graph]
description: The collapsible post footer drawer that surfaces tags, semantic triples, and thematic arguments.
category: design
section: Components
ai: co-created
---

At the bottom of each post, a collapsible `<details>` element holds the post's metadata: tags, relations (semantic triples), and thematic arguments ("what this post argues"). It's called the Mycelium section — the connective tissue beneath the garden.

## Why a drawer

The metadata is valuable for navigation but visually noisy. A `<details>` element hides it by default, keeps the prose clean, and lets curious readers expand it deliberately. The browser handles open/closed state natively — no JavaScript needed.

## Trigger design

```css
.mycelium-label {
  font-size: 1.5rem;
  font-family: var(--font-heading);
  font-weight: 700;
  padding-left: 1.4rem;  /* space for the triangle */
}

.mycelium-label::before {
  content: '▶';
  position: absolute;
  left: 0;
  font-size: 0.65rem;
  color: var(--color-accent);
  opacity: 0.6;
  transition: transform 150ms ease;
  top: 0.45em;
}

.mycelium-section[open] .mycelium-label::before {
  transform: rotate(90deg);
}
```

The triangle rotates 90° when open. The hint text ("tags, relations & arguments") sits baseline-aligned next to the label at 0.8rem, italic, muted — visible enough to describe the drawer but light enough not to compete with the heading.

## Content: tags

A `TagList` component renders tag pills. These link to `/tags/[tag]` and collect all posts across collections that share the tag.

## Content: relations (triples)

Semantic triples express statements about the post in subject-predicate-object form:

```
[subject]  [predicate]  [object]
```

Rendered in a pink-left-bordered card:

```css
.triple {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  font-size: 0.78rem;
}

.triple-subject   { font-weight: 600; color: var(--color-text); }
.triple-predicate { font-style: italic; opacity: 0.7; }
.triple-object    { font-weight: 500; }
```

Triples are stored in frontmatter as a list of three-element arrays:

```yaml
triples:
  - [Argumentation, requires, Evidence]
  - [Rhetoric, can replace, Reasoning]
```

## Content: themes

The "What this post argues" section renders a list of thematic claims, each prefixed with a `→` arrow in accent color. The heading carries a small `beta` badge (the feature is still being explored):

```css
.beta-badge {
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: 3px;
  padding: 1px 5px;
  opacity: 0.7;
}
```

Themes are stored as a flat list in frontmatter:

```yaml
themes:
  - Framing an argument matters as much as its content.
  - Rhetorical skill is teachable, not innate.
```

## Open animation

When expanded, the content fades and slides in:

```css
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

## Visibility rule

The entire `<details>` element is only rendered if at least one of tags, triples, or themes is present. Empty drawers are suppressed entirely.
