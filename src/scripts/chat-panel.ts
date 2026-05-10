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
type ChatMode = 'chat' | 'ask';

interface AskSource {
  cid: string;
  title: string;
  slug?: string;
  kind?: 'topic' | 'article';
  type?: string;
  section?: string;
  url?: string;
  date?: string;
  href?: string;
}

interface ChatMessage {
  role: ChatRole;
  content: string;
  sources?: AskSource[];  // ask-mode assistant messages keep their sources for re-render
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
  mode: ChatMode;
  chat: { messages: ChatMessage[] };
  ask: { messages: ChatMessage[] };
  open: boolean;
}

interface PaneSettings {
  width: number;
  maximized: boolean;
}

const CONV_STORAGE_KEY = 'garden-chat-v2';
const MODE_STORAGE_KEY = 'garden-chat-mode';
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

// Stable per-page-load session id. Sent on every /api/chat request so Langfuse
// can group consecutive turns into one conversation thread.
const CHAT_SESSION_ID = (() => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
})();

// Avatars
const GARDEN_AVATAR_HTML = `<img src="/images/watercolor-leaf-trimmed.png" alt="" loading="lazy" />`;

const USER_AVATAR_SVG = `<img src="/images/watercolor-acorn-trimmed.png" alt="" loading="lazy" />`;

const ASSISTANT_LABEL = 'The Garden';

function _sanitizeMessages(arr: any): ChatMessage[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((m: any) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m: any) => {
      const out: ChatMessage = { role: m.role, content: m.content };
      if (Array.isArray(m.sources)) out.sources = m.sources;
      return out;
    });
}

function loadConversation(): PersistedConversation {
  let savedMode: ChatMode = 'chat';
  try {
    const m = localStorage.getItem(MODE_STORAGE_KEY);
    if (m === 'chat' || m === 'ask') savedMode = m;
  } catch {}
  try {
    const raw = sessionStorage.getItem(CONV_STORAGE_KEY);
    if (!raw) return { mode: savedMode, chat: { messages: [] }, ask: { messages: [] }, open: false };
    const parsed = JSON.parse(raw);
    return {
      mode: (parsed?.mode === 'ask' || parsed?.mode === 'chat') ? parsed.mode : savedMode,
      chat: { messages: _sanitizeMessages(parsed?.chat?.messages) },
      ask: { messages: _sanitizeMessages(parsed?.ask?.messages) },
      open: Boolean(parsed?.open),
    };
  } catch {}
  return { mode: savedMode, chat: { messages: [] }, ask: { messages: [] }, open: false };
}

function saveConversation(state: PersistedConversation) {
  try {
    sessionStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(MODE_STORAGE_KEY, state.mode);
  } catch {}
}

function activeMessages(conv: PersistedConversation): ChatMessage[] {
  return conv[conv.mode].messages;
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

// rAF-throttled smooth scroll to bottom. CSS scroll-behavior: smooth on the
// chat-history container makes the actual scroll animate; this helper just
// makes sure we only set scrollTop once per frame during fast token streams.
let _scrollScheduled: number | null = null;
function scheduleScrollToBottom(el: HTMLElement) {
  if (_scrollScheduled !== null) return;
  _scrollScheduled = requestAnimationFrame(() => {
    _scrollScheduled = null;
    el.scrollTop = el.scrollHeight;
  });
}

// ── Mycelium variant rendering ───────────────────────────────────────────
//
// When the visitor has opted into the mycelium variant (homepage toggle →
// localStorage 'garden-chat-variant' = 'mycelium'), the chat drawer gains
// a size-toggle button. Clicking it expands the drawer to full viewport
// and reveals the right-side pane: an SVG visualisation that grows with
// the conversation, plus a curated summary of topics + cited posts.

const SVG_NS = 'http://www.w3.org/2000/svg';

// Strip collection colour for citation cards in the summary.
const CHAT_MYC_STRIP_COLORS: Record<string, string> = {
  articles: '#C5A87A',
  'field-notes': '#8DBE8D',
  seeds: '#D6B07A',
  jottings: '#A8B5D6',
  weblinks: '#9CC4BD',
  videos: '#C5A0BD',
  library: '#B5A89C',
  experiments: '#7EBDC4',
  toolshed: '#6B7A52',
};

function chatMycExtractTopics(messages: ChatMessage[]) {
  const counts = new Map<string, number>();
  messages.forEach((m) => {
    if (m.role !== 'assistant') return;
    const re = /\*\*([^*]+)\*\*/g;
    let mt: RegExpExecArray | null;
    while ((mt = re.exec(m.content)) !== null) {
      const term = mt[1].trim();
      if (term.length < 60) counts.set(term, (counts.get(term) || 0) + 1);
    }
  });
  return [...counts.entries()].map(([term, count]) => ({ term, count }));
}

function chatMycExtractCitations(messages: ChatMessage[]) {
  const seen = new Set<string>();
  const out: { title: string; href: string; collection: string }[] = [];
  messages.forEach((m) => {
    if (m.role !== 'assistant') return;
    const re = /\[([^\]]+)\]\((\/[a-z0-9-]+\/[a-z0-9-]+\/?)\)/gi;
    let mt: RegExpExecArray | null;
    while ((mt = re.exec(m.content)) !== null) {
      const href = mt[2];
      if (seen.has(href)) continue;
      seen.add(href);
      const collection = href.split('/').filter(Boolean)[0] || 'articles';
      out.push({ title: mt[1], href, collection });
    }
  });
  return out;
}

