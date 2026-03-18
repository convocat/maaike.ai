/**
 * Fetch missing book covers from Open Library.
 * Skips books that already have a cover: field.
 *
 * Usage: node scripts/fetch-book-covers.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const CONTENT_DIR = path.join(__dirname, '..', 'src', 'content', 'library');
const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'library');

// ── HTTP helpers ─────────────────────────────────────────────────────────────

function httpGet(url, binary = false) {
  return new Promise((resolve, reject) => {
    const doGet = (url, redirects) => {
      if (redirects > 5) return reject(new Error('Too many redirects'));
      https.get(url, { headers: { 'User-Agent': 'MaaikeGarden/1.0 (maaike.ai)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return doGet(res.headers.location, redirects + 1);
        }
        if (res.statusCode === 404) return resolve(null);
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const buf = Buffer.concat(chunks);
          if (binary) return resolve(buf);
          try { resolve(JSON.parse(buf.toString())); }
          catch (e) { reject(new Error(`JSON parse: ${buf.toString().slice(0, 100)}`)); }
        });
      }).on('error', reject);
    };
    doGet(url, 0);
  });
}

// ── Open Library search ──────────────────────────────────────────────────────

async function findCoverId(title, author) {
  const params = new URLSearchParams({
    title,
    limit: '5',
    fields: 'key,title,author_name,cover_i',
  });
  if (author) params.set('author', author);

  const data = await httpGet(`https://openlibrary.org/search.json?${params}`);
  if (!data || !data.docs || data.docs.length === 0) {
    // Retry without author
    if (author) {
      const params2 = new URLSearchParams({ title, limit: '5', fields: 'key,title,author_name,cover_i' });
      const data2 = await httpGet(`https://openlibrary.org/search.json?${params2}`);
      if (!data2 || !data2.docs || data2.docs.length === 0) return null;
      return pickCoverId(data2.docs);
    }
    return null;
  }
  return pickCoverId(data.docs);
}

function pickCoverId(docs) {
  // Prefer docs that have a cover_i
  const withCover = docs.filter(d => d.cover_i);
  return withCover.length > 0 ? withCover[0].cover_i : null;
}

async function downloadCover(coverId, destPath) {
  const url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
  const buf = await httpGet(url, true);
  if (!buf || buf.length < 500) return false; // not a real image
  fs.writeFileSync(destPath, buf);
  return true;
}

// ── Parse frontmatter ────────────────────────────────────────────────────────

function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w[\w_-]*):\s*"?([^"]*)"?\s*$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

function addCoverToFrontmatter(src, coverPath) {
  // Insert cover: after author: line
  return src.replace(
    /^(author:.*)/m,
    `$1\ncover: "${coverPath}"`
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const files = fs.readdirSync(CONTENT_DIR)
    .filter(f => f.endsWith('.md'))
    .map(f => ({ file: f, slug: f.replace('.md', ''), fullPath: path.join(CONTENT_DIR, f) }));

  const toFetch = [];
  for (const item of files) {
    const src = fs.readFileSync(item.fullPath, 'utf8');
    if (src.includes('\ncover:') || src.includes('\ncover: ')) continue; // already has cover
    const fm = parseFrontmatter(src);
    if (!fm || !fm.title) continue;
    toFetch.push({ ...item, title: fm.title, author: fm.author || '', src });
  }

  console.log(`${toFetch.length} books without covers\n`);

  let fetched = 0, failed = 0;

  for (const book of toFetch) {
    const imgFile = `${book.slug}.jpg`;
    const imgPath = path.join(IMAGES_DIR, imgFile);
    const coverField = `/images/library/${imgFile}`;

    process.stdout.write(`${book.title} … `);

    try {
      const coverId = await findCoverId(book.title, book.author);
      if (!coverId) { console.log('not found'); failed++; continue; }

      const ok = await downloadCover(coverId, imgPath);
      if (!ok) { console.log('image too small / invalid'); failed++; continue; }

      const updated = addCoverToFrontmatter(book.src, coverField);
      fs.writeFileSync(book.fullPath, updated);
      console.log(`✓ ${coverField}`);
      fetched++;
    } catch (err) {
      console.log(`error: ${err.message}`);
      failed++;
    }

    await new Promise(r => setTimeout(r, 800));
  }

  console.log(`\nDone: ${fetched} fetched, ${failed} not found/failed`);
}

main().catch(err => { console.error(err); process.exit(1); });
