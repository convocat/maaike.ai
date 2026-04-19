# Karpathy wiki — schema

This is an LLM-maintained wiki compiled from Maaike's digital garden content. It follows Andrej Karpathy's LLM knowledge base pattern: raw sources are ingested and compiled into a structured markdown wiki by an LLM. The human (Maaike) does not write wiki pages directly. The LLM writes and maintains them.

This wiki is an experiment: applying Karpathy's approach to Maaike's own published content, to see what it surfaces.

---

## Directory structure

```
raw/
  articles/        Non-draft articles from the garden (47 files)
  field-notes/     Non-draft field notes (25 files)
  seeds/           Non-draft seeds (18 files)
  triples.json     Semantic triples extracted from articles
  taxonomy.json    Garden taxonomy
  themes.json      Themes per article

wiki/
  concepts/        One page per major concept or topic
  people/          One page per person mentioned
  entities/        Tools, frameworks, organisations
  index.md         Full content catalog
  _log.md          Append-only ingest + maintenance log

tools/             Helper scripts (search, lint, etc.)
```

---

## Wiki page format

Every wiki page uses this structure:

```markdown
# [Concept name]

**Type:** concept | person | entity | theme
**First seen:** [date of earliest raw source mentioning this]
**Last updated:** [date of most recent ingest touching this page]

## Summary
[2-4 sentence summary of what this concept means in Maaike's thinking]

## How Maaike uses this concept
[What she argues, questions, or explores in relation to this concept]

## Appearances
- [article-slug](../raw/articles/filename.md) — [one-line note on how it appears]
- ...

## Related concepts
- [[concept-name]] — [relationship type and brief note]
- ...

## Open questions
[Questions that emerge from reading the sources — things not yet resolved]
```

---

## Ingest workflow

When ingesting a new source file:

1. Read the file fully.
2. Identify all concepts, people, and entities mentioned.
3. For each: find or create a wiki page in the appropriate subfolder.
4. Update the page: add to Appearances, update Summary if new information changes it, add new Related concepts.
5. Update `wiki/index.md` if new pages were created.
6. Append a log entry to `wiki/_log.md`.

Format for log entries:
```
## [date] — Ingest: [filename]
- Pages updated: [list]
- Pages created: [list]
- Notes: [anything unusual or interesting]
```

---

## Lint rules

Run a lint pass periodically to:
- Find concepts mentioned in Appearances but with no wiki page (orphan references)
- Find wiki pages with only one Appearance entry (candidate for merging)
- Find contradictions between Summary statements across pages
- Suggest new pages for concepts that appear in 3+ sources but have no dedicated page

---

## Seed data

The following structured data from the garden is available in `raw/` and should be used to bootstrap wiki pages:

- `triples.json` — subject/predicate/object semantic relationships extracted from articles. Use these to populate Related concepts sections.
- `taxonomy.json` — structured classification of topics. Use as a map of the concept space.
- `themes.json` — per-article theme statements. Use to populate How Maaike uses this concept sections.

---

## Scope

This wiki covers Maaike's published thinking only. It does not import external sources. The question it answers: what does Maaike's body of work actually say, and what connects?
