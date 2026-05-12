/**
 * Generate the OG image for /convoclubirl.
 * One-shot: produces public/images/og-convoclubirl.png (1200x630, fuchsia card).
 *
 * Usage: node scripts/generate-convoclubirl-og.cjs
 */
const path = require('path');
const sharp = require('sharp');

const OUT = path.resolve(__dirname, '..', 'public', 'images', 'og-convoclubirl.png');

const FUCHSIA = '#B01778';
const WHITE = '#FFFFFF';
const PINK_SOFT = '#F8E6F0';
const PINK_MID = '#E89BC4';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${FUCHSIA}"/>

  <!-- Decorative pink shapes -->
  <circle cx="1040" cy="110" r="220" fill="${WHITE}" fill-opacity="0.10"/>
  <circle cx="1090" cy="540" r="120" fill="${PINK_MID}" fill-opacity="0.55"/>
  <circle cx="160" cy="540" r="170" fill="${PINK_SOFT}" fill-opacity="0.18"/>

  <!-- Kicker -->
  <text x="80" y="135" font-family="Segoe UI, Roboto, Arial, sans-serif"
        font-size="32" font-weight="700" fill="${PINK_SOFT}"
        letter-spacing="8">CONVOCLUB IRL</text>

  <!-- Headline -->
  <text x="80" y="270" font-family="Segoe UI, Roboto, Arial, sans-serif"
        font-size="94" font-weight="900" fill="${WHITE}">Convoclub</text>
  <text x="80" y="370" font-family="Segoe UI, Roboto, Arial, sans-serif"
        font-size="94" font-weight="900" fill="${WHITE}">goes IRL</text>

  <!-- Date -->
  <text x="80" y="490" font-family="Segoe UI, Roboto, Arial, sans-serif"
        font-size="40" font-weight="700" fill="${WHITE}">Wednesday 17 June 2026</text>

  <!-- Location -->
  <text x="80" y="545" font-family="Segoe UI, Roboto, Arial, sans-serif"
        font-size="30" font-weight="500" fill="${PINK_SOFT}">University of Surrey  ·  Guildford</text>
</svg>
`;

(async () => {
  await sharp(Buffer.from(svg)).png().toFile(OUT);
  console.log('Wrote', OUT);
})();
