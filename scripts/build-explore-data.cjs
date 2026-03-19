/**
 * Build script for explore page data.
 * Reads content frontmatter, embeddings, and keyphrases,
 * computes UMAP 2D projection + territories + topography, outputs public/explore-data.json.
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
        date: fm.date || null,
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
  const MATURITY_RADIUS = { draft: 5, developing: 8, solid: 11, complete: 14 };
  const SVG_REF = 800;
  const PADDING = 4;

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
            const push = overlap / 2 + 0.001;
            const nx = dx / dist;
            const ny = dy / dist;
            a.x += nx * push;
            a.y += ny * push;
            b.x -= nx * push;
            b.y -= ny * push;
          } else {
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

    for (const item of items) {
      item.x = Math.max(0.02, Math.min(0.98, item.x));
      item.y = Math.max(0.02, Math.min(0.98, item.y));
    }

    if (maxOverlap === 0) {
      console.log(`  Collision resolution converged after ${iter + 1} iterations`);
      break;
    }
  }

  for (const item of items) {
    item.x = parseFloat(item.x.toFixed(4));
    item.y = parseFloat(item.y.toFixed(4));
  }
}

// ---------------------------------------------------------------------------
// 5. Territory computation: k-means on positions, named by dominant tags
// ---------------------------------------------------------------------------

// k-means++ on 2D positions with deterministic seed
function kMeans2D(points, k, maxIter = 80) {
  const n = points.length;

  const rng = (seed) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
  const rand = rng(42);
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

function computeTerritories(items) {
  const k = Math.min(6, Math.max(4, Math.floor(items.length / 30)));
  const positions = items.map(item => [item.x, item.y]);
  console.log(`Computing ${k} territories from ${items.length} items...`);
  const { assignments, centroids } = kMeans2D(positions, k);

  // Global tag frequency
  const globalTagCount = {};
  for (const item of items) {
    for (const tag of item.tags) {
      globalTagCount[tag] = (globalTagCount[tag] || 0) + 1;
    }
  }
  const totalItems = items.length;

  const usedLabels = new Set();
  const territories = [];

  for (let c = 0; c < k; c++) {
    const clusterItems = items.filter((_, i) => assignments[i] === c);
    if (clusterItems.length < 3) continue;

    // Count tags within this cluster
    const clusterTagCount = {};
    for (const item of clusterItems) {
      for (const tag of item.tags) {
        clusterTagCount[tag] = (clusterTagCount[tag] || 0) + 1;
      }
    }

    // Score: prefer tags frequent in this cluster but not everywhere
    const scored = Object.entries(clusterTagCount)
      .map(([tag, count]) => {
        const clusterFreq = count / clusterItems.length;
        const globalFreq = (globalTagCount[tag] || 0) / totalItems;
        return { tag, score: clusterFreq * (1 - globalFreq * 0.6), count };
      })
      .filter(s => s.count >= 2 && !usedLabels.has(s.tag))
      .sort((a, b) => b.score - a.score);

    const label = scored.length > 0 ? scored[0].tag : `region ${c + 1}`;
    usedLabels.add(label);

    const centerX = parseFloat(centroids[c][0].toFixed(4));
    const centerY = parseFloat(centroids[c][1].toFixed(4));
    console.log(`  Territory: "${label}" (${clusterItems.length} items)`);
    territories.push({ label, centerX, centerY, itemCount: clusterItems.length });
  }

  return territories;
}

// ---------------------------------------------------------------------------
// 6. Topographic contours via KDE + marching squares
// ---------------------------------------------------------------------------

function marchingSquaresSegs(idx, top, right, bottom, left) {
  switch (idx) {
    case 1:  return [[left, bottom]];
    case 2:  return [[bottom, right]];
    case 3:  return [[left, right]];
    case 4:  return [[top, right]];
    case 5:  return [[top, right], [left, bottom]]; // ambiguous
    case 6:  return [[top, bottom]];
    case 7:  return [[top, left]];
    case 8:  return [[top, left]];
    case 9:  return [[top, bottom]];
    case 10: return [[top, left], [right, bottom]]; // ambiguous
    case 11: return [[top, right]];
    case 12: return [[left, right]];
    case 13: return [[right, bottom]];
    case 14: return [[left, bottom]];
    default: return [];
  }
}

function chainSegments(segments) {
  if (segments.length === 0) return [];
  const fmt = v => Math.round(v * 1e4);
  const key = ([x, y]) => `${fmt(x)},${fmt(y)}`;

  const endMap = new Map();
  segments.forEach((seg, i) => {
    [0, 1].forEach(e => {
      const k = key(seg[e]);
      if (!endMap.has(k)) endMap.set(k, []);
      endMap.get(k).push([i, e]);
    });
  });

  const used = new Array(segments.length).fill(false);
  const polylines = [];

  for (let start = 0; start < segments.length; start++) {
    if (used[start]) continue;
    used[start] = true;
    const chain = [segments[start][0], segments[start][1]];

    // Extend forward
    let growing = true;
    while (growing) {
      growing = false;
      for (const [si, ei] of (endMap.get(key(chain[chain.length - 1])) || [])) {
        if (used[si]) continue;
        used[si] = true;
        chain.push(segments[si][1 - ei]);
        growing = true;
        break;
      }
    }
    // Extend backward
    growing = true;
    while (growing) {
      growing = false;
      for (const [si, ei] of (endMap.get(key(chain[0])) || [])) {
        if (used[si]) continue;
        used[si] = true;
        chain.unshift(segments[si][1 - ei]);
        growing = true;
        break;
      }
    }

    if (chain.length >= 3) polylines.push(chain);
  }
  return polylines;
}

function computeTopography(items) {
  const GRID = 32; // 32×32 vertex grid
  const h = 0.10;  // KDE bandwidth (10% of map)
  const h2 = h * h;

  // Gaussian KDE evaluated at each grid vertex
  const grid = new Float64Array(GRID * GRID).fill(0);
  for (const item of items) {
    for (let gy = 0; gy < GRID; gy++) {
      for (let gx = 0; gx < GRID; gx++) {
        const cx = gx / (GRID - 1);
        const cy = gy / (GRID - 1);
        const dx = item.x - cx;
        const dy = item.y - cy;
        const d2 = (dx * dx + dy * dy) / h2;
        if (d2 < 9) grid[gy * GRID + gx] += Math.exp(-0.5 * d2);
      }
    }
  }

  // Normalize to [0,1]
  let maxVal = 0;
  for (let i = 0; i < grid.length; i++) if (grid[i] > maxVal) maxVal = grid[i];
  if (maxVal === 0) return { levels: [] };
  for (let i = 0; i < grid.length; i++) grid[i] /= maxVal;

  const THRESHOLDS = [0.15, 0.38];
  console.log('Computing topographic contours...');

  const levels = THRESHOLDS.map(threshold => {
    const segments = [];
    for (let gy = 0; gy < GRID - 1; gy++) {
      for (let gx = 0; gx < GRID - 1; gx++) {
        const tl = grid[gy * GRID + gx];
        const tr = grid[gy * GRID + gx + 1];
        const bl = grid[(gy + 1) * GRID + gx];
        const br = grid[(gy + 1) * GRID + gx + 1];

        const idx = (tl >= threshold ? 8 : 0) | (tr >= threshold ? 4 : 0) |
                    (br >= threshold ? 2 : 0) | (bl >= threshold ? 1 : 0);
        if (idx === 0 || idx === 15) continue;

        const x0 = gx / (GRID - 1);
        const x1 = (gx + 1) / (GRID - 1);
        const y0 = gy / (GRID - 1);
        const y1 = (gy + 1) / (GRID - 1);

        const lerp = (a, b, va, vb) =>
          Math.abs(vb - va) < 1e-10 ? (a + b) / 2 : a + (b - a) * (threshold - va) / (vb - va);

        const top    = [lerp(x0, x1, tl, tr), y0];
        const right  = [x1, lerp(y0, y1, tr, br)];
        const bottom = [lerp(x0, x1, bl, br), y1];
        const left   = [x0, lerp(y0, y1, tl, bl)];

        segments.push(...marchingSquaresSegs(idx, top, right, bottom, left));
      }
    }

    const polylines = chainSegments(segments).map(pl =>
      pl.map(([x, y]) => [parseFloat(x.toFixed(3)), parseFloat(y.toFixed(3))])
    );
    console.log(`  Level ${(threshold * 100).toFixed(0)}%: ${polylines.length} contour lines`);
    return { threshold, polylines };
  });

  return { levels };
}

// ---------------------------------------------------------------------------
// 7. Define trails (manual + auto-generated from hub/develops)
// ---------------------------------------------------------------------------

function buildTrails(itemSlugs, allItems) {
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
      type: 'curated',
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
      type: 'curated',
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
      type: 'curated',
    },
  ];

  // Auto-generate trails from hub/develops project structure
  if (allItems) {
    const hubMap = new Map();
    for (const item of allItems) {
      if (item.hub) hubMap.set(item.slug, { hubItem: item, files: [] });
    }
    for (const item of allItems) {
      if (item.develops && hubMap.has(item.develops)) {
        hubMap.get(item.develops).files.push(item);
      }
    }
    for (const [hubSlug, { hubItem, files }] of hubMap) {
      if (!hubItem || files.length === 0) continue;
      // Sort files by date ascending, falling back to slug order
      const sorted = files.slice().sort((a, b) => {
        if (a.date && b.date) return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
        return a.slug.localeCompare(b.slug);
      });
      trails.push({
        id: `project-${hubSlug}`,
        name: hubItem.title,
        description: hubItem.description || `Explore the ${hubItem.title} project.`,
        items: [hubSlug, ...sorted.map(f => f.slug)],
        type: 'project',
      });
    }
  }

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

  // Remove tags, hub, develops, date from output (not needed on client as raw fields)
  const outputItems = allItems.map(({ tags, hub, develops, date, ...rest }) => rest);

  // Territories (semantic clusters named by dominant tags)
  console.log('Computing territories...');
  const territories = computeTerritories(allItems);
  console.log(`Generated ${territories.length} territories`);

  // Topographic contours (KDE density iso-contours)
  const topography = computeTopography(allItems);

  // Trails (manual curated + auto-generated from hub/develops)
  const slugSet = new Set(allItems.map(i => i.slug));
  const trails = buildTrails(slugSet, allItems);
  console.log(`Built ${trails.length} trails`);

  // Write output
  const output = { items: outputItems, territories, topography, trails };
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`Wrote ${OUTPUT_FILE} (${outputItems.length} items)`);
}

main();
