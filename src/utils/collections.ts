import { getCollection } from 'astro:content';

type CollectionName = 'fieldNotes' | 'sparks' | 'articles' | 'weblinks' | 'videos' | 'library' | 'principles';

export async function getAllContent() {
  const [fieldNotes, sparks, articles, weblinks, videos, library, principles] = await Promise.all([
    getCollection('fieldNotes'),
    getCollection('sparks'),
    getCollection('articles'),
    getCollection('weblinks'),
    getCollection('videos'),
    getCollection('library'),
    getCollection('principles'),
  ]);

  return [
    ...fieldNotes.map((e) => ({ ...e, collection: 'field-notes' as const })),
    ...sparks.map((e) => ({ ...e, collection: 'sparks' as const })),
    ...articles.map((e) => ({ ...e, collection: 'articles' as const })),
    ...weblinks.map((e) => ({ ...e, collection: 'weblinks' as const })),
    ...videos.map((e) => ({ ...e, collection: 'videos' as const })),
    ...library.map((e) => ({ ...e, collection: 'library' as const })),
    ...principles.map((e) => ({ ...e, collection: 'principles' as const })),
  ].filter((e) => !e.data.draft);
}

export function sortByDate<T extends { data: { date: Date } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getUniqueTags(entries: { data: { tags: string[] } }[]): string[] {
  return [...new Set(entries.flatMap((e) => e.data.tags))].sort();
}
