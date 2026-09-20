"""
Tests for scripts/telegram_sync.py.

Two readers share one Telegram bot: the scheduled GitHub Actions run, and the
local task on Maaike's machine. Acknowledging in Telegram is cumulative and
destructive, so a mistake here does not raise an error. It silently loses a
voice note or a link. These tests exist to make that failure loud.

Run with:  python -m pytest tests/test_telegram_sync.py -v
"""

import importlib.util
import subprocess
import sys
import types
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parent.parent
SCRIPT = REPO_ROOT / 'scripts' / 'telegram_sync.py'

taken_by_the_link_path = []


class FakeTelegram:
    """Stands in for the Telegram API and remembers what was asked of it."""

    def __init__(self, updates):
        self.pending = list(updates)
        self.replies = []
        self.acked_offsets = []

    def get(self, url, **kwargs):
        params = kwargs.get('params') or {}
        if 'getUpdates' in url:
            if 'offset' in params:
                # An acknowledgement. Everything below the offset is gone for good.
                self.acked_offsets.append(params['offset'])
                self.pending = [u for u in self.pending if u['update_id'] >= params['offset']]
                return self._response({'ok': True, 'result': []})
            return self._response({'ok': True, 'result': list(self.pending)})
        if 'getFile' in url:
            return self._response({'result': {'file_path': 'voice/file_1.oga'}})
        # The audio download itself.
        return self._response({}, content=b'fake-ogg-bytes')

    def post(self, url, **kwargs):
        data = kwargs.get('data') or {}
        if 'sendMessage' in url:
            self.replies.append(data['text'])
        return self._response({'ok': True})

    @staticmethod
    def _response(payload, content=b''):
        r = types.SimpleNamespace()
        r.ok = True
        r.text = '{}'
        r.content = content
        r.json = lambda: payload
        r.raise_for_status = lambda: None
        return r


def message(update_id, **fields):
    body = {'date': 1758300000 + update_id, 'chat': {'id': 4242}, 'message_id': update_id}
    body.update(fields)
    return {'update_id': update_id, 'message': body}


def link(update_id, url='https://example.com/a'):
    return message(update_id, text=url)


def voice(update_id, duration=84):
    return message(update_id, voice={'file_id': 'v%d' % update_id, 'duration': duration})


def load(telegram, monkeypatch, tmp_path, on_runner, argv=()):
    """Import a fresh copy of the script against a stubbed Telegram."""
    fake_requests = types.ModuleType('requests')
    fake_requests.get = telegram.get
    fake_requests.post = telegram.post
    monkeypatch.setitem(sys.modules, 'requests', fake_requests)

    monkeypatch.setenv('TELEGRAM_BOT_TOKEN', 'test-token')
    if on_runner:
        monkeypatch.setenv('GITHUB_ACTIONS', 'true')
    else:
        monkeypatch.delenv('GITHUB_ACTIONS', raising=False)
    monkeypatch.setattr(sys, 'argv', ['telegram_sync.py'] + list(argv))

    spec = importlib.util.spec_from_file_location('telegram_sync_under_test', SCRIPT)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)

    # Keep the test off the network and out of the real repository.
    module.clear_webhook = lambda: None
    module.VOICE_DIR = tmp_path / 'voice'
    module.create_weblink = lambda url, date: taken_by_the_link_path.append(url)
    module.append_to_inbox = lambda text, date: taken_by_the_link_path.append(text)
    return module


@pytest.fixture(autouse=True)
def _reset():
    taken_by_the_link_path.clear()


@pytest.mark.parametrize('seconds,expected', [
    (0, '0:00'), (7, '0:07'), (60, '1:00'), (84, '1:24'), (605, '10:05'),
])
def test_duration_is_minutes_and_padded_seconds(monkeypatch, tmp_path, seconds, expected):
    module = load(FakeTelegram([]), monkeypatch, tmp_path, on_runner=False)
    assert module.format_duration(seconds) == expected


def test_scheduled_run_stops_at_a_voice_note(monkeypatch, tmp_path):
    """The runner's disk is thrown away and the repository is public, so it must not take audio."""
    telegram = FakeTelegram([link(1), voice(2), link(3)])
    module = load(telegram, monkeypatch, tmp_path, on_runner=True)

    module.main()

    assert taken_by_the_link_path == ['https://example.com/a']
    assert telegram.acked_offsets == [2], 'acknowledged up to the voice note and no further'
    assert [u['update_id'] for u in telegram.pending] == [2, 3], 'the voice note survives'
    assert telegram.replies == [], 'the runner answers nothing'
    assert not module.VOICE_DIR.exists(), 'no audio is written on the runner'


def test_local_run_keeps_the_audio_and_replies_with_the_length(monkeypatch, tmp_path):
    telegram = FakeTelegram([voice(1, duration=84)])
    module = load(telegram, monkeypatch, tmp_path, on_runner=False)

    module.main()

    kept = sorted(module.VOICE_DIR.glob('*.oga'))
    assert len(kept) == 1, 'the audio is on disk afterwards'
    assert kept[0].read_bytes() == b'fake-ogg-bytes'
    assert telegram.replies == ['Kept. 1:24.'], 'the reply names its length'
    assert telegram.acked_offsets == [2]


def test_local_run_stops_at_anything_that_is_not_a_voice_note(monkeypatch, tmp_path):
    """Links belong to the scheduled run, which commits them. The local run must leave them."""
    telegram = FakeTelegram([link(1), voice(2)])
    module = load(telegram, monkeypatch, tmp_path, on_runner=False)

    module.main()

    assert taken_by_the_link_path == [], 'no link is consumed locally'
    assert telegram.acked_offsets == [], 'nothing is acknowledged, so nothing is lost'
    assert [u['update_id'] for u in telegram.pending] == [1, 2]


def test_local_run_takes_everything_when_told_to(monkeypatch, tmp_path):
    telegram = FakeTelegram([link(1), voice(2)])
    module = load(telegram, monkeypatch, tmp_path, on_runner=False, argv=['--all'])

    module.main()

    assert taken_by_the_link_path == ['https://example.com/a']
    assert len(list(module.VOICE_DIR.glob('*.oga'))) == 1
    assert telegram.acked_offsets == [3]


def test_a_mixed_queue_drains_with_nothing_lost(monkeypatch, tmp_path):
    """The whole point of the split: both readers alternating leave an empty queue."""
    telegram = FakeTelegram([
        link(1, 'https://example.com/a'),
        voice(2, 84),
        link(3, 'https://example.com/b'),
        voice(4, 21),
    ])

    module = None
    for on_runner in (True, False, True, False):
        module = load(telegram, monkeypatch, tmp_path, on_runner=on_runner)
        module.main()

    assert telegram.pending == [], 'every update was handled by one reader or the other'
    assert taken_by_the_link_path == ['https://example.com/a', 'https://example.com/b']
    assert telegram.replies == ['Kept. 1:24.', 'Kept. 0:21.']
    assert len(list(module.VOICE_DIR.glob('*.oga'))) == 2


def test_the_voice_folder_is_never_committed():
    """This repository is public. If this fails, her voice notes go onto the internet."""
    result = subprocess.run(
        ['git', 'check-ignore', 'voice/any-note.oga'],
        cwd=REPO_ROOT, capture_output=True, text=True,
    )
    assert result.returncode == 0, 'voice/ must be gitignored, and it is not'
