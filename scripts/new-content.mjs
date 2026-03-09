#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const [,, collection, ...titleParts] = process.argv;
const title = titleParts.join(' ');

const validCollections = ['field-note', 'spark', 'article', 'weblink'];
if (!validCollections.includes(collection) || !title) {
  console.error('Usage: npm run new <field-note|spark|article|weblink> <Title of Content>');
  console.error('');
  console.error('Examples:');
  console.error('  npm run new field-note My New Idea');
  console.error('  npm run new spark A Quick Thought');
  console.error('  npm run new article Writing Better Prompts');
  console.error('  npm run new weblink Interesting Paper on Attention');
  process.exit(1);
}

const folderMap = { 'field-note': 'field-notes', spark: 'sparks', article: 'articles', weblink: 'weblinks' };
const folder = folderMap[collection];
const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const date = new Date().toISOString().split('T')[0];
const filePath = path.join('src', 'content', folder, `${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error(`File already exists: ${filePath}`);
  process.exit(1);
}

let frontmatter = `---
title: "${title}"
date: ${date}
maturity: draft
tags: []
description: ""`;

if (collection === 'weblink') {
  frontmatter += `\nurl: ""`;
}

frontmatter += `\n---\n\n`;

fs.mkdirSync(path.dirname(filePath), { recursive: true });
fs.writeFileSync(filePath, frontmatter);
console.log(`Created: ${filePath}`);
