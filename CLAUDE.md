# Maai & AI - Digital Garden

Personal digital garden for Maaike, deployed at **maaike.ai**. Built with Astro 5, static output, GitHub Pages.

## Quick start

```
npm install
npm run dev        # → localhost:4321
npm run build      # → dist/
```

Dev server config lives in `.claude/launch.json` (name: "digital-garden", port 4321).

## Architecture

Astro static site with 8 content collections, wiki-style cross-linking, and dual light/dark theme.

### Content collections (src/content/)

| Collection | Slug | Extra fields |
|---|---|---|
| Articles | `articles` | `pruning` (optional) |
| Field Notes | `field-notes` | - |
| Seeds | `seeds` | - |
| Weblinks | `weblinks` | `url` (required) |
| Videos | `videos` | `url` (required) |
| Library | `library` | `author`, `cover`, `status` (reading/read/to-read) |
| Experiments | `experiments` | - |
| Jottings | `jottings` | `type` (note/quote/event/link/post), `source` (optional), `page` (optional), `url` (optional) |

All collections share: `title`, `date`, `updated`, `maturity` (draft/developing/solid/complete), `tags[]`, `description`, `draft`, `ai`, `hub` (optional boolean), `develops` (optional slug string).

Content files are Markdown with YAML frontmatter. Draft items (`draft: true`) are filtered out at build time.

### Maturity system

4 stages visualized with plant emojis: 🌱 draft → 🌿 developing → 🪴 solid → 🌳 complete. Shown as an interactive track in PostLayout.

### Wiki links

`[[Page Title]]` syntax links across all collections. Configured in `astro.config.mjs` with remark-wiki-link. Hover previews show title + description (WikiLinkPreview component). Backlinks are computed and shown in post footers.

### Layouts

- **BaseLayout** → global CSS, ViewTransitions, dark mode persistence (`data-theme` on `<html>`)
- **PageLayout** → BaseLayout + Header + SketchyFilter + Footer + container
- **PostLayout** → PageLayout + post header (tags, collection label, title, maturity track) + prose content + backlinks

### Key directories

```
src/components/    Astro components
src/content/       Markdown content per collection
src/data/          settings.json (site titles, descriptions)
src/layouts/       BaseLayout, PageLayout, PostLayout
src/pages/         Route files ([...slug].astro per collection)
src/styles/        tokens.css (design tokens), global.css, fonts.css, utilities.css
src/utils/         collections.ts, backlinks.ts
```

## Design system

### Colors (src/styles/tokens.css)

- **Primary accent: `#D6006C` (hot pink)**. This is Maaike's company color. Do not change it.
- Secondary accent: `#0D7C66` (teal), dark mode: `#2DD4A8`
- Dark mode accent: `#FF4DA6` (bright pink variant of company color)
- Background: white (`#FFFFFF`) / dark (`#111111`)

### Typography

- Headings: Lora (serif), self-hosted variable font
- Body: Roboto (sans-serif), self-hosted variable font
- Code: JetBrains Mono

### Collection icons

Hand-drawn SVG icons per collection with earthy pastel stroke colors and a feTurbulence wobble filter (`SketchyFilter.astro`). Managed in `CollectionIcon.astro`. Each icon has light and dark mode stroke variants. Icons appear in:
- Homepage section headings
- Collection index page headings
- Post detail headers (as collection label)

Icon stroke palette (light, WCAG AA ≥3:1): articles=#7A5A48, field-notes=#4A7A50, seeds=#A07030, weblinks=#7A6048, videos=#6E4E68, library=#5A4E44, experiments=#3A7080, jottings=#4A5A7A. Dark mode: articles=#D4A88E, field-notes=#8ECF94, seeds=#E8C07A, weblinks=#D4B89E, videos=#C9A8C4, library=#BDB0A6, experiments=#7ECCD6, jottings=#9AAED4.

### AI transparency indicator

Optional `ai` frontmatter field on any content. Renders a styled aside box above the post content (in PostLayout). Four levels:
- `100% Maai`: fully written by Maaike, no AI
- `assisted`: her ideas/structure, AI helped refine
- `co-created`: written by AI based on her ideas and direction
- `generated`: fully AI-generated, reviewed by her
- No field: no box shown

### Spacing tokens

`--space-xs` (0.25rem) through `--space-3xl` (4rem). Max width: 65rem, content width: 42rem.

## Deployment

- Push to `main` triggers GitHub Actions → builds → deploys to GitHub Pages
- `publish.bat` is a convenience script for local git-add-commit-push
- GitHub workflow `share-link.yml` allows quick weblink creation via manual dispatch

