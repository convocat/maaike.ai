# Start eval

Start the wiki eval dashboard stack and open it in the browser.

## What this does

Runs `scripts/eval-dev.sh` to boot the wiki server (port 8780) and the static server (port 8782). If anything is already listening on those ports, the script kills it first. After both are up, opens the dashboard in the default browser.

## Step 1: Start the stack

Run the canonical start command:

```bash
bash scripts/eval-dev.sh
```

Wait for the green "Stack is up" message. If it fails, read the error — the script names exactly what went wrong.

## Step 2: Verify health

Check the wiki reports its feature flags:

```bash
curl -s http://localhost:8780/api/health
```

Expect `retrieval_debug: true`, `verify_api: true`, `refuse_weak_retrieval: true`, `stack_control: true`. If any are missing, the serve.py running is out of date — run `/start-eval` again (the script kills before starting).

## Step 3: Open the dashboard

Tell Maaike the stack is up and give her the clickable URL:

```
http://localhost:8782/eval.html
```

Also mention the three doc pages if she wants them:

- Manual: http://localhost:8782/manual.html
- Methodology: http://localhost:8782/methodology.html
- Truth report: http://localhost:8782/truth-report.html

## Notes

- Memory rule: always show the clickable URL, not "it's visible in the preview panel" alone.
- If Maaike wants a one-click launch outside of Claude, tell her: `scripts/start-eval.bat` can be pinned to her taskbar.
- Use `/stop-eval` to shut down.
