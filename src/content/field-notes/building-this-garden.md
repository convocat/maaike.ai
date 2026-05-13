---
reviewed: 2026-04-27
title: 'Building this garden: change log'
date: 2026-03-12
updated: 2026-05-13
maturity: solid
tags:
- about
- digital-gardens
- ai-tools
- developer-experience
- claude-code
description: A changelog of features and decisions made while building this digital garden.
ai: co-created
themes:
- Iterative, session-by-session construction of a personal website
- Claude Code as co-builder of the garden itself
- Consolidating five platforms into one home
triples:
- [Building this garden, demonstrates, Digital garden]
- [Digital garden, requires, Astro]
- [Building this garden, exhibits, Iterative building]
- [Digital garden, counters, content-fragmentation]
- [Building this garden, reinforces, Thinking in public]
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

### 10 April

The garden got its first music post: a personal jotting about U2's new song Easter Parade.

- **Jotting published**: "U2 - Easter parade" -- a link jotting with Wikipedia context for The Joshua Tree and Zoo TV, plus a companion Dutch article from Sonorant.nl
- **Music tag**: new tag added to the taxonomy

### 12 April

A tiny session: one jotting, one lesson about how LinkedIn works.

- **Jotting published**: "AI slop and the Glasswing project" -- a LinkedIn `type` jotting with a styled post card (no iframe -- LinkedIn blocks them) and an Anthropic link card featuring the Glasswing hero video
- **Reading radar**: three GenAI direction articles added to the backlog as a private to-read list

### 13 April

Housekeeping: auto-tagging the garden origin story, and keeping the stream clean.

- **Auto-tag: digital garden article**: "A digital garden as central space" tagged with new topics (serendipity, writing-as-craft, PKM, indie-web, thinking-in-public) and triples added
- **Stream cleanup**: Instagram weblink hidden (draft), em-dash fixed in epistemic injustice title
- **Gitignore**: device-specific Claude config and worktree folders excluded to avoid noisy commits

### 14 April

A deployment safety net, a data fix, and a new article on where conversation design is heading.

- **Pre-commit hook + CI validation**: `npm run validate` now blocks commits with frontmatter errors; install once per device with `bash scripts/install-hooks.sh`; GitHub Actions also validates on push
- **Weekly health check**: new GitHub Actions workflow runs every Monday, builds the full site, and sends an email notification on failure
- **Triples format fix**: pipe-separated triples in "A digital garden as central space" converted to array format
- **Article published**: "LLMOps analyst: conversation designer's next career step" -- on conversation designers evolving into LLMOps architects, with full TAO tagging

### 18 April

A structural push: faceted classification, topic pages, and a dozen visualization prototypes.

- **Faceted classification**: every topic now tagged across 9 entity types, 5 domains, 4 argumentative roles
- **Topic pages** (`/topics/`): sidebar grouped by domain, topic detail with named relations and connected topics
- **Visualization prototypes**: 12 in `public/prototypes/` -- argument map, river diagram, periodic table, mycelium variants
- **Wiki redesign prototypes**: three takes (dashboard, narrative, hub) in `public/`
- **Sources page**: simplified to external-only
- **Graph page**: "Browse as wiki" link added

### 19 April

A chat over Maaike's garden: shipped to production, then the whole day spent making it actually feel right.

- **Wiki chat live** at `maaike.ai/wiki` with backend on Vercel (`wiki.maaike.ai`); chat-primary layout, tabbed right pane (Wiki concepts + full Article view), slide-away topic drawer
- **Real content**: answers draw on 99 wiki concepts plus 90 articles, field notes, and seeds; cites actual article titles with clickable links back to maaike.ai
- **Streaming + prompt caching**: first words appear in ~1 s (was 3-5 s), follow-up calls within 5 min are ~10× cheaper on input tokens; markdown renders progressively as tokens arrive
- **Conversation history**: short follow-ups like "yes" or "go on" now get interpreted against the prior turn instead of in a vacuum
- **Editable system prompt**: extracted to `tools/karpathy-wiki/SYSTEM_PROMPT.md`, rewritten from "research assistant" to "interlocutor" with turn-taking, length calibration, warmer tone, and a role-override defense
- **Mobile**: bottom tab bar (Chat / Wiki / Article), drawer as overlay, reading typography for Wiki and Article tabs
- **Security**: per-IP rate limit (in-memory), hashed-IP usage logging, Vercel preview deployments walled, Anthropic account-level spend cap
- **Docs**: `ARCHITECTURE.md` + `API.md` alongside the code; safety tag `pre-wiki-session` on commit `721ddce`

