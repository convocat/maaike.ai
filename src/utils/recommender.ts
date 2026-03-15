import { getCollection, getEntry } from 'astro:content';

export interface SuggestedBook {
  title: string;
  author: string;
  href: string;
  cover?: string;
}

// Tags that are semantically related across articles and books
const TAG_SYNONYMS: Record<string, string[]> = {
  'conversation-design': ['conversational-ai', 'voice', 'design'],
  'conversational-ai': ['conversation-design', 'voice', 'nlp'],
  'prompt-design': ['ai', 'nlp', 'conversational-ai'],
  'content-design': ['content-strategy', 'writing', 'design'],
  'ai-ethics': ['ai', 'philosophy'],
  'ai-tools': ['ai', 'nlp'],
  'ai': ['ai-ethics', 'ai-tools', 'nlp'],
  'writing': ['content-strategy', 'linguistics'],
  'digital-gardens': ['writing', 'content-strategy'],
  'llm': ['ai', 'nlp', 'conversational-ai'],
  'role-of-ai': ['ai', 'philosophy', 'ai-ethics'],
  'developer-experience': ['python', 'nlp'],
  'human-behavior': ['psychology', 'design'],
};

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'it', 'its', 'this', 'that', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall',
  'not', 'no', 'nor', 'so', 'if', 'then', 'than', 'too', 'very', 'just',
  'about', 'up', 'out', 'into', 'over', 'after', 'before', 'between',
  'under', 'again', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
  'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some',
  'such', 'only', 'own', 'same', 'also', 'as', 'well', 'what', 'which',
  'who', 'whom', 'these', 'those', 'them', 'they', 'their', 'your', 'our',
  'we', 'you', 'he', 'she', 'my', 'his', 'her', 'me', 'him', 'us',
  'i', 'don', 'doesn', 'didn', 'won', 'isn', 'aren', 'wasn', 'weren',
  'like', 'get', 'got', 'way', 'even', 'still', 'much', 'many',
  'because', 'through', 'while', 'during', 'really', 'think', 'know',
  'make', 'made', 'thing', 'things', 'people', 'one', 'two', 'first',
  'new', 'use', 'used', 'using', 'take', 'need', 'want', 'look',
  'going', 'come', 'back', 'now', 'time', 'long', 'work', 'say',
  'said', 'something', 'already', 'lot', 'always', 'see', 'keep',
]);

function stripMarkdown(text: string): string {
  return text
    .replace(/\[\[([^\]|]+)\|?[^\]]*\]\]/g, '$1')  // wiki links
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')        // markdown links
    .replace(/[#*_`~>|]/g, ' ')                      // markdown formatting
    .replace(/!\[.*?\]\(.*?\)/g, '')                  // images
    .replace(/```[\s\S]*?```/g, '')                   // code blocks
    .replace(/<[^>]+>/g, '')                          // html tags
    .replace(/https?:\/\/\S+/g, '');                  // urls
}

function tokenize(text: string): string[] {
  return stripMarkdown(text)
    .toLowerCase()
    .split(/[^a-z'-]+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

function buildKeywordMap(tokens: string[], weight: number = 1): Map<string, number> {
  const map = new Map<string, number>();
  for (const token of tokens) {
    map.set(token, (map.get(token) || 0) + weight);
  }
  return map;
}

function mergeKeywordMaps(...maps: Map<string, number>[]): Map<string, number> {
  const result = new Map<string, number>();
  for (const map of maps) {
    for (const [key, value] of map) {
      result.set(key, (result.get(key) || 0) + value);
    }
  }
  return result;
}

function cosineSimilarity(a: Map<string, number>, b: Map<string, number>): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [key, val] of a) {
    normA += val * val;
    if (b.has(key)) {
      dotProduct += val * b.get(key)!;
    }
  }
  for (const [, val] of b) {
    normB += val * val;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function computeTagBonus(postTags: string[], bookTags: string[]): number {
  let bonus = 0;

  for (const pTag of postTags) {
    // Direct match
    if (bookTags.includes(pTag)) {
      bonus += 3;
      continue;
    }
    // Synonym match
    const synonyms = TAG_SYNONYMS[pTag] || [];
    for (const syn of synonyms) {
      if (bookTags.includes(syn)) {
        bonus += 1.5;
        break;
      }
    }
  }

  return bonus;
}

let cachedBooks: Awaited<ReturnType<typeof getCollection<'library'>>> | null = null;

export async function getSuggestedBooks(
  collection: string,
  slug: string,
  tags: string[],
  limit: number = 3,
): Promise<SuggestedBook[]> {
  // Get current post content
  const collectionMap: Record<string, string> = {
    'field-notes': 'fieldNotes',
    'articles': 'articles',
    'seeds': 'seeds',
    'weblinks': 'weblinks',
    'videos': 'videos',
    'experiments': 'experiments',
  };

  const astroCollection = collectionMap[collection] || collection;
  let postBody = '';
  let postTitle = '';
  let postDescription = '';

  try {
    const entry = await getEntry(astroCollection as any, slug);
    if (entry) {
      postBody = entry.body ?? '';
      postTitle = entry.data.title ?? '';
      postDescription = (entry.data as any).description ?? '';
    }
  } catch {
    // If we can't get the entry, fall back to tags only
  }

  // Build article keyword profile
  const titleKeywords = buildKeywordMap(tokenize(postTitle), 3);
  const descKeywords = buildKeywordMap(tokenize(postDescription), 2);
  const bodyKeywords = buildKeywordMap(tokenize(postBody), 1);
  const articleProfile = mergeKeywordMaps(titleKeywords, descKeywords, bodyKeywords);

  // Get all library books
  if (!cachedBooks) {
    cachedBooks = await getCollection('library', ({ data }) => !data.draft);
  }

  // Score each book (exclude self if viewing a library page)
  const scored = cachedBooks
    .filter((book) => !(collection === 'library' && book.id === slug))
    .map((book) => {
    const bookTitleKeywords = buildKeywordMap(tokenize(book.data.title), 3);
    const bookAuthorKeywords = buildKeywordMap(tokenize(book.data.author), 1);
    const bookBodyKeywords = buildKeywordMap(tokenize(book.body ?? ''), 1);
    const bookTagKeywords = buildKeywordMap(
      (book.data.tags || []).flatMap((t: string) => t.split('-')).filter((w: string) => w.length > 2),
      2,
    );
    const bookProfile = mergeKeywordMaps(bookTitleKeywords, bookAuthorKeywords, bookBodyKeywords, bookTagKeywords);

    const contentScore = cosineSimilarity(articleProfile, bookProfile);
    const tagBonus = computeTagBonus(tags, book.data.tags || []);

    // Combined score: content similarity + tag bonus (normalized)
    const score = contentScore * 10 + tagBonus;

    return { book, score };
  });

  return scored
    .filter(({ score }) => score > 0.5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ book }) => ({
      title: book.data.title,
      author: book.data.author,
      href: `/library/${book.id}`,
      cover: book.data.cover,
    }));
}
