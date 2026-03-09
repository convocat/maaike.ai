import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const maturityEnum = z.enum(['draft', 'developing', 'solid', 'complete']);

const baseSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  maturity: maturityEnum.default('draft'),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  draft: z.boolean().default(false),
});

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/notes' }),
  schema: baseSchema,
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/articles' }),
  schema: baseSchema,
});

const links = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/links' }),
  schema: baseSchema.extend({
    url: z.string().url(),
  }),
});

export const collections = { notes, articles, links };
