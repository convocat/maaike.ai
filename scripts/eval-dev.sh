#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# eval-dev.sh — the ONLY way to start the eval stack.
#
# Starts:
#   - Wiki server (serve.py) on WIKI_PORT (default 8780)
#   - Static file server for eval.html on STATIC_PORT (default 8782)
#
# Guarantees:
#   1. Kills any existing listeners on those ports BEFORE starting.
#   2. Verifies each server is healthy BEFORE returning.
#   3. Uses python3 explicitly (avoids PATH issues on Git Bash).
#   4. Prints exact URLs to open.
#   5. Self-tests /api/health on the wiki to confirm trace features.
#   6. Exits non-zero on any step that fails — no silent zombies.
#
# Usage:
#   bash scripts/eval-dev.sh           # start everything
#   bash scripts/eval-dev.sh --stop    # kill everything
#   bash scripts/eval-dev.sh --check   # verify state without starting
# ─────────────────────────────────────────────────────────────────────────

set -u  # undefined variable is an error

WIKI_PORT="${WIKI_PORT:-8780}"
STATIC_PORT="${STATIC_PORT:-8782}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WIKI_DIR="$REPO_ROOT/tools/karpathy-wiki"
PIDFILE_WIKI="$WIKI_DIR/.wiki-server.pid"
PIDFILE_STATIC="$WIKI_DIR/.static-server.pid"

# Prefer python3, fall back to python. Error loudly if neither works.
if command -v python3 >/dev/null 2>&1; then PY=python3
elif command -v python  >/dev/null 2>&1; then PY=python
else echo "ERROR: neither python3 nor python found in PATH" >&2; exit 1
fi

log()  { printf "\033[1;35m[eval-dev]\033[0m %s\n" "$*"; }
ok()   { printf "\033[1;32m[eval-dev] ✓\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[eval-dev] !\033[0m %s\n" "$*"; }
err()  { printf "\033[1;31m[eval-dev] ✗\033[0m %s\n" "$*" >&2; }

kill_port() {
  local port="$1"
  # Windows netstat + taskkill. Git Bash forwards these fine.
  local pids
  pids=$(netstat -ano 2>/dev/null | grep ":$port " | grep LISTENING | awk '{print $NF}' | sort -u)
  if [[ -z "$pids" ]]; then return 0; fi
  for pid in $pids; do
    taskkill //F //PID "$pid" >/dev/null 2>&1 && ok "killed PID $pid on port $port" || warn "could not kill PID $pid"
  done
  sleep 1
}

port_free() {
  local port="$1"
  ! netstat -ano 2>/dev/null | grep ":$port " | grep -q LISTENING
}

wait_http() {
  local url="$1" label="$2" attempts=20
  for i in $(seq 1 "$attempts"); do
    if curl -s -m 2 "$url" >/dev/null 2>&1; then
      ok "$label responding at $url"
      return 0
    fi
    sleep 0.3
  done
  err "$label did not respond at $url after $attempts tries"
  return 1
}

stop_all() {
  log "Stopping eval stack"
  kill_port "$WIKI_PORT"
  kill_port "$STATIC_PORT"
  rm -f "$PIDFILE_WIKI" "$PIDFILE_STATIC"
  ok "stopped"
}

check_state() {
  log "Checking state"
  local wiki_up=0 static_up=0
  if curl -s -m 2 "http://localhost:$WIKI_PORT/api/health" >/dev/null 2>&1; then
    wiki_up=1
    local h; h=$(curl -s -m 2 "http://localhost:$WIKI_PORT/api/health")
    ok "wiki alive on $WIKI_PORT — $h"
  else
    warn "wiki NOT responding on $WIKI_PORT"
  fi
  if curl -s -m 2 "http://localhost:$STATIC_PORT/eval.html" >/dev/null 2>&1; then
    static_up=1
    ok "static server alive on $STATIC_PORT"
  else
    warn "static server NOT responding on $STATIC_PORT"
  fi
  [[ $wiki_up == 1 && $static_up == 1 ]] && return 0 || return 1
}

start_all() {
  log "Starting eval stack (python=$PY, wiki_port=$WIKI_PORT, static_port=$STATIC_PORT)"

  # 1. Clear both ports
  kill_port "$WIKI_PORT"
  kill_port "$STATIC_PORT"

  port_free "$WIKI_PORT"   || { err "port $WIKI_PORT still occupied";   exit 1; }
  port_free "$STATIC_PORT" || { err "port $STATIC_PORT still occupied"; exit 1; }

  # 2. Start wiki server in background, redirect logs
  cd "$WIKI_DIR"
  nohup "$PY" tools/serve.py > "$WIKI_DIR/.wiki-server.log" 2>&1 &
  echo $! > "$PIDFILE_WIKI"
  log "wiki server PID $(cat "$PIDFILE_WIKI") — log: .wiki-server.log"

  # 3. Start static file server
  nohup "$PY" -m http.server "$STATIC_PORT" --directory "$WIKI_DIR" > "$WIKI_DIR/.static-server.log" 2>&1 &
  echo $! > "$PIDFILE_STATIC"
  log "static server PID $(cat "$PIDFILE_STATIC") — log: .static-server.log"

  # 4. Health gates — exit loudly if either fails
  wait_http "http://localhost:$WIKI_PORT/api/health"    "wiki"   || { tail "$WIKI_DIR/.wiki-server.log";   exit 1; }
  wait_http "http://localhost:$STATIC_PORT/eval.html"   "static" || { tail "$WIKI_DIR/.static-server.log"; exit 1; }

  # 5. Verify wiki has trace features
  local features; features=$(curl -s "http://localhost:$WIKI_PORT/api/health" | grep -o '"retrieval_debug": *true' || true)
  if [[ -z "$features" ]]; then
    err "wiki is up but retrieval_debug feature is MISSING — old build?"
    exit 1
  fi
  ok "wiki reports retrieval_debug: true"

  # 6. Summary
  echo
  ok "Stack is up."
  echo "   Dashboard:   http://localhost:$STATIC_PORT/eval.html"
  echo "   Wiki API:    http://localhost:$WIKI_PORT/api/ask"
  echo "   Health:      http://localhost:$WIKI_PORT/api/health"
  echo "   Stop with:   bash scripts/eval-dev.sh --stop"
  echo
}

case "${1:-}" in
  --stop)  stop_all ;;
  --check) check_state ;;
  *)       start_all ;;
esac
