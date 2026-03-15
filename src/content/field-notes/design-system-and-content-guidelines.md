---
title: "Design system and content guidelines"
date: 2026-03-15
maturity: developing
tags:
  - project
  - digital-gardens
description: The living reference for the visual design, component library, content rules, and interaction patterns of maaike.ai.
ai: co-created
---

## Purpose

This is the living reference for the visual design, component library, content rules, and interaction patterns of maaike.ai. It serves two audiences: Maaike (for consistency when adding content) and Claude (for generating code and content that fits the garden).

## Terminology

| Term | Definition |
|---|---|
| Garden | The entire site: a collection of interconnected notes, not a blog |
| Item | Any piece of content (article, seed, field note, etc.) |
| Collection | A content type with its own schema, icon, and color |
| Maturity | How developed an item is: 🌱 draft → 🌿 developing → 🪴 solid → 🌳 complete |
| Wiki-link | Internal cross-reference using `[[Page Title]]` syntax |
| Backlink | Automatically computed reverse wiki-link |
| Trail | A curated or auto-generated sequence through related items |
| Project hub | A field note tagged `project` that tracks a multi-item effort |

## Content model

### Collections

| Collection | Purpose | Extra fields |
|---|---|---|
| Articles | Polished long-form writing | `pruning` (optional) |
| Field Notes | Analysis, project tracking, research write-ups | — |
| Seeds | Standalone concepts and ideas, not project work | — |
| Weblinks | External links worth bookmarking | `url` (required) |
| Videos | Video content (YouTube, etc.) | `url` (required) |
| Library | Books, with reading status | `author`, `cover`, `status` |
| Experiments | Runnable code with setup instructions | — |

All items share: `title`, `date`, `updated`, `maturity`, `tags[]`, `description`, `draft`, `ai`.

### Content rules

- **Project hubs are always field notes.** If it has a `project` tag, it lives in `field-notes/`. Seeds never get `project` tags.
- **Experiments contain code.** If it's analysis or narrative about code, it's a field note. If it's runnable instructions, it's an experiment. Link the two with wiki-links.
- **Seeds are conceptual.** Standalone ideas, definitions, frameworks. Not active project work.
- **Draft items** (`draft: true`) are excluded from build output.
- **AI transparency** is declared per item: `100% Maai`, `assisted`, `co-created`, or `generated`. Omit the field to show no indicator.

### Maturity system

| Stage | Emoji | Meaning |
|---|---|---|
| Draft | 🌱 | Just planted, rough notes |
| Developing | 🌿 | Taking shape, needs work |
| Solid | 🪴 | Well-developed, reviewed |
| Complete | 🌳 | Done, polished |

Displayed as an interactive 4-step track in PostLayout, and as circle size on the explore map.

## Visual identity

### Brand color

**Hot pink #D6006C** (light) / **#FF4DA6** (dark). This is Maaike's company color. It is the only "loud" color on the site. Used for: accent links, active states, maturity "complete" indicator, active trail highlights.

### Palette philosophy

Warm, earthy, organic. The garden should feel hand-made and personal, never corporate or data-dashboard. Colors are muted pastels with enough saturation for WCAG AA compliance.

### Collection colors (WCAG AA ≥3:1)

| Collection | Light mode | Dark mode | Character |
|---|---|---|---|
| Articles | #7A5A48 | #D4A88E | Warm brown |
| Field Notes | #4A7A50 | #8ECF94 | Forest green |
| Seeds | #A07030 | #E8C07A | Dark gold |
| Weblinks | #7A6048 | #D4B89E | Earth brown |
| Videos | #6E4E68 | #C9A8C4 | Plum |
| Library | #5A4E44 | #BDB0A6 | Dark brown |
| Experiments | #3A7080 | #7ECCD6 | Deep teal |

These colors are used consistently in: collection icons (stroke), explore map circles, legend dots, collection labels, and the ConnectionMap component.

### Typography

| Role | Font | Fallback |
|---|---|---|
| Headings | Lora (variable, serif) | Georgia, Times New Roman |
| Body | Roboto (variable, sans) | system sans-serif |
| Code | JetBrains Mono | monospace |

All fonts are self-hosted. Headings use `clamp()` for fluid sizing.

### Spacing scale

`--space-xs` (0.25rem) through `--space-3xl` (4rem). Consistent across all components. Maximum content width: 65rem. Prose width: 42rem.

### Dark mode

Managed via `data-theme` attribute on `<html>`, persisted in localStorage. All colors switch via CSS custom properties in `tokens.css`. Components never hardcode colors.

