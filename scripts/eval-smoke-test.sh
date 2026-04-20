#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────
# eval-smoke-test.sh — verify the eval stack is fully wired.
#
# Runs a battery of checks that would have caught every failure today:
#   1. /api/health returns retrieval_debug: true
#   2. /api/ask returns a debug event with breakdown/fired_triples
#   3. Only ONE process listens on each port (no zombies)
#   4. Static server serves eval.html with the expected markers
#   5. Wiki and static servers are using fresh code (version check)
#
# Exit code 0 = all green. Non-zero = which check failed is printed.
#
# Usage:
#   bash scripts/eval-smoke-test.sh
# ─────────────────────────────────────────────────────────────────────────

set -u

WIKI_PORT="${WIKI_PORT:-8780}"
STATIC_PORT="${STATIC_PORT:-8782}"

FAIL=0
pass() { printf "\033[1;32m  ✓\033[0m %s\n" "$*"; }
fail() { printf "\033[1;31m  ✗\033[0m %s\n" "$*"; FAIL=$((FAIL+1)); }

echo "── Smoke test: eval stack"

# 1. Only one listener per port
echo
echo "[1/5] Port uniqueness"
w=$(netstat -ano 2>/dev/null | grep ":$WIKI_PORT " | grep LISTENING | wc -l | tr -d ' ')
s=$(netstat -ano 2>/dev/null | grep ":$STATIC_PORT " | grep LISTENING | wc -l | tr -d ' ')
[[ "$w" == "1" ]] && pass "wiki port $WIKI_PORT: exactly 1 listener" || fail "wiki port $WIKI_PORT: $w listeners (expected 1) — zombies?"
# Static server sometimes binds IPv4 + IPv6, allow 1 or 2
[[ "$s" == "1" || "$s" == "2" ]] && pass "static port $STATIC_PORT: $s listener(s)" || fail "static port $STATIC_PORT: $s listeners"

# 2. Health endpoint + feature flags
echo
echo "[2/5] Wiki /api/health"
health=$(curl -s -m 5 "http://localhost:$WIKI_PORT/api/health" 2>/dev/null || echo "")
if [[ -z "$health" ]]; then
  fail "wiki /api/health did not respond"
else
  echo "  response: $health"
  echo "$health" | grep -q '"status": *"ok"' && pass "status ok" || fail "status not ok"
  echo "$health" | grep -q '"retrieval_debug": *true' && pass "retrieval_debug feature flagged true" || fail "retrieval_debug missing/false"
fi

# 3. /api/ask returns debug trace
echo
echo "[3/5] Wiki /api/ask streams debug event"
ask=$(curl -s -m 30 -X POST "http://localhost:$WIKI_PORT/api/ask" \
  -H "Content-Type: application/json" \
  -d '{"question":"What does Maaike mean by the articulation barrier?"}' 2>/dev/null || echo "")
if [[ -z "$ask" ]]; then
  fail "/api/ask did not respond"
else
  echo "$ask" | grep -q '"type": *"debug"' && pass "debug event present" || fail "no debug event in ndjson"
  echo "$ask" | grep -q '"breakdown":' && pass "breakdown in trace" || fail "breakdown missing"
  echo "$ask" | grep -q '"fired_triples":' && pass "fired_triples in trace" || fail "fired_triples missing"
  echo "$ask" | grep -q '"matched_themes":' && pass "matched_themes in trace" || fail "matched_themes missing"
fi

# 4. Static server serves eval.html with current markers
echo
echo "[4/5] Static /eval.html served"
page=$(curl -s -m 5 "http://localhost:$STATIC_PORT/eval.html" 2>/dev/null || echo "")
if [[ -z "$page" ]]; then
  fail "eval.html did not load"
else
  echo "$page" | grep -q 'id="eval-sections"' && pass "eval.html has current layout (eval-sections div)" || fail "eval.html is stale (no eval-sections div)"
  echo "$page" | grep -q 'checkHealth' && pass "eval.html has health-check logic" || fail "eval.html missing checkHealth"
  echo "$page" | grep -q 'fired_triples' && pass "eval.html handles fired_triples" || fail "eval.html does not handle fired_triples"
fi

# 5. Verify endpoint + refusal flag in health
echo
echo "[5/7] Truth-defense endpoints"
echo "$health" | grep -q '"verify_api": *true' && pass "verify_api feature flagged" || fail "verify_api feature missing"
echo "$health" | grep -q '"refuse_weak_retrieval": *true' && pass "refuse_weak_retrieval feature flagged" || fail "refuse_weak_retrieval feature missing"
v=$(curl -s -m 30 -X POST "http://localhost:$WIKI_PORT/api/verify" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is the articulation barrier?","answer":"The articulation barrier is a usability threshold when prompting.","source_slugs":["conversational-interfaces-are-not-easy"]}' 2>/dev/null || echo "")
echo "$v" | grep -q '"verified":' && pass "/api/verify returns structured claim buckets" || fail "/api/verify response malformed"

# 6. Dead DOM references — JS must not call getElementById on IDs not in the HTML
echo
echo "[6/7] Dead DOM references in eval.html"
eval_file="$(cd "$(dirname "$0")/.." && pwd)/tools/karpathy-wiki/eval.html"
# Extract every id="..." and every getElementById('...') / getElementById("...")
ids_html=$(grep -oE 'id="[a-zA-Z0-9_-]+"' "$eval_file" | sort -u)
# Only look for getElementById('foo') where closing quote is followed by ')' —
# skip dynamic lookups like getElementById('foo-' + id).
ids_js=$(grep -oE "getElementById\(['\"][a-zA-Z0-9_-]+['\"]\)" "$eval_file" | grep -oE "['\"][a-zA-Z0-9_-]+['\"]" | tr -d "'\"" | sort -u)
dead=0
for id in $ids_js; do
  if ! echo "$ids_html" | grep -q "\"$id\""; then
    fail "getElementById('$id') has no matching id=\"$id\" in HTML"
    dead=$((dead+1))
  fi
done
[[ "$dead" == "0" ]] && pass "all getElementById calls reference existing DOM IDs"

# 7. End-to-end: dashboard's POV
echo
echo "[7/7] End-to-end: cross-origin /api/ask from static → wiki"
# This exercises CORS, the same path the browser uses
cors=$(curl -s -m 5 -H "Origin: http://localhost:$STATIC_PORT" -X OPTIONS "http://localhost:$WIKI_PORT/api/ask" -i | grep -i "access-control-allow-origin" || echo "")
[[ -n "$cors" ]] && pass "CORS header present: $cors" || fail "CORS preflight did not return Access-Control-Allow-Origin"

echo
if [[ "$FAIL" == "0" ]]; then
  printf "\n\033[1;32m══ ALL GREEN ══\033[0m\n"
  exit 0
else
  printf "\n\033[1;31m══ %d CHECK(S) FAILED ══\033[0m\n" "$FAIL"
  exit 1
fi
