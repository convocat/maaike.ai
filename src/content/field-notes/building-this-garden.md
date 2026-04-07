---
title: "Building this garden: change log"
date: 2026-03-12
updated: 2026-04-07
maturity: solid
tags:
  - about
  - digital-gardens
  - ai-tools
  - developer-experience
description: A changelog of features and decisions made while building this digital garden.
ai: co-created
---

For the story behind why this garden exists, read [[a-digital-garden-as-central-space|the origin story]].

## Before the garden

Maaike's writing life predates this garden by two decades: a WordPress blog since 2003, a Substack newsletter running from 2020 to 2025, a YouTube channel under the Convocat name, books collected in Notion, articles on Medium and LinkedIn. Five platforms, five workflows, no single place that felt fully hers.

## Changelog

### 9 March

Everything started at once -- the whole site went from zero to functional in a single sitting.

- **Initial Astro setup**: static output, GitHub Pages, six content collections (articles, field notes, sparks, weblinks, videos, library)
- **Sveltia CMS**: admin panel for editing content without touching code
- **Substack import**: 40+ articles from 2020-2025 converted to Markdown, images downloaded locally
- **Videos collection**: YouTube embed support
- **Library collection**: migrated from Notion with reading status and topic tags
- **Homepage redesign**: full-width hero, note preview cards
- **Filtering and sorting**: interactive filter bar on all collection index pages
- **Publishing workflow**: `publish.bat` for local push, GitHub Actions for phone link sharing

### 10 March

The garden got its personality -- hover previews, hand-drawn icons, and the first real content.

- **Wiki link hover cards**: hovering any `[[link]]` shows a small card with the post's title and description
- **Hand-drawn collection icons**: SVG icons with a `feTurbulence` wobble filter, each collection with its own character
- **First sparks planted**: three early ideas about the garden itself
- **CLAUDE.md**: project memory file so Claude carries context across sessions
- **AI transparency**: four-level indicator (100% Maai, assisted, co-created, generated) shown as a labelled box on each post

### 11 March

The authoring workflow was rebuilt from the ground up, and the post detail page got its permanent shape.

- **Post sidebar**: backlinks, related posts, and suggested reading in a sticky sidebar on desktop
- **Dark mode logo**: CSS filter approach keeps the logo legible without a separate dark asset
- **Typora theme**: custom "Maaike Garden" theme matching the site (Lora, Roboto, hot pink accent)
- **`/new-post` skill**: opens Typora directly with a blank template; metadata added after writing, not before
- **`/auto-tag` skill**: scans the content base and suggests tags and wiki-links for any post
- **`/update-release-notes` skill**: generates these very entries from git commits

### 12 March

The first original article was published, and the library became genuinely useful.

- **First original article**: "A digital garden as central space for my thoughts and writing" -- written for the garden, not imported from Substack
- **SSL fix**: GitHub Pages domain misconfigured; fixed with a DNS change and waited for a new cert
- **Notion library import**: 59 books migrated with reading status and topic tags
- **Book covers**: 45 covers fetched from Open Library and stored locally
- **Suggested reading sidebar**: up to 3 matching library books shown on each post
- **LinkedIn sharing skill**: `/share-linkedin` generates LinkedIn-ready text from any post
- **Smarter book recommendations**: moved from simple tag overlap to keyword similarity blending content, tags, and blurbs

### 14 March

Sparks became Seeds, LinkedIn got real API posting, and the knowledge graph work began in earnest.

- **Seeds rename**: the collection was renamed across the entire codebase; new hand-drawn seed icon
- **LinkedIn API posting**: direct API publishing added to `/share-linkedin`, not just clipboard copy
- **Sidebar refinement**: stripped to navigation only -- backlinks, related posts, suggested reading; connection graph removed
- **Experiments collection**: new content type for hands-on, reproducible explorations with beaker icon
- **Projects page**: cross-collection hub view for all content tagged `project`
- **Saga reading notes**: detailed field note summarising both Apple Saga papers (SIGMOD 2022 + 2023)
- **Embedding survey**: five eras of text embedding, three local models tested on garden content (nomic-embed-text, bge-m3, embeddinggemma)
- **Full-scale embedding run**: bge-m3 on all 157 items; confirmed 43/44 existing wiki-links and surfaced 2,771 candidate connections

### 15 March

A very long day: key phrases, Explore, design system, WCAG, and a collection that got deleted.

- **Key phrase extraction field note**: four eras of methods, the short-text problem, recommended approach for the garden
- **Observation box**: new `.observation` component in teal for personal meta-notes, in site and Typora theme
- **Explore page**: interactive spatial map at `/explore` with Map, Wander, and Paths modes; UMAP + Rough.js + d3-zoom
- **Explore data pipeline**: build-time script computes positions, k-means clusters, and trail data
- **Nightly rebuild**: scheduled task updates embeddings, key phrases, and explore data overnight
- **WCAG color overhaul**: all collection colors updated to meet AA contrast (≥3:1)
- **Design system field note**: all 22 components, full color palette, typography, content rules, and accessibility standards
- **Principles collection removed**: deleted entirely; never felt right
- **Nav updated**: Explore replaced weblinks and videos in the main navigation

