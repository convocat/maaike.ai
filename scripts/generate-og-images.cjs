/**
 * Generate OG images for all articles, field notes, and seeds.
 *
 * Uses a pre-rendered background PNG (sage green + leaf watermark) and
 * composites text on top via satori (text → SVG) + sharp (composite).
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
const BG_IMAGE = path.join(__dirname, 'og-bg.png');

const COLLECTIONS = ['articles', 'field-notes', 'seeds'];

const WIDTH = 1200;
const HEIGHT = 627;

// Colors
const DARK = '#1c1917';
const MUTED = '#57534e';
const CHESTNUT = '#8B7355';

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

  return { title, description, draft };
}

// ---------------------------------------------------------------------------
// Build text overlay (transparent background, text only)
// ---------------------------------------------------------------------------

function buildTextOverlay(title, description) {
  let snippet = description || '';
  if (snippet.length > 140) {
    snippet = snippet.slice(0, 137) + '...';
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
        padding: '56px 64px',
        backgroundColor: 'transparent',
      },
      children: [
        // Wordmark
        {
          type: 'div',
          props: {
            style: { display: 'flex' },
            children: {
              type: 'span',
              props: {
                style: {
                  fontSize: '42px',
                  fontFamily: 'SourceSerifPro',
                  fontWeight: 700,
                  color: CHESTNUT,
                },
                children: 'Maai&AI',
              },
            },
          },
        },
        // Title + description
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: title.length > 70 ? '48px' : '64px',
                    fontFamily: 'SourceSerifPro',
                    fontWeight: 700,
                    color: DARK,
                    lineHeight: 1.1,
                    maxWidth: '900px',
                  },
                  children: title,
                },
              },
              snippet ? {
                type: 'div',
                props: {
                  style: {
                    fontSize: '32px',
                    fontFamily: 'Inter',
                    fontWeight: 400,
                    color: MUTED,
                    lineHeight: 1.4,
                    maxWidth: '850px',
                  },
                  children: snippet,
                },
              } : { type: 'div', props: { children: '' } },
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
  console.log('Loading fonts...');
  const sourceSerifFont = fs.readFileSync(path.join(__dirname, 'source-serif-pro-700.ttf'));
  const interFont = fs.readFileSync(path.join(__dirname, 'inter-400.ttf'));

  const fonts = [
    { name: 'SourceSerifPro', data: sourceSerifFont, weight: 700, style: 'normal' },
    { name: 'Inter', data: interFont, weight: 400, style: 'normal' },
  ];

  // Load background image once
  const bgBuffer = fs.readFileSync(BG_IMAGE);

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

      if (fs.existsSync(outPath)) {
        skipped++;
        continue;
      }

      const fm = parseFrontmatter(path.join(dir, file));
      if (!fm || fm.draft) continue;

      // Render text as transparent PNG via satori
      const textNode = buildTextOverlay(fm.title, fm.description);
      const svg = await satori(textNode, { width: WIDTH, height: HEIGHT, fonts });
      const textPng = await sharp(Buffer.from(svg)).png().toBuffer();

      // Composite text on background
      await sharp(bgBuffer)
        .composite([{ input: textPng, left: 0, top: 0 }])
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
