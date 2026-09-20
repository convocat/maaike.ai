#!/usr/bin/env node
/**
 * Content validator for the digital garden.
 * Parses all markdown frontmatter, checks for YAML errors, unsafe values,
 * and missing required fields per collection.
 *
 * Usage:
 *   node scripts/validate-content.mjs
 *   node scripts/validate-content.mjs --fix-report   # show fixable issues only
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, extname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const yaml = require('js-yaml');

// ── Config ────────────────────────────────────────────────────────────────────

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
const CONTENT_DIR = join(ROOT, 'src', 'content');

const SHARED_FIELDS = ['title', 'date', 'maturity'];

const REQUIRED_BY_COLLECTION = {
  articles:     [...SHARED_FIELDS],
  'field-notes': [...SHARED_FIELDS],
  seeds:        [...SHARED_FIELDS],
  weblinks:     [...SHARED_FIELDS, 'url'],
  videos:       [...SHARED_FIELDS, 'url'],
  library:      [...SHARED_FIELDS, 'author', 'status'],
  experiments:  [...SHARED_FIELDS],
  jottings:     [...SHARED_FIELDS],
  tags:         ['title'], // tag definition files only need a title
};

const VALID_MATURITY         = ['draft', 'developing', 'solid', 'complete', 'compost'];
const VALID_STATUS           = ['reading', 'read', 'to-read', 'abandoned'];
const VALID_JOTTING_TYPE     = ['note', 'quote', 'event', 'link', 'post'];
const VALID_AI               = ['100% Maai', 'assisted', 'co-created', 'generated'];
const VALID_BOOK_TYPE        = ['fiction', 'non-fiction'];
const VALID_PURPOSE          = ['personal', 'professional'];
const VALID_RATING           = ['loved it', 'liked it', 'meh', 'disappointing'];
const VALID_TOOLSHED_CATEGORY = ['design', 'technical'];

// Collections scripts/generate-og-images.cjs generates images for — keep in sync.
const OG_COLLECTIONS = ['articles', 'field-notes', 'seeds', 'jottings'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function walkDir(dir, exts = ['.md']) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkDir(full, exts));
    } else if (exts.includes(extname(entry))) {
      results.push(full);
    }
  }
  return results;
}

function extractFrontmatter(src) {
  const match = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : null;
}

/**
 * Detect unquoted string values that contain ': ' (colon-space).
 * These will parse fine in js-yaml but can break stricter parsers
 * (e.g. Astro's production build).
 *
 * Heuristic: lines where the value starts without a quote character
 * but contains ': ' somewhere after the key.
 */