### 17 March

The book recommender project formally began, with a scoring model designed across five dimensions.

- **Project hub**: field note with user research framing and library audit (40 books labeled)
- **Scoring dimensions**: topic match, experience prediction, mood fit, garden connection, freshness

### 18 March

A genuinely impressive single day -- the book recommender went from algorithm design to a full interactive dashboard with library integration.

- **Python script**: scores all candidate books across 4 mood profiles; outputs main read, side read, wildcard
- **Interactive dashboard**: single-file HTML, moods switch client-side without re-running the script
- **Library integration**: recommender reads from and writes back to the garden library as single source of truth
- **Learning layer**: mood profile cards, score bar tooltips, matched interest keywords as pink pills, collapsible algorithm explainer
- **2D positioning canvas**: draggable canvas replaced mood selector; X axis play/personal to learn/professional, Y axis comfort to discover; four preset chips snap to named positions
- **Library auto-tagging**: all 100 books tagged with missing metadata (book_type, purpose, reason)
- **Library detail pages**: read-only reason, rating, and review shown on each book page
- **Category filter**: 8 curated buttons (Conversation design, NLP/NLU, Feminism/bias/ethics, etc.)
- **YAML safety fix**: four books had unquoted colon-space sequences in frontmatter, breaking production builds silently
- **Test strategy**: content validator, GitHub Actions build verification, 11 Playwright E2E tests

### 19 March

The Explore map stabilised, and the garden started thinking about what lived beyond its walls.

- **10 territories**: expanded from 6 with label overrides; new territories include knowledge-graph, ai-ethics, philosophy
- **Re-embedding**: all 213 items enriched with title + description + tags + keyphrases + reason; better semantic discrimination without length bias
- **Stable map positions**: pinned in `map-roots.json`; map no longer reshuffles on every rebuild
- **Manual overrides**: individual items can be moved to a different territory via overrides
- **External content discovery**: new project hub with constraints for using the knowledge graph to find relevant content outside the garden
- **Garden lifecycle metaphor**: greenhouse (quarantine), compost heap (decayed content), soil (pre-stage for seeds)
- **Nav updated**: field notes and seeds brought back into main navigation

### 21 March

The Claude Code experiments project launched, and the conversation metaphor article got two new sections.

- **Claude Code features x garden**: project hub with 5 planned experiments demonstrating new Claude Code features
- **Experiment 1**: scheduled health check -- automated garden monitoring via Claude Code's scheduled tasks
- **Experiment 2**: thematic analysis using 1M context window on all 244 files; produced 7 emergent themes
- **Conversation metaphor article tended**: new sections on the problem with anthropomorphism, and delegation as metaphor (parcel delivery service framing)
- **Tended box**: pink accent component for marking article updates, with Typora theme support
- **Machine migration**: repo migrated to a new machine

### 23 March

A new content type and a whole new page: jottings and the stream both landed on the same day.

- **Jottings collection**: subtypes note, quote, event, link, post for casual notes, book quotes, and LinkedIn cross-posts; fountain pen nib icon in ink-blue
- **Stream page**: braided chronological feed mixing articles, field notes, seeds, jottings, and weblinks
- **Stream design**: parchment hero card, pinned quote cards in sage green, doodle icons per collection, currently-reading sidebar
- **Mega-menu navigation**: garden dropdown replaced with a mega-menu showing all collections with icons and descriptions
- **Dark mode simplified**: system preference only; manual toggle removed
- **`/new-book` skill**: adds library books via Open Library API with automatic cover downloads

### 24 March

The project infrastructure was completed and the content workflow consolidated into a single command.

- **Files and artefacts collections**: two new project-specific content types for sub-documents and design deliverables
- **Post layout improvements**: description shown as subtitle, wiki-linked library books in a sidebar section, h6 headings styled as inline labels
- **LinkedIn API posting**: full flow -- image upload, post creation, URL comment; Convocat BV company page verified
- **`/publish` skill**: validates, generates OG images, rebuilds explore map, updates release notes, commits, pushes, and optionally posts to LinkedIn -- in one command

### 25 March

The first original writing about the garden itself went live, and the stream duplication bug was fixed.

- **Field note published**: "The garden so far: how do I keep the weeds away from my writing"
- **LinkedIn automation**: GitHub Actions workflows for automatic LinkedIn post on new articles and jottings
- **Hub post fix**: project hub posts had been appearing twice in the stream; deduplicated

### 27 March

The stream got a full visual redesign, the session handover workflow was formalised, and two new projects were started.

- **Stream redesign**: index card layout with sidebar, cleaner structure
- **Stack page**: physical card browser at `/stack` with wiki-link connections and A-Z mode
- **`/handover` skill**: formalises session close-outs with a sign-off and a backlog entry for the next session
- **Public backlog page**: backlog visible at `/backlog` on the garden
- **Seeds published**: button metaphor, ultrasmall team, reading log
- **New projects started**: Claude LabBook and Conversational Patterns for Human-Machine Interaction

