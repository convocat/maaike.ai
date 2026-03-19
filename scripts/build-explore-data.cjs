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
        hub: fm.hub === true,
        develops: typeof fm.develops === 'string' ? fm.develops : null,
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

// Seeded PRNG (mulberry32) for deterministic UMAP + k-means
function seededRandom(seed) {
  let s = seed | 0;
  return function() {
    s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function computeUMAP(embeddingsMatrix) {
  console.log(`Running UMAP on ${embeddingsMatrix.length} embeddings of dim ${embeddingsMatrix[0].length}...`);
  const umap = new UMAP({
    nNeighbors: 15,
    minDist: 0.1,
    nComponents: 2,
    spread: 1.0,
    random: seededRandom(42),
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
// 4. Collision resolution: push overlapping dots apart
// ---------------------------------------------------------------------------

/**
 * Iteratively resolve overlapping dots so each one sits in its own space.
 * Works in normalized coordinate space (0..1).
 * Uses maturity-based radii (matching the client-side MATURITY_RADIUS map)
 * scaled to normalized space assuming a ~1200px wide SVG viewport.
 */
function resolveCollisions(items, iterations = 300) {
  // The SVG viewBox matches the container pixel size (typically 800-1400px wide).
  // Circle radii are fixed in px (5-14), so in normalized 0..1 space we need
  // to separate by radius/viewportWidth. We use a conservative (small) reference
  // so that dots don't overlap even on narrower viewports.
  const MATURITY_RADIUS = { draft: 5, developing: 8, solid: 11, complete: 14 };
  const SVG_REF = 800; // conservative: narrower viewport = more overlap risk
  const PADDING = 4;   // px gap between dot edges

  for (let iter = 0; iter < iterations; iter++) {
    let maxOverlap = 0;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i];
        const b = items[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const rA = ((MATURITY_RADIUS[a.maturity] || 5) + PADDING) / SVG_REF;
        const rB = ((MATURITY_RADIUS[b.maturity] || 5) + PADDING) / SVG_REF;
        const minDist = rA + rB;

        if (dist < minDist) {
          const overlap = minDist - dist;
          if (overlap > maxOverlap) maxOverlap = overlap;

          if (dist > 0.0001) {
            const push = overlap / 2 + 0.001; // slight extra push
            const nx = dx / dist;
            const ny = dy / dist;
            a.x += nx * push;
            a.y += ny * push;
            b.x -= nx * push;
            b.y -= ny * push;
          } else {
            // Nearly identical positions: nudge randomly
            const angle = Math.random() * Math.PI * 2;
            const nudge = minDist / 2;
            a.x += Math.cos(angle) * nudge;
            a.y += Math.sin(angle) * nudge;
            b.x -= Math.cos(angle) * nudge;
            b.y -= Math.sin(angle) * nudge;
          }
        }
      }
    }

    // Clamp within bounds each iteration to prevent drift
    for (const item of items) {
      item.x = Math.max(0.02, Math.min(0.98, item.x));
      item.y = Math.max(0.02, Math.min(0.98, item.y));
    }

    if (maxOverlap === 0) {
      console.log(`  Collision resolution converged after ${iter + 1} iterations`);
      break;
    }
  }

  // Final precision
  for (const item of items) {
    item.x = parseFloat(item.x.toFixed(4));
    item.y = parseFloat(item.y.toFixed(4));
  }
}

// ---------------------------------------------------------------------------
// 5. Simple k-means clustering
// ---------------------------------------------------------------------------

// k-means++ on 2D positions with deterministic seed
function kMeans2D(points, k, maxIter = 80) {
  const n = points.length;

  // k-means++ init: spread initial centroids apart
  const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
  const rand = rng(42); // deterministic for reproducible clusters
  const centroids = [points[Math.floor(rand() * n)].slice()];
  while (centroids.length < k) {
    const dists = points.map(p => {
      let minD = Infinity;
      for (const c of centroids) {
        const d = (p[0]-c[0])**2 + (p[1]-c[1])**2;
        if (d < minD) minD = d;
      }
      return minD;
    });
    const total = dists.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    for (let i = 0; i < n; i++) {
      r -= dists[i];
      if (r <= 0) { centroids.push(points[i].slice()); break; }
    }
  }

  let assignments = new Array(n).fill(0);
  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let bestDist = Infinity, bestK = 0;
      for (let c = 0; c < k; c++) {
        const dist = (points[i][0]-centroids[c][0])**2 + (points[i][1]-centroids[c][1])**2;
        if (dist < bestDist) { bestDist = dist; bestK = c; }
      }
      if (assignments[i] !== bestK) { assignments[i] = bestK; changed = true; }
    }
    if (!changed) break;

    const sums = Array.from({ length: k }, () => [0, 0, 0]);
    for (let i = 0; i < n; i++) {
      sums[assignments[i]][0] += points[i][0];
      sums[assignments[i]][1] += points[i][1];
      sums[assignments[i]][2] += 1;
    }
    for (let c = 0; c < k; c++) {
      if (sums[c][2] > 0) {
        centroids[c] = [sums[c][0] / sums[c][2], sums[c][1] / sums[c][2]];
      }
    }
  }
  return { assignments, centroids };
}

function computeClusters(items, positions, keyphraseMap) {
  // Cluster on 2D UMAP positions (which already encode semantic similarity)
  // Use fewer clusters for clarity
  const k = Math.min(5, Math.max(3, Math.floor(items.length / 30)));
  console.log(`Clustering ${items.length} items into ${k} clusters on 2D UMAP positions...`);
  const { assignments, centroids } = kMeans2D(positions, k);

  // Build global phrase document frequency for TF-IDF scoring
  const globalPhraseDF = {};
  for (const item of items) {
    const key = `${item.collection}/${item.slug}`;
    const phrases = keyphraseMap.get(key) || [];
    const seen = new Set();
    for (const p of phrases) {
      if (!seen.has(p)) { globalPhraseDF[p] = (globalPhraseDF[p] || 0) + 1; seen.add(p); }
    }
  }
  const totalDocs = items.length;

  const clusters = [];
  for (let c = 0; c < k; c++) {
    const clusterIndices = [];
    for (let i = 0; i < items.length; i++) {
      if (assignments[i] === c) clusterIndices.push(i);
    }
    if (clusterIndices.length < 3) continue;

    const clusterItems = clusterIndices.map(i => items[i]);
    const centerX = centroids[c][0];
    const centerY = centroids[c][1];

    // Radius: 75th percentile distance from center (tighter than max)
    const distances = clusterIndices.map(i =>
      Math.sqrt((positions[i][0] - centerX) ** 2 + (positions[i][1] - centerY) ** 2)
    ).sort((a, b) => a - b);
    const radius = Math.max(0.06, distances[Math.floor(distances.length * 0.85)] * 1.4);

    // TF-IDF label: phrases distinctive to THIS cluster vs the whole garden
    const phraseTF = {};
    for (const item of clusterItems) {
      const key = `${item.collection}/${item.slug}`;
      const phrases = keyphraseMap.get(key) || [];
      for (const p of phrases) {
        phraseTF[p] = (phraseTF[p] || 0) + 1;
      }
    }
    const scored = Object.entries(phraseTF).map(([phrase, tf]) => {
      const df = globalPhraseDF[phrase] || 1;
      const idf = Math.log(totalDocs / df);
      const clusterCoverage = tf / clusterItems.length; // what fraction of cluster has this phrase
      return { phrase, score: clusterCoverage * idf, tf };
    }).filter(s => s.tf >= 2) // must appear in 2+ cluster items
      .sort((a, b) => b.score - a.score);

    // Manual overrides for clusters the algorithm can't name well
    const LABEL_OVERRIDES = {
      'region 1': 'AI ethics and critical perspectives',
      'region 2': 'AI ethics and critical perspectives',
      'region 3': 'AI ethics and critical perspectives',
      'region 4': 'AI ethics and critical perspectives',
      'region 5': 'AI ethics and critical perspectives',
    };
    const autoLabel = scored.length > 0 ? scored[0].phrase : `region ${c + 1}`;
    const label = LABEL_OVERRIDES[autoLabel] || autoLabel;

    console.log(`  ${label} (${clusterItems.length} items, r=${radius.toFixed(3)})`);
    clusters.push({ label, centerX, centerY, radius });
  }
  return clusters;
}

// ---------------------------------------------------------------------------
// 5. Compute inquiry areas from hub/develops relations
// ---------------------------------------------------------------------------

function computeInquiryAreas(items) {
  // Build a map: hubSlug → { hubItem, files[] }
  const hubMap = new Map();

  // Register all hubs
  for (const item of items) {
    if (item.hub) {
      if (!hubMap.has(item.slug)) {
        hubMap.set(item.slug, { hubItem: item, files: [] });
      } else {
        hubMap.get(item.slug).hubItem = item;
      }
    }
  }

  // Register all project files
  for (const item of items) {
    if (item.develops) {
      if (!hubMap.has(item.develops)) {
        hubMap.set(item.develops, { hubItem: null, files: [] });
      }
      hubMap.get(item.develops).files.push(item);
    }
  }

  const areas = [];

  for (const [hubSlug, { hubItem, files }] of hubMap) {
    // Need hub + at least 1 file, and all must have positions
    const members = [...files];
    if (hubItem && typeof hubItem.x === 'number') members.push(hubItem);
    const located = members.filter(m => typeof m.x === 'number');
    if (located.length < 2) continue;

    // Centroid
    const cx = located.reduce((s, m) => s + m.x, 0) / located.length;
    const cy = located.reduce((s, m) => s + m.y, 0) / located.length;

    // 85th-percentile distance + 15% buffer
    const dists = located.map(m => Math.sqrt((m.x - cx) ** 2 + (m.y - cy) ** 2)).sort((a, b) => a - b);
    const radius = Math.max(0.05, dists[Math.floor(dists.length * 0.85)] * 1.15 + 0.02);

    const label = hubItem ? hubItem.title : hubSlug;
    const hubUrl = hubItem ? hubItem.url : null;

    areas.push({ label, centerX: parseFloat(cx.toFixed(4)), centerY: parseFloat(cy.toFixed(4)), radius: parseFloat(radius.toFixed(4)), hubUrl });
  }

  return areas;
}

// ---------------------------------------------------------------------------
// 6. Define trails
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
      description: 'From technical writing to prompt design: the evolution of conversation design as a discipline.',
      items: [
        'van-technisch-schrijver-naar-conversation-designer',
        'how-do-i-become-a-conversation-designer',
        'conversational-interfaces-are-not-easy',
        'modeling-conversational-agents-natural-conversation-framework',
        'how-to-make-chatgpt-more-conversational',
        'prompt-scaffolding',
        'context-engineering-lets-call-it-design',
        'designing-for-doubt',
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

  // Resolve dot collisions so no circles overlap
  console.log('Resolving dot collisions...');
  resolveCollisions(allItems);

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

  // Remove tags, hub, develops from output (not needed on the client as raw fields)
  const outputItems = allItems.map(({ tags, hub, develops, ...rest }) => rest);

  // Inquiry areas (from hub/develops relations)
  console.log('Computing inquiry areas...');
  const inquiryAreas = computeInquiryAreas(allItems);
  console.log(`Generated ${inquiryAreas.length} inquiry areas`);

  // Trails
  const slugSet = new Set(allItems.map(i => i.slug));
  const trails = buildTrails(slugSet);
  console.log(`Built ${trails.length} trails`);

  // Write output
  const output = { items: outputItems, inquiryAreas, trails };
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Wrote ${OUTPUT_FILE} (${outputItems.length} items)`);
}

main();
