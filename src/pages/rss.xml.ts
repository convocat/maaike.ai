import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const jottings = await getCollection('jottings', ({ data }) => !data.draft);

  const items = [...articles, ...jottings]
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((entry) => ({
      title: entry.data.title,
      pubDate: entry.data.date,
      description: entry.data.description ?? '',
      link: `/${entry.collection}/${entry.id}/`,
    }));

  return rss({
    title: 'Maai & AI',
    description: 'A digital garden by Maaike: conversation design, AI, and the things in between.',
    site: context.site!,
    items,
    customData: `<language>en-gb</language>`,
  });
}
