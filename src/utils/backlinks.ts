import { getCollection } from 'astro:content';

interface Backlink {
  title: string;
  href: string;
  collection: string;
}

let backlinkMap: Map<string, Backlink[]> | null = null;

async function buildBacklinkMap() {
  if (backlinkMap) return backlinkMap;

  const [fieldNotes, seeds, articles, weblinks, experiments] = await Promise.all([
    getCollection('fieldNotes'),
    getCollection('seeds'),
    getCollection('articles'),
    getCollection('weblinks'),
    getCollection('experiments'),
  ]);

  const allEntries = [
    ...fieldNotes.map((e) => ({ ...e, collection: 'field-notes' })),
    ...seeds.map((e) => ({ ...e, collection: 'seeds' })),
    ...articles.map((e) => ({ ...e, collection: 'articles' })),
    ...weblinks.map((e) => ({ ...e, collection: 'weblinks' })),
    ...experiments.map((e) => ({ ...e, collection: 'experiments' })),
  ];

  const map = new Map<string, Backlink[]>();
  const wikiLinkRegex = /\[\[([^\]]+)\]\]/g;

  for (const entry of allEntries) {
    const body = entry.body ?? '';
    let match;
    while ((match = wikiLinkRegex.exec(body)) !== null) {
      const targetSlug = match[1].split('|')[0].replace(/ /g, '-').toLowerCase();
      const backlink: Backlink = {
        title: entry.data.title,
        href: `/${entry.collection}/${entry.id}`,
        collection: entry.collection,
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

