#!/usr/bin/env python3
"""
Telegram → garden inbox sync.

Reads messages sent to @MaaikGardenBot:
- URLs   → new draft entry in src/content/weblinks/
- Text   → appended to src/content/_inbox/telegram.md

Run manually or via GitHub Actions on a schedule.
Requires TELEGRAM_BOT_TOKEN environment variable.
"""

import os
import re
import sys
import requests
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
if not BOT_TOKEN:
    sys.exit('TELEGRAM_BOT_TOKEN not set.')

BASE_URL = f'https://api.telegram.org/bot{BOT_TOKEN}'
REPO_ROOT = Path(__file__).parent.parent
INBOX_FILE = REPO_ROOT / 'src/content/_inbox/telegram.md'
WEBLINKS_DIR = REPO_ROOT / 'src/content/weblinks'

URL_RE = re.compile(r'^https?://\S+', re.IGNORECASE)


def get_updates():
    r = requests.get(f'{BASE_URL}/getUpdates', timeout=30)
    r.raise_for_status()
    return r.json().get('result', [])


def acknowledge(last_update_id):
    requests.get(
        f'{BASE_URL}/getUpdates',
        params={'offset': last_update_id + 1},
        timeout=30,
    )


def decode_html_entities(text):
    return (text
        .replace('&#x27;', "'")
        .replace('&amp;', '&')
        .replace('&quot;', '"')
        .replace('&lt;', '<')
        .replace('&gt;', '>')
        .replace('&nbsp;', ' '))


def fetch_page_meta(url):
    """Returns (title, description) from a page's meta tags."""
    title = urlparse(url).netloc
    description = ''
    try:
        r = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        title_match = re.search(r'<title[^>]*>([^<]+)</title>', r.text, re.IGNORECASE)
        if title_match:
            title = decode_html_entities(title_match.group(1).strip())
        desc_match = re.search(
            r'<meta[^>]+(?:name=["\']description["\']|property=["\']og:description["\'])[^>]+content=["\']([^"\']+)["\']',
            r.text, re.IGNORECASE
        )
        if not desc_match:
            desc_match = re.search(
                r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+(?:name=["\']description["\']|property=["\']og:description["\'])',
                r.text, re.IGNORECASE
            )
        if desc_match:
            description = decode_html_entities(desc_match.group(1).strip())
    except Exception:
        pass
    return title, description


def slugify(text):
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')[:50]


def create_weblink(url, date):
    title, description = fetch_page_meta(url)
    slug = slugify(title) or f'link-{date.strftime("%Y%m%d%H%M%S")}'
    date_str = date.strftime('%Y-%m-%d')

    filepath = WEBLINKS_DIR / f'{slug}.md'
    counter = 1
    while filepath.exists():
        filepath = WEBLINKS_DIR / f'{slug}-{counter}.md'
        counter += 1

    content = (
        f'---\n'
        f'title: "{title}"\n'
        f'url: {url}\n'
        f'date: {date_str}\n'
        f'updated: {date_str}\n'
        f'maturity: solid\n'
        f'tags: []\n'
        f'description: "{description}"\n'
        f'ai: "100% Maai"\n'
        f'draft: false\n'
        f'---\n'
    )
    filepath.write_text(content, encoding='utf-8')
    print(f'Weblink: {filepath.name}')


def append_to_inbox(text, date):
    date_str = date.strftime('%Y-%m-%d')
    entry = f'\n{date_str}: {text}\n'

    INBOX_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(INBOX_FILE, 'a', encoding='utf-8') as f:
        f.write(entry)
    print(f'Inbox: {text[:60]}')


def main():
    updates = get_updates()
    if not updates:
        print('No new messages.')
        return

    count = 0
    for update in updates:
        msg = update.get('message', {})
        text = (msg.get('text') or '').strip()
        if not text:
            continue

        date = datetime.fromtimestamp(msg['date'], tz=timezone.utc)

        if URL_RE.match(text):
            create_weblink(text, date)
        else:
            append_to_inbox(text, date)

        count += 1

    acknowledge(updates[-1]['update_id'])
    print(f'Done. Processed {count} message(s), acknowledged {len(updates)} update(s).')


if __name__ == '__main__':
    main()
