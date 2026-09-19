"""Quantitative stats + trimmed readable corpus."""
import json, re
from pathlib import Path
from collections import Counter, defaultdict

HERE = Path(__file__).parent
recs = [json.loads(l) for l in open(HERE / "corpus.jsonl", encoding="utf-8")]

DUTCH = set("""de het een en van ik je jij niet dat dit zijn maar voor naar ook nog wel even graag dus
deze die hier daar nu dan kan kun kunnen moet moeten wil willen maak doe gewoon echt heel erg goed
mooi prima oke oké ja nee misschien eerst daarna alvast bij met aan op om uit als wat hoe waarom
wanneer welke nieuwe oude tekst pagina hoeft alleen.""".split())
ENGLISH = set("""the a an and of i you not that this is are but for to also still please so these those
here there now then can could must should will would want make do just really very good nice ok okay
yes no maybe first after at with on in out if what how why when which new old text page only let's
add remove change update fix check show me it we don't can't won't""".split())

def lang(text):
    words = re.findall(r"[a-zA-Zéëï']+", text.lower())
    if not words: return "?", 0
    d = sum(w in DUTCH for w in words)
    e = sum(w in ENGLISH for w in words)
    if d == 0 and e == 0: return "?", len(words)
    if d > e * 1.2: return "nl", len(words)
    if e > d * 1.2: return "en", len(words)
    return "mix", len(words)

# per-week stats
weekly = defaultdict(lambda: Counter())
weekly_len = defaultdict(list)
for r in recs:
    ts = r["ts"][:10]
    week = ts[:8] + "wk"  # group by ~date; better: ISO week
    import datetime
    d = datetime.date.fromisoformat(ts)
    wk = f"{d.isocalendar()[0]}-W{d.isocalendar()[1]:02d}"
    L, n = lang(r["text"])
    weekly[wk][L] += 1
    weekly_len[wk].append(len(r["text"]))

print("WEEK | n | nl | en | mix | ? | medlen")
for wk in sorted(weekly):
    c = weekly[wk]; n = sum(c.values())
    lens = sorted(weekly_len[wk])
    print(f"{wk} | {n} | {c['nl']} | {c['en']} | {c['mix']} | {c['?']} | {lens[len(lens)//2]}")

# markers
markers = {
    "question": lambda t: "?" in t,
    "please": lambda t: re.search(r"\b(please|graag|alsjeblieft|aub)\b", t, re.I),
    "thanks": lambda t: re.search(r"\b(thanks|thank you|dank|bedankt|thnx|thx)\b", t, re.I),
    "greeting": lambda t: re.search(r"^(hi|hoi|hey|hallo|goedemorgen|morning|good morning)\b", t.strip(), re.I),
    "negation_correction": lambda t: re.search(r"^(no\b|nee\b|not\b|niet\b|stop\b|wait\b|wacht\b|hm+\b|hmm)", t.strip(), re.I),
    "yes_approve": lambda t: re.search(r"^(yes|ja|ok|oke|oké|okay|prima|go|goed|perfect|mooi|top|great|nice|akkoord|doe maar|yep|yes please)\b", t.strip(), re.I),
    "exclam": lambda t: "!" in t,
    "you_address": lambda t: re.search(r"\b(you|je|jij|claude)\b", t, re.I),
    "we_collab": lambda t: re.search(r"\b(we|wij|let's|laten we|ons|our)\b", t, re.I),
    "emoji": lambda t: re.search(r"[\U0001F300-\U0001FAFF❤✨]", t),
}
mc = Counter()
for r in recs:
    for k, fn in markers.items():
        if fn(r["text"]): mc[k] += 1
print("\nMARKERS (of", len(recs), "messages)")
for k, v in mc.most_common(): print(f"  {k}: {v} ({100*v/len(recs):.0f}%)")

# message starts (first word)
starts = Counter()
for r in recs:
    w = re.findall(r"[\w']+", r["text"].lower())
    if w: starts[w[0]] += 1
print("\nTOP FIRST WORDS:", starts.most_common(35))

# trimmed corpus for reading
with open(HERE / "corpus_trimmed.txt", "w", encoding="utf-8") as fh:
    cur_sess = None
    for r in recs:
        if r["session"] != cur_sess:
            cur_sess = r["session"]
            fh.write(f"\n=== {r['ts'][:10]} | {r['project'].replace('C--Sharing-Maaike-','')} | {r['session']} ===\n")
        t = r["text"].replace("\n", " ⏎ ")
        if len(t) > 700: t = t[:700] + f" …[+{len(t)-700}ch]"
        L, _ = lang(r["text"])
        fh.write(f"[{r['ts'][11:16]}|{L}] {t}\n")
import os
print("\ntrimmed size:", os.path.getsize(HERE / "corpus_trimmed.txt"))