function findUnsafeColons(rawYaml) {
  const unsafe = [];
  const lines = rawYaml.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match  key: value  (value doesn't start with ", ', |, >, [, {)
    const m = line.match(/^(\s*[\w-]+):\s+([^"'|>{[\s].*)$/);
    if (m) {
      const value = m[2];
      if (value.includes(': ')) {
        unsafe.push({ line: i + 1, text: line.trim() });
      }
    }
  }
  return unsafe;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const EXCLUDED_DIRS = ['_inbox', '_templates'];
const files = walkDir(CONTENT_DIR).filter(f => {
  const rel = relative(CONTENT_DIR, f).replace(/\\/g, '/');
  return !EXCLUDED_DIRS.some(dir => rel.startsWith(dir + '/'));
});
let errors = 0;
let warnings = 0;

for (const file of files) {
  const rel = relative(CONTENT_DIR, file).replace(/\\/g, '/');
  const collection = rel.split('/')[0];
  const src = readFileSync(file, 'utf8');
  const rawFm = extractFrontmatter(src);
  const fileLabel = `  ${rel}`;

  if (!rawFm) {
    console.error(`✗ No frontmatter found\n${fileLabel}`);
    errors++;
    continue;
  }

  // 1. YAML parse check
  let data;
  try {
    data = yaml.load(rawFm);
  } catch (e) {
    console.error(`✗ YAML parse error: ${e.message}\n${fileLabel}`);
    errors++;
    continue;
  }

  const fileErrors = [];
  const fileWarnings = [];

  // 2. Unsafe colon-space check
  const unsafe = findUnsafeColons(rawFm);
  for (const u of unsafe) {
    fileErrors.push(`  line ${u.line}: unquoted value contains ': '  →  ${u.text}`);
  }

  // 3. Required fields
  const required = REQUIRED_BY_COLLECTION[collection] ?? SHARED_FIELDS;
  for (const field of required) {
    if (data[field] == null) {
      fileErrors.push(`  missing required field: ${field}`);
    }
  }

  // 4. Enum validation
  if (data.maturity && !VALID_MATURITY.includes(data.maturity)) {
    fileErrors.push(`  invalid maturity: "${data.maturity}" (expected: ${VALID_MATURITY.join(', ')})`);
  }
  if (data.ai && !VALID_AI.includes(data.ai)) {
    fileErrors.push(`  invalid ai: "${data.ai}" (expected: ${VALID_AI.join(', ')})`);
  }
  if (collection === 'jottings' && data.type && !VALID_JOTTING_TYPE.includes(data.type)) {
    fileErrors.push(`  invalid jotting type: "${data.type}" (expected: ${VALID_JOTTING_TYPE.join(', ')})`);
  }
  if (collection === 'toolshed' && data.category && !VALID_TOOLSHED_CATEGORY.includes(data.category)) {
    fileErrors.push(`  invalid toolshed category: "${data.category}" (expected: ${VALID_TOOLSHED_CATEGORY.join(', ')})`);
  }
  if (collection === 'library') {
    if (data.status && !VALID_STATUS.includes(data.status)) {
      fileErrors.push(`  invalid status: "${data.status}" (expected: ${VALID_STATUS.join(', ')})`);
    }
    if (data.book_type && !VALID_BOOK_TYPE.includes(data.book_type)) {
      fileErrors.push(`  invalid book_type: "${data.book_type}" (expected: ${VALID_BOOK_TYPE.join(', ')})`);
    }
    if (data.purpose && !VALID_PURPOSE.includes(data.purpose)) {
      fileErrors.push(`  invalid purpose: "${data.purpose}" (expected: ${VALID_PURPOSE.join(', ')})`);
    }
    if (data.rating && !VALID_RATING.includes(data.rating)) {
      fileErrors.push(`  invalid rating: "${data.rating}" (expected: ${VALID_RATING.join(', ')})`);
    }
  }

  // 5. Triples format check
  if (data.triples) {
    if (!Array.isArray(data.triples)) {
      fileErrors.push(`  triples: must be an array`);
    } else {
      data.triples.forEach((t, i) => {
        if (!Array.isArray(t) || t.length !== 3 || !t.every(s => typeof s === 'string')) {
          fileErrors.push(`  triples[${i}]: must be ["subject", "predicate", "object"], got: ${JSON.stringify(t)}`);
        }
      });
    }
  }

  // 6. Weblink quality checks
  if (collection === 'weblinks' && data.draft === false) {
    // Redirect wrapper URLs should never be stored as the canonical URL
    const REDIRECT_PATTERNS = [
      /linkedin\.com\/safety\/go\//i,
      /l\.facebook\.com\/l\.php/i,
      /t\.co\//i,
    ];
    if (data.url && REDIRECT_PATTERNS.some(p => p.test(data.url))) {
      fileErrors.push(`  weblink url is a redirect wrapper (resolve to real URL): ${data.url.slice(0, 80)}`);
    }

    // Generic platform titles indicate a failed meta-fetch
    const GENERIC_TITLES = ['linkedin', 'youtube', '- youtube', 'twitter', 'instagram', 'facebook', 'x'];
    if (data.title && GENERIC_TITLES.includes(data.title.toLowerCase().trim())) {
      fileErrors.push(`  weblink title "${data.title}" looks like a failed meta-fetch — add a real title`);
    }
  }

  // 7. Date sanity
  if (data.date && isNaN(new Date(data.date).getTime())) {
    fileWarnings.push(`  invalid date: "${data.date}"`);
  }
  if (data.updated && isNaN(new Date(data.updated).getTime())) {
    fileWarnings.push(`  invalid updated date: "${data.updated}"`);
  }

  // 8. OG image must exist for published posts in OG-covered collections.
  // Catches content committed with raw git commands instead of /publish
  // (which runs scripts/generate-og-images.cjs as part of its housekeeping) —
  // the symptom is the "Copy card" button on the live post having nothing to
  // fetch. Run `node scripts/generate-og-images.cjs` or `/publish`, not a raw commit.
  if (OG_COLLECTIONS.includes(collection) && data.draft !== true) {
    const slug = rel.split('/')[1]?.replace(/\.md$/, '');
    const ogPath = join(ROOT, 'public', 'images', 'og', collection, `${slug}.png`);
    if (slug && !existsSync(ogPath)) {
      fileErrors.push(`  missing OG image: public/images/og/${collection}/${slug}.png — run node scripts/generate-og-images.cjs (or /publish, never a raw commit)`);
    }
  }

  if (fileErrors.length) {
    console.error(`✗ ${rel}`);
    fileErrors.forEach(e => console.error(e));
    errors += fileErrors.length;
  }
  if (fileWarnings.length) {
    console.warn(`⚠ ${rel}`);
    fileWarnings.forEach(w => console.warn(w));
    warnings += fileWarnings.length;
  }
}

// ── triples.json topic ID check ───────────────────────────────────────────────
// Topic IDs are used as URL slugs in /research/[slug].astro — they must be
// URL-safe: no slashes, spaces, or other characters that break routing.
const TRIPLES_PATH = join(ROOT, 'src', 'data', 'triples.json');
const URL_UNSAFE = /[/\s?#%&=+]/;

if (existsSync(TRIPLES_PATH)) {
  let triplesData;
  try {
    triplesData = JSON.parse(readFileSync(TRIPLES_PATH, 'utf8'));
  } catch (e) {
    console.error(`✗ triples.json: JSON parse error: ${e.message}`);
    errors++;
  }
  if (triplesData?.topics) {
    for (const id of Object.keys(triplesData.topics)) {
      if (URL_UNSAFE.test(id)) {
        console.error(`✗ triples.json: topic ID contains URL-unsafe character: "${id}"`);
        console.error(`  Rename to use only lowercase letters, digits, and hyphens.`);
        errors++;
      }
    }
  }
}

// ── Local absolute path check ─────────────────────────────────────────────────
// The site is built from the files on Maaike's own machine, so a Windows path
// pasted into a note or a component ships straight to maaike.ai. /backlog and
// /toolshed did exactly that: both are rendered from .claude/backlog.md, which
// carried absolute home-directory paths, username and all, into the public HTML.
//
// Everything that can reach a rendered page is scanned. Scripts that only ever
// run locally (the .bat launchers, which legitimately point at the Git install
// directory) are not, because nothing they contain is published.
//
// The pattern needs a drive letter, a separator, and a real first path segment,
// so a deliberately elided quote such as "C:\...\schedule.docx" is left alone.
const LOCAL_PATH = /(?<![A-Za-z0-9])[A-Za-z]:[\\/][A-Za-z0-9_$][^\s'"`)\]]*/;

const RENDERED_SOURCES = [
  ...files,
  ...walkDir(join(ROOT, 'src', 'pages'), ['.astro', '.ts', '.js', '.mjs', '.md']),
  ...walkDir(join(ROOT, 'src', 'components'), ['.astro', '.ts', '.js', '.mjs']),
  ...walkDir(join(ROOT, 'src', 'layouts'), ['.astro', '.ts', '.js', '.mjs']),
  ...walkDir(join(ROOT, 'src', 'data'), ['.json']),
  join(ROOT, '.claude', 'backlog.md'),
  join(ROOT, '.claude', 'health-report.md'),
];

const seenSources = new Set();
for (const file of RENDERED_SOURCES) {
  if (seenSources.has(file) || !existsSync(file)) continue;
  seenSources.add(file);

  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const hit = line.match(LOCAL_PATH);
    if (!hit) return;
    console.error(`✗ ${rel}:${i + 1}: local absolute path would be published: ${hit[0].slice(0, 100)}`);
    console.error(`  Use a repo-relative path (scripts/foo.mjs) or a home-relative one (~/.claude/plans/foo.md).`);
    errors++;
  });
}

console.log(`\n─────────────────────────────────────────`);
console.log(`Checked ${files.length} files.`);
if (errors === 0 && warnings === 0) {
  console.log('✓ All content valid.');
} else {
  if (errors)   console.error(`${errors} error(s) found.`);
  if (warnings) console.warn(`${warnings} warning(s) found.`);
}

process.exit(errors > 0 ? 1 : 0);
