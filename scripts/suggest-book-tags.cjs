/**
 * Suggest enriched tags for library books based on Open Library subjects.
 * Maps subjects to existing garden tag vocabulary.
 *
 * Usage: node scripts/suggest-book-tags.cjs
 */

const fs = require('fs');
const path = require('path');

const SUMMARIES_FILE = path.join(__dirname, 'book-summaries.json');
const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content', 'library');

// Map Open Library subjects to garden tags
const SUBJECT_TO_TAG = {
  'artificial intelligence': 'ai',
  'machine learning': 'ai',
  'robots': 'ai',
  'robotics': 'ai',
  'neural networks': 'ai',
  'chatbots': 'conversation-design',
  'conversation': 'conversation-design',
  'conversational agents': 'conversation-design',
  'dialog systems': 'conversation-design',
  'natural language processing': 'nlp',
  'computational linguistics': 'nlp',
  'linguistics': 'linguistics',
  'sociolinguistics': 'linguistics',
  'psycholinguistics': 'linguistics',
  'design': 'design',
  'user experience': 'design',
  'user interfaces': 'design',
  'human-computer interaction': 'design',
  'accessibility': 'accessibility',
  'voice': 'voice-design',
  'speech': 'voice-design',
  'speech synthesis': 'voice-design',
  'writing': 'writing',
  'rhetoric': 'writing',
  'style': 'writing',
  'feminism': 'feminism',
  'gender': 'feminism',
  'women': 'feminism',
  'fiction': 'fiction',
  'science fiction': 'fiction',
  'speculative fiction': 'fiction',
  'philosophy': 'philosophy',
  'ethics': 'ai-ethics',
  'psychology': 'psychology',
  'cognitive psychology': 'psychology',
  'decision making': 'psychology',
  'reasoning': 'psychology',
  'cognition': 'psychology',
  'thinking': 'psychology',
  'taxonomy': 'knowledge-management',
  'knowledge management': 'knowledge-management',
  'information science': 'knowledge-management',
  'classification': 'knowledge-management',
  'content strategy': 'content-strategy',
  'python': 'python',
  'internet': 'digital-gardens',
};

function readCurrentTags(slug) {
  const file = path.join(CONTENT_DIR, slug + '.md');
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf-8').replace(/\r\n/g, '\n');
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return [];
  const tags = [];
  const lines = fmMatch[1].split('\n');
  let inTags = false;
  for (const line of lines) {
    if (line.match(/^tags:\s*$/)) { inTags = true; continue; }
    if (inTags && line.match(/^\s+-\s+(.+)/)) {
      tags.push(line.match(/^\s+-\s+(.+)/)[1].trim());
    } else if (inTags && !line.match(/^\s+-/)) {
      inTags = false;
    }
  }
  return tags;
}

function main() {
  const summaries = JSON.parse(fs.readFileSync(SUMMARIES_FILE, 'utf-8'));

  const suggestions = [];

  for (const [slug, info] of Object.entries(summaries)) {
    if (!info.subjects || info.subjects.length === 0) continue;

    const currentTags = readCurrentTags(slug);
    const suggestedTags = new Set();

    for (const subj of info.subjects) {
      const lower = subj.toLowerCase();
      for (const [keyword, tag] of Object.entries(SUBJECT_TO_TAG)) {
        if (lower.includes(keyword)) suggestedTags.add(tag);
      }
    }

    // Find new tags (not already present)
    const newTags = [...suggestedTags].filter(t => !currentTags.includes(t));

    if (newTags.length > 0) {
      suggestions.push({
        slug,
        title: info.title,
        currentTags,
        newTags,
        allTags: [...new Set([...currentTags, ...newTags])],
        subjects: info.subjects,
      });
    }
  }

  console.log(`\n=== Tag enrichment suggestions for ${suggestions.length} books ===\n`);

  for (const s of suggestions) {
    console.log(`${s.title}`);
    console.log(`  Current:  ${s.currentTags.join(', ')}`);
    console.log(`  + Add:    ${s.newTags.join(', ')}`);
    console.log(`  Subjects: ${s.subjects.slice(0, 8).join(', ')}`);
    console.log();
  }

  console.log(`Total: ${suggestions.length} books would get new tags`);
}

main();