function renderChatSummary(root: HTMLElement | null, messages: ChatMessage[]) {
  if (!root) return;
  if (!messages.length) {
    root.innerHTML = '<p class="chat-mycelium-summary-empty">As the conversation grows, a summary of what you have touched on will appear here: topics pulled, posts cited.</p>';
    return;
  }
  const topics = chatMycExtractTopics(messages);
  const citations = chatMycExtractCitations(messages);
  const sections: string[] = [];

  if (topics.length) {
    const tagsHtml = topics.map((t) => {
      const slug = t.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const cls = t.count > 1 ? 'chat-myc-topic is-recurring' : 'chat-myc-topic';
      return `<a class="${cls}" href="/tags/${slug}/" target="_blank" rel="noopener" title="${t.count > 1 ? `mentioned ${t.count}× — open the tag page` : 'open the tag page'}">${escapeHtml(t.term)}</a>`;
    }).join('');
    sections.push(`<div class="chat-myc-section"><h3>Threads pulled</h3><div class="chat-myc-topics">${tagsHtml}</div></div>`);
  }

  if (citations.length) {
    const itemsHtml = citations.map((c) => {
      const stripColor = CHAT_MYC_STRIP_COLORS[c.collection] || '#C5A87A';
      return `<a class="chat-myc-cite-item" href="${c.href}" target="_blank" rel="noopener">
        <span class="chat-myc-cite-strip" style="background: ${stripColor}"></span>
        <div class="chat-myc-cite-body">
          <p class="chat-myc-cite-coll">${c.collection.replace('-', ' ')}</p>
          <p class="chat-myc-cite-title">${escapeHtml(c.title)}</p>
        </div>
      </a>`;
    }).join('');
    sections.push(`<div class="chat-myc-section"><h3>Posts cited</h3><ul class="chat-myc-cite-list">${itemsHtml}</ul></div>`);
  }

  if (!sections.length) {
    root.innerHTML = '<p class="chat-mycelium-summary-empty">Keep going. Topics and cited posts will surface here.</p>';
    return;
  }

  const hasBot = messages.some((m) => m.role === 'assistant');
  const action = hasBot ? `
    <div class="chat-myc-action">
      <button class="chat-myc-action-btn" id="chat-myc-submit">Submit this conversation to the garden</button>
      <p class="chat-myc-action-hint">Queued for Maaike's review. If it helps shape a post, she may pick it up. Visitors stay anonymous unless signed.</p>
    </div>
  ` : '';

  root.innerHTML = `<p class="chat-mycelium-summary-h">What you have talked about</p>${sections.join('')}${action}`;
  const btn = document.getElementById('chat-myc-submit') as HTMLButtonElement | null;
  if (btn) {
    btn.addEventListener('click', () => {
      btn.disabled = true;
      btn.textContent = 'Submitted ✓';
      const hint = btn.nextElementSibling;
      if (hint) {
        hint.outerHTML = '<div class="chat-myc-action-confirmation">Queued for review. Maaike sees this in her inbox alongside Telegram drops and email shares. Nothing gets published without her go-ahead.</div>';
      }
    });
  }
}