### 20 April

An eval harness for the wiki chat: graph retrieval grounded in the garden's own triples, two defenses against hallucination, and a 55-question test set.

- **Graph retrieval**: the chat now uses triples, taxonomy, and themes to pick articles instead of sending all 90 as snippets; context drops from ~40k to ~10-14k tokens
- **Defense A -- refuse weak retrieval**: if the graph matches nothing, the server returns a canned refusal without calling Claude; zero tokens, zero hallucination risk on out-of-scope questions
- **Defense B -- verify claims**: new `/api/verify` runs a second Claude call to classify every claim as verified, inferred, or unverified against the source articles; the first real hallucination metric
- **Eval dashboard** at `localhost:8782/eval.html`: 55-question golden test set across 7 categories, auto plus human scoring with a 10-criterion rubric, claim verification UI, automated diagnosis from the methodology decision tree, editable expected-source per question
- **Canonical start and zombie prevention**: `scripts/eval-dev.sh` kills listeners before starting and verifies health; `scripts/eval-smoke-test.sh` runs 7 regression checks; `/start-eval` and `/stop-eval` skills plus double-click `.bat` launchers; serve.py hardened with ThreadingTCPServer, no SO_REUSEADDR, `/api/health`, and `/api/control` for Restart/Stop from the UI
- **Docs** at `localhost:8782`: `manual.html` (task-based, Information Mapping), `methodology.html` (how to evaluate, worked examples), `truth-report.html` (architecture of the defenses), `TRUTH-AND-VERIFICATION.md`

### 21 April

A ritual for ingesting the world. The two enrichment skills share one vocabulary now, and external sources flow through the same routine as internal posts.

- **Unified enrichment vocab**: `/auto-tag` (for garden content) and `/ingest-source` (for external URLs) now draw from the same controlled list of types, lenses, subjects, roles, and predicates
- **Ingest publishes weblinks**: `/ingest-source` now creates a full weblink entry with extracted tags and an AI-generated description, instead of stopping at the knowledge graph
- **First external source**: Nora Bateson's "How our ways of knowing shape our collective future" added, with 6 triples linking warm data, reductionism, systems thinking, and epistemic bias

### 22 April

Normalizing the graph. Every topic converted to a richer classification, so filters actually mean something.

- **Faceted knowledge graph**: 144 topics reclassified on four axes (type, lens, subject, role); the `ai` bucket that lumped 25 topics into one useless filter is gone, replaced by specific subjects like `llm`, `prompt`, `agent`, `pragmatics`, `psycholinguistics`, `digital-garden`, `future-of-work`, and more
- **Sources and weblinks merged**: the parallel `sources` object was retired; every external URL is now just a weblink, and associations point to the weblink slug
- **Mycelium on weblinks**: the Bateson weblink now renders its triples and themes in the Mycelium drawer, same as articles
- **/sources page**: repurposed to read weblinks + associations, keeping the rich card view with summary + topic badges + graph edges
- **Dashboard project scoped**: integrated admin dashboard added to the backlog as a requirements-first scoping item with six open questions

### 25 April

A research-wiki shell at /research that nobody enjoyed building, plus admin-dashboard polish, plus the API endpoints finally pointing at the right place. The Ask view streams real answers with three citation styles, the topic reading view shows grounded synthesis from real content, and the stream uses the same index cards as the homepage with filters in the right rail. None of this came together in one shot.

- **/research routes**: Dashboard, Ask, Stream, /research/[slug], Map (links out to /explore), Log -- shared three-pane shell in `ResearchLayout.astro`
- **Three-way citation system**: pink inline links for Maaike's own writing, sage-green chips for topics, blue chips for external sources -- distinct visual treatment, no more duplicate "1" labels
- **Sources stream up-front**: the right rail populates before the answer finishes generating, so you can scan citations while reading
- **Grounded topic-view cache**: 426 of 472 topics pre-generated into `tools/karpathy-wiki/cache/topic-views/`, used by the topic reading view's "How Maaike uses this" and "Open questions" sections
- **Stream**: existing `MosaicCard` reused, three pinned articles up top, filters (collection + maturity) in the right rail with live client-side filtering
- **Left rail**: collapsible Concepts / People / Entities under a single Topics header
- **Vercel API extended**: `tools/karpathy-wiki/api/index.py` gains `/api/topic-meta/{slug}` and `/api/topic-view/{slug}`; cache files committed so the deploy ships them; `wiki-v6.html` and `/research/ask` both point at `https://maaike-ai.vercel.app` in production
- **Admin dashboard polish (earlier today)**: edit-on-approve for tags/description/triples; "My content" review tab with `reviewed:` frontmatter stamp; per-question rail reset in the chat; published items stay greyed in the queue for situation awareness

