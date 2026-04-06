# Telegram sync

Trigger the Telegram sync workflow and surface any new captures.

## Step 1: Trigger the workflow

Call the GitHub API to trigger the `telegram-sync.yml` workflow dispatch:

```bash
curl -s -X POST \
  -H "Authorization: token $(git credential fill <<< $'protocol=https\nhost=github.com' | grep password | cut -d= -f2)" \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Content-Type: application/json" \
  https://api.github.com/repos/convocat/maaike.ai/actions/workflows/telegram-sync.yml/dispatches \
  -d '{"ref":"main"}'
```

## Step 2: Wait for completion

Poll the workflow runs every 5 seconds until the latest `telegram-sync` run is no longer `in_progress`:

```bash
curl -s -H "Authorization: token <TOKEN>" \
  "https://api.github.com/repos/convocat/maaike.ai/actions/runs?per_page=5" \
  | python3 -c "import json,sys; runs=[r for r in json.load(sys.stdin)['workflow_runs'] if 'telegram' in r['name'].lower()]; print(runs[0]['status'], runs[0]['conclusion'] or '')"
```

Wait up to 60 seconds. If it times out, report that and continue.

## Step 3: Pull and surface results

```bash
git pull
```

Then check for new content:
- Read `src/content/_inbox/telegram.md` — show any entries added today
- Check `git log --oneline -3` for new weblink files committed by the sync
- Check `src/content/files/` for any new PDF stubs (files other than `.gitkeep`)

Report what arrived:
- New inbox notes: show date + text
- New weblinks: show title + URL
- New PDF stubs: show filename

## Step 4: Process PDF stubs

For each new stub in `src/content/files/`:

1. **Read the stub** to get the `file:` path (e.g. `/pdfs/filename.pdf`).

2. **Match to library**: search `src/content/library/` for an entry whose `title` or `author` closely matches the PDF filename. Read candidate files to confirm.

3. **Generate AI summary**: read the PDF at `public/pdfs/filename.pdf` and produce a 2-3 sentence summary of what the paper argues.

4. **If match found**: update the library entry:
   - Add `file: /pdfs/filename.pdf`
   - Set `status: read`
   - Set `maturity: complete`
   - Set `ai: "100% Maai"`
   - If `description` is thin or generic, replace it with the AI summary

5. **If no match**: create a new library entry in `src/content/library/` with:
   - `title`: extracted from PDF content or filename
   - `author`: extracted from PDF content or filename
   - `date`: today
   - `status: read`
   - `maturity: complete`
   - `ai: "100% Maai"`
   - `description`: AI summary
   - `file: /pdfs/filename.pdf`
   - `genre: research-paper` (or adjust based on content)
   - `book_type: non-fiction`

6. **Delete the stub** from `src/content/files/`.

7. Show Maaike what was created or updated before committing.

## Step 5: Offer next steps

- For inbox notes: offer to turn them into posts (use `/new-post`)
- For weblinks: offer to review and publish them (use `/publish`)
- For PDF library updates: commit if Maaike approves
