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
const PROMPT_STORAGE_KEY = 'garden-chat-prompt';
const MIN_WIDTH = 320;
const MAX_WIDTH_RATIO = 0.9; // up to 90% of viewport

interface PromptOption {
  prompt_id: string;
  title: string;
  version: string;
  status: string;
  description?: string;
}

const API_BASE =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8780'
    : 'https://maaike-ai.vercel.app';

// Avatars
const GARDEN_AVATAR_HTML = `<img src="/images/watercolor-leaf-trimmed.png" alt="" loading="lazy" />`;

const USER_AVATAR_SVG = `<img src="/images/watercolor-acorn-trimmed.png" alt="" loading="lazy" />`;

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

const SERENDIPITY_PROMPTS = [
  'Find a strange neighbour',
  'What would Maaike push back on?',
  'Show me an outlier',
  'Where does this break?',
  'Take me somewhere unexpected',
  'Find the messiest idea',
  'Surprise me',
  'Connect this to something far away',
  'What is half-baked here?',
  'Show me the contradiction',
  'What is the quiet idea?',
  'Pick a tangent',
  'What would change my mind?',
  'Where is the doubt?',
  'Lead me astray',
];

function pickSerendipityChips(n = 3): string[] {
  const pool = [...SERENDIPITY_PROMPTS];
  const out: string[] = [];
  while (out.length < n && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth <= 800;
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
    .map((q) => `<button type="button" class="chat-followup" data-q="${escapeHtml(q)}"><span class="chip-pebble" aria-hidden="true"></span><span class="chip-text">${escapeHtml(q)}</span></button>`)
    .join('');

  history.innerHTML = `
    <div class="chat-empty">
      <p>${intro}</p>
      <div class="chat-followups chat-empty-followups">${buttons}</div>
    </div>
  `;

  history.querySelectorAll<HTMLButtonElement>('.chat-followup').forEach((btn) => {
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

function clearFollowups(history: HTMLElement) {
  history.querySelectorAll('.chat-followups').forEach((el) => el.remove());
}

function appendFollowups(history: HTMLElement, onPick: (q: string) => void, items?: string[]) {
  clearFollowups(history);
  const chips = (items && items.length) ? items.slice(0, 3) : pickSerendipityChips(3);
  const wrap = document.createElement('div');
  wrap.className = 'chat-followups';
  wrap.innerHTML = chips
    .map((q) => `<button type="button" class="chat-followup" data-q="${escapeHtml(q)}"><span class="chip-pebble" aria-hidden="true"></span><span class="chip-text">${escapeHtml(q)}</span></button>`)
    .join('');
  history.appendChild(wrap);
  wrap.querySelectorAll<HTMLButtonElement>('.chat-followup').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q || '';
      if (q) onPick(q);
    });
  });
  history.scrollTop = history.scrollHeight;
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
  const settingsBtn = document.getElementById('chat-settings-toggle') as HTMLButtonElement | null;
  const settingsPanel = document.getElementById('chat-settings-panel') as HTMLElement | null;
  const promptSelect = document.getElementById('chat-prompt-select') as HTMLSelectElement | null;

  if (!toggle || !drawer || !closeBtn || !resetBtn || !maxBtn || !resize || !form || !input || !sendBtn || !history || !pill) return;
  if (!settingsBtn || !settingsPanel || !promptSelect) return;

  const ctx = readPageContext();
  setContextPill(pill, ctx);

  // Prompt selection. URL ?prompt=… > localStorage > server default.
  let promptOptions: PromptOption[] = [];
  let selectedPromptId: string | null = (() => {
    try {
      const url = new URL(window.location.href);
      const fromUrl = (url.searchParams.get('prompt') || '').trim();
      if (fromUrl) return fromUrl;
      return localStorage.getItem(PROMPT_STORAGE_KEY);
    } catch {
      return null;
    }
  })();

  const persistPromptId = (id: string | null) => {
    try {
      if (id) localStorage.setItem(PROMPT_STORAGE_KEY, id);
      else localStorage.removeItem(PROMPT_STORAGE_KEY);
    } catch {}
  };

  const renderPromptOptions = () => {
    if (!promptOptions.length) return;
    promptSelect.innerHTML = promptOptions
      .map((p) => {
        const label = `${escapeHtml(p.title)}${p.version ? ` (v${escapeHtml(p.version)})` : ''}${p.status === 'draft' ? ' · draft' : ''}`;
        return `<option value="${escapeHtml(p.prompt_id)}">${label}</option>`;
      })
      .join('');
    if (selectedPromptId && promptOptions.some((p) => p.prompt_id === selectedPromptId)) {
      promptSelect.value = selectedPromptId;
    } else {
      selectedPromptId = promptSelect.value || null;
    }
    // Only reveal the gear when there's a real choice to make
    if (promptOptions.length > 1) {
      settingsBtn.hidden = false;
    }
  };

  const fetchPromptOptions = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/prompts`);
      if (!resp.ok) return;
      const data = await resp.json();
      if (Array.isArray(data?.prompts)) {
        promptOptions = data.prompts;
        if (!selectedPromptId && typeof data.default === 'string') {
          selectedPromptId = data.default;
        }
        renderPromptOptions();
      }
    } catch {}
  };

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

  const submitText = (q: string) => {
    input.value = q;
    sendBtn.disabled = false;
    form.requestSubmit();
  };

  const renderHistory = () => {
    history.innerHTML = '';
    if (conv.messages.length === 0) {
      renderEmpty(history, ctx, submitText);
      return;
    }
    for (const m of conv.messages) {
      appendMessage(history, m.role, m.role === 'assistant' ? renderMarkdown(m.content) : escapeHtml(m.content));
    }
    const last = conv.messages[conv.messages.length - 1];
    if (last && last.role === 'assistant') {
      appendFollowups(history, submitText);
    }
  };

  let promptsFetched = false;
  const openDrawer = () => {
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('is-hidden');
    conv.open = true;
    saveConversation(conv);
    if (!promptsFetched) {
      promptsFetched = true;
      fetchPromptOptions();
    }
    if (!isMobile()) setTimeout(() => input.focus(), 220);
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
    if (!isMobile()) input.focus();
  };

  toggle.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  resetBtn.addEventListener('click', resetConversation);

  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = settingsPanel.hidden === false;
    settingsPanel.hidden = open;
    settingsBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
  });

  document.addEventListener('click', (e) => {
    if (settingsPanel.hidden) return;
    const target = e.target as Node | null;
    if (target && (settingsPanel.contains(target) || settingsBtn.contains(target))) return;
    settingsPanel.hidden = true;
    settingsBtn.setAttribute('aria-expanded', 'false');
  });

  promptSelect.addEventListener('change', () => {
    const next = promptSelect.value;
    if (!next || next === selectedPromptId) return;
    if (conv.messages.length > 0) {
      const ok = window.confirm(
        'Switching the system prompt will clear the current conversation. Continue?',
      );
      if (!ok) {
        promptSelect.value = selectedPromptId || '';
        return;
      }
    }
    selectedPromptId = next;
    persistPromptId(next);
    if (conv.messages.length > 0) {
      conv.messages = [];
      saveConversation(conv);
      renderHistory();
    }
  });

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

    clearFollowups(history);

    const userMsg: ChatMessage = { role: 'user', content: text };
    conv.messages.push(userMsg);
    saveConversation(conv);

    if (conv.messages.length === 1) {
      renderHistory();
      clearFollowups(history);
    } else {
      appendMessage(history, 'user', escapeHtml(text));
    }

    const { wrap: typingNode, bubble } = appendTyping(history);

    abortController = new AbortController();
    let assistantText = '';
    let errored: string | null = null;
    let firstToken = true;
    let chipItems: string[] | null = null;

    try {
      const historyToSend = conv.messages.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyToSend,
          current: ctx,
          prompt_id: selectedPromptId || undefined,
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
          if (msg.type === 'meta' && typeof msg.prompt_id === 'string') {
            // Backend echoes the resolved prompt_id (after allowlist).
            // Sync local state in case our request was rejected silently.
            if (msg.prompt_id !== selectedPromptId) {
              selectedPromptId = msg.prompt_id;
              persistPromptId(msg.prompt_id);
              if (promptOptions.some((p) => p.prompt_id === selectedPromptId)) {
                promptSelect.value = selectedPromptId!;
              }
            }
            continue;
          }
          if (msg.type === 'token' && typeof msg.text === 'string') {
            assistantText += msg.text;
            if (firstToken) {
              // Replace typing dots with the first content + cursor
              firstToken = false;
            }
            bubble.innerHTML = renderMarkdown(assistantText) + '<span class="chat-cursor" aria-hidden="true"></span>';
            history.scrollTop = history.scrollHeight;
          } else if (msg.type === 'chips' && Array.isArray(msg.items)) {
            chipItems = msg.items.filter((s: any) => typeof s === 'string').slice(0, 3);
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
      appendFollowups(history, submitText, chipItems || undefined);
    } else {
      typingNode.remove();
    }

    sendBtn.disabled = !input.value.trim();
    if (!isMobile()) input.focus();
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
