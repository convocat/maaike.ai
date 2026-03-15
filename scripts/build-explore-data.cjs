/**
 * Build script for explore page data.
 * Reads content frontmatter, embeddings, and keyphrases,
 * computes UMAP 2D projection + clusters, outputs public/explore-data.json.
 *
 * Usage: node scripts/build-explore-data.cjs
 */

const fs = require('fs');
const path = require('path');
const { UMAP } = require('umap-js');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const EMBEDDINGS_FILE = path.join(ROOT, 'scripts', 'embeddings-bge-m3.json');
const KEYPHRASES_FILE = path.join(ROOT, 'keyphrase-results.json');
const OUTPUT_FILE = path.join(ROOT, 'public', 'explore-data.json');

const COLLECTIONS = [
  'articles', 'field-notes', 'seeds', 'weblinks',
  'videos', 'library', 'experiments'
];

// ---------------------------------------------------------------------------
// 1. Read all content frontmatter
// ---------------------------------------------------------------------------

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  const fm = {};
  const lines = match[1].split(/\r?\n/);
  let currentKey = null;
  let inArray = false;

  for (const line of lines) {
    // Array item
    if (inArray && /^\s+-\s+/.test(line)) {
      fm[currentKey].push(line.replace(/^\s+-\s+/, '').replace(/^["']|["']$/g, ''));
      continue;
    }
    // Key-value
    const kvMatch = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kvMatch) {
      const key = kvMatch[1];
      let value = kvMatch[2].trim();
      inArray = false;
      currentKey = key;

      if (value === '' || value === '[]') {
        fm[key] = [];
        inArray = value === '';
        continue;
      }
      // Strip quotes
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (value === 'true') value = true;
      else if (value === 'false') value = false;
      fm[key] = value;
    }
  }
  return fm;
}

function readAllContent() {
  const items = [];
  for (const collection of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, collection);
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
    for (const file of files) {
      const fm = parseFrontmatter(path.join(dir, file));
      if (!fm) continue;
      if (fm.draft === true) continue;
      const slug = file.replace(/\.md$/, '');
      items.push({
        slug,
        title: fm.title || slug,
        collection,
        maturity: fm.maturity || 'draft',
        description: fm.description || '',
        tags: Array.isArray(fm.tags) ? fm.tags : [],
        url: `/${collection}/${slug}`,
      });
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// 2. Load embeddings and keyphrases
// ---------------------------------------------------------------------------

function loadEmbeddings() {
  const data = JSON.parse(fs.readFileSync(EMBEDDINGS_FILE, 'utf-8'));
  // data.items has slug/title/collection, data.embeddings is array of float arrays
  const map = new Map();
  for (let i = 0; i < data.items.length; i++) {
    const key = `${data.items[i].collection}/${data.items[i].slug}`;
    map.set(key, data.embeddings[i]);
  }
  return map;
}

function loadKeyphrases() {
  const data = JSON.parse(fs.readFileSync(KEYPHRASES_FILE, 'utf-8'));
  const map = new Map();
  for (const item of data.items) {
    const key = `${item.collection}/${item.slug}`;
    map.set(key, item.llm_phrases || []);
  }
  return map;
}

// ---------------------------------------------------------------------------
// 3. UMAP projection
// ---------------------------------------------------------------------------

function computeUMAP(embeddingsMatrix) {
  console.log(`Running UMAP on ${embeddingsMatrix.length} embeddings of dim ${embeddingsMatrix[0].length}...`);
  const umap = new UMAP({
    nNeighbors: 15,
    minDist: 0.1,
    nComponents: 2,
    spread: 1.0,
  });
  const result = umap.fit(embeddingsMatrix);
  return result; // array of [x, y]
}

function normalizePositions(positions) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const [x, y] of positions) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  // Normalize to 0.05..0.95 with padding
  return positions.map(([x, y]) => [
    0.05 + 0.9 * (x - minX) / rangeX,
    0.05 + 0.9 * (y - minY) / rangeY,
  ]);
}

// ---------------------------------------------------------------------------
// 4. Simple k-means clustering
// ---------------------------------------------------------------------------

function kMeans(points, k, maxIter = 50) {
  const n = points.length;
  // Initialize centroids from random points
  const indices = [];
  while (indices.length < k) {
    const idx = Math.floor(Math.random() * n);
    if (!indices.includes(idx)) indices.push(idx);
  }
  let centroids = indices.map(i => [...points[i]]);
  let assignments = new Array(n).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign
    let changed = false;
    for (let i = 0; i < n; i++) {
      let bestDist = Infinity;
      let bestK = 0;
      for (let c = 0; c < k; c++) {
        const dx = points[i][0] - centroids[c][0];
        const dy = points[i][1] - centroids[c][1];
        const dist = dx * dx + dy * dy;
        if (dist < bestDist) {
          bestDist = dist;
          bestK = c;
        }
      }
      if (assignments[i] !== bestK) {
        assignments[i] = bestK;
        changed = true;
      }
    }
    if (!changed) break;

    // Update centroids
    const sums = Array.from({ length: k }, () => [0, 0, 0]); // [sumX, sumY, count]
    for (let i = 0; i < n; i++) {
      sums[assignments[i]][0] += points[i][0];
      sums[assignments[i]][1] += points[i][1];
      sums[assignments[i]][2] += 1;
    }
    centroids = sums.map(([sx, sy, cnt]) =>
      cnt > 0 ? [sx / cnt, sy / cnt] : [Math.random(), Math.random()]
    );
  }
  return { assignments, centroids };
}

