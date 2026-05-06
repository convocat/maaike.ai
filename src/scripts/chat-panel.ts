/**
 * chat-panel.ts
 *
 * Vanilla TS module powering the per-page chatbot UI in ChatPanel.astro.
 *
 * Conversation lives in sessionStorage ('garden-chat-v1') so it survives
 * navigation. Drawer width and maximized state live in localStorage so they
 * persist across sessions.
 *
 * Page-specific context is read from <script id="page-context"> written by
 * BaseLayout.astro and sent with every request so the API can load the
 * current post body server-side.
 */

type ChatRole = 'user' | 'assistant';

interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface PageContext {
  type: string;
  title: string;
  url: string;
  description?: string;
  collection?: string;
  slug?: string;
  tags?: string[];
  themes?: string[];
  triples?: [string, string, string][];
  open_questions?: string[];
  maturity?: string;
  date?: string;
  updated?: string;
  ai?: string;
}

interface PersistedConversation {
  messages: ChatMessage[];
  open: boolean;
}

interface PaneSettings {
  width: number;
  maximized: boolean;
}

const CONV_STORAGE_KEY = 'garden-chat-v1';
const PANE_STORAGE_KEY = 'garden-chat-pane-v1';
const MIN_WIDTH = 320;
const MAX_WIDTH_RATIO = 0.9; // up to 90% of viewport

const API_BASE =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8780'
    : 'https://maaike-ai.vercel.app';

// Avatars
const GARDEN_AVATAR_HTML = `<img src="/images/watercolor-leaf-trimmed.png" alt="" loading="lazy" />`;

const USER_AVATAR_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="12" cy="8" r="3.5" />
  <path d="M5 20 C5 15.5 8 14 12 14 C16 14 19 15.5 19 20" />
