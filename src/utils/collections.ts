import { getCollection } from 'astro:content';

type CollectionName = 'fieldNotes' | 'seeds' | 'articles' | 'weblinks' | 'videos' | 'library' | 'experiments' | 'principles';

export async function getAllContent() {
  const [fieldNotes, seeds, articles, weblinks, videos, library, experiments, principles] = await Promise.all([
    getCollection('fieldNotes'),
    getCollection('seeds'),
    getCollection('articles'),
    getCollection('weblinks'),
    getCollection('videos'),
    getCollection('library'),
    getCollection('experiments'),
    getCollection('principles'),
  ]);

  return [
    ...fieldNotes.map((e) => ({ ...e, collection: 'field-notes' as const })),
    ...seeds.map((e) => ({ ...e, collection: 'seeds' as const })),
    ...articles.map((e) => ({ ...e, collection: 'articles' as const })),
    ...weblinks.map((e) => ({ ...e, collection: 'weblinks' as const })),
    ...videos.map((e) => ({ ...e, collection: 'videos' as const })),
    ...library.map((e) => ({ ...e, collection: 'library' as const })),
    ...experiments.map((e) => ({ ...e, collection: 'experiments' as const })),
    ...principles.map((e) => ({ ...e, collection: 'principles' as const })),
  ].filter((e) => !e.data.draft);
}

export function sortByDate<T extends { data: { date: Date } }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export function getUniqueTags(entries: { data: { tags: string[] } }[]): string[] {
  return [...new Set(entries.flatMap((e) => e.data.tags))].sort();
}

export interface RelatedPost {
  title: string;
  href: string;
  collection: string;
  sharedTagCount: number;
}

export async function getRelatedPosts(
  currentSlug: string,
  currentTags: string[],
  currentCollection: string,
  limit: number = 5,
): Promise<RelatedPost[]> {
  const allContent = await getAllContent();

  return allContent
    .filter((entry) => entry.id !== currentSlug)
    .map((entry) => {
      const sharedTags = entry.data.tags.filter((t: string) => currentTags.includes(t));
      const sameCollection = entry.collection === currentCollection ? 1 : 0;
      return {
        title: entry.data.title,
        href: `/${entry.collection}/${entry.id}`,
        collection: entry.collection,
        sharedTagCount: sharedTags.length,
        sameCollection,
        date: entry.data.date,
      };
    })
    .filter((entry) => entry.sharedTagCount > 0 || entry.sameCollection)
    .sort((a, b) => {
      if (b.sharedTagCount !== a.sharedTagCount) return b.sharedTagCount - a.sharedTagCount;
      if (b.sameCollection !== a.sameCollection) return b.sameCollection - a.sameCollection;
      return b.date.getTime() - a.date.getTime();
    })
    .slice(0, limit)
    .map(({ title, href, collection, sharedTagCount }) => ({
      title,
      href,
      collection,
      sharedTagCount,
    }));
}
