# Stop eval

Shut down the wiki eval dashboard stack.

## Step 1: Stop the stack

```bash
bash scripts/eval-dev.sh --stop
```

Kills the wiki server on 8780 and the static server on 8782. Removes the pid files.

## Step 2: Confirm ports are free

```bash
netstat -ano | grep -E ":878[02] " | grep LISTENING || echo "ports clear"
```

Expect "ports clear".

## Notes

- Running Run or Verify in the dashboard after this will fail until the stack is started again.
- Use `/start-eval` to boot back up.
