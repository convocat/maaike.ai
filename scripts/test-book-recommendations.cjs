/**
 * Test suite for generate-book-recommendations.cjs
 *
 * Catches:
 * - Frontmatter parser edge cases (empty strings, numeric coercion, arrays)
 * - Output structure correctness
 * - Type safety on all book fields
 *
 * Run: node scripts/test-book-recommendations.cjs
 */

const fs   = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}${detail ? ': ' + detail : ''}`);
    failed++;
  }
}

// ── 1. Parser edge cases ──────────────────────────────────────────────────────

console.log('\n1. Frontmatter parser edge cases');

// Inline the parser so we test exactly what the script uses
function parseFrontmatter(raw) {
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
      const key = kvMatch[1];
      let value = kvMatch[2].trim();
      inArray = false;
      currentKey = key;
      if (value === '' || value === '[]') {
        fm[key] = [];
        inArray = value === '';
        continue;
      }
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (value === 'true')       fm[key] = true;
      else if (value === 'false') fm[key] = false;
      else if (value === 'null')  fm[key] = null;
      else                        fm[key] = value;
    }
  }
  return fm;
}

const edgeCases = `---
author: ""
description: ""
title: "Normal title"
flag: true
count: 42
tags:
  - one
  - two
empty_array: []
plain: hello
---`;

const parsed = parseFrontmatter(edgeCases);

assert('empty quoted string → empty string (not array)',
  parsed.author === '' && !Array.isArray(parsed.author),
  `got: ${JSON.stringify(parsed.author)}`);

assert('empty quoted description → empty string',
  parsed.description === '' && !Array.isArray(parsed.description),
  `got: ${JSON.stringify(parsed.description)}`);

assert('quoted title → string',
  parsed.title === 'Normal title',
  `got: ${JSON.stringify(parsed.title)}`);

assert('boolean true → boolean',
  parsed.flag === true,
  `got: ${JSON.stringify(parsed.flag)}`);

assert('numeric string stays as string (no coercion)',
  typeof parsed.count === 'string',
  `got type: ${typeof parsed.count}, value: ${JSON.stringify(parsed.count)}`);

assert('array with items → array',
  Array.isArray(parsed.tags) && parsed.tags.length === 2,
  `got: ${JSON.stringify(parsed.tags)}`);

assert('empty array literal → empty array',
  Array.isArray(parsed.empty_array) && parsed.empty_array.length === 0,
  `got: ${JSON.stringify(parsed.empty_array)}`);

assert('unquoted string → string',
  parsed.plain === 'hello',
  `got: ${JSON.stringify(parsed.plain)}`);

// ── 2. Output structure ───────────────────────────────────────────────────────

console.log('\n2. scored-books.json structure');

const outputPath = path.join(__dirname, '../public/scored-books.json');
assert('scored-books.json exists', fs.existsSync(outputPath));

const data = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));

assert('has all_scored array', Array.isArray(data.all_scored));
assert('has mix object', data.mix && typeof data.mix === 'object');
assert('mix.main exists', data.mix.main != null);
assert('mix.side exists', data.mix.side != null);
assert('mix.wildcard exists', data.mix.wildcard != null);
assert('at least 10 books scored', data.all_scored.length >= 10,
  `got: ${data.all_scored.length}`);

// ── 3. Type safety on all books ───────────────────────────────────────────────

console.log('\n3. Type safety on all scored books');

let titleErrors = [], authorErrors = [], scoresErrors = [], gardenErrors = [];

for (const book of data.all_scored) {
  if (typeof book.title  !== 'string') titleErrors.push(book.id);
  if (typeof book.author !== 'string') authorErrors.push(book.id);
  if (!book.scores || typeof book.scores !== 'object') scoresErrors.push(book.id);
  if (!book.scores?.garden || typeof book.scores.garden.score !== 'number') gardenErrors.push(book.id);
}

assert('all books have string title',  titleErrors.length  === 0, titleErrors.join(', '));
assert('all books have string author', authorErrors.length === 0, authorErrors.join(', '));
assert('all books have scores object', scoresErrors.length === 0, scoresErrors.join(', '));
assert('all books have garden.score',  gardenErrors.length === 0, gardenErrors.join(', '));

// ── 4. No read books in output ────────────────────────────────────────────────

console.log('\n4. Content rules');

const readBooks = data.all_scored.filter(b => b.status === 'read');
assert('no already-read books in scored list', readBooks.length === 0,
  readBooks.map(b => b.id).join(', '));

// ── Summary ───────────────────────────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`${passed + failed} tests: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.error('\nSome tests failed.');
  process.exit(1);
} else {
  console.log('\nAll tests passed.');
}