function renderMycelium(svg: SVGSVGElement, emptyHint: HTMLElement | null, messages: ChatMessage[]) {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  if (!messages.length) {
    if (emptyHint) emptyHint.hidden = false;
    return;
  }
  if (emptyHint) emptyHint.hidden = true;

  const W = svg.clientWidth || 400;
  const H = svg.clientHeight || 600;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

  // Pad so labels don't run off edges.
  const padX = 60;
  const padY = 50;
  const usableW = W - padX * 2;
  const usableH = H - padY * 2;

  // Position each turn along a meandering path.
  const n = messages.length;
  type Node = { x: number; y: number; msg: ChatMessage; index: number; size: number; href: string; caption: string };
  const nodes: Node[] = messages.map((m, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1);
    const y = padY + t * usableH;
    // Sin curve so the path meanders left-right as it descends.
    const phase = i * 0.9;
    const x = padX + usableW / 2 + Math.sin(phase) * (usableW * 0.32);
    const isUser = m.role === 'user';
    const size = isUser ? 26 : 30;
    const href = isUser
      ? '/images/watercolor-acorn-trimmed.png'
      : '/images/watercolor-leaf-trimmed.png';
    // First-sentence summary so each node is a self-contained unit.
    const stripped = m.content
      .replace(/<<CHIPS:[^>]*>>/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*_`#]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    let caption = stripped;
    if (m.role === 'assistant') {
      const firstSentence = stripped.match(/^(.{20,160}?[.!?])\s/);
      if (firstSentence) caption = firstSentence[1];
      else if (stripped.length > 110) caption = stripped.slice(0, 108) + '…';
    } else if (stripped.length > 80) {
      caption = stripped.slice(0, 78) + '…';
    }
    return { x, y, msg: m, index: i, size, href, caption };
  });

  // Pre-count citations per turn so caption placement can dodge cards.
  const citationsPerTurn = new Map<number, number>();
  messages.forEach((m, i) => {
    if (m.role !== 'assistant') return;
    const re = /\[([^\]]+)\]\((\/[a-z0-9-]+\/[a-z0-9-]+\/?)\)/gi;
    let count = 0;
    while (re.exec(m.content) !== null) count++;
    if (count) citationsPerTurn.set(i, count);
  });

  // Threads: a curved path between consecutive nodes, behind everything.
  for (let i = 1; i < nodes.length; i++) {
    const a = nodes[i - 1];
    const b = nodes[i];
    const cx = (a.x + b.x) / 2 + (i % 2 === 0 ? 28 : -28);
    const cy = (a.y + b.y) / 2;
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#9C7A3E');
    path.setAttribute('stroke-width', '1');
    path.setAttribute('stroke-dasharray', '3 5');
    path.setAttribute('opacity', '0.5');
    svg.appendChild(path);
  }

  // Citation parsing: grab markdown links of the form [Title](/collection/slug/)
  type Citation = { title: string; href: string; collection: string; turnIndex: number };
  const citations: Citation[] = [];
  messages.forEach((m, i) => {
    if (m.role !== 'assistant') return;
    const re = /\[([^\]]+)\]\((\/[a-z0-9-]+\/[a-z0-9-]+\/?)\)/gi;
    let match: RegExpExecArray | null;
    const seen = new Set<string>();
    while ((match = re.exec(m.content)) !== null) {
      const href = match[2];
      if (seen.has(href)) continue;
      seen.add(href);
      const title = match[1];
      const collection = (href.split('/').filter(Boolean)[0] || 'articles');
      citations.push({ title, href, collection, turnIndex: i });
    }
  });

  // Render each turn's node + caption (foreignObject so wrapping works).
  nodes.forEach((node) => {
    // Watercolor avatar.
    const img = document.createElementNS(SVG_NS, 'image');
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', node.href);
    img.setAttribute('href', node.href);
    img.setAttribute('x', String(node.x - node.size / 2));
    img.setAttribute('y', String(node.y - node.size / 2));
    img.setAttribute('width', String(node.size));
    img.setAttribute('height', String(node.size));
    svg.appendChild(img);

    // Caption: above node when there are citation cards beside, otherwise to the side.
    const onLeft = node.x > W / 2;
    const captionW = 170;
    const captionH = 60;
    const hasCards = citationsPerTurn.has(node.index);
    let captionX: number; let captionY: number; let textAlign: string;
    if (hasCards) {
      captionX = node.x - captionW / 2;
      captionY = node.y - node.size / 2 - captionH - 4;
      textAlign = 'center';
    } else if (onLeft) {
      captionX = node.x - node.size / 2 - 10 - captionW;
      captionY = node.y - captionH / 2;
      textAlign = 'right';
    } else {
      captionX = node.x + node.size / 2 + 10;
      captionY = node.y - captionH / 2;
      textAlign = 'left';
    }
    const fo = document.createElementNS(SVG_NS, 'foreignObject');
    fo.setAttribute('x', String(captionX));
    fo.setAttribute('y', String(captionY));
    fo.setAttribute('width', String(captionW));
    fo.setAttribute('height', String(captionH));
    const wrap = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    wrap.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');
    wrap.style.cssText = `
      font-family: 'Cedarville Cursive', cursive;
      font-size: 13px;
      line-height: 1.25;
      color: #1A1A1A;
      text-align: ${textAlign};
      white-space: normal;
      overflow: hidden;
    `;
    wrap.textContent = node.caption || (node.msg.role === 'user' ? 'You' : 'The Garden');
    fo.appendChild(wrap);
    svg.appendChild(fo);
  });

  // Render citation cards near their turn's node.
  // Stack vertically below the node so they don't collide with the caption.
  const placedPerTurn = new Map<number, number>();
  citations.forEach((c) => {
    const node = nodes[c.turnIndex];
    if (!node) return;
    const slot = placedPerTurn.get(c.turnIndex) || 0;
    placedPerTurn.set(c.turnIndex, slot + 1);

    const onLeft = node.x > W / 2;
    const cardW = 130;
    const cardH = 24;
    const cardX = onLeft ? node.x - node.size / 2 - 8 - cardW : node.x + node.size / 2 + 8;
    const cardY = node.y + 14 + slot * (cardH + 4);

    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'myc-citation');
    g.setAttribute('cursor', 'pointer');
    g.addEventListener('click', () => { window.open(c.href, '_blank', 'noopener'); });

    // Strip (collection-coloured tab on the left).
    const stripColors: Record<string, string> = {
      articles: '#C5A87A',
      'field-notes': '#8DBE8D',
      seeds: '#D6B07A',
      jottings: '#A8B5D6',
      weblinks: '#9CC4BD',
      videos: '#C5A0BD',
      library: '#B5A89C',
      experiments: '#7EBDC4',
      toolshed: '#6B7A52',
    };
    const strip = document.createElementNS(SVG_NS, 'rect');
    strip.setAttribute('x', String(cardX));
    strip.setAttribute('y', String(cardY));
    strip.setAttribute('width', '6');
    strip.setAttribute('height', String(cardH));
    strip.setAttribute('fill', stripColors[c.collection] || '#C5A87A');
    g.appendChild(strip);

    // Card background.
    const bg = document.createElementNS(SVG_NS, 'rect');
    bg.setAttribute('x', String(cardX + 6));
    bg.setAttribute('y', String(cardY));
    bg.setAttribute('width', String(cardW - 6));
    bg.setAttribute('height', String(cardH));
    bg.setAttribute('fill', '#FFFFFF');
    bg.setAttribute('stroke', '#EDE5D2');
    bg.setAttribute('stroke-width', '1');
    g.appendChild(bg);

    // Title.
    const title = document.createElementNS(SVG_NS, 'text');
    title.setAttribute('x', String(cardX + 12));
    title.setAttribute('y', String(cardY + 16));
    title.setAttribute('font-family', "'Lora', Georgia, serif");
    title.setAttribute('font-size', '11');
    title.setAttribute('fill', '#1A1A1A');
    const truncTitle = c.title.length > 22 ? c.title.slice(0, 20) + '…' : c.title;
    title.textContent = truncTitle;
    g.appendChild(title);

    svg.appendChild(g);

    // Thread from node to card.
    const thread = document.createElementNS(SVG_NS, 'path');
    const tx = onLeft ? cardX + cardW : cardX;
    const ty = cardY + cardH / 2;
    thread.setAttribute('d', `M ${node.x} ${node.y + node.size / 2} Q ${(node.x + tx) / 2} ${(node.y + ty) / 2 + 6} ${tx} ${ty}`);
    thread.setAttribute('fill', 'none');
    thread.setAttribute('stroke', '#6B7A52');
    thread.setAttribute('stroke-width', '0.8');
    thread.setAttribute('stroke-dasharray', '2 4');
    thread.setAttribute('opacity', '0.5');
    svg.insertBefore(thread, g);
  });
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

// ── Ask-mode citation parsing ────────────────────────────────────────────────
//
// Ports the citation logic from /research/ask down to the chat panel scale.
// Walks an assistant bubble's text nodes, swaps `[1]` / `[s1]` markers for
// chips/links pointing at the sources the backend already streamed.
const INTERNAL_SECTIONS = new Set(['articles', 'field-notes', 'seeds', 'jottings', 'experiments']);

function _hrefForSource(src: AskSource | undefined): string {
  if (!src) return '#';
  if (src.kind === 'topic' && src.slug) return `/research/${src.slug}`;
  if (src.kind === 'article' && src.section && src.slug) return `/${src.section}/${src.slug}`;
  if (src.url) return src.url;
  return '#';
}

function applyCitations(rootEl: HTMLElement, sources: AskSource[]): void {
  const map: Record<string, AskSource> = {};
  for (const s of sources) if (s && s.cid) map[s.cid] = s;
  if (!Object.keys(map).length) return;
  const pattern = /\[(s?\d+)\]/g;
  const walk = (node: Node) => {
    if (node.nodeType === 3) {
      const text = node.textContent || '';
      if (!pattern.test(text)) return;
      pattern.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = pattern.exec(text))) {
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const cid = m[1];
        const src = map[cid];
        const isTopic = !cid.startsWith('s');
        const isInternal = !isTopic && src && src.section && INTERNAL_SECTIONS.has(src.section);
        const href = _hrefForSource(src);
        let el: HTMLAnchorElement;
        if (isInternal && src) {
          el = document.createElement('a');
          el.className = 'ask-link-internal';
          el.textContent = src.title;
          el.href = href;
          el.title = `${src.section}/${src.slug}`;
        } else {
          el = document.createElement('a');
          el.className = 'ask-cite ' + (isTopic ? 'topic' : 'src');
          el.textContent = cid.replace(/^s/, '');
          el.title = src ? src.title : `Citation ${cid}`;
          el.href = href;
          if (src && src.url && !isInternal) el.target = '_blank';
        }
        frag.appendChild(el);
        last = m.index + m[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode!.replaceChild(frag, node);
      return;
    }
    if (node.nodeType === 1 && (node as Element).tagName !== 'CODE' && (node as Element).tagName !== 'A') {
      [...node.childNodes].forEach(walk);
    }
  };
  walk(rootEl);
}

function prependSourcesBlock(bubble: HTMLElement, sources: AskSource[]): void {
  if (!sources || !sources.length) return;
  // Remove any prior sources block (live re-render during streaming).
  const prior = bubble.querySelector(':scope > .chat-sources');
  if (prior) prior.remove();
  const details = document.createElement('details');
  details.className = 'chat-sources';
  const articles = sources.filter(s => s.kind === 'article');
  const topics = sources.filter(s => s.kind === 'topic');
  const summary = document.createElement('summary');
  const parts: string[] = [];
  if (articles.length) parts.push(`${articles.length} source${articles.length === 1 ? '' : 's'}`);
  if (topics.length) parts.push(`${topics.length} topic${topics.length === 1 ? '' : 's'}`);
  summary.textContent = parts.join(' · ') || `${sources.length} sources`;
  details.appendChild(summary);
  const ul = document.createElement('ul');
  for (const s of sources) {
    const li = document.createElement('li');
    const cidEl = document.createElement('span');
    cidEl.className = 'src-cid ' + (s.kind === 'topic' ? 'topic' : 'src');
    cidEl.textContent = (s.cid || '').replace(/^s/, '');
    const a = document.createElement('a');
    a.href = _hrefForSource(s);
    a.textContent = s.title || s.slug || s.cid;
    if (s.url && !(s.section && INTERNAL_SECTIONS.has(s.section))) a.target = '_blank';
    li.appendChild(cidEl);
    li.appendChild(a);
    ul.appendChild(li);
  }
  details.appendChild(ul);
  bubble.insertBefore(details, bubble.firstChild);
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

function buildSuggestions(_ctx: PageContext): string[] {
  // First-turn chips: must stand on their own with no prior conversation.
  // The same three universal openers work whether the visitor is on a post,
  // the index, or anywhere else. The garden interprets them in context.
  return [
    'Tell me more',
    'What stands out?',
    'Surprise me',
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
  const inputPebble = `
    <span class="chat-followup chat-followup-input">
      <span class="chip-pebble" aria-hidden="true"></span>
      <input type="text" class="chat-followup-input-field" placeholder="type your own…" aria-label="Your question" />
    </span>
  `;

  history.innerHTML = `
    <div class="chat-empty">
      <p>${intro}</p>
      <div class="chat-followups chat-empty-followups">${buttons}${inputPebble}</div>
    </div>
  `;

  history.querySelectorAll<HTMLButtonElement>('.chat-followup:not(.chat-followup-input)').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q || '';
      if (q) onSuggestion(q);
    });
  });
  const customInput = history.querySelector<HTMLInputElement>('.chat-followup-input-field');
  const customWrap = history.querySelector<HTMLElement>('.chat-followup-input');
  if (customInput) {
    customInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = customInput.value.trim();
        if (q) {
          customInput.value = '';
          onSuggestion(q);
        }
      }
    });
  }
  if (customWrap && customInput) {
    customWrap.addEventListener('click', (e) => {
      if (e.target !== customInput) customInput.focus();
    });
  }
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
  const chipHtml = chips
    .map((q) => `<button type="button" class="chat-followup" data-q="${escapeHtml(q)}"><span class="chip-pebble" aria-hidden="true"></span><span class="chip-text">${escapeHtml(q)}</span></button>`)
    .join('');
  // The fourth pebble is an input the visitor can fill in themselves.
  const inputHtml = `
    <span class="chat-followup chat-followup-input">
      <span class="chip-pebble" aria-hidden="true"></span>
      <input type="text" class="chat-followup-input-field" placeholder="type your own…" aria-label="Your question" />
    </span>
  `;
  wrap.innerHTML = chipHtml + inputHtml;
  history.appendChild(wrap);
  wrap.querySelectorAll<HTMLButtonElement>('.chat-followup:not(.chat-followup-input)').forEach((btn) => {
    btn.addEventListener('click', () => {
      const q = btn.dataset.q || '';
      if (q) onPick(q);
    });
  });
  const customInput = wrap.querySelector<HTMLInputElement>('.chat-followup-input-field');
  const customWrap = wrap.querySelector<HTMLElement>('.chat-followup-input');
  if (customInput) {
    customInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = customInput.value.trim();
        if (q) {
          customInput.value = '';
          onPick(q);
        }
      }
    });
  }
  // Tapping anywhere on the input pebble (including its watercolor body)
  // focuses the input. Without this, on mobile only direct taps on the
  // input's text area would activate it.
  if (customWrap && customInput) {
    customWrap.addEventListener('click', (e) => {
      if (e.target !== customInput) customInput.focus();
    });
  }
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

  // The mycelium variant has been retired from the live chat. The
  // renderMycelium and renderChatSummary functions remain in this file
  // for the standalone prototype's reference, but are not invoked here.
  const renderMyceliumIfWide = () => {};

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
    // Only reveal the gear when there's a real choice to make AND we're in chat mode
    if (promptOptions.length > 1 && conv.mode === 'chat') {
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

  // Mode toggle (This page / The garden). Each mode keeps its own thread.
  const modeButtons = drawer.querySelectorAll<HTMLButtonElement>('.chat-mode-btn');
  const titleEl = document.getElementById('chat-drawer-title') as HTMLElement | null;
  const applyMode = (m: ChatMode, opts?: { rerender?: boolean }) => {
    conv.mode = m;
    saveConversation(conv);
    drawer.dataset.mode = m;
    modeButtons.forEach((b) => {
      const on = b.dataset.mode === m;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    if (titleEl) {
      titleEl.textContent = m === 'ask' ? 'Ask the garden' : 'Talk about this page';
    }
    if (input) {
      input.placeholder = m === 'ask'
        ? 'Ask anything in the garden…'
        : 'Ask about this page, or anything in the garden…';
    }
    // Cogwheel only in chat mode AND only when there are choices.
    if (settingsBtn) {
      if (m === 'ask') {
        settingsBtn.hidden = true;
        settingsPanel.hidden = true;
        settingsBtn.setAttribute('aria-expanded', 'false');
      } else if (promptOptions.length > 1) {
        settingsBtn.hidden = false;
      }
    }
    if (opts?.rerender !== false) renderHistory();
  };
  modeButtons.forEach((b) => {
    b.addEventListener('click', () => {
      const m = (b.dataset.mode === 'ask' ? 'ask' : 'chat') as ChatMode;
      if (m === conv.mode) return;
      if (inFlight && abortController) {
        abortController.abort();
        inFlight = false;
        abortController = null;
      }
      applyMode(m);
    });
  });

  const submitText = (q: string) => {
    input.value = q;
    sendBtn.disabled = false;
    form.requestSubmit();
  };

  const renderHistory = () => {
    history.innerHTML = '';
    const messages = activeMessages(conv);
    if (messages.length === 0) {
      renderEmpty(history, ctx, submitText);
      return;
    }
    for (const m of messages) {
      const html = m.role === 'assistant' ? renderMarkdown(m.content) : escapeHtml(m.content);
      const { bubble } = appendMessage(history, m.role, html);
      if (m.role === 'assistant' && m.sources && m.sources.length) {
        prependSourcesBlock(bubble, m.sources);
        applyCitations(bubble, m.sources);
      }
    }
    // Followups (chip suggestions) only make sense in chat mode.
    if (conv.mode === 'chat') {
      const last = messages[messages.length - 1];
      if (last && last.role === 'assistant') {
        appendFollowups(history, submitText);
      }
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
    conv[conv.mode].messages = [];
    saveConversation(conv);
    renderHistory();
    renderMyceliumIfWide();
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
    if (conv.chat.messages.length > 0) {
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
    if (conv.chat.messages.length > 0) {
      conv.chat.messages = [];
      saveConversation(conv);
      renderHistory();
      renderMyceliumIfWide();
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

    const mode = conv.mode;
    const thread = conv[mode].messages;

    const userMsg: ChatMessage = { role: 'user', content: text };
    thread.push(userMsg);
    saveConversation(conv);
    renderMyceliumIfWide();

    if (thread.length === 1) {
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
    let askSources: AskSource[] = [];

    try {
      const historyToSend = thread.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));

      const url = mode === 'ask' ? `${API_BASE}/api/ask` : `${API_BASE}/api/chat`;
      const body: Record<string, unknown> = mode === 'ask'
        ? {
            question: text,
            history: historyToSend,
            session_id: CHAT_SESSION_ID,
          }
        : {
            message: text,
            history: historyToSend,
            current: ctx,
            prompt_id: selectedPromptId || undefined,
            session_id: CHAT_SESSION_ID,
          };

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
            if (msg.prompt_id !== selectedPromptId) {
              selectedPromptId = msg.prompt_id;
              persistPromptId(msg.prompt_id);
              if (promptOptions.some((p) => p.prompt_id === selectedPromptId)) {
                promptSelect.value = selectedPromptId!;
              }
            }
            continue;
          }
          if (msg.type === 'sources' && Array.isArray(msg.sources)) {
            // /api/ask: emit sources up-front. Save them and render the
            // collapsible sources block above the bubble.
            askSources = msg.sources as AskSource[];
            prependSourcesBlock(bubble, askSources);
            continue;
          }
          if (msg.type === 'token' && typeof msg.text === 'string') {
            assistantText += msg.text;
            if (firstToken) firstToken = false;
            bubble.innerHTML = renderMarkdown(assistantText) + '<span class="chat-cursor" aria-hidden="true"></span>';
            // Re-attach the sources block (innerHTML wipe replaced it).
            if (askSources.length) {
              prependSourcesBlock(bubble, askSources);
              applyCitations(bubble, askSources);
            }
            scheduleScrollToBottom(history);
          } else if (msg.type === 'chips' && Array.isArray(msg.items)) {
            chipItems = msg.items.filter((s: any) => typeof s === 'string').slice(0, 3);
          } else if (msg.type === 'error') {
            errored = msg.error || 'backend error';
          }
          // 'debug' (ask) and 'done' are intentionally ignored.
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
      thread.pop();
      saveConversation(conv);
    } else if (assistantText.trim()) {
      bubble.innerHTML = renderMarkdown(assistantText);
      if (mode === 'ask' && askSources.length) {
        prependSourcesBlock(bubble, askSources);
        applyCitations(bubble, askSources);
      }
      const assistantMsg: ChatMessage = { role: 'assistant', content: assistantText };
      if (mode === 'ask' && askSources.length) assistantMsg.sources = askSources;
      thread.push(assistantMsg);
      saveConversation(conv);
      if (mode === 'chat') {
        appendFollowups(history, submitText, chipItems || undefined);
      }
      renderMyceliumIfWide();
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

  applyMode(conv.mode, { rerender: false });
  renderHistory();
  if (conv.open) {
    openDrawer();
  }
}
