#!/usr/bin/env node
/**
 * Extracts LinkedIn post text from a markdown content file.
 *
 * Priority order:
 *   1. <div class="linkedin"> block in post body (custom text written by Maaike)
 *   2. title + description from frontmatter (auto-generated fallback)
 *
 * Usage: node scripts/prepare-linkedin-post.mjs <markdown-file>
 * Output: post text written to stdout
 */

import fs from 'node:fs';

const file = process.argv[2];
if (!file || !fs.existsSync(file)) {
  console.error('Usage: node scripts/prepare-linkedin-post.mjs <markdown-file>');
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf-8');

// Extract frontmatter
const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
if (!fmMatch) {
  console.error('No frontmatter found in', file);
  process.exit(1);
}

const fm = fmMatch[1];
const title = (fm.match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1]?.trim() ?? '';
const description = (fm.match(/^description:\s*["']?(.+?)["']?\s*$/m) || [])[1]?.trim() ?? '';

// Use custom LinkedIn block if present (rendered as sage card in Typora, hidden on site)
const linkedinMatch = content.match(/<div\s+class=["']linkedin["']>([\s\S]*?)<\/div>/);
if (linkedinMatch) {
  process.stdout.write(linkedinMatch[1].trim());
  process.exit(0);
}

// Fall back to title + description
const parts = [title, description].filter(Boolean);
process.stdout.write(parts.join('\n\n'));
