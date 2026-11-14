/**
 * Menghasilkan public/og.png (1200×630) tanpa foto AI.
 * Jalankan: node scripts/generate-og.mjs
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1C4A3E"/>
      <stop offset="0.6" stop-color="#173F35"/>
      <stop offset="1" stop-color="#102B25"/>
    </linearGradient>
    <clipPath id="phoneClip">
      <rect x="884" y="98" width="232" height="464" rx="34"/>
    </clipPath>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>

  <g fill="none" stroke="#DDF3EC" stroke-opacity="0.10">
    <circle cx="1030" cy="330" r="300"/>
    <circle cx="1030" cy="330" r="236"/>
    <circle cx="1030" cy="330" r="172"/>
    <circle cx="1030" cy="330" r="108"/>
  </g>

  <!-- Logo mark -->
  <rect x="72" y="64" width="56" height="56" rx="18" fill="#FFFFFF"/>
  <g transform="translate(84 76) scale(1.35)" fill="none" stroke="#173F35" stroke-width="1.8" stroke-linejoin="round">
    <path d="M20.2 3.8c.4 7.3-2.6 13-8.4 14.4-3 .7-5.6-.1-7.3-1.7C2.6 14.6 2.4 11 4.1 8.2 6.4 4.4 12 3.4 20.2 3.8Z"/>
    <path d="M5.4 19.4c1.4-4.1 4.2-7.5 8.2-9.6" stroke-linecap="round"/>
  </g>
  <text x="144" y="103" font-family="Noto Sans, Liberation Sans, sans-serif" font-size="28" font-weight="700" fill="#FFFFFF">PilahYuk</text>

  <text x="72" y="228" font-family="Noto Sans, Liberation Sans, sans-serif" font-size="15" font-weight="700" letter-spacing="2.2" fill="#DDF3EC">APLIKASI KOMUNITAS PILAH SAMPAH</text>

  <text x="72" y="320" font-family="Noto Sans, Liberation Sans, sans-serif" font-size="66" font-weight="700" fill="#FFFFFF">Pilah dari rumah,</text>
  <text x="72" y="398" font-family="Noto Sans, Liberation Sans, sans-serif" font-size="66" font-weight="700" fill="#FFFFFF">kumpul bersama</text>
  <text x="72" y="476" font-family="Noto Sans, Liberation Sans, sans-serif" font-size="66" font-weight="700" fill="#E7A34B">tetangga.</text>

  <text x="72" y="566" font-family="Noto Sans, Liberation Sans, sans-serif" font-size="19" font-weight="500" fill="#DDF3EC">Memilah, mengajukan jemput, dan mencatat setoran. Tetap jalan tanpa sinyal.</text>

  <!-- Phone mockup: layar bersih, tanpa UI palsu -->
  <rect x="874" y="88" width="252" height="484" rx="44" fill="#101614"/>
  <g clip-path="url(#phoneClip)">
    <rect x="884" y="98" width="232" height="464" fill="#DDF3EC"/>
    <g fill="none" stroke="#3D9274" stroke-opacity="0.35">
      <circle cx="1000" cy="330" r="150"/>
      <circle cx="1000" cy="330" r="104"/>
      <circle cx="1000" cy="330" r="58"/>
    </g>
    <rect x="946" y="286" width="108" height="108" rx="34" fill="#173F35"/>
    <g transform="translate(970 310) scale(1.9)" fill="none" stroke="#DDF3EC" stroke-width="1.6" stroke-linejoin="round">
      <path d="M20.2 3.8c.4 7.3-2.6 13-8.4 14.4-3 .7-5.6-.1-7.3-1.7C2.6 14.6 2.4 11 4.1 8.2 6.4 4.4 12 3.4 20.2 3.8Z"/>
      <path d="M5.4 19.4c1.4-4.1 4.2-7.5 8.2-9.6" stroke-linecap="round"/>
    </g>
    <text x="1000" y="446" text-anchor="middle" font-family="Noto Sans, Liberation Sans, sans-serif" font-size="18" font-weight="700" fill="#173F35">PilahYuk</text>
    <text x="1000" y="472" text-anchor="middle" font-family="Noto Sans, Liberation Sans, sans-serif" font-size="13" font-weight="500" fill="#246B56">Android · APK</text>
  </g>
</svg>`;

await mkdir("public", { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile("public/og.png");
console.log("public/og.png dibuat");
