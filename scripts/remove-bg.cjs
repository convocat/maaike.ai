/**
 * Removes the background from an image using a flood-fill from all four corners,
 * then feathers the edge pixels for a clean result.
 *
 * Usage: node scripts/remove-bg.cjs <input> <output>
 */
const sharp = require('sharp');

const [,, input, output] = process.argv;
if (!input || !output) {
  console.error('Usage: node remove-bg.cjs <input> <output>');
  process.exit(1);
}

const BG_THRESHOLD  = 240; // pixels this bright are candidate background
const FILL_TOLERANCE = 30; // flood-fill colour tolerance
const FEATHER_PASSES = 2;  // soften edge pixels this many times

function colourDistance(data, i, r, g, b) {
  return Math.abs(data[i] - r) + Math.abs(data[i+1] - g) + Math.abs(data[i+2] - b);
}

async function run() {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const mask = new Uint8Array(width * height); // 0 = keep, 1 = background

  // --- flood fill from all four corners ---
  const seeds = [
    0, width - 1,
    (height - 1) * width, (height - 1) * width + width - 1,
  ];

  for (const seed of seeds) {
    const sr = data[seed * channels];
    const sg = data[seed * channels + 1];
    const sb = data[seed * channels + 2];
    if (sr < BG_THRESHOLD && sg < BG_THRESHOLD && sb < BG_THRESHOLD) continue; // dark corner, skip

    const queue = [seed];
    mask[seed] = 1;

    while (queue.length) {
      const idx = queue.pop();
      const x = idx % width;
      const y = Math.floor(idx / width);

      for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const ni = ny * width + nx;
        if (mask[ni]) continue;
        if (colourDistance(data, ni * channels, sr, sg, sb) <= FILL_TOLERANCE) {
          mask[ni] = 1;
          queue.push(ni);
        }
      }
    }
  }

  // --- apply mask: filled pixels → transparent, feather edges ---
  for (let i = 0; i < width * height; i++) {
    if (mask[i]) data[i * channels + 3] = 0;
  }

  // Feather: for each kept pixel adjacent to a transparent pixel, reduce its alpha slightly
  for (let pass = 0; pass < FEATHER_PASSES; pass++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        if (data[i * channels + 3] === 0) continue;
        const neighbours = [
          (y-1)*width+x, (y+1)*width+x, y*width+(x-1), y*width+(x+1)
        ];
        const transparentNeighbours = neighbours.filter(n => data[n * channels + 3] === 0).length;
        if (transparentNeighbours > 0) {
          data[i * channels + 3] = Math.max(0, data[i * channels + 3] - transparentNeighbours * 30);
        }
      }
    }
  }

  await sharp(Buffer.from(data), { raw: { width, height, channels } })
    .png()
    .toFile(output);

  console.log(`Saved: ${output}`);
}

run().catch(err => { console.error(err); process.exit(1); });
