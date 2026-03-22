---
title: "Building this garden: change log"
date: 2026-03-12
updated: 2026-03-21
maturity: developing
tags:
  - about
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
- **Book blurbs**: 18 books enriched with official descriptions from Open Library
- **Smarter book recommendations**: Content-based recommender using keyword similarity, tag synonyms, and blurb matching instead of simple tag overlap
- **Backlinks fix**: Wiki links with pipe syntax (`[[slug|display text]]`) now correctly generate backlinks

### 14 March

- **Sparks renamed to Seeds**: Collection renamed across the entire codebase to better fit the garden metaphor. New hand-drawn seed icon
- **LinkedIn integration**: Connected LinkedIn developer app with OAuth, created `post-to-linkedin.mjs` script for direct API posting
- **Share and tags in post footer**: LinkedIn share button, copy-link button, and tags moved from sidebar to a dedicated post footer section
- **Sidebar as garden path**: Sidebar stripped down to navigation only: "Linked from" (backlinks), "Related" posts, and "Suggested reading", all with collection icons
- **`/share-linkedin` skill updated**: Now offers direct API posting in addition to clipboard copy
- **New seeds**: "Garden to do list" (living roadmap) and "Chatbots without AI" (conversational garden guide without LLMs)
- **Experiments collection**: New content type for hands-on, reproducible explorations. Beaker icon (#6a8e96), full routing, CMS, and nav integration
- **Knowledge graph research**: New field note tracking research into automatic semantic backlinks, garden world model, and external content discovery. Inspired by Apple's Saga platform
- **Projects page**: Cross-collection view showing all content tagged `project`. Added to header nav. No new collection needed: any content tagged `project` becomes a project hub
- **Saga reading notes**: Detailed field note summarizing both Apple Saga papers (SIGMOD 2022 + 2023), with PDFs stored locally
- **Project files in sidebar**: Project hub pages show "Project files" instead of "Linked from", listing all content that wiki-links back to the hub. Seeds can link forward to projects they inspired
- **Embedding model survey**: Field note covering five eras of text embedding, comparison of three local models (nomic-embed-text, bge-m3, embeddinggemma), and model selection criteria for the garden's dataset
- **Local embedding setup**: Experiment documenting Ollama installation and three-model comparison on 10 garden items (body text vs metadata-enriched)
- **Full-scale embedding run**: bge-m3 on all 157 garden items, confirming 43/44 existing wiki-links and surfacing 2,771 candidate connections
- **New seeds**: "Dutch-aware quantization" (language-specific model compression) and "Embeddings for knowledge gardens: a research gap" (PKM embedding research gap)
- **Crew Resource Management**: Moved from field notes to seeds

### 15 March

- **Key phrase extraction write-up**: Field note covering four eras of extraction methods (statistical, graph-based, embedding-based, LLM-based), relationship to embeddings, the short-text problem, and recommended approach for the garden
- **Observation box**: New `.observation` CSS component (teal accent) for personal meta-notes, added to both garden and Typora theme
- **Backlinks fix**: Deduplicated backlinks and sorted by date for chronological project file ordering
- **Experiment reorganization**: Moved analysis out of experiments into field notes, added full inline code to experiment files
- **Full-scale key phrase extraction**: LLM-based extraction (gemma3:4b) on all 92 garden items. 705 unique phrases, 35% item overlap, short-text padding confirmed as main quality issue
- **Field-notes icon**: Redesigned from flask to clipboard with checklist, distinguishable from experiments beaker at small sizes
- **Link review UI**: Standalone tool (`tools/review-links.html`) for reviewing embedding-based link candidates with z-score filtering, keyboard navigation, and export
- **Candidate pipeline**: Scripts to generate scored link candidates from embeddings + key phrases, and apply approved links as Related sections
- **100 new cross-links**: First review round applied 50 approved link pairs (bidirectional) across 50 content files, all discovered by the knowledge graph pipeline
- **Explore page**: Interactive spatial map at `/explore` with three modes (Map, Wander, Paths). UMAP projection of bge-m3 embeddings, Rough.js hand-drawn rendering, d3-zoom pan/zoom. Prototyped in v0 by Vercel, rebuilt as vanilla JS for Astro
- **Explore data pipeline**: Build-time script (`scripts/build-explore-data.cjs`) computes UMAP positions, k-means clusters, and trail data from embeddings and key phrases
- **Nightly explore rebuild**: Scheduled task updates embeddings, key phrases, and explore data overnight
- **WCAG color overhaul**: All collection colors updated to meet WCAG AA (≥3:1 contrast) across explore page, collection icons, and connection map
- **Design system documentation**: New field note documenting the full visual system: color palette, typography, all 22 components, content rules, and accessibility standards
- **Principles removed**: Collection deleted entirely (config, pages, content, icons)
- **Nav cleanup**: Removed Weblinks and Videos from navigation (collections still accessible), added Explore

### 17 March

- **Book recommender project**: New field note project hub with user research interview and library audit (40 books labeled). Logic-based scoring algorithm designed across 5 dimensions: topic match, experience prediction, mood fit, garden connection, freshness

### 18 March

- **Book recommender: Python script**: `recommend.py` scores all candidate books across 4 mood profiles and outputs a reading mix (main read, side read, wildcard). Reads garden tags and active projects automatically
- **Book recommender: HTML dashboard**: Interactive single-file dashboard at `dashboard.html`. All 4 moods pre-generated, switch client-side without re-running the script. Score breakdown bars, matched garden tags, estimated pages and reading time per book
- **Book recommender: library integration design**: New experiment outlining how the recommender will read from and write back to the garden's library collection, making it the single source of truth
- **Book recommender: learning layer**: Dashboard now shows a mood profile card (what the mood boosts and why), score bar tooltips on hover (dimension explanation + weight), matched interest keywords as pink pills, and a collapsible algorithm explainer
- **Book recommender: library integration**: Extended Astro library schema with audit fields (genre, book_type, purpose, reason, rating, review, recommended, recommended_score). Migrated 40 books from JSON to markdown frontmatter. Recommender now reads from and writes back to the garden library as single source of truth
- **Book recommender: vibe chips + mood removal**: Replaced mood selector with four situational vibe chips (short session, feed the work, from the pile, surprise me). Each chip is orthogonal to content preference: short session picks the best-scored short book; feed the work re-ranks by garden connection; from the pile re-ranks by freshness. Python scoring simplified to four mood-independent dimensions (topic 30%, experience 35%, garden 20%, freshness 15%)
- **Book recommender: 2D positioning canvas**: Replaced vibe chips with a draggable 2D canvas. X axis: play/personal to learn/professional. Y axis: comfort/familiar to discover/challenge. Dot position re-ranks results in real time. Four preset chips snap to named positions. Short session stays as a separate checkbox
- **Book recommender: library integration**: "What to read next?" link on the library page. Inline audit editor on each book's detail page, saves directly to the markdown file via a local Python server (localhost:8090)
- **Book recommender: UI cleanup**: Removed scored books list from the dashboard. Removed public inline audit editor from book detail pages (security concern). Recommender drawer moved inside PageLayout so Astro scoped CSS applies correctly. Button redesigned as pink pill
- **Library: auto-tagging**: All 100 library books tagged with missing metadata (book_type, purpose, reason). Reading status corrected: only "Bacteria to AI" marked as currently reading
- **Library: metadata display**: Read-only reason, rating, and review shown on book detail pages
- **Library: category filter**: Tag pills replaced with 8 curated category buttons (Conversation design, Conversational analysis, Content architecture, NLP/NLU & speech, Feminism/bias/ethics, Accessibility, Writing, General interest)
- **Library: status filter**: Sort buttons replaced with "To be read" and "Finished reading" reading status filter buttons
- **YAML safety fix**: Four library files had unquoted colon-space sequences in reason fields, breaking production builds silently. Fixed by quoting all affected values
- **Test strategy**: Three-layer test pyramid: content validator (`scripts/validate-content.mjs`, run via `npm run validate`), build verification via GitHub Actions, and 11 Playwright E2E tests (`tests/library.spec.ts`, run via `npm test`). Pre-commit hook wired up
- **About tag**: Five field notes about building the garden tagged with `about` for easier filtering

### 19 March

- **Explore map: 10 territories**: Increased territory count from 6 to 10 with label overrides for awkward auto-labels. New territories include knowledge-graph, ai-ethics, philosophy, developer-experience, conversational-ai
- **Normalized re-embedding**: All 213 items re-embedded with enriched input: title + description + tags + keyphrases + reason fields. Better semantic discrimination without length bias
- **Link candidates regenerated**: 269 new candidates at 0.70 threshold (down from 5,583 at 0.50)
- **Stable map positions**: Pinned item positions and territories in `map-roots.json`. Map no longer reshuffles on every rebuild. New items placed near most similar neighbor. `--recompute` flag for full reset
- **Manual position overrides**: Items can be moved to a different territory via overrides in `map-roots.json`
- **Library noise filter**: Unconnected fiction excluded from explore map. 18 professional books given wiki-links to keep them visible
- **Wiki-links on 18 library books**: Related sections added to professional books that had no connections
- **External content discovery**: New project hub with constraints and conditions for using the garden's knowledge graph to find relevant external content
- **Garden lifecycle metaphor**: Field note describing the greenhouse (quarantine for external content), compost heap (decayed content), and soil (pre-stage for seeds) as a full recycle loop
- **Nav bar updated**: Field Notes and Seeds added back to main navigation
- **About page rewritten**: Updated from 3 content types to all 7 collections, plus maturity system, AI transparency, connections, and projects sections

### 21 March

- **New project: Claude Code features x garden**: Project hub with 5 experiments demonstrating new Claude Code features through practical garden tasks
- **Experiment 1: scheduled health check**: Automated garden health task using Claude Code's scheduled tasks feature
- **Experiment 2: thematic analysis with 1M context**: Full-garden reading of all 244 files in a single context window, producing 7 emergent themes plus embedding cluster comparison
- **Conversation metaphor article updated**: New sections on the problem with conversation (anthropomorphism, emotional labor) and delegation as metaphor (parcel delivery service)
- **Tended box**: Pink accent box for marking article updates, with Typora theme support
- **End-of-session housekeeping**: Checklist added to CLAUDE.md for consistent garden maintenance
- **Prompt scaffolding removed**: AI-generated content that violated garden ethics, cleaned up across articles
- **Machine migration**: Repo migrated to new machine with memory and scheduled task files

## Related

- [[digital-garden-history|The History of Digital Gardens]]
- [[saga-knowledge-platform|Saga: a platform for continuous construction and serving of knowledge at scale]]
