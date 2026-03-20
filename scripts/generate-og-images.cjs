/**
 * Generate OG images for all articles, field notes, and seeds.
 * Uses satori (HTML/CSS → SVG) + sharp (SVG → PNG).
 *
 * Usage: node scripts/generate-og-images.cjs
 * Output: public/images/og/<collection>/<slug>.png
 */

const fs = require('fs');
const path = require('path');
const { default: satori } = require('satori');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const OUTPUT_DIR = path.join(ROOT, 'public', 'images', 'og');

const COLLECTIONS = ['articles', 'field-notes', 'seeds'];

const WIDTH = 1200;
const HEIGHT = 630;

// Collection display names and icon SVGs (bold white versions for OG cards)
const COLLECTION_META = {
  'articles': {
    label: 'Articles',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 L15 2 L20 7 L20 22 L6 22 Z"/><path d="M15 2 L15 7 L20 7"/><line x1="9" y1="11" x2="17" y2="11"/><line x1="9" y1="14" x2="17" y2="14"/><line x1="9" y1="17" x2="14" y2="17"/></svg>`,
  },
  'field-notes': {
    label: 'Field Notes',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4 L5 22 L19 22 L19 4 Z"/><path d="M10 4 L10 2.5 L14 2.5 L14 4"/><line x1="7" y1="4" x2="17" y2="4"/><path d="M6.5 6 L6.5 20.5 L17.5 20.5 L17.5 6 Z"/><rect x="10" y="9" width="2" height="2"/><rect x="10" y="13" width="2" height="2"/><rect x="10" y="17" width="2" height="2"/></svg>`,
  },
  'seeds': {
    label: 'Seeds',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22 C12 22, 12 16, 12 14"/><path d="M12 14 C8 14, 5 10, 7 6 C9 2, 12 2, 12 2 C12 2, 15 2, 17 6 C19 10, 16 14, 12 14 Z"/><path d="M12 6 C12 6, 10 9, 12 14"/></svg>`,
  },
};

// ---------------------------------------------------------------------------
// Parse frontmatter
// ---------------------------------------------------------------------------

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const fm = match[1];

  const title = (fm.match(/^title:\s*["']?(.+?)["']?\s*$/m) || [])[1] || '';
  const description = (fm.match(/^description:\s*["']?(.+?)["']?\s*$/m) || [])[1] || '';
  const draft = /draft:\s*true/.test(fm);
  const maturity = (fm.match(/maturity:\s+(\S+)/) || [])[1] || 'draft';

  return { title, description, draft, maturity };
}

// ---------------------------------------------------------------------------
// Generate card markup (satori JSX-like objects)
// ---------------------------------------------------------------------------

function buildCard(title, description, collectionLabel, iconSvg, maturity) {
  // Truncate description to ~120 chars
  let snippet = description || '';
  if (snippet.length > 120) {
    snippet = snippet.slice(0, 117) + '...';
  }

  // Create data URI for the collection icon SVG
  const iconDataUri = `data:image/svg+xml;base64,${Buffer.from(iconSvg).toString('base64')}`;

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#D6006C',
        padding: '60px',
        fontFamily: 'LeagueSpartan',
      },
      children: [
        // Top: collection label + site name
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '20px',
                    padding: '8px 20px',
                    fontSize: '24px',
                    color: '#fff',
                    fontFamily: 'LeagueSpartan',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  },
                  children: collectionLabel,
                },
              },
              // Site name
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '28px',
                    color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'LeagueSpartan',
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  },
                  children: 'maaike.ai',
                },
              },
            ],
          },
        },
        // Middle: large icon + title side by side
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
              flex: 1,
            },
            children: [
              // Large collection icon
              {
                type: 'img',
                props: {
                  src: iconDataUri,
                  width: 220,
                  height: 220,
                  style: {
                    flexShrink: 0,
                  },
                },
              },
              // Title
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: title.length > 60 ? '42px' : title.length > 40 ? '50px' : '56px',
                    color: '#fff',
                    fontWeight: 700,
                    fontFamily: 'LeagueSpartan',
                    lineHeight: 1.2,
                    margin: 0,
                  },
                  children: title,
                },
              },
            ],
          },
        },
        // Bottom: description snippet
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
            },
            children: [
              snippet ? {
                type: 'p',
                props: {
                  style: {
                    fontSize: '24px',
                    color: 'rgba(255,255,255,0.85)',
                    fontFamily: 'Lora',
                    fontWeight: 400,
                    lineHeight: 1.4,
                    margin: 0,
                    maxWidth: '950px',
                  },
                  children: snippet,
                },
              } : {
                type: 'div',
                props: { children: '' },
              },
            ],
          },
        },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Load fonts (satori needs raw TTF/OTF font data)
  console.log('Loading fonts...');
  const leagueSpartanFont = fs.readFileSync(path.join(__dirname, 'league-spartan-700.ttf'));
  const loraFont = fs.readFileSync(path.join(__dirname, 'lora-400.ttf'));

  const fonts = [
    { name: 'LeagueSpartan', data: leagueSpartanFont, weight: 700, style: 'normal' },
    { name: 'Lora', data: loraFont, weight: 400, style: 'normal' },
  ];

  let generated = 0;
  let skipped = 0;

  for (const collection of COLLECTIONS) {
    const dir = path.join(CONTENT_DIR, collection);
    if (!fs.existsSync(dir)) continue;

    const outDir = path.join(OUTPUT_DIR, collection);
    fs.mkdirSync(outDir, { recursive: true });

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

    for (const file of files) {
      const slug = file.replace('.md', '');
      const outPath = path.join(outDir, `${slug}.png`);

      // Skip if already generated (for incremental builds)
      if (fs.existsSync(outPath)) {
        skipped++;
        continue;
      }

      const fm = parseFrontmatter(path.join(dir, file));
      if (!fm || fm.draft) continue;

      const meta = COLLECTION_META[collection];
      const card = buildCard(fm.title, fm.description, meta.label, meta.icon, fm.maturity);

      const svg = await satori(card, {
        width: WIDTH,
        height: HEIGHT,
        fonts,
      });

      await sharp(Buffer.from(svg))
        .png({ quality: 90 })
        .toFile(outPath);

      generated++;
    }
  }

  console.log(`Generated ${generated} OG images, skipped ${skipped} existing`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
