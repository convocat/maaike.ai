/**
 * Generate scored-books.json for the library book recommender.
 * Scores all unread/to-read/started books and picks main, side, and wildcard.
 *
 * Run: node scripts/generate-book-recommendations.cjs
 */

const fs   = require('fs');
const path = require('path');

const LIBRARY_DIR = path.join(__dirname, '../src/content/library');
const OUTPUT_FILE = path.join(__dirname, '../public/scored-books.json');

// Core interest tags — high topic match score
const CORE_INTERESTS = [
  'ai', 'ai-ethics', 'ai-tools', 'llm', 'nlp',
  'conversation-design', 'conversational-ai', 'voice',
  'content-design', 'content-strategy', 'writing', 'linguistics',
  'design', 'ux', 'human-behavior', 'psychology',
  'philosophy', 'systems', 'ecology',
  'digital-gardens', 'knowledge-management', 'personal-knowledge',
  'productivity', 'learning',
];

// Favourite authors — boost experience score
const FAVOURITE_AUTHORS = [
  'terry pratchett', 'ursula le guin', 'virginia woolf',
  'douglas hofstadter', 'borges',
];

// ── Frontmatter parser (same as build-explore-data.cjs) ──────────────────────

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fm = {};
  const lines = match[1].split(/\r?\n/);
  let currentKey = null;
  let inArray = false;

  for (const line of lines) {
    if (inArray && /^\s+-\s+/.test(line)) {
      fm[currentKey].push(line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, ''));
      continue;
    }
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const key   = kvMatch[1];
      let value   = kvMatch[2].trim().replace(/^["']|["']$/g, '');
      inArray     = false;
      if (value === '') {
        fm[key]   = [];
        inArray   = true;
        currentKey = key;
      } else if (value === 'true')  { fm[key] = true; }
      else if (value === 'false')   { fm[key] = false; }
      else if (value === 'null')    { fm[key] = null; }
      else if (!isNaN(Number(value)) && value !== '') { fm[key] = Number(value); }
      else { fm[key] = value; }
      if (!inArray) currentKey = key;
    }
  }
  return fm;
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreTopicMatch(tags) {
  const matched = (tags || []).filter(t => CORE_INTERESTS.includes(t));
  return { score: Math.min(matched.length * 25, 100), matched };
}

function scoreExperience(book) {
  let score = 50;
  const author = String(book.author || '').toLowerCase();
  if (FAVOURITE_AUTHORS.some(a => author.includes(a))) score += 25;
  if (book.book_type === 'fiction')      score += 10;
  if (book.purpose === 'professional')   score += 5;
  if (book.reason && book.reason.length > 10) score += 5;
  if (book.description)                  score += 5;
  return Math.min(score, 100);
}

function scoreFreshness(book) {
  if (book.status === 'reading' || book.status === 'started') return 80;
  const added = book.date ? new Date(book.date) : new Date('2024-01-01');
  const ageMonths = (Date.now() - added.getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (ageMonths > 12) return 85;
  if (ageMonths > 6)  return 65;
  if (ageMonths > 3)  return 45;
  return 25;
}

function scoreGarden(tags) {
  // Tag overlap with broad garden themes
  const gardenTags = [
    'ai', 'design', 'writing', 'digital-gardens', 'systems',
    'conversation-design', 'content-design', 'philosophy',
  ];
  const matched = (tags || []).filter(t => gardenTags.includes(t));
  return { score: Math.min(matched.length * 20, 100), matched };
}

function totalScore(scores) {
  return Math.round(
    scores.topic_match * 0.30 +
    scores.experience  * 0.25 +
    50                 * 0.25 + // mood: default neutral (50)
    scores.garden.score * 0.10 +
    scores.freshness   * 0.10
  );
}

function whyLabel(book, scores) {
  if (book.status === 'reading' || book.status === 'started') return 'Already started';
  const author = String(book.author || '').toLowerCase();
  if (FAVOURITE_AUTHORS.some(a => author.includes(a))) return `By ${book.author}`;
  if (scores.topic_match > 60) return 'Matches your interests';
  if (scores.freshness > 70) return 'Rediscovery';
  if (book.purpose === 'professional') return 'For your work';
  return 'From your pile';
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = fs.readdirSync(LIBRARY_DIR).filter(f => f.endsWith('.md'));

const books = [];
for (const file of files) {
  const fm = parseFrontmatter(path.join(LIBRARY_DIR, file));
  if (!fm) continue;
  if (fm.draft === true) continue;

  // Only recommend unread books
  const status = (fm.status || '').toLowerCase();
  if (status === 'read') continue;

  const tags = Array.isArray(fm.tags) ? fm.tags : [];
  const topicResult   = scoreTopicMatch(tags);
  const gardenResult  = scoreGarden(tags);
  const experience    = scoreExperience(fm);
  const freshness     = scoreFreshness(fm);

  const scores = {
    topic_match:      topicResult.score,
    matched_keywords: topicResult.matched,
    experience,
    garden: {
      score:          gardenResult.score,
      matching_tags:  gardenResult.matched,
      matching_projects: [],
    },
    freshness,
  };
  scores.total = totalScore(scores);

  books.push({
    id:     file.replace(/\.md$/, ''),
    title:  fm.title,
    author: fm.author,
    genre:  fm.genre || '',
    status: fm.status || 'unread',
    type:   fm.book_type || 'non-fiction',
    purpose: fm.purpose || 'personal',
    reason: fm.reason || null,
    notes:  fm.notes  || null,
    rating: fm.rating || null,
    review: fm.review || null,
    scores,
    why: whyLabel(fm, scores),
    tags,
  });
}

books.sort((a, b) => b.scores.total - a.scores.total);

// Pick main: highest scoring non-fiction OR professional
const mainCandidates = books.filter(b => b.type === 'non-fiction' || b.purpose === 'professional');
const main = mainCandidates[0] || books[0];

// Pick side: highest scoring fiction OR personal (different from main)
const sideCandidates = books.filter(b => b.id !== main?.id && (b.type === 'fiction' || b.purpose === 'personal'));
const side = sideCandidates[0] || books.find(b => b.id !== main?.id);

// Pick wildcard: random from top 20, different genre from main
const top20 = books.filter(b => b.id !== main?.id && b.id !== side?.id).slice(0, 20);
const wildcard = top20[Math.floor(Math.random() * top20.length)];

const output = {
  mix: { main, side, wildcard },
  all_scored: books,
  generated: new Date().toISOString(),
  total_scored: books.length,
};

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
console.log(`Scored ${books.length} books → ${OUTPUT_FILE}`);
console.log(`Main: ${main?.title}`);
console.log(`Side: ${side?.title}`);
console.log(`Wildcard: ${wildcard?.title}`);