function computeClusters(items, positions, keyphraseMap) {
  const k = Math.min(8, Math.max(3, Math.floor(items.length / 12)));
  const { assignments, centroids } = kMeans(positions, k);

  const clusters = [];
  for (let c = 0; c < centroids.length; c++) {
    const clusterItems = items.filter((_, i) => assignments[i] === c);
    if (clusterItems.length === 0) continue;

    // Compute radius as max distance from centroid
    const distances = clusterItems.map((item) => {
      const idx = items.indexOf(item);
      const dx = positions[idx][0] - centroids[c][0];
      const dy = positions[idx][1] - centroids[c][1];
      return Math.sqrt(dx * dx + dy * dy);
    });
    const radius = Math.max(0.05, Math.max(...distances) * 1.2);

    // Label from most common keyphrases
    const phraseCounts = {};
    for (const item of clusterItems) {
      const key = `${item.collection}/${item.slug}`;
      const phrases = keyphraseMap.get(key) || [];
      for (const p of phrases) {
        phraseCounts[p] = (phraseCounts[p] || 0) + 1;
      }
    }
    const sortedPhrases = Object.entries(phraseCounts)
      .sort((a, b) => b[1] - a[1]);
    const label = sortedPhrases.length > 0 ? sortedPhrases[0][0] : `cluster ${c + 1}`;

    clusters.push({
      label,
      centerX: centroids[c][0],
      centerY: centroids[c][1],
      radius,
    });
  }
  return clusters;
}

// ---------------------------------------------------------------------------
// 5. Define trails
// ---------------------------------------------------------------------------

