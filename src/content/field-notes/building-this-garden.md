---
title: Building this garden
date: 2026-03-12
maturity: developing
tags:
  - digital-gardens
  - ai-tools
  - developer-experience
description: A changelog of features and decisions made while building this digital garden.
ai: generated
---

For the story behind why this garden exists, read [[a-digital-garden-as-central-space|the origin story]].

## Changelog

### 9 March

- **Initial setup**: Astro 5, static output, GitHub Pages deployment
- **Content collections**: 7 collections (articles, field notes, sparks, weblinks, videos, library, principles)
- **CMS**: Sveltia CMS admin panel
- **Publishing workflow**: `publish.bat` for local push, GitHub Actions for phone link sharing
- **Content import**: 40+ Substack articles (2020-2025) imported in batches
- **Tags system**: Dynamic tag collection, tag pages, relation widgets in CMS
- **Filtering and sorting**: Interactive filter bar on collection index pages
- **Homepage redesign**: Full-width hero, note preview cards, video thumbnails
- **Videos collection**: YouTube embed support, thumbnail grid on homepage
- **Library + Principles**: Two new collections with custom fields (author, status, cover)
- **Pruning reflections**: Optional retrospective notes on older articles
- **Collection renaming**: notes to field-notes, links to weblinks, added sparks
- **Wiki links**: `[[double bracket]]` cross-linking across all collections
- **Backlinks**: Computed incoming links shown on each post

### 10 March

- **Wiki link previews**: Hover cards showing title + description
- **Hand-drawn icons**: SVG collection icons with feTurbulence wobble filter
- **Sparks content**: First three sparks planted
- **CLAUDE.md**: Project memory file for persistent AI assistant context
- **AI transparency**: Four-level indicator (100% Maai, assisted, co-created, generated)
- **Style rules**: Sentence case titles, no em-dashes

### 11 March

- **Post sidebar**: Tags, backlinks, and related posts in a sticky sidebar on desktop
- **Sidebar refinement**: Removed connection map graph, kept clean text lists
- **Dark mode logo**: CSS filter (invert + grayscale + lighten blend) for logo visibility in dark mode
- **AI transparency labels**: Renamed "none" to "100% Maai", set AI status on all posts
- **Content cleanup**: Deleted 4 posts, reformatted changelog to date headers with bullet lists
- **Content creation skill**: `/new-post` command opens Typora directly with blank template, metadata added after writing
- **Typora theme**: Custom "Maaike Garden" theme matching site design (Lora, Roboto, hot pink accent, collapsible frontmatter)
- **Auto-tag skill**: `/auto-tag` scans content base to suggest tags and wiki-links for any post
- **Release notes skill**: `/update-release-notes` generates changelog entries from git commits

### 12 March

- **First original article**: Published "A digital garden as central space for my thoughts and writing" with inline link processing and local image hosting
- **New sparks**: "The disappearance of authentic voice online" and "Writing as a conversation with yourself"
- **New tags**: `personal-web`, `non-linear-thinking`, `role-of-ai` for more specific topic tagging
- **Cross-linking**: Added backlinks from 6 existing posts to the new article
- **SSL fix**: Updated GitHub Pages custom domain to www.maaike.ai, triggered new cert for both domains
- **Build fix**: Added required frontmatter to draft file that was blocking all deployments
- **Notion library import**: Migrated 59 books from Notion to the library collection, with reading status and topic tags
- **Book covers**: 45 covers fetched from Open Library and stored locally
- **Suggested reading sidebar**: Posts show up to 3 matching library books based on shared tags
- **Articles shelf**: Library page includes weblinks as a separate Articles section
- **LinkedIn sharing skill**: `/share-linkedin` generates LinkedIn-ready text from any post
- **DNS fix**: Changed www CNAME to point to convocat.github.io for proper SSL provisioning
