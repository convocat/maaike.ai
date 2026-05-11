/**
 * Generate the OG image for /convoclubirl.
 * One-shot: produces public/images/og-convoclubirl.png (1200x630, fuchsia card).
 *
 * Usage: node scripts/generate-convoclubirl-og.cjs
 */
const path = require('path');
const sharp = require('sharp');

const OUT = path.resolve(__dirname, '..', 'public', 'images', 'og-convoclubirl.png');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#D6006C"/>
  <circle cx="980" cy="120" r="180" fill="#FFFFFF" fill-opacity="0.08"/>
  <circle cx="120" cy="520" r="140" fill="#111111" fill-opacity="0.18"/>
  <text x="80" y="160" font-family="Segoe UI, Roboto, Arial, sans-serif"
        font-size="36" font-weight="700" fill="#FFFFFF"
        letter-spacing="6">CONVOCLUB IRL</text>
  <text x="80" y="290" font-family="Segoe UI, Roboto, Arial, sans-serif"
        font-size="86" font-weight="900" fill="#FFFFFF">Convoclub</text>
  <text x="80" y="385" font-family="Segoe UI, Roboto, Arial, sans-serif"
        font-size="86" font-weight="900" fill="#111111">goes in real life</text>
  <text x="80" y="495" font-family="Segoe UI, Roboto, Arial, sans-serif"
        font-size="38" font-weight="600" fill="#FFFFFF">17 June 2026</text>
  <text x="80" y="548" font-family="Segoe UI, Roboto, Arial, sans-serif"
        font-size="30" font-weight="400" fill="#FFFFFF" fill-opacity="0.92">University of Surrey  ·  Guildford</text>
  <rect x="0" y="610" width="1200" height="20" fill="#111111"/>
</svg>
`;

(async () => {
  await sharp(Buffer.from(svg)).png().toFile(OUT);
  console.log('Wrote', OUT);
})();
