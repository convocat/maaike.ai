# Prep dashboard

A four-pane workspace for preparing a talk: search the garden, collect cards into a project, take notes, and order them into a narrative outline.

## Run

```
python tools/prep-dashboard/server.py
```

Then open:

```
http://localhost:8901/?project=conference-talk-guildford
```

The `project` query parameter is the slug of a field-note hub. Default is `conference-talk-guildford`. Open with any other slug for a fresh, separate workspace; state lives in `tools/prep-dashboard/data/<slug>.json` (gitignored).

## Panes

1. **Search** — title, description, tags, body across all 8 published collections. Filter by collection chips.
2. **Selected cards** — the project's content shortlist. Drag to reorder, click to open, × to remove. "Sync to hub" writes the picks as wiki-links into the hub post (no commit).
3. **Notes** — free-form scratchpad. Autosaves.
4. **Outline** — drag cards in (via "→ outline" button on each card) and add free notes. Drag to reorder. This is the narrative.

All four panes autosave to the sidecar JSON.

## Sync to hub

Click "Sync to hub" in the cards pane. Writes a `## Talk picks` section to `src/content/field-notes/<project>.md` with `[[slug|title]]` links for each card. Edits the file in place; does not commit. Re-running replaces the existing block.
