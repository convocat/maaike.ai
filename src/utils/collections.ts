import { getCollection } from 'astro:content';

type CollectionName = 'notes' | 'articles' | 'links';

export async function getAllContent() {
  const [notes, articles, links] = await Promise.all([
    getCollection('notes'),
    getCollection('articles'),
    getCollection('links'),
  ]);

  return [
    ...notes.map((e) => ({ ...e, collection: 'notes' as const })),
    ...articles.map((e) => ({ ...e, collection: 'articles' as const })),
    ...links.map((e) => ({ ...e, collection: 'links' as const })),
  ].filter((e) => !e.data.draft);
}

export function sortByDate<T extends { data: { date: Date } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getUniqueTags(entries: { data: { tags: string[] } }[]): string[] {
  return [...new Set(entries.flatMap((e) => e.data.tags))].sort();
}
