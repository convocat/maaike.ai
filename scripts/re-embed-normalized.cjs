/**
 * Re-embed all garden items using NORMALIZED input:
 *   Title + Description + Tags + Keyphrases + Reason (no body text).
 *
 * This levels the playing field so that a video about conversation design
 * lands near an article about conversation design, instead of clustering
 * by content length/format. Keyphrases and reason fields add semantic
 * richness without reintroducing length bias.
 *
 * Requires: Ollama running with bge-m3 model loaded.
 * Output:   scripts/embeddings-bge-m3.json (overwrites existing)
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content');
const OUTPUT_FILE = path.join(__dirname, 'embeddings-bge-m3.json');
const MODEL = 'bge-m3';
const COLLECTIONS = ['articles', 'field-notes', 'seeds', 'weblinks', 'videos', 'library', 'experiments'];

// ---------------------------------------------------------------------------
// Parse frontmatter
// ---------------------------------------------------------------------------

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)/);
  if (!match) return [{}, raw];
  const fmBlock = match[1];
  const body = match[2];

  const fm = {};
  let currentKey = null;
  let inArray = false;

  for (const line of fmBlock.split('\n')) {
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const [, key, value] = kvMatch;
      if (value.trim() === '') {
        fm[key] = [];
        currentKey = key;
        inArray = true;
      } else {
        fm[key] = value.replace(/^["']|["']$/g, '').trim();
        currentKey = key;
        inArray = false;
      }
    } else if (inArray && line.match(/^\s+-\s+(.+)/)) {
      const val = line.match(/^\s+-\s+(.+)/)[1].replace(/^["']|["']$/g, '').trim();
      if (Array.isArray(fm[currentKey])) fm[currentKey].push(val);
    }
  }
  return [fm, body];
}

// ---------------------------------------------------------------------------
// Build normalized text: title + description + tags + keyphrases + reason
// ---------------------------------------------------------------------------

// Load keyphrases if available
const KEYPHRASES_FILE = path.join(__dirname, '..', 'keyphrase-results.json');
let keyphraseMap = {};
if (fs.existsSync(KEYPHRASES_FILE)) {
  const kpData = JSON.parse(fs.readFileSync(KEYPHRASES_FILE, 'utf-8'));
  for (const item of kpData.items) {
    keyphraseMap[item.slug] = (item.llm_phrases || []).slice(0, 5);
  }
}

function buildNormalizedText(fm, slug) {
  const parts = [];

  const title = fm.title || slug;
  parts.push(`Title: ${title}`);

  if (fm.description) {
    parts.push(`Description: ${fm.description}`);
  }

  if (Array.isArray(fm.tags) && fm.tags.length > 0) {
    parts.push(`Topics: ${fm.tags.join(', ')}`);
  }

  if (fm.author) {
    parts.push(`Author: ${fm.author}`);
  }

  // Include keyphrases for richer semantic signal
  const kp = keyphraseMap[slug];
  if (kp && kp.length > 0) {
    parts.push(`Key concepts: ${kp.join(', ')}`);
  }

  // Include reason field (library books) for Maaike's personal context
  if (fm.reason) {
    parts.push(`Why it matters: ${fm.reason}`);
  }

  return parts.join('. ') + '.';
}

// ---------------------------------------------------------------------------
// Read all content items
// ---------------------------------------------------------------------------

function readAllContent() {
  const items = [];
  for (const collection of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, collection);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const [fm] = parseFrontmatter(raw);

      if (fm.draft === 'true' || fm.draft === true) continue;

      const slug = file.replace('.md', '');
      const text = buildNormalizedText(fm, slug);

      items.push({
        slug,
        title: fm.title || slug,
        collection,
        text,
      });
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Embed via Ollama
// ---------------------------------------------------------------------------

function embed(text) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ model: MODEL, input: text });
    const req = http.request({
      hostname: 'localhost',
      port: 11434,
      path: '/api/embed',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.embeddings[0]);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data.slice(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Reading content with NORMALIZED input (title + description + tags + keyphrases + reason)...');
  const items = readAllContent();
  console.log(`Found ${items.length} items`);

  // Show a sample
  console.log('\nSample inputs:');
  for (const sample of items.slice(0, 3)) {
    console.log(`  [${sample.collection}] ${sample.slug}:`);
    console.log(`    "${sample.text.slice(0, 120)}..."`);
  }
  console.log();

  console.log(`Embedding ${items.length} items with ${MODEL}...`);
  const embeddings = [];
  for (let i = 0; i < items.length; i++) {
    const vec = await embed(items[i].text);
    embeddings.push(vec);
    if ((i + 1) % 10 === 0 || i === items.length - 1) {
      console.log(`  ${i + 1}/${items.length} done`);
    }
  }

  // Save
  const output = {
    model: MODEL,
    method: 'normalized (title + description + tags + keyphrases + reason)',
    items: items.map(item => ({
      slug: item.slug,
      title: item.title,
      collection: item.collection,
    })),
    embeddings,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output));
  console.log(`\nSaved ${items.length} embeddings to ${OUTPUT_FILE}`);
  console.log('Now run: node scripts/build-explore-data.cjs');
}

main().catch(err => { console.error(err); process.exit(1); });
