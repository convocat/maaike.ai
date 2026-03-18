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

import { readFileSync, readdirSync, statSync } from 'fs';
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
  tags:         ['title'], // tag definition files only need a title
};

const VALID_MATURITY = ['draft', 'developing', 'solid', 'complete'];
const VALID_STATUS   = ['reading', 'read', 'to-read', 'abandoned'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...walkDir(full));
    } else if (extname(entry) === '.md') {
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

const files = walkDir(CONTENT_DIR);
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
  if (collection === 'library' && data.status && !VALID_STATUS.includes(data.status)) {
    fileErrors.push(`  invalid status: "${data.status}" (expected: ${VALID_STATUS.join(', ')})`);
  }

  // 5. Date sanity
  if (data.date && isNaN(new Date(data.date).getTime())) {
    fileWarnings.push(`  invalid date: "${data.date}"`);
  }
  if (data.updated && isNaN(new Date(data.updated).getTime())) {
    fileWarnings.push(`  invalid updated date: "${data.updated}"`);
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

console.log(`\n─────────────────────────────────────────`);
console.log(`Checked ${files.length} files.`);
if (errors === 0 && warnings === 0) {
  console.log('✓ All content valid.');
} else {
  if (errors)   console.error(`${errors} error(s) found.`);
  if (warnings) console.warn(`${warnings} warning(s) found.`);
}

process.exit(errors > 0 ? 1 : 0);
