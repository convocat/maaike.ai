import { getCollection } from 'astro:content';

interface Backlink {
  title: string;
  href: string;
}

let backlinkMap: Map<string, Backlink[]> | null = null;

async function buildBacklinkMap() {
  if (backlinkMap) return backlinkMap;

  const [notes, articles, links] = await Promise.all([
    getCollection('notes'),
    getCollection('articles'),
    getCollection('links'),
  ]);

  const allEntries = [
    ...notes.map((e) => ({ ...e, collection: 'notes' })),
    ...articles.map((e) => ({ ...e, collection: 'articles' })),
    ...links.map((e) => ({ ...e, collection: 'links' })),
  ];

  const map = new Map<string, Backlink[]>();
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;

  for (const entry of allEntries) {
    const body = entry.body ?? '';
    let match;
    while ((match = wikiLinkRegex.exec(body)) !== null) {
      const targetSlug = match[1].replace(/ /g, '-').toLowerCase();
      const backlink: Backlink = {
        title: entry.data.title,
        href: `/${entry.collection}/${entry.id}`,
      };

      if (!map.has(targetSlug)) {
        map.set(targetSlug, []);
      }
      map.get(targetSlug)!.push(backlink);
    }
  }

  backlinkMap = map;
  return map;
}

export async function getBacklinks(slug: string): Promise<Backlink[]> {
  const map = await buildBacklinkMap();
  return map.get(slug) ?? [];
}