</svg>`;

const ASSISTANT_LABEL = 'The Garden';

function loadConversation(): PersistedConversation {
  try {
    const raw = sessionStorage.getItem(CONV_STORAGE_KEY);
    if (!raw) return { messages: [], open: false };
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.messages)) {
      return {
        messages: parsed.messages.filter(
          (m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string',
        ),
        open: Boolean(parsed.open),
      };
    }
  } catch {}
  return { messages: [], open: false };
}

function saveConversation(state: PersistedConversation) {
  try {
    sessionStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function loadPaneSettings(): PaneSettings {
  try {
    const raw = localStorage.getItem(PANE_STORAGE_KEY);
    if (!raw) return { width: 420, maximized: false };
    const parsed = JSON.parse(raw);
    return {
      width: typeof parsed.width === 'number' && parsed.width >= MIN_WIDTH ? parsed.width : 420,
      maximized: Boolean(parsed.maximized),
    };
  } catch {}
  return { width: 420, maximized: false };
}

function savePaneSettings(settings: PaneSettings) {
  try {
    localStorage.setItem(PANE_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

function readPageContext(): PageContext {
  const tag = document.getElementById('page-context');
  if (tag && tag.textContent) {
    try {
      const parsed = JSON.parse(tag.textContent);
      return {
        type: parsed.type || 'page',
        title: parsed.title || document.title || '',
        url: parsed.url || window.location.pathname,
        description: parsed.description || '',
        collection: parsed.collection || '',
        slug: parsed.slug || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        themes: Array.isArray(parsed.themes) ? parsed.themes : [],
        triples: Array.isArray(parsed.triples) ? parsed.triples : [],
        open_questions: Array.isArray(parsed.open_questions) ? parsed.open_questions : [],
        maturity: parsed.maturity || '',
        date: parsed.date || '',
        updated: parsed.updated || '',
        ai: parsed.ai || '',
      };
    } catch {}
  }
  return {
    type: 'page',
    title: document.title || '',
    url: window.location.pathname,
  };
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function renderMarkdown(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<![*\w])\*([^*\n]+)\*(?!\w)/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
    const safe = /^(https?:\/\/|\/)/.test(url);
    if (!safe) return label;
    const isExternal = /^https?:\/\//.test(url) && !url.startsWith('https://maaike.ai') && !url.startsWith('http://maaike.ai');
    const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${url}"${attrs}>${label}</a>`;
  });
  const lines = html.split('\n');
  const out: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${para.join(' ')}</p>`);
      para = [];
    }
  };
  const closeList = () => {
    if (inList && listType) {
      out.push(`</${listType}>`);
      inList = false;
      listType = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      closeList();
      continue;
    }
    const ulMatch = /^[-*]\s+(.+)$/.exec(line);
    const olMatch = /^\d+\.\s+(.+)$/.exec(line);
    if (ulMatch) {
      flushPara();
      if (!inList || listType !== 'ul') {
        closeList();
        out.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      out.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      flushPara();
      if (!inList || listType !== 'ol') {
        closeList();
        out.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      out.push(`<li>${olMatch[1]}</li>`);
    } else {
      closeList();
      para.push(line);
    }
  }
  flushPara();
  closeList();
  return out.join('\n');
}

function buildSuggestions(ctx: PageContext): string[] {
  if (ctx.collection && ctx.slug) {
    return [
      'What is this about?',
      'How does this connect to the rest of the garden?',
      "What's Maaike's view here?",
    ];
  }
  return [
    "What is Maaike's garden about?",
    'What has Maaike published recently?',
    'Recommend a starting article.',
  ];
}

function avatarMarkup(role: ChatRole): string {
  const cls = role === 'assistant' ? 'chat-avatar-garden' : 'chat-avatar-user';
  const inner = role === 'assistant' ? GARDEN_AVATAR_HTML : USER_AVATAR_SVG;
  return `<div class="chat-avatar ${cls}" aria-hidden="true">${inner}</div>`;
}

function renderEmpty(history: HTMLElement, ctx: PageContext, onSuggestion: (q: string) => void) {
  const intro = ctx.collection && ctx.slug
    ? `You're reading <strong>${escapeHtml(ctx.title)}</strong>. The rest of Maaike's writing is in scope too. What would you like to talk about?`
    : `Welcome. The garden has a few hundred posts: articles, field notes, jottings, links. What would you like to talk about?`;

  const suggestions = buildSuggestions(ctx);
  const buttons = suggestions
    .map((q) => `<button type="button" class="chat-suggestion" data-q="${escapeHtml(q)}">${escapeHtml(q)}</button>`)
    .join('');

  history.innerHTML = `
    <div class="chat-empty">
      <p>${intro}</p>
      <div class="chat-suggestions">${buttons}</div>
    </div>
  `;

  history.querySelectorAll<HTMLButtonElement>('.chat-suggestion').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q || '';
      if (q) onSuggestion(q);
    });
  });
}

function appendMessage(history: HTMLElement, role: ChatRole, html: string): { wrap: HTMLElement; bubble: HTMLElement } {
  const empty = history.querySelector('.chat-empty');
  if (empty) empty.remove();

  const wrap = document.createElement('div');
  wrap.className = `chat-msg chat-msg-${role}`;
  wrap.innerHTML = `
    ${avatarMarkup(role)}
    <div class="chat-msg-body">
      <span class="chat-msg-role">${role === 'user' ? 'You' : ASSISTANT_LABEL}</span>
      <div class="chat-msg-bubble">${html}</div>
    </div>
  `;
  history.appendChild(wrap);
  history.scrollTop = history.scrollHeight;
  const bubble = wrap.querySelector('.chat-msg-bubble') as HTMLElement;
  return { wrap, bubble };
}

function appendTyping(history: HTMLElement): { wrap: HTMLElement; bubble: HTMLElement } {
  const empty = history.querySelector('.chat-empty');
  if (empty) empty.remove();

  const wrap = document.createElement('div');
  wrap.className = 'chat-msg chat-msg-assistant';
  wrap.innerHTML = `
    ${avatarMarkup('assistant')}
    <div class="chat-msg-body">
      <span class="chat-msg-role">${ASSISTANT_LABEL}</span>
      <div class="chat-msg-bubble">
        <span class="chat-typing">
          <span class="chat-typing-dot"></span>
          <span class="chat-typing-dot"></span>
          <span class="chat-typing-dot"></span>
        </span>
      </div>
    </div>
  `;
  history.appendChild(wrap);
  history.scrollTop = history.scrollHeight;
  const bubble = wrap.querySelector('.chat-msg-bubble') as HTMLElement;
  return { wrap, bubble };
}

function setContextPill(pill: HTMLElement, ctx: PageContext) {
  const label = ctx.title || ctx.url || 'this page';
  pill.innerHTML = `Talking about <strong>${escapeHtml(label)}</strong>`;
}

export function initChatPanel() {
  const panel = document.getElementById('chat-panel');
  if (!panel) return;
  // Idempotent guard: skip if init already attached handlers to this DOM
  if (panel.dataset.chatInit === '1') return;
  panel.dataset.chatInit = '1';

  const toggle = document.getElementById('chat-toggle') as HTMLButtonElement | null;
  const drawer = document.getElementById('chat-drawer') as HTMLElement | null;
  const closeBtn = document.getElementById('chat-close') as HTMLButtonElement | null;
  const resetBtn = document.getElementById('chat-reset') as HTMLButtonElement | null;
  const maxBtn = document.getElementById('chat-maximize') as HTMLButtonElement | null;
  const resize = document.getElementById('chat-resize') as HTMLElement | null;
  const form = document.getElementById('chat-form') as HTMLFormElement | null;
  const input = document.getElementById('chat-input') as HTMLTextAreaElement | null;
  const sendBtn = document.getElementById('chat-send') as HTMLButtonElement | null;
  const history = document.getElementById('chat-history') as HTMLElement | null;
  const pill = document.getElementById('chat-context-pill') as HTMLElement | null;

  if (!toggle || !drawer || !closeBtn || !resetBtn || !maxBtn || !resize || !form || !input || !sendBtn || !history || !pill) return;

  const ctx = readPageContext();
  setContextPill(pill, ctx);

  let conv = loadConversation();
  let pane = loadPaneSettings();
  let inFlight = false;
  let abortController: AbortController | null = null;

  // Apply pane settings
  const applyPaneWidth = (w: number) => {
    const max = Math.floor(window.innerWidth * MAX_WIDTH_RATIO);
    const clamped = Math.max(MIN_WIDTH, Math.min(max, w));
    drawer.style.setProperty('--chat-drawer-width', `${clamped}px`);
    pane.width = clamped;
  };
  const applyMaximized = (m: boolean) => {
    drawer.classList.toggle('is-maximized', m);
    maxBtn.setAttribute('aria-label', m ? 'Restore panel' : 'Maximize panel');
    maxBtn.title = m ? 'Restore' : 'Maximize';
    pane.maximized = m;
  };
  applyPaneWidth(pane.width);
  applyMaximized(pane.maximized);

  const renderHistory = () => {
    history.innerHTML = '';
    if (conv.messages.length === 0) {
      renderEmpty(history, ctx, (q) => {
        input.value = q;
        sendBtn.disabled = false;
        form.requestSubmit();
      });
      return;
    }
    for (const m of conv.messages) {
      appendMessage(history, m.role, m.role === 'assistant' ? renderMarkdown(m.content) : escapeHtml(m.content));
    }
  };

  const openDrawer = () => {
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('is-hidden');
    conv.open = true;
    saveConversation(conv);
    setTimeout(() => input.focus(), 220);
  };

  const closeDrawer = () => {
    drawer.hidden = true;
    drawer.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('is-hidden');
    conv.open = false;
    saveConversation(conv);
    if (inFlight && abortController) {
      abortController.abort();
      inFlight = false;
    }
  };

  const resetConversation = () => {
    if (inFlight && abortController) {
      abortController.abort();
      inFlight = false;
    }
    conv.messages = [];
    saveConversation(conv);
    renderHistory();
    input.value = '';
    sendBtn.disabled = true;
    input.focus();
  };

  toggle.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  resetBtn.addEventListener('click', resetConversation);

  history.addEventListener('click', (e) => {
    const target = e.target as HTMLElement | null;
    const link = target?.closest('a');
    if (!link) return;
    if (link.target === '_blank') return;
    if (window.innerWidth > 800) return;
    closeDrawer();
  });

  maxBtn.addEventListener('click', () => {
    applyMaximized(!pane.maximized);
    savePaneSettings(pane);
  });

  // Resize: drag the left edge
  let dragStartX = 0;
  let dragStartWidth = 0;
  const onPointerMove = (e: PointerEvent) => {
    const dx = dragStartX - e.clientX;
    applyPaneWidth(dragStartWidth + dx);
  };
  const onPointerUp = () => {
    resize.classList.remove('is-dragging');
    document.body.classList.remove('is-chat-resizing');
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    savePaneSettings(pane);
  };
  resize.addEventListener('pointerdown', (e: PointerEvent) => {
    if (pane.maximized) return;
    e.preventDefault();
    dragStartX = e.clientX;
    dragStartWidth = drawer.getBoundingClientRect().width;
    resize.classList.add('is-dragging');
    document.body.classList.add('is-chat-resizing');
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  });
  // Keyboard resize for accessibility
  resize.addEventListener('keydown', (e: KeyboardEvent) => {
    if (pane.maximized) return;
    let delta = 0;
    if (e.key === 'ArrowLeft') delta = 32;
    else if (e.key === 'ArrowRight') delta = -32;
    else return;
    e.preventDefault();
    applyPaneWidth(pane.width + delta);
    savePaneSettings(pane);
  });

  input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim() || inFlight;
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) form.requestSubmit();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !drawer.hidden) {
      // Don't close if focus is in the input and there's text (might be ime)
      const active = document.activeElement;
      if (active === input && input.value.trim()) return;
      closeDrawer();
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || inFlight) return;

    input.value = '';
    sendBtn.disabled = true;
    inFlight = true;

    const userMsg: ChatMessage = { role: 'user', content: text };
    conv.messages.push(userMsg);
    saveConversation(conv);

    if (conv.messages.length === 1) {
      renderHistory();
    } else {
      appendMessage(history, 'user', escapeHtml(text));
    }

    const { wrap: typingNode, bubble } = appendTyping(history);

    abortController = new AbortController();
    let assistantText = '';
    let errored: string | null = null;
    let firstToken = true;

    try {
      const historyToSend = conv.messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyToSend,
          current: ctx,
        }),
        signal: abortController.signal,
      });

      if (!resp.ok) {
        let err = `Request failed (${resp.status})`;
        try {
          const j = await resp.json();
          if (j && j.error) err = j.error;
        } catch {}
        throw new Error(err);
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          let msg: any;
          try { msg = JSON.parse(line); } catch { continue; }
          if (msg.type === 'token' && typeof msg.text === 'string') {
            assistantText += msg.text;
            if (firstToken) {
              // Replace typing dots with the first content + cursor
              firstToken = false;
            }
            bubble.innerHTML = renderMarkdown(assistantText) + '<span class="chat-cursor" aria-hidden="true"></span>';
            history.scrollTop = history.scrollHeight;
          } else if (msg.type === 'error') {
            errored = msg.error || 'backend error';
          }
        }
      }
    } catch (e: any) {
      if (e && e.name === 'AbortError') {
        typingNode.remove();
        inFlight = false;
        abortController = null;
        return;
      }
      errored = e?.message || 'Network error';
    }

    inFlight = false;
    abortController = null;

    if (errored) {
      bubble.classList.add('is-error');
      bubble.textContent = errored;
      conv.messages.pop();
      saveConversation(conv);
    } else if (assistantText.trim()) {
      bubble.innerHTML = renderMarkdown(assistantText);
      conv.messages.push({ role: 'assistant', content: assistantText });
      saveConversation(conv);
    } else {
      typingNode.remove();
    }

    sendBtn.disabled = !input.value.trim();
    input.focus();
  });

  // Reapply width on viewport resize so we never overflow
  window.addEventListener('resize', () => {
    if (!pane.maximized) applyPaneWidth(pane.width);
  });

  renderHistory();
  if (conv.open) {
    openDrawer();
  }
}