function buildTrails(itemSlugs) {
  const trails = [
    {
      id: 'building-the-garden',
      name: 'How this garden was built',
      description: 'Follow the technical journey of building this digital garden.',
      items: [
        'a-digital-garden-as-central-space',
        'building-this-garden',
        'digital-gardens-and-the-old-web',
        'claude-md-project-memory',
        'knowledge-graph',
      ],
    },
    {
      id: 'evening-with-chatgpt',
      name: 'Evenings with ChatGPT',
      description: 'A series of hands-on explorations with ChatGPT over time.',
      items: [
        'an-evening-with-chatgpt',
        'an-evening-with-chatgpt-2',
        'an-evening-with-chatgpt-3',
        'an-evening-with-chatgpt-september-2023',
        'an-evening-with-youchat-and-chatsonic',
      ],
    },
    {
      id: 'conversation-design',
      name: 'Conversation design thinking',
      description: 'Ideas and reflections on designing conversational interfaces.',
      items: [
        'conversational-interfaces-are-not-easy',
        'convo-question-should-i-learn-programming',
        '7-new-skills-for-conversation-designers-2022',
        'context-engineering-lets-call-it-design',
      ],
    },
  ];

  // Filter out trail items that don't exist in the data
  return trails.map(t => ({
    ...t,
    items: t.items.filter(slug => itemSlugs.has(slug)),
  })).filter(t => t.items.length >= 2);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  console.log('Reading content...');
  const contentItems = readAllContent();
  console.log(`Found ${contentItems.length} published items`);

  console.log('Loading embeddings...');
  const embeddingMap = loadEmbeddings();
  console.log(`Loaded ${embeddingMap.size} embeddings`);

  console.log('Loading keyphrases...');
  const keyphraseMap = loadKeyphrases();
  console.log(`Loaded ${keyphraseMap.size} keyphrase sets`);

  // Filter to items that have embeddings
  const itemsWithEmbeddings = contentItems.filter(item => {
    const key = `${item.collection}/${item.slug}`;
    return embeddingMap.has(key);
  });
  console.log(`${itemsWithEmbeddings.length} items have embeddings`);

  // Items without embeddings get random positions
  const itemsWithout = contentItems.filter(item => {
    const key = `${item.collection}/${item.slug}`;
    return !embeddingMap.has(key);
  });

  // Build embedding matrix for UMAP
  const embeddingsMatrix = itemsWithEmbeddings.map(item => {
    const key = `${item.collection}/${item.slug}`;
    return embeddingMap.get(key);
  });

  // Compute UMAP
  let positions;
  if (embeddingsMatrix.length > 0) {
    const rawPositions = computeUMAP(embeddingsMatrix);
    positions = normalizePositions(rawPositions);
  } else {
    positions = [];
  }

  // Assign positions
  for (let i = 0; i < itemsWithEmbeddings.length; i++) {
    itemsWithEmbeddings[i].x = parseFloat(positions[i][0].toFixed(4));
    itemsWithEmbeddings[i].y = parseFloat(positions[i][1].toFixed(4));
  }

  // Random positions for items without embeddings
  for (const item of itemsWithout) {
    item.x = parseFloat((0.1 + Math.random() * 0.8).toFixed(4));
    item.y = parseFloat((0.1 + Math.random() * 0.8).toFixed(4));
  }

  const allItems = [...itemsWithEmbeddings, ...itemsWithout];

  // Add keyphrases
  for (const item of allItems) {
    const key = `${item.collection}/${item.slug}`;
    item.keyphrases = (keyphraseMap.get(key) || []).slice(0, 5);
  }

  // Compute connections count (items sharing 2+ tags)
  for (const item of allItems) {
    let connections = 0;
    for (const other of allItems) {
      if (other === item) continue;
      const shared = item.tags.filter(t => other.tags.includes(t)).length;
      if (shared >= 2) connections++;
    }
    item.connections = connections;
  }

  // Remove tags from output (not needed on the client)
  const outputItems = allItems.map(({ tags, ...rest }) => rest);

  // Clusters
  console.log('Computing clusters...');
  const allPositions = allItems.map(item => [item.x, item.y]);
  const clusters = computeClusters(allItems, allPositions, keyphraseMap);
  console.log(`Generated ${clusters.length} clusters`);

  // Trails
  const slugSet = new Set(allItems.map(i => i.slug));
  const trails = buildTrails(slugSet);
  console.log(`Built ${trails.length} trails`);

  // Write output
  const output = { items: outputItems, clusters, trails };
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Wrote ${OUTPUT_FILE} (${outputItems.length} items)`);
}

main();
