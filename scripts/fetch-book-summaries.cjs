/**
 * Fetch book descriptions and subjects from Open Library for all library items.
 * No API key needed.
 *
 * Output: scripts/book-summaries.json
 *
 * Usage: node scripts/fetch-book-summaries.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content', 'library');
const OUTPUT_FILE = path.join(__dirname, 'book-summaries.json');

// ---------------------------------------------------------------------------
// HTTPS GET (JSON), follows redirects
// ---------------------------------------------------------------------------
function httpGetJSON(url) {
  return new Promise((resolve, reject) => {
    const doGet = (url, redirects) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      https.get(url, { headers: { 'User-Agent': 'MaaikeGarden/1.0 (maaike.ai)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doGet(res.headers.location, redirects + 1);
        }
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error(`JSON parse error: ${data.slice(0, 200)}`)); }
        });
      }).on('error', reject);
    };
    doGet(url, 0);
  });
}

// ---------------------------------------------------------------------------
// Search Open Library
// ---------------------------------------------------------------------------
async function searchBook(title, author) {
  const params = new URLSearchParams({
    title: title,
    limit: '3',
    fields: 'key,title,author_name,subject,description,first_sentence',
  });
  if (author) params.set('author', author);

  const url = `https://openlibrary.org/search.json?${params.toString()}`;
  const result = await httpGetJSON(url);

  if (!result.docs || result.docs.length === 0) {
    // Retry without author
    if (author) {
      const params2 = new URLSearchParams({
        title: title,
        limit: '3',
        fields: 'key,title,author_name,subject,description,first_sentence',
      });
      const url2 = `https://openlibrary.org/search.json?${params2.toString()}`;
      const result2 = await httpGetJSON(url2);
      if (!result2.docs || result2.docs.length === 0) return null;
      return pickBest(result2.docs, title, author);
    }
    return null;
  }

  return pickBest(result.docs, title, author);
}

function pickBest(docs, title, author) {
  const titleLower = title.toLowerCase().replace(/[^a-z0-9\s]/g, '');
  let best = null;
  let bestScore = -1;

  for (const doc of docs) {
    const docTitle = (doc.title || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
    const docAuthors = (doc.author_name || []).join(' ').toLowerCase();

    let score = 0;
    for (const word of titleLower.split(/\s+/)) {
      if (word.length > 2 && docTitle.includes(word)) score += 2;
    }
    if (author && docAuthors.includes(author.toLowerCase().split(' ').pop())) score += 5;
    if (doc.description) score += 3;
    if (doc.subject && doc.subject.length > 0) score += 2;

    if (score > bestScore) {
      bestScore = score;
      best = doc;
    }
  }

  if (!best || bestScore < 3) return null;

  // Clean up subjects: remove call numbers, classification codes, etc.
  const subjects = (best.subject || [])
    .filter(s => {
      if (/^\d/.test(s)) return false;          // starts with number
      if (/^[A-Z]{1,3}\d/.test(s)) return false; // call number like "BF441"
      if (s.includes('nyt:')) return false;       // NYT list codes
      if (s.length > 50) return false;            // too long
      if (s.includes(':')) return false;           // classification
      return true;
    })
    .slice(0, 15);

  // Description can be a string or an object { value: "..." }
  let description = '';
  if (typeof best.description === 'string') {
    description = best.description;
  } else if (best.description && best.description.value) {
    description = best.description.value;
  }

  return {
    openLibraryTitle: best.title,
    description,
    subjects,
  };
}

// ---------------------------------------------------------------------------
// Read all library items
// ---------------------------------------------------------------------------
function readLibraryItems() {
  const items = [];
  for (const file of fs.readdirSync(CONTENT_DIR)) {
    if (!file.endsWith('.md')) continue;
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8').replace(/\r\n/g, '\n');
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) continue;

    const titleMatch = fmMatch[1].match(/^title:\s*["']?(.+?)["']?\s*$/m);
    const authorMatch = fmMatch[1].match(/^author:\s*["']?(.+?)["']?\s*$/m);
    const draftMatch = fmMatch[1].match(/^draft:\s*(.+)/m);

    if (draftMatch && draftMatch[1].trim() === 'true') continue;

    items.push({
      slug: file.replace('.md', ''),
      title: titleMatch ? titleMatch[1] : file.replace('.md', ''),
      author: authorMatch ? authorMatch[1] : '',
    });
  }
  return items;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const books = readLibraryItems();
  console.log(`Found ${books.length} library items\n`);

  // Load existing results
  let existing = {};
  if (fs.existsSync(OUTPUT_FILE)) {
    try { existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf-8')); } catch {}
  }

  const results = { ...existing };
  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  for (const book of books) {
    if (results[book.slug] && (results[book.slug].description || results[book.slug].subjects)) {
      process.stdout.write(`  ${book.slug}... cached\n`);
      skipped++;
      continue;
    }

    process.stdout.write(`  ${book.slug}... `);
    try {
      const info = await searchBook(book.title, book.author);
      if (info) {
        results[book.slug] = {
          title: book.title,
          author: book.author,
          openLibraryTitle: info.openLibraryTitle,
          description: info.description,
          subjects: info.subjects,
          descWordCount: info.description ? info.description.split(/\s+/).length : 0,
        };
        console.log(`OK (${results[book.slug].descWordCount} words, ${info.subjects.length} subjects)`);
        fetched++;
      } else {
        console.log('not found');
        failed++;
      }
    } catch (err) {
      console.log(`error: ${err.message}`);
      failed++;
    }

    // Be polite
    await new Promise(r => setTimeout(r, 1000));
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`\nDone: ${fetched} fetched, ${skipped} cached, ${failed} not found`);
  console.log(`Saved to ${OUTPUT_FILE}`);
}

main().catch(err => { console.error(err); process.exit(1); });
