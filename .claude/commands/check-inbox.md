# Check inbox

Sync from Telegram, enrich any new drafts, then open the local admin dashboard so Maaike can review them in her browser.

## What this does

End-to-end review pipeline:

1. Run `/telegram-sync` (triggers the GitHub workflow, waits for completion, pulls, then runs `/ingest-source` on each new draft weblink so it's enriched before review).
2. Start the Flask reviewer in [tools/admin/server.py](tools/admin/server.py) on port 8900 if it's not already up.
3. Hand Maaike the dashboard URL and the count of drafts waiting.

Why this skill drives the sync (not the dashboard's "Sync Telegram" button): the GitHub workflow intentionally does not auto-tag — enrichment must happen in a Claude Code session, not via API ([memory/feedback_no_api_for_enrichment.md](C:/Users/mgroe/.claude/projects/C--Sharing-Maaike-Digital-Garden/memory/feedback_no_api_for_enrichment.md)). So the button alone leaves drafts un-enriched. This skill closes that loop.

This is **not** the `src/content/_inbox/` folder (persistent text notes) — different workflow.

## Step 1: Sync + enrich new drafts

Invoke `/telegram-sync`. It handles: workflow dispatch → polling → `git pull` → process PDF stubs → run `/ingest-source` on each new draft weblink.

When it returns, every **new** draft should have triples in its frontmatter and an entry in `src/data/triples.json`.

## Step 2: Backfill un-enriched drafts

`/telegram-sync` only enriches drafts that arrived in this run. Earlier runs (or button-only triggers from the dashboard) may have left drafts behind with `triples: []`. Find them:

```bash
python -c "
import re, sys, pathlib
for p in pathlib.Path('src/content/weblinks').glob('*.md'):
    t = p.read_text(encoding='utf-8')
    fm = re.match(r'^---\s*\n(.*?)\n---', t, re.DOTALL)
    if not fm: continue
    body = fm.group(1)
    if 'draft: true' not in body: continue
    if re.search(r'^triples:\s*\n\s*-\s', body, re.MULTILINE): continue
    if re.search(r'^triples:\s*\[.+\]', body, re.MULTILINE): continue
    print(p.stem)
"
```

For each slug printed, run `/ingest-source` with the URL from its frontmatter. This is the same enrichment path `/telegram-sync` uses; the only difference is we're running it on drafts that already exist on disk rather than ones that just arrived.

If the list is empty, skip to Step 3.

## Step 3: Start the dashboard server (if needed)

Check first:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8900/api/inbox
```

If it returns `200`, skip to Step 3.

Otherwise start in the background:

```bash
python tools/admin/server.py
```

Then poll until ready:

```bash
until curl -s -o /dev/null -w "%{http_code}" http://localhost:8900/api/inbox | grep -q 200; do sleep 1; done
```

If it fails to start, read the error — likely a missing dependency (`flask`, `pyyaml`, `requests`) or a port conflict on 8900.

## Step 4: Report and hand over

Count only the unprocessed drafts. `/api/inbox` returns drafts **plus** already-published weblinks (greyed out in the UI for situational awareness), so filter on `processed: false`:

```bash
curl -s http://localhost:8900/api/inbox | python -c "import sys,json; d=json.load(sys.stdin); n=sum(1 for x in d if not x.get('processed')); print(f'{n} draft(s) to review ({len(d)} total in feed)')"
```

Then give her the clickable URL:

```
http://localhost:8900/
```

## Notes

- Memory rule: always show the clickable URL, not "it's visible in the preview panel" alone.
- The dashboard commits and pushes on approve/dismiss — Maaike's actions in the UI are real writes to `main`. No extra confirmation needed; that's the whole point of the review UI.
- If `/telegram-sync` reports nothing new, skip straight to Step 2 — the inbox may still contain older un-reviewed drafts.
