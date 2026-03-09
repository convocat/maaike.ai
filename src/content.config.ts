import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const maturityEnum = z.enum(['draft', 'developing', 'solid', 'complete']);

const baseSchema = z.object({
  title: z.string(),
  date: z.coerce.date(),
  updated: z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.coerce.date().optional(),
  ),
  maturity: maturityEnum.default('draft'),
  tags: z.array(z.string()).default([]),
  description: z.string().optional(),
  draft: z.boolean().default(false),
});

const fieldNotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/field-notes' }),
  schema: baseSchema,
});

const sparks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/sparks' }),
  schema: baseSchema,
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/articles' }),
  schema: baseSchema.extend({
    pruning: z.string().optional(),
  }),
});

const weblinks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/weblinks' }),
  schema: baseSchema.extend({
    url: z.string().url(),
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/videos' }),
  schema: baseSchema.extend({
    url: z.string().url(),
  }),
});

const library = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/library' }),
  schema: baseSchema.extend({
    author: z.string(),
    cover: z.string().optional(),
    status: z.enum(['reading', 'read', 'to-read']).default('to-read'),
  }),
});

const principles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/principles' }),
  schema: baseSchema,
});

export const collections = { fieldNotes, sparks, articles, weblinks, videos, library, principles };
