// @ts-check
import { defineConfig } from 'astro/config';
import remarkWikiLink from 'remark-wiki-link';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sitemap from '@astrojs/sitemap';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build a slug-to-path map for wiki links to resolve across collections
function buildPermalinkMap() {
  const contentDir = path.join(__dirname, 'src', 'content');
  const collections = ['field-notes', 'seeds', 'articles', 'weblinks', 'videos', 'library', 'principles'];
  const slugMap = new Map();

  for (const collection of collections) {
    const dir = path.join(contentDir, collection);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const slug = file.replace(/\.md$/, '');
      // First collection to register a slug wins
      if (!slugMap.has(slug)) {
        slugMap.set(slug, `/${collection}/${slug}`);
      }
    }
  }

  return slugMap;
}

const permalinkMap = buildPermalinkMap();
const permalinks = [...permalinkMap.keys()];
// https://astro.build/config
export default defineConfig({
  site: 'https://maaike.ai',

  markdown: {
    remarkPlugins: [
      [
        remarkWikiLink,
        {
          permalinks,
          pageResolver: (name) => [name.replace(/ /g, '-').toLowerCase()],
          hrefTemplate: (permalink) => {
            return permalinkMap.get(permalink) || `/field-notes/${permalink}`;
          },
          aliasDivider: '|',
          wikiLinkClassName: 'wiki-link',
          newClassName: 'wiki-link--new',
        },
      ],
    ],
  },

  integrations: [sitemap()]
});