## Git workflow

Everything goes directly to `main`. No branches. The Claude Code session itself is the editorial moment: Maaike reviews content before it's written to a file, and reviews the diff before it's committed.

### Exception: large experimental changes

For changes that shouldn't go near production until they're ready (redesigns, structural refactors), use a **git worktree** instead of a branch switch. This creates a second independent folder on disk so edits never bleed into main:

```bash
# Set up
git worktree add ../Digital-Garden-redesign redesign/my-feature

# Work in the worktree folder in a separate Claude session
# When done, merge and clean up:
git worktree remove ../Digital-Garden-redesign
```

Key rule: **never switch branches in the working directory without committing first** — uncommitted changes follow you across branch switches and will end up on the wrong branch.

### Content flow

| Content type | LinkedIn on publish |
|---|---|
| Articles | ✅ new only |
| Jottings | ✅ new only |
| Field notes, seeds, weblinks, projects | ❌ |

### Detecting new vs updated posts

GitHub Actions uses `git diff` to check file status. `A` (added) = new post, triggers LinkedIn. `M` (modified) = update, skips LinkedIn.

## Projects page rule

The Projects page (`/projects`) shows **only project hub posts** — the single post that defines what a project is. It filters by `hub: true` in frontmatter.

### Typed relations: `hub` and `develops`

The garden uses two frontmatter fields to express project structure:

- **`hub: true`** — marks a post as a project hub. It appears on the Projects page. Hub posts show a "Project files" sidebar listing all posts that link back to them via backlinks.
- **`develops: <slug>`** — marks a post as a file that belongs to a hub. The sidebar on that post shows a "Part of" link to the hub. A post can have both `hub: true` and `develops: <slug>` (a sub-project that is itself a hub within a larger project).

Example:
- `field-notes/book-recommender.md` → `hub: true` → appears on Projects page ✓
- `experiments/book-recommender-scoring-algorithm.md` → `develops: book-recommender` → shows "Part of: Book recommender" in sidebar ✓

**Never use the `project` tag to mark hubs or project files.** Use `hub: true` and `develops` instead. The `project` tag is no longer used for project structure.

## Adding content

```
npm run new    # interactive content creation script
```

Or create a `.md` file directly in the appropriate `src/content/<collection>/` folder with the required frontmatter.

## Interaction examples

See `.claude/interaction-examples.md` for a running log of great and meh exchanges. Use these as reference for tone, approach, and judgment.

When the thread nudge fires and Maaike responds with feedback about how the interaction felt, log it there immediately: date, topic, her words, and whether it was a great or meh exchange. Do not ask for clarification — just log what she said.

## Preferences

- **Commit author**: No Co-Authored-By line. Maaike is the sole author.
- Keep the hot pink (`#D6006C`). It's the company brand color
- Icons should feel hand-drawn and organic, not polished or geometric
- The site aesthetic is warm and personal, not corporate
- Maaike works in Dutch and English; site content is English
- **Never use em-dashes** (—) in content. Use colons, commas, or periods instead
- **Sentence case for titles**. Only capitalize the first word (and proper nouns/acronyms)
- **AI language rules**: Refer to yourself as "Claude", not "AI" or "I". Never use "write" for Claude's output, use "generate". Only Maaike writes. Claude generates.
- **ALWAYS let Maaike review content before writing it to a file**. Show her the draft first and wait for approval. This applies to all content: seeds, articles, field notes, descriptions, blurbs, anything that will be published on the site. Never write content directly without her sign-off.

## Content workflows

Use these skills for all content work:

| Task | Skill |
|------|-------|
| Write a new article or jotting | `/new-post` |
| Write a field note or seed | `/new-post` |
| Add a book | `/new-book` |
| Start a new project | `/new-project` |
| Add a file to a project | `/new-project-file` |
| Complete a project + generate report | `/complete-project` |
| Publish a post (validate + OG + deploy) | `/publish` |
| Share to LinkedIn | `/share-linkedin` (articles + jottings only) |

**`/publish` handles all housekeeping automatically** (validate, OG images, explore map, release notes). Do not run these manually unless debugging.

**Never commit articles or jottings directly with raw git commands.** Always use `/publish`. Raw commits skip enrichment checks, OG images, and LinkedIn. If a post arrives from outside `/new-post` (e.g. written in Typora and moved manually), run `/auto-tag` before `/publish`.

**Cross-session enrichment check.** When resuming a session and reading a handover, check any recently published articles for missing `triples`. If `triples: []`, the post was never auto-tagged — run `/auto-tag` before doing anything else.
