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

// Collection display names and icon colors
const COLLECTION_META = {
  'articles': { label: 'Articles', color: '#7A5A48' },
  'field-notes': { label: 'Field Notes', color: '#4A7A50' },
  'seeds': { label: 'Seeds', color: '#A07030' },
};

// ---------------------------------------------------------------------------
// Parse frontmatter
// ---------------------------------------------------------------------------

function parseFrontmatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
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

function buildCard(title, description, collectionLabel, collectionColor, maturity) {
  const maturityEmoji = {
    draft: '🌱', developing: '🌿', solid: '🪴', complete: '🌳'
  }[maturity] || '🌱';

  // Truncate description to ~120 chars
  let snippet = description || '';
  if (snippet.length > 120) {
    snippet = snippet.slice(0, 117) + '...';
  }

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
        fontFamily: 'Lora',
      },
      children: [
        // Top: collection label + maturity
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
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          background: 'rgba(255,255,255,0.2)',
                          borderRadius: '20px',
                          padding: '6px 16px',
                          fontSize: '18px',
                          color: '#fff',
                          fontFamily: 'Roboto',
                          letterSpacing: '0.05em',
                        },
                        children: collectionLabel,
                      },
                    },
                  ],
                },
              },
              // Logo
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '24px',
                    color: 'rgba(255,255,255,0.7)',
                    fontFamily: 'Lora',
                    fontWeight: 400,
                  },
                  children: 'Maai & AI',
                },
              },
            ],
          },
        },
        // Middle: title
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              flex: 1,
              justifyContent: 'center',
            },
            children: [
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: title.length > 60 ? '36px' : title.length > 40 ? '42px' : '48px',
                    color: '#fff',
                    fontWeight: 400,
                    fontFamily: 'Lora',
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
                    fontSize: '20px',
                    color: 'rgba(255,255,255,0.8)',
                    fontFamily: 'Roboto',
                    lineHeight: 1.4,
                    margin: 0,
                    maxWidth: '900px',
                  },
                  children: snippet,
                },
              } : {
                type: 'div',
                props: { children: '' },
              },
              // Decorative dot pattern
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'flex-end',
                  },
                  children: [
                    { type: 'div', props: { style: { width: '12px', height: '12px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }, children: '' } },
                    { type: 'div', props: { style: { width: '16px', height: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }, children: '' } },
                    { type: 'div', props: { style: { width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }, children: '' } },
                  ],
                },
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
  const loraFont = fs.readFileSync(path.join(__dirname, 'lora-400.ttf'));
  const robotoFont = fs.readFileSync(path.join(__dirname, 'roboto-400.ttf'));

  const fonts = [
    { name: 'Lora', data: loraFont, weight: 400, style: 'normal' },
    { name: 'Roboto', data: robotoFont, weight: 400, style: 'normal' },
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
      const card = buildCard(fm.title, fm.description, meta.label, meta.color, fm.maturity);

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