### 28 March

Mobile stream refinements -- small changes, but the stream finally felt right on a phone.

- **Stream mobile**: body preview removed from stream cards, sidebar slimmed, compact filter dropdown

### 29 March

The homepage was rebuilt again, more completely, and the triples system was introduced for semantic metadata.

- **Homepage redesign**: new hero with large leaf and blob, doodle library elements, RSS feed, full mobile polish
- **Stream visual overhaul**: featured hero card, white card backgrounds, subtle greengrey page tint, tabbed filter cards with protruding tabs, hamburger menu on mobile
- **Triples system**: structured semantic metadata in frontmatter following the TAO method (Topics, Associations, Occurrences), feeding the knowledge graph
- **Wikipedia link styling** and external link behaviour formalised
- **First jotting published**: "Thinking in action, precision matters"

### 31 March

The garden joined the IndieWeb, and the TAO system was used for the first time on existing articles.

- **IndieWeb h-card**: added to homepage for level 2 verification
- **`rel=me` link**: GitHub linked for identity verification
- **Blogroll**: sidebar card and `/blogroll` page, plus two webrings (later removed)
- **Auto-tag run**: TAO enrichment applied to 5 articles for the first time
- **Mycelium section**: collapsible drawer on post pages showing tags, relations, and themes

### 1 April

A concept graph, a tended article, and a new homepage hero.

- **Concept graph**: new page at `/graph` visualising the semantic triples network
- **Conversation metaphor article tended**: new sections on listening and threadiness, drawing from conversation analysis research
- **Homepage hero**: watercolor image replaced the SVG leaf design
- **Reading notes seed**: published from the Bacteria to AI reading

### 2 April

The Thematic-TAO method was written up and the research paper collection began.

- **Thematic-TAO field note published**: documents the three-pass method (themes, TAO extraction, coherence check) that emerged from the auto-tag work
- **12 research papers added**: to the library collection

### 3 April

The Toolshed appeared for the first time as a place to document how the garden works.

- **Toolshed page**: collects documentation about the garden's own patterns, components, and workflows
- **Library descriptions**: completed across the full collection

### 4 April

The library was redesigned and the Toolshed structure was designed as a three-section mini-site.

- **Library redesign**: stream aesthetic with filters, sort, and multiple view modes
- **Toolshed structure designed**: three sections -- Architecture, Components, Workflow

### 5 April

A full day on the Toolshed, plus tablet support and a new article published.

- **Toolshed built out**: technical section, session management docs, skills overview, content design section
- **`/new-post` updated**: supports Toolshed posts as a first-class type
- **Tablet support**: Samsung Galaxy Tab with S-Pen set up for inbox notes via Samsung Notes, syncing to the garden's inbox folder
- **Inbox workflow**: persistent `_inbox/` folder; session start checks for unprocessed notes
- **Garden-as-metaphor**: moved from field notes to articles and published
- **Stream pinning**: three most recent articles pinned at the top of the stream

### 6 April

The biggest infrastructure day since March 14: Telegram, PDF pipeline, and OG images.

- **Telegram bot sync**: messages to the garden's bot sync to the inbox (notes) or create weblinks directly; GitHub Action runs every 15 minutes
- **PDF pipeline**: library `file` field for annotated PDFs, `/summarize-pdf` skill to process academic papers
- **First papers summarised**: Clark and Brennan on grounding theory, and a paper on grounding gaps in LLMs
- **OG image redesign**: split layout replacing the previous single-panel format
- **ViewTransitions removed**: caused interaction bugs; removed
- **Design system content**: moved from a field note hub into the Toolshed where it belongs

### 7 April

A jotting, a video post, a full changelog rewrite, and a redesigned Garden Ops page.

- **Jotting published**: "From role to skills: how Claude Code desilos the future of work" -- a reflection on how agentic AI collapses specialist role boundaries; milestone 1 in the Claude Code experiments
- **First YouTube video post**: welcome video with embedded player; index card in the stream with video icon, no thumbnail
- **Validator fix**: `compost` added as a valid maturity state for retired content
- **Video stream card fixed**: a previous session had accidentally introduced a thumbnail that broke the stream layout; removed
- **Changelog rewrite**: all entries in `building-this-garden.md` rewritten as narrative mini stories -- intro sentence per day plus descriptive bullets, covering March 9 through April 7
- **Garden Ops release notes redesigned**: sources from `building-this-garden.md` only; grouped by month with collapsible day accordions; no pagination, no raw git commits
- **`/update-release-notes` skill updated**: now generates intro sentence + bullet format to match the new changelog style
- **`/handover` skill updated**: now includes a `/update-release-notes` step as part of closing out

## Related

- [[digital-garden-history|The History of Digital Gardens]]
- [[saga-knowledge-platform|Saga: a platform for continuous construction and serving of knowledge at scale]]
