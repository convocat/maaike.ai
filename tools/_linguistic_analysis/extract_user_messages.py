"""Extract genuine user-typed messages from Claude Code transcripts."""
import json, os, re, sys
from pathlib import Path

ROOT = Path(r"C:\Users\mgroe\.claude\projects")
OUT = Path(__file__).parent / "corpus.jsonl"

def is_noise(text):
    t = text.strip()
    if not t:
        return True
    # caveat / system-injected
    if t.startswith("Caveat:"): return True
    if t.startswith("<command-name>") or t.startswith("<command-message>"): return True
    if t.startswith("<local-command"): return True
    if t.startswith("<system-reminder>"): return True
    if t.startswith("[Request interrupted"): return True
    return False

records = []
for proj in ROOT.iterdir():
    if not proj.is_dir(): continue
    for f in proj.glob("*.jsonl"):
        session_id = f.stem
        try:
            with open(f, encoding="utf-8") as fh:
                for line in fh:
                    try:
                        d = json.loads(line)
                    except Exception:
                        continue
                    if d.get("type") != "user": continue
                    if d.get("isMeta"): continue
                    msg = d.get("message", {})
                    content = msg.get("content")
                    texts = []
                    if isinstance(content, str):
                        texts.append(content)
                    elif isinstance(content, list):
                        for c in content:
                            if isinstance(c, dict) and c.get("type") == "text":
                                texts.append(c.get("text", ""))
                    for t in texts:
                        # strip system-reminder blocks embedded in text
                        t2 = re.sub(r"<system-reminder>.*?</system-reminder>", "", t, flags=re.S).strip()
                        if is_noise(t2): continue
                        # skip command output wrappers
                        if "<local-command-stdout>" in t2: continue
                        # skip slash-command expansions (they contain command-name tags)
                        if "<command-name>" in t2: continue
                        records.append({
                            "project": proj.name,
                            "session": session_id,
                            "ts": d.get("timestamp"),
                            "text": t2,
                        })
        except Exception as e:
            print(f"ERR {f}: {e}", file=sys.stderr)

records.sort(key=lambda r: r.get("ts") or "")
with open(OUT, "w", encoding="utf-8") as fh:
    for r in records:
        fh.write(json.dumps(r, ensure_ascii=False) + "\n")
print(f"{len(records)} user messages -> {OUT}")
# quick stats
from collections import Counter
c = Counter(r["project"] for r in records)
for k, v in c.most_common(): print(f"  {k}: {v}")
sess = Counter((r["project"], r["session"]) for r in records)
print(f"sessions with user text: {len(sess)}")
