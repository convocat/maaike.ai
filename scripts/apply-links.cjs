/**
 * Apply approved links to garden markdown files.
 *
 * Two modes:
 *   node scripts/apply-links.cjs --preview     Show what would change (dry run)
 *   node scripts/apply-links.cjs --related      Add ## Related sections to files
 *   node scripts/apply-links.cjs --inline       Add inline wiki-links at relevant spots
 *
 * Reads: approved-links.json (from Desktop or project root)
 */

const fs = require('fs');
const path = require('path');

const CONTENT_DIR = 'src/content';
const COLLECTIONS = ['articles', 'field-notes', 'seeds', 'experiments', 'weblinks', 'videos', 'library'];

// --- Find approved links file ---

const candidates = [
    path.join(process.env.USERPROFILE || '', 'Desktop', 'approved-links.json'),
    'approved-links.json',
    path.join('scripts', 'approved-links.json'),
];

let linksFile = candidates.find(f => fs.existsSync(f));
if (!linksFile) {
    console.error('Could not find approved-links.json');
    process.exit(1);
}

const approved = JSON.parse(fs.readFileSync(linksFile, 'utf-8'));
console.log(`Loaded ${approved.links.length} approved links from ${linksFile}\n`);

// --- Build slug -> file path + title map ---

const slugMap = {}; // slug -> { path, title, collection }

for (const collection of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, collection);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.md')) continue;
        const slug = file.replace('.md', '');
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extract title from frontmatter
        const titleMatch = content.match(/^title:\s*["']?(.+?)["']?\s*$/m);
        const title = titleMatch ? titleMatch[1] : slug;

        slugMap[slug] = { path: filePath, title, collection, content };
    }
}

// --- Build per-item link lists (bidirectional) ---

const itemLinks = {}; // slug -> [{ targetSlug, targetTitle }]

for (const link of approved.links) {
    const { source, target } = link;

    if (!slugMap[source]) { console.warn(`  Warning: slug "${source}" not found`); continue; }
    if (!slugMap[target]) { console.warn(`  Warning: slug "${target}" not found`); continue; }

    if (!itemLinks[source]) itemLinks[source] = [];
    if (!itemLinks[target]) itemLinks[target] = [];

    // Check if link already exists in content
    const sourceHasLink = slugMap[source].content.includes(`[[${target}`) || slugMap[source].content.includes(`[[${slugMap[target].title}`);
    const targetHasLink = slugMap[target].content.includes(`[[${source}`) || slugMap[target].content.includes(`[[${slugMap[source].title}`);

    if (!sourceHasLink) {
        itemLinks[source].push({ slug: target, title: slugMap[target].title });
    }
    if (!targetHasLink) {
        itemLinks[target].push({ slug: source, title: slugMap[source].title });
    }
}

// --- Mode: Preview ---

const mode = process.argv[2] || '--preview';

if (mode === '--preview') {
    console.log('=== PREVIEW (dry run) ===\n');

    let totalNewLinks = 0;
    for (const [slug, links] of Object.entries(itemLinks).sort()) {
        if (links.length === 0) continue;
        const item = slugMap[slug];
        console.log(`${item.collection}/${slug} - "${item.title}"`);
        for (const link of links) {
            console.log(`  + [[${link.slug}|${link.title}]]`);
            totalNewLinks++;
        }
        console.log();
    }
    console.log(`Total: ${totalNewLinks} new links across ${Object.keys(itemLinks).filter(s => itemLinks[s].length > 0).length} files`);
    console.log('\nRun with --related or --inline to apply.');
}

// --- Mode: Add ## Related sections ---

if (mode === '--related') {
    console.log('=== Adding ## Related sections ===\n');

    let filesChanged = 0;
    for (const [slug, links] of Object.entries(itemLinks)) {
        if (links.length === 0) continue;
        const item = slugMap[slug];
        let content = item.content;

        // Check if file already has a ## Related section
        const relatedMatch = content.match(/\n## Related\s*\n/);

        const newLinks = links.map(l => `- [[${l.slug}|${l.title}]]`).join('\n');

        if (relatedMatch) {
            // Append to existing Related section
            const insertPos = relatedMatch.index + relatedMatch[0].length;
            // Find existing links in the section
            const afterRelated = content.slice(insertPos);
            const nextSection = afterRelated.search(/\n## /);
            const existingSection = nextSection >= 0 ? afterRelated.slice(0, nextSection) : afterRelated;

            // Only add links not already present
            const newContent = content.slice(0, insertPos) + existingSection.trimEnd() + '\n' + newLinks + '\n' + (nextSection >= 0 ? content.slice(insertPos + nextSection) : '');
            fs.writeFileSync(item.path, newContent, 'utf-8');
        } else {
            // Add new Related section at end
            content = content.trimEnd() + '\n\n## Related\n\n' + newLinks + '\n';
            fs.writeFileSync(item.path, content, 'utf-8');
        }

        console.log(`  ✓ ${item.collection}/${slug}: +${links.length} links`);
        filesChanged++;
    }

    console.log(`\nDone: ${filesChanged} files updated.`);
}

// --- Mode: Inline links ---

if (mode === '--inline') {
    console.log('=== Inline link suggestions ===\n');
    console.log('For each file, showing where a wiki-link could be inserted:\n');

    for (const [slug, links] of Object.entries(itemLinks).sort()) {
        if (links.length === 0) continue;
        const item = slugMap[slug];
        const lines = item.content.split('\n');

        // Skip frontmatter
        let inFrontmatter = false;
        let bodyStart = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() === '---') {
                if (inFrontmatter) { bodyStart = i + 1; break; }
                else inFrontmatter = true;
            }
        }

        console.log(`${item.collection}/${slug} - "${item.title}"`);

        for (const link of links) {
            // Search for the best place to insert this link
            // Strategy: find a sentence that mentions a keyword from the target title
            const targetWords = link.title.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(/\s+/)
                .filter(w => w.length > 3); // skip short words

            let bestLine = -1;
            let bestWord = '';
            let bestScore = 0;

            for (let i = bodyStart; i < lines.length; i++) {
                const lineLower = lines[i].toLowerCase();
                // Skip headings, empty lines, existing wiki-links on this line
                if (lines[i].startsWith('#') || lines[i].trim() === '' || lines[i].includes('[[')) continue;

                let lineScore = 0;
                let matchedWord = '';
                for (const word of targetWords) {
                    if (lineLower.includes(word)) {
                        lineScore++;
                        matchedWord = word;
                    }
                }

                if (lineScore > bestScore) {
                    bestScore = lineScore;
                    bestLine = i;
                    bestWord = matchedWord;
                }
            }

            if (bestLine >= 0 && bestScore > 0) {
                const preview = lines[bestLine].trim().slice(0, 100);
                console.log(`  → [[${link.slug}|${link.title}]]`);
                console.log(`    Line ${bestLine + 1} (matched "${bestWord}"): "${preview}..."`);

                // Show the suggested edit
                const line = lines[bestLine];
                const wordRegex = new RegExp(`\\b(${bestWord})\\b`, 'i');
                const match = line.match(wordRegex);
                if (match) {
                    const before = line.slice(0, match.index);
                    const after = line.slice(match.index + match[0].length);
                    console.log(`    Suggestion: ...${before.slice(-30)}[[${link.slug}|${match[0]}]]${after.slice(0, 30)}...`);
                }
            } else {
                console.log(`  → [[${link.slug}|${link.title}]]`);
                console.log(`    No good inline spot found. Better as ## Related.`);
            }
            console.log();
        }
    }
}
