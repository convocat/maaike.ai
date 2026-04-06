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
  triples: z.array(z.tuple([z.string(), z.string(), z.string()])).optional(),
  themes: z.array(z.string()).optional(),
  description: z.string().optional(),
  draft: z.boolean().default(false),
  ai: z.enum(['100% Maai', 'assisted', 'co-created', 'generated']).optional(),
  hub: z.boolean().optional(),
  develops: z.string().optional(),
});

const fieldNotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/field-notes' }),
  schema: baseSchema,
});

const seeds = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/seeds' }),
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
    status: z.enum(['reading', 'read', 'to-read', 'abandoned']).default('to-read'),
    genre: z.string().optional(),
    book_type: z.enum(['fiction', 'non-fiction']).optional(),
    purpose: z.enum(['personal', 'professional']).optional(),
    reason: z.string().optional(),
    notes: z.string().optional(),
    rating: z.enum(['loved it', 'liked it', 'meh', 'disappointing']).optional(),
    review: z.string().optional(),
    recommended: z.boolean().optional(),
    recommended_score: z.number().optional(),
    file: z.string().optional(),
  }),
});

const experiments = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/experiments' }),
  schema: baseSchema,
});

const jottings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/jottings' }),
  schema: baseSchema.extend({
    type: z.enum(['note', 'quote', 'event', 'link', 'post']).default('note'),
    source: z.string().optional(),
    page: z.number().optional(),
    url: z.string().optional(),
  }),
});

const files = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/files' }),
  schema: baseSchema.extend({
    file: z.string().optional(),
  }),
});

const artefacts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/artefacts' }),
  schema: baseSchema,
});

const toolshed = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/toolshed' }),
  schema: baseSchema.extend({
    category: z.enum(['design', 'technical']).optional(),
    section: z.string().optional(),
  }),
});

export const collections = { fieldNotes, seeds, articles, weblinks, videos, library, experiments, jottings, files, artefacts, toolshed };