## Hand-drawn aesthetic

The garden's visual signature is a hand-drawn, sketchy style achieved through:

- **SketchyFilter**: A global SVG `feTurbulence` + `feDisplacementMap` filter that adds subtle wobble to collection icons
- **Rough.js**: Used on the explore page for circles, paths, and shapes. Gives SVG elements an organic, imperfect look
- **CollectionIcon**: Each collection has a hand-drawn SVG icon (stroke-only, no fill except pupil/bubble elements). Stroke width 1, round caps and joins

This style should be maintained and extended, never replaced with polished geometric icons.

## Component library

### Layout components

| Component | Purpose | Props |
|---|---|---|
| BaseLayout | HTML shell, meta tags, ViewTransitions, dark mode | `title`, `description?`, `ogImage?` |
| PageLayout | BaseLayout + Header + Footer + container | same as BaseLayout |
| PostLayout | Full post page with sidebar, maturity track, AI indicator | `title`, `date`, `maturity`, `tags[]`, `collection`, `slug`, + more |

### Card components

| Component | Use case | Key behavior |
|---|---|---|
| ContentCard | Main grid card for most collections | 3-tag max, maturity badge, hover lift |
| FeaturedCard | Hero/spotlight card | Left accent border, larger font, all tags shown |
| CompactItem | Sidebar lists, related posts | Minimal: title, date, 2 tags max |
| NotePreview | Small preview boxes | 3-line description clamp, min 10rem height |
| BookCard | Library items | Horizontal layout, cover image, reading status badge |
| LinkCard | External weblinks | Shows hostname with external icon |
| VideoCard | YouTube videos | Auto-extracts thumbnail, play overlay |

### Interactive components

| Component | Purpose |
|---|---|
| FilterBar | Maturity + tag filtering, sort controls for collection pages |
| DarkModeToggle | Sun/moon button, manages theme |
| WikiLinkPreview | Hover popover on wiki-links with title + description |
| ConnectionMap | SVG node graph of related posts (max 6), orbiting animation |
| BackLinks | Lists pages that link to the current page |
| PostSidebar | Sticky sidebar with backlinks, related posts, suggested books |

### Structural components

| Component | Purpose |
|---|---|
| Header | Site title, nav links, hamburger menu (mobile), dark mode toggle |
| Footer | Copyright line |
| ContentGrid | CSS grid wrapper: `auto-fill, minmax(280px, 1fr)` |
| HomepageSection | Section heading with optional "View all" link |
| TagList | Clickable tag chips |
| MaturityBadge | Inline plant emoji for maturity level |
| ShareLinkedIn | LinkedIn share button with sketchy icon |

## Explore page

The `/explore` page is the garden's interactive spatial view. Three modes:

### Map
A 2D landscape where items are positioned by semantic similarity (UMAP projection of bge-m3 embeddings). Items rendered as Rough.js circles. Size = maturity, color = collection. Pan/zoom via d3-zoom. Cluster labels from k-means + key phrases.

### Wander
Serendipity mode. Picks a random item (weighted toward under-linked content), pans the map to it, shows a "While you are here..." card with the item and its 3-4 nearest neighbors.

### Paths (trails)
Curated or auto-generated sequences. Drawn as Rough.js curved lines across the map. Active trail in hot pink. Trail sidebar lists available paths with descriptions.

### Explore page UI elements

- **Mode switcher**: 3-button pill, top-right (Map, Wander, Paths)
- **Legend**: Collapsible pill, bottom-left. 2-column collection grid + maturity size scale
- **Wander button**: Bottom-right, Rough.js signpost icon
- **Tooltip**: Hover card with title, collection dot, segmented maturity bar
- **Trail sidebar**: Slides from right. Trail cards with left-border accent

### Data pipeline

Pre-computed at build time by `scripts/build-explore-data.cjs`. Outputs `public/explore-data.json` with item metadata, 2D coordinates, cluster labels, and trails. No runtime ML needed.

## Navigation

Main nav (Header.astro): Field Notes, Seeds, Articles, Projects, Experiments, Library, Explore, About.

Weblinks and Videos are accessible collections but not in the main nav, to keep it focused.

## Accessibility

- All collection colors pass WCAG AA (≥3:1 for graphical elements, ≥4.5:1 for text)
- Dark mode colors verified separately against #111111 background
- Interactive elements have `aria-label` attributes
- Mobile hamburger menu with `aria-expanded` state
- Explore map supports keyboard focus (planned)
