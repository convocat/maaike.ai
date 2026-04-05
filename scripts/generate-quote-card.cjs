/**
 * Generate a square (1080×1080) quote card for a jotting with type: quote.
 * Same visual style as the OG card — same background, same fonts.
 *
 * Usage: node scripts/generate-quote-card.cjs <slug>
 *   e.g. node scripts/generate-quote-card.cjs the-map-is-not-the-territory
 *
 * Output: public/images/quote-cards/<slug>.png
 */

const fs = require('fs');
const path = require('path');
const { default: satori } = require('satori');
const sharp = require('sharp');

const ROOT        = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content', 'jottings');
const OUTPUT_DIR  = path.join(ROOT, 'public', 'images', 'quote-cards');
const BG_IMAGE    = path.join(__dirname, 'og-bg.png');
const LEAF_SVG    = path.join(__dirname, 'leaf-icon.svg');

const SIZE = 1080;

// Same palette as OG cards
const DARK     = '#1c1917';
const MUTED    = '#57534e';
const CHESTNUT = '#8B7355';

// ---------------------------------------------------------------------------
// Parse frontmatter + body
// ---------------------------------------------------------------------------

function parseJotting(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return null;

  const fm   = match[1];
  const body = match[2].trim();

  const title  = (fm.match(/^title:\s*["']?(.+?)["']?\s*$/m)  || [])[1] || '';
  const source = (fm.match(/^source:\s*["']?(.+?)["']?\s*$/m) || [])[1] || '';
  const draft  = /draft:\s*true/.test(fm);
  const type   = (fm.match(/^type:\s*(\S+)/m) || [])[1] || '';

  // Body is the quote text — strip any leading # heading if present
  const quoteText = body.replace(/^#[^\n]*\n/, '').trim();

  return { title, source, quoteText, draft, type };
}

// ---------------------------------------------------------------------------
// Build text overlay
// ---------------------------------------------------------------------------

function buildOverlay(quoteText, source, leafDataUrl) {
  // Scale font size to quote length
  const fontSize = quoteText.length > 120 ? 44 : quoteText.length > 80 ? 52 : 62;

  return {
    type: 'div',
    props: {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '72px 80px',
        backgroundColor: 'transparent',
      },
      children: [
        // Wordmark (top, centered)
        {
          type: 'div',
          props: {
            style: { display: 'flex', width: '100%', justifyContent: 'center' },
            children: {
              type: 'span',
              props: {
                style: {
                  fontSize: '40px',
                  fontFamily: 'SourceSerifPro',
                  fontWeight: 700,
                  color: CHESTNUT,
                },
                children: 'Maai&AI',
              },
            },
          },
        },

        // Spacer — pushes quote block to vertical center
        { type: 'div', props: { style: { flex: '1' }, children: '' } },

        // Quote block (centered)
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
              width: '100%',
            },
            children: [
              // Leaf icon + quote text
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    width: '100%',
                  },
                  children: [
                    // Leaf icon
                    {
                      type: 'img',
                      props: {
                        src: leafDataUrl,
                        width: 56,
                        height: 77,
                        style: { display: 'block' },
                      },
                    },
                    // Quote text
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'SourceSerifPro',
                          fontWeight: 700,
                          fontSize: `${fontSize}px`,
                          color: DARK,
                          lineHeight: 1.35,
                          textAlign: 'center',
                          width: '100%',
                        },
                        children: quoteText,
                      },
                    },
                  ],
                },
              },

              // Source attribution (centered)
              source ? {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: '40px',
                          height: '3px',
                          backgroundColor: CHESTNUT,
                          opacity: '0.5',
                        },
                        children: '',
                      },
                    },
                    {
                      type: 'span',
                      props: {
                        style: {
                          fontFamily: 'Inter',
                          fontWeight: 400,
                          fontSize: '28px',
                          color: MUTED,
                          letterSpacing: '0.04em',
                          textAlign: 'center',
                        },
                        children: source,
                      },
                    },
                  ],
                },
              } : { type: 'div', props: { style: { display: 'flex' }, children: '' } },
            ],
          },
        },

        // Bottom spacer — slightly smaller so content sits just below center
        { type: 'div', props: { style: { flex: '0.6' }, children: '' } },
      ],
    },
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: node scripts/generate-quote-card.cjs <slug>');
    process.exit(1);
  }

  const filePath = path.join(CONTENT_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    console.error(`Not found: ${filePath}`);
    process.exit(1);
  }

  const data = parseJotting(filePath);
  if (!data) {
    console.error('Could not parse frontmatter');
    process.exit(1);
  }
  if (data.type !== 'quote') {
    console.warn(`Warning: jotting type is "${data.type}", not "quote" — generating anyway`);
  }

  console.log('Loading fonts...');
  const sourceSerifFont = fs.readFileSync(path.join(__dirname, 'source-serif-pro-700.ttf'));
  const interFont       = fs.readFileSync(path.join(__dirname, 'inter-400.ttf'));

  const fonts = [
    { name: 'SourceSerifPro', data: sourceSerifFont, weight: 700, style: 'normal' },
    { name: 'Inter',          data: interFont,        weight: 400, style: 'normal' },
  ];

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const outPath = path.join(OUTPUT_DIR, `${slug}.png`);

  // Load leaf SVG, rasterise to PNG, embed as data URL
  const leafSvgStr = fs.readFileSync(LEAF_SVG, 'utf-8');
  const leafPng = await sharp(Buffer.from(leafSvgStr))
    .resize(56, 77, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const leafDataUrl = `data:image/png;base64,${leafPng.toString('base64')}`;

  // Square-crop from the left (clean background, no branch overlap)
  const bgBuffer = await sharp(BG_IMAGE)
    .resize(SIZE, SIZE, { fit: 'cover', position: 'left' })
    .modulate({ brightness: 1.08 })
    .png()
    .toBuffer();

  // Render text overlay
  const overlay   = buildOverlay(data.quoteText, data.source, leafDataUrl);
  const svg        = await satori(overlay, { width: SIZE, height: SIZE, fonts });
  const overlayPng = await sharp(Buffer.from(svg)).png().toBuffer();

  // Composite
  await sharp(bgBuffer)
    .composite([{ input: overlayPng, left: 0, top: 0 }])
    .png({ quality: 90 })
    .toFile(outPath);

  console.log(`Quote card saved: ${outPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
