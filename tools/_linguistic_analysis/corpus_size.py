"""Corpus size metrics."""
import json, datetime
from pathlib import Path
from collections import defaultdict

HERE = Path(__file__).parent
recs = [json.loads(l) for l in open(HERE / "corpus.jsonl", encoding="utf-8")]

# Filter out automation-injected pseudo-user turns for a "human turns" count
def is_automation(t):
    return ("<scheduled-task" in t or "<task-notification>" in t or
            "This session is being continued from a previous conversation" in t)

human = [r for r in recs if not is_automation(r["text"])]

ts = [datetime.datetime.fromisoformat(r["ts"].replace("Z","+00:00")) for r in recs if r.get("ts")]
ts.sort()
start, end = ts[0], ts[-1]
span = end - start

days = sorted(set(t.date() for t in ts))
sessions = set((r["project"], r["session"]) for r in recs)

# active hours: sum of within-session active time (gap<30min counts as continuous)
by_sess = defaultdict(list)
for r in recs:
    if r.get("ts"):
        by_sess[(r["project"], r["session"])].append(
            datetime.datetime.fromisoformat(r["ts"].replace("Z","+00:00")))
active = datetime.timedelta()
GAP = datetime.timedelta(minutes=30)
for k, times in by_sess.items():
    times.sort()
    for a, b in zip(times, times[1:]):
        d = b - a
        if d <= GAP:
            active += d

words = sum(len(r["text"].split()) for r in human)
chars = sum(len(r["text"]) for r in human)

print(f"Start date          : {start.date()} ({start.strftime('%A')}), first turn {start.strftime('%H:%M')} UTC")
print(f"End date            : {end.date()} ({end.strftime('%A')}), last turn {end.strftime('%H:%M')} UTC")
print(f"Calendar span       : {span.days} days ({span.days/7:.1f} weeks)")
print(f"Distinct active days: {len(days)}")
print(f"Sessions (w/ user txt): {len(sessions)}")
print(f"Total user turns     : {len(recs)}")
print(f"  human-typed turns  : {len(human)}")
print(f"  automation turns   : {len(recs)-len(human)}")
print(f"Active engaged time  : ~{active.total_seconds()/3600:.1f} hours (gaps <30min counted)")
print(f"Human words typed    : {words:,} (~{chars:,} chars)")
print(f"Avg turns / session  : {len(recs)/len(sessions):.1f}")
print(f"Avg turns / active day: {len(recs)/len(days):.1f}")