Working with Claude on this update was an absolute pain. Same instructions had to be repeated multiple times before they landed; layout fundamentals were re-broken between fixes; whole sub-tasks were tackled before they were asked for.

### 27 April

A workflow-consolidation day: the inbox got codified as `/check-inbox`, the morning ritual got its own skill, and the admin dashboard grew a Write tab.

- **`/check-inbox` skill**: new slash command that runs `/telegram-sync`, scans for un-enriched drafts, runs `/ingest-source` on each, then opens the dashboard at localhost:8900
- **Inbox count fix**: the dashboard count now filters on `processed: false` instead of the whole feed (greyed-out published items no longer inflate the badge)
- **Four weblinks published**: Microsoft DELEGATE-52 paper, two Lucio Arese reels (birdsong-as-data, robin shared manifolds), and Marek Tuszynski's "Don't show me your AI", all enriched with topics, themes, and triples before going live

### 30 April

An ergonomics day: opening a session is now one slash command, and the dashboard grew teeth for editing.

- **`/morning` skill**: session-start ritual that chains `/backlog` and `/check-inbox` so the day starts with the inbox and the open-loops list, in that order
- **Admin dashboard tabs**: three-tab layout (Weblinks default, My content, Write); title, description, tags and triples now editable on every item; Milkdown markdown editor in the Write tab backed by `tools/admin/scratch.md`; new `/api/content-review` and `/api/mark-reviewed` to stamp posts with `reviewed:`
- **Ingest dashboard copy fix**: Sync Telegram button, toast, and "awaiting enrichment" hint now correctly say syncing only, and point to `/check-inbox` for enrichment (the GitHub workflow doesn't auto-tag)

### 1 May

A big admin day: the dashboard became a proper enrichment station with one-click TAO analysis, the content was swept clean of em-dashes, and the garden's open questions now surface in posts.

- **Weblink enrichment in dashboard**: "Enrich" button calls the Anthropic API (claude-sonnet-4-5, user-triggered only), fetches the page, runs TAO analysis, and pre-fills description, tags, themes, and associations in the panel for review before publishing
- **Em-dash sweep**: batch-replaced em-dashes across all 78 content files; rule extended to all API prompts and CLAUDE.md to prevent recurrence
- **Pending-only queue**: dashboard queues now hide completed items by default; a "+ N completed" toggle at the bottom expands them; count badge shows only actionable items
- **Weblink notes field**: long-form notes textarea added to the weblinks panel (page-only, not shown in stream cards); saved as markdown body on approve
- **Save to library**: new inline action in the inbox panel; pre-fills title, requires author, defaults to to-read; creates a `library/` entry and dismisses the source draft in one commit
- **Open questions in Mycelium**: TAO proposals now include open questions; when applied, they appear in the Mycelium section under "Questions this raises" with an italic `?` prefix, alongside themes and relations
- **Article enrichments**: three articles tagged via the Enrich tab: "A digital garden as central space", "You're not married to your texts", "Saturday design thoughts"

### 5 May

The about page grew up: converted from a static Astro file to a proper markdown post editable in Typora, with full garden frontmatter and the same PostLayout treatment as articles and field notes. Stream cards got more substance too.

- **About page as markdown**: `about.astro` replaced by `src/pages/about.md` with full frontmatter (date, maturity, tags, ai field); PostLayout now handles standalone markdown pages alongside content collection entries
- **Featured card visual**: strip width now matches regular cards; content area gets a warm parchment background (#FEFAE8) with blue ruled lines
- **Body excerpts on cards**: article cards and 100% Maai jotting cards show a 3-line body excerpt with "Read more", instead of the short description field

### 6 May

A small but pleasant fix: tapping a link inside the chat on mobile now actually shows you the article.

- **Chatbot mobile link UX**: clicking an internal link in a chat answer auto-closes the drawer on mobile (≤800px) so the destination page is visible. Desktop and external links unchanged.
- **Six weblinks published**: dive-in-tommi-space, masure-manifesto-acentric-design, it's-like-this-why-perceptions-are-our-realities, fieldwork-for-future-ecologies-onomatopee, structured-prompt-driven-development-spdd, ai-metaphors-how-to-think-about-ai-jd-meier

### 7 May

A big design pass: pink retired, earth tones in, the chatbot gets new watercolors, and visitors get to pick their own reading font.

- **Earth-tone palette site-wide**: the company hot pink retired in favour of deep moss-green primary, warm bronze secondary, terracotta for "complete" maturity. Backgrounds in light mode are now pure white (the stream keeps its own cream locally).
- **Reading font picker**: a small Aa control next to the search icon offers four self-hosted body fonts. Nunito is the new default at weight 460 (it reads light at 400). Mulish, Atkinson Hyperlegible, and Roboto sit alongside it. Choice persists in localStorage and applies before paint.
- **Hero acorn**: the right-hand image on the stream is now a watercolor acorn at 160px, on a transparent background.
- **Chatbot user avatar**: a watercolor acorn at 34px with no circular crop, paired with the leaf bot avatar.
- **Settings cogwheel + prompt picker**: a popover in the chat header lets visitors switch the active system prompt. Prompts moved to a content collection at `src/content/prompts/`, with a v0.2 chip-driven prompt added.
- **Contextual chips (v0.2 prompt, now default)**: v0.2 is the new default. The model appends `<<CHIPS:["q1","q2","q3"]>>` at the end of every reply (two close-context items plus one "wander" chip). The backend extracts the marker from the stream, suppresses it from visible text, and emits a chips event the frontend renders. v0.1 remains selectable from the cogwheel for the original in-prose handoff design.
- **Chat panel persists across navigation**: the panel re-inits on `astro:after-swap` so clicking an internal link in the chat lands on a new page with the same conversation, same avatars, same bindings.
- **No mobile auto-focus**: the chat input is no longer auto-focused on mobile (≤800px), so the keyboard only appears on tap.
- **Empty-state chips in chip layout**: the chatbot's starter suggestions now use the same hand-drawn pebble shapes as follow-ups, instead of rounded pills.
- **Toolshed updates**: new entry for font-picker; chat-panel refreshed for the new avatars, sand bubble, settings cogwheel, and contextual chips. Color-tokens doc updated for the palette migration.

### 8 May

A long backlog grooming session that produced two library entries, a new field note, and a restyle of the backlog page itself.

- **Field note: Three defenses against confabulation**: write-up of the wiki eval's truth-verification architecture (Defense A refusal on weak retrieval, Defense B per-claim LLM-as-judge verification, offline aggregate eval). Generated from the internal `TRUTH-AND-VERIFICATION.md` doc.
- **Two research papers added to the library**: Dingemanse 2026 "Interactional foundations for critical AI literacies" and Cheng et al "Metaphors of AI indicate that people increasingly perceive AI as warm and human-like". Both with structured `## Summary` body and full TAO enrichment. Two pending PDF stubs cleared from the inbox.
- **Backlog grooming**: 16 active items, 30+ archived. Items folded together where related: working-tree housekeeping into Karpathy cleanup; topic + tag cleanup into ontology research; eval baseline into admin dashboard; themes-as-prompts into chatbot.
- **Visual backlog restyle at `/backlog`**: ball emojis (🟡🔵🟠✅) replaced by colour-coded text pills using the earth-tone palette (moss / bronze / neutral / terracotta). Card-style typography for h2/h3, bordered blockquotes for opening messages, code spans on cream.
- **Garden ops kanban parser fix**: the kanban at `/toolshed/` was parsing the old emoji format and silently empty after the backlog rewrite. Parser now matches `[STATUS]` text directly. Counts: READY 10, IN PROGRESS 4, PARKED 3, DONE 8.

### 10 May

Wired the chatbot up to Langfuse, merged the two bots into a single panel with a mode toggle, repointed retrieval to the live garden, and pushed the auto-tag coverage on field-notes and library way up.

- **Langfuse tracing for ask + chat**: every `/api/ask` and `/api/chat` request opens a trace in Langfuse with a hashed user id, a frontend-minted session id, retrieval debug as a span, and the generation linked to the exact prompt version. Both bots tagged so they can be filtered and compared in the UI.
- **Prompt management in Langfuse**: system prompts (`ask-system-prompt-v1`, `garden-system-prompt-v0-2`, plus older variants) now live under a `garden/` folder in Langfuse. Pulled at runtime with a 60-second cache and the `.md` files in the repo as fallback. A small CLI seeds them: `python tools/karpathy-wiki/tools/sync_prompts_to_langfuse.py`.
- **Mode toggle in the chat panel**: a "This page / The garden" segmented control in the panel header switches between the per-page chat bot and the RAG ask bot. Each mode keeps its own thread, ask mode renders inline citation chips and a collapsible sources block above each reply, the textarea form surfaces in ask mode while pebbles return for chat.
- **Ask bot reads the live garden**: retrieval no longer reads from the frozen `tools/karpathy-wiki/raw/` snapshot (3 weeks stale, 3 collections). It reads `src/content/<section>/` directly across 8 collections (articles, field-notes, seeds, jottings, weblinks, library, experiments, videos), filters drafts and compost. Corpus jumped from ~85 to 281 items.
- **Auto-tagged 3 published field-notes**: `conference-talk-guildford` (project hub), `beyond-anthropomorphism-reading-notes`, `masure-acentric-design-reading-notes`. 14 new associations, 8 new topics (clifford-nass, interface-metaphor, acentric-design, hyper-anthropomorphism, etc.). Field-notes coverage 72% → 81%.
- **Auto-tagged 45 library entries**: 8 with substantive bodies got full TAO (Mitchell, Criado Perez, McCulloch, Kahneman, Kirk, Turkle, Corbett, Bear), and 37 description-only stubs got a single `(author, theorised-by, topic)` association where their existing tags mapped to a known graph topic. Library coverage 4% → 44%. 58 new topics across both passes (authors + concepts like dual-process-theory, machine-consciousness, gender-data-gap, classical-rhetoric).

### 11 May

The first IRL Convoclub event got its own landing page at maaike.ai/convoclubirl, with the Convoclub cat front and centre.

- **Convoclub IRL event page**: Standalone Astro page at `/convoclubirl` for the 17 June 2026 in-person meetup at the University of Surrey. Bypasses the garden's earth-tone chrome and ships its own fuchsia and plum palette and Convoclub branding. Two-column intro and news sidebar, condensed schedule, and Luma registration embed.
- **Hero, palette, date prominence**: Started white, settled on a fuchsia hero with the Convoclub cat in a white circular badge. "Wednesday 17 June 2026" stacked prominently above the location. Hero height tuned down after the first pass.

### 12 May

A full HTML cleanup and SEO sweep on the event page, plus the first AI-friendly structured data on the garden.

- **Deeper magenta palette**: Swapped the fluorescent fuchsia (`#D6006C`) for a deeper magenta (`#B01778`) to match the existing Convoclub assets. Regenerated the Open Graph social card in white and pink on fuchsia, no black.
- **First structured data on the garden**: Added schema.org `Event` JSON-LD (start and end times, location, organizer, free `Offer`) and `FAQPage` JSON-LD with six visible Q&A pairs at the bottom of the page. Eligible for rich results in Google and AI Overviews.
- **GEO with llms.txt**: Created `public/llms.txt` following the [llms.txt convention](https://llmstxt.org/): site summary, featured event block, list of garden collections, attribution guidance for LLM-generated answers. Picked up immediately by Claude, ChatGPT browsing mode, and Perplexity.
- **Head metadata extras**: Canonical link, `og:site_name`, `og:locale`, `theme-color`, `og:image:alt`, `author` meta, plus a permissive per-page Content Security Policy scoped to allow only Luma on this page.
- **Accessibility polish**: Skip-to-content link, `:focus-visible` outlines on every interactive element, `lang="nl"` tags on Dutch strings (CTA, signoff), 44px minimum tap target on every FAQ summary for mobile WCAG. Removed duplicate `</svg>`, simplified the logo wrapper, dropped redundant ARIA attributes on the iframe, added `loading="lazy"` and explicit dimensions on the logo to prevent layout shift.
- **Google Search Console verification**: Verification file at both site root and under `/convoclubirl/` so URL-prefix and domain-level properties both verify with the same file. Page is now ready for indexing and rich-results testing.

## Related

- [[digital-garden-history|The History of Digital Gardens]]
- [[saga-knowledge-platform|Saga: a platform for continuous construction and serving of knowledge at scale]]
