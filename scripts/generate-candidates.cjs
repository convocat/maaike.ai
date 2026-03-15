/**
 * Generate link candidates from embeddings + key phrases.
 *
 * Reads:
 *   scripts/embeddings-bge-m3.json   (157 items, 1024-dim vectors)
 *   keyphrase-results.json           (92 items, 8 phrases each)
 *   src/content/**\/*.md              (existing wiki-links)
 *
 * Writes:
 *   scripts/link-candidates.json     (scored candidate pairs)
 *
 * Usage:
 *   node scripts/generate-candidates.cjs
 *   node scripts/generate-candidates.cjs --threshold 0.55   (default: 0.50)
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = 'src/content';
const COLLECTIONS = ['articles', 'field-notes', 'seeds', 'experiments', 'weblinks', 'videos', 'library'];

// --- Parse args ---

let threshold = 0.50;
const threshIdx = process.argv.indexOf('--threshold');
if (threshIdx !== -1 && process.argv[threshIdx + 1]) {
    threshold = parseFloat(process.argv[threshIdx + 1]);
}

// --- Load data ---

console.log('Loading embeddings...');
const embData = JSON.parse(fs.readFileSync('scripts/embeddings-bge-m3.json', 'utf-8'));
const items = embData.items;       // [{slug, title, collection}]
const embeddings = embData.embeddings; // [[float]]

console.log('Loading key phrases...');
const kpData = JSON.parse(fs.readFileSync('keyphrase-results.json', 'utf-8'));
const kpMap = {};
kpData.items.forEach(item => {
    kpMap[item.slug] = item.llm_phrases.map(p => p.toLowerCase().trim());
});

// --- Parse existing wiki-links from markdown ---

console.log('Parsing existing wiki-links...');
const existingLinks = new Set();

for (const collection of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, collection);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.md')) continue;
        const slug = file.replace('.md', '');
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');

        const wikiLinkRe = /\[\[([^\]]+)\]\]/g;
        let match;
        while ((match = wikiLinkRe.exec(content)) !== null) {
            let target = match[1].split('|')[0].trim();
            target = target.toLowerCase().replace(/\s+/g, '-');
            // Store as sorted pair so A->B and B->A are the same
            const pair = [slug, target].sort().join('::');
            existingLinks.add(pair);
        }
    }
}

console.log(`  Found ${existingLinks.size} existing wiki-link pairs`);

// --- Cosine similarity ---

function cosine(a, b) {
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// --- Compute all pairwise similarities ---

console.log(`Computing similarities for ${items.length} items (${items.length * (items.length - 1) / 2} pairs)...`);

// First pass: compute all similarities per item (for z-score normalization)
const simMatrix = [];
for (let i = 0; i < items.length; i++) {
    simMatrix[i] = [];
    for (let j = 0; j < items.length; j++) {
        if (i === j) {
            simMatrix[i][j] = 1;
        } else if (j < i) {
            simMatrix[i][j] = simMatrix[j][i]; // symmetric
        } else {
            simMatrix[i][j] = cosine(embeddings[i], embeddings[j]);
        }
    }
}

// Per-item stats for z-score normalization
const itemStats = items.map((_, i) => {
    const sims = [];
    for (let j = 0; j < items.length; j++) {
        if (i !== j) sims.push(simMatrix[i][j]);
    }
    const mean = sims.reduce((a, b) => a + b, 0) / sims.length;
    const variance = sims.reduce((a, b) => a + (b - mean) ** 2, 0) / sims.length;
    const std = Math.sqrt(variance);
    return { mean, std };
});

// --- Key phrase overlap ---

function phraseOverlap(slugA, slugB) {
    const phrasesA = kpMap[slugA];
    const phrasesB = kpMap[slugB];
    if (!phrasesA || !phrasesB) return { shared: [], score: 0 };

    const shared = [];
    for (const pa of phrasesA) {
        for (const pb of phrasesB) {
            // Exact match or containment
            if (pa === pb || pa.includes(pb) || pb.includes(pa)) {
                shared.push(pa.length >= pb.length ? pa : pb);
            }
        }
    }
    // Deduplicate
    const unique = [...new Set(shared)];
    return { shared: unique, score: unique.length / 8 }; // normalized to max phrases
}

// --- Generate candidates ---

console.log(`Filtering at threshold ${threshold}...`);

const candidates = [];

for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
        const rawSim = simMatrix[i][j];
        if (rawSim < threshold) continue;

        const slugA = items[i].slug;
        const slugB = items[j].slug;

        // Z-scores from both perspectives
        const zA = itemStats[i].std > 0 ? (rawSim - itemStats[i].mean) / itemStats[i].std : 0;
        const zB = itemStats[j].std > 0 ? (rawSim - itemStats[j].mean) / itemStats[j].std : 0;
        const avgZ = (zA + zB) / 2;

        // Key phrase overlap
        const overlap = phraseOverlap(slugA, slugB);

        // Already linked?
        const pair = [slugA, slugB].sort().join('::');
        const alreadyLinked = existingLinks.has(pair);

        // Same collection?
        const sameCollection = items[i].collection === items[j].collection;

        candidates.push({
            itemA: { slug: slugA, title: items[i].title, collection: items[i].collection },
            itemB: { slug: slugB, title: items[j].title, collection: items[j].collection },
            similarity: Math.round(rawSim * 1000) / 1000,
            zScore: Math.round(avgZ * 100) / 100,
            sharedPhrases: overlap.shared,
            phraseScore: Math.round(overlap.score * 100) / 100,
            sameCollection,
            alreadyLinked,
        });
    }
}

// Sort by z-score descending (most surprising first)
candidates.sort((a, b) => b.zScore - a.zScore);

// --- Output ---

const output = {
    generated: new Date().toISOString(),
    threshold,
    totalItems: items.length,
    totalCandidates: candidates.length,
    alreadyLinked: candidates.filter(c => c.alreadyLinked).length,
    newCandidates: candidates.filter(c => !c.alreadyLinked).length,
    candidates,
};

fs.writeFileSync('scripts/link-candidates.json', JSON.stringify(output, null, 2));

console.log(`\nResults:`);
console.log(`  Total candidates (>= ${threshold}): ${candidates.length}`);
console.log(`  Already linked: ${output.alreadyLinked}`);
console.log(`  New candidates: ${output.newCandidates}`);
console.log(`  Cross-collection: ${candidates.filter(c => !c.sameCollection).length}`);
console.log(`  With shared phrases: ${candidates.filter(c => c.sharedPhrases.length > 0).length}`);
console.log(`\nSaved to scripts/link-candidates.json`);

// Show top 10
console.log('\nTop 10 new candidates (by z-score):');
candidates.filter(c => !c.alreadyLinked).slice(0, 10).forEach((c, i) => {
    const phrases = c.sharedPhrases.length > 0 ? ` [${c.sharedPhrases.join(', ')}]` : '';
    console.log(`  ${i + 1}. ${c.itemA.title} <-> ${c.itemB.title}`);
    console.log(`     sim=${c.similarity} z=${c.zScore} ${c.sameCollection ? 'same' : 'cross'}${phrases}`);
});
