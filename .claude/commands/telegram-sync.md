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

Report what arrived:
- New inbox notes: show date + text
- New weblinks: show title + URL

If nothing new: say so clearly.

## Step 4: Offer next steps

- For inbox notes: offer to turn them into posts (use `/new-post`)
- For weblinks: offer to review and publish them (use `/publish`)
