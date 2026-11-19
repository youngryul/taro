/**
 * 오리지널 타로 카드 일러스트(SVG) 생성기
 *
 * 실제 출판 덱의 그림을 쓰지 않고, 전통적인 타로 상징(달·기둥·등불·저울 등)과
 * 슈트 기호만으로 74장을 새로 그립니다. 결과: public/tarot-images/{key}.svg
 *
 * 실행: node scripts/generate-card-art.js
 * 카드 이름은 src/data/universalTarot.ts 에서 읽어오므로, 이름을 바꾸면 다시 실행하세요.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'tarot-images');
const SRC = fs.readFileSync(path.join(ROOT, 'src', 'data', 'universalTarot.ts'), 'utf8');

const W = 250;
const H = 375;
const CX = W / 2;
const CY = 168; // 그림 영역 중심
const FONT = "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif";

/* ───────────── 카드 목록 ───────────── */

const majors = [...SRC.matchAll(/major\((\d+), '(m\d+)', '([^']+)', '([^']+)'/g)].map((m) => ({
  key: m[2], number: Number(m[1]), name: m[3], nameKo: m[4], type: 'major',
}));

const SUITS = {
  wands: { prefix: 'w', en: 'Wands', ko: '완드' },
  cups: { prefix: 'c', en: 'Cups', ko: '컵' },
  swords: { prefix: 's', en: 'Swords', ko: '소드' },
  disks: { prefix: 'd', en: 'Disks', ko: '디스크' },
};
const RANK_EN = ['', 'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Knave', 'Queen', 'King'];
const RANK_KO = ['', '에이스', '2', '3', '4', '5', '6', '7', '8', '9', '10', '급사', '여왕', '왕'];
const RANK_KEY = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'kn', 'q', 'k'];
const RANK_LABEL = ['', 'ACE', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'KNAVE', 'QUEEN', 'KING'];

const minors = [];
for (const [suit, s] of Object.entries(SUITS)) {
  for (let n = 1; n <= 13; n++) {
    minors.push({
      key: `${s.prefix}${RANK_KEY[n]}`, number: n, suit, type: 'minor',
      name: `${RANK_EN[n]} of ${s.en}`, nameKo: `${s.ko} ${RANK_KO[n]}`,
    });
  }
}

/* ───────────── 색 테마 ───────────── */

const THEMES = {
  major: { bg: ['#4a3a6e', '#a8719c'], frame: '#f3d48a', ink: '#fff6e8', art: '#f6d98f', soft: '#f2b8d0', banner: 'rgba(40,24,60,0.55)' },
  wands: { bg: ['#ffe4d6', '#ffb3a7'], frame: '#e0876f', ink: '#7a3426', art: '#c2553e', soft: '#f59a6e', banner: 'rgba(255,255,255,0.6)' },
  cups: { bg: ['#e3efff', '#c3c9f5'], frame: '#7f8fd6', ink: '#2f3b7a', art: '#4d5fb8', soft: '#8fb2ec', banner: 'rgba(255,255,255,0.6)' },
  swords: { bg: ['#f6f4ff', '#d7e6f0'], frame: '#8fa3bd', ink: '#3b4862', art: '#56688a', soft: '#a9bdd6', banner: 'rgba(255,255,255,0.65)' },
  disks: { bg: ['#eef6dc', '#f2dea6'], frame: '#b49a4c', ink: '#55491c', art: '#8a7524', soft: '#c8b25e', banner: 'rgba(255,255,255,0.6)' },
};

/* ───────────── 유틸 ───────────── */

const hash = (str) => {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

const star = (x, y, r, fill, points = 5, inner = 0.45) => {
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner;
    const a = (Math.PI * i) / points - Math.PI / 2;
    pts.push(`${(x + rad * Math.cos(a)).toFixed(1)},${(y + rad * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
};

const rays = (x, y, r1, r2, count, color, width = 2) =>
  Array.from({ length: count }, (_, i) => {
    const a = (2 * Math.PI * i) / count;
    return `<line x1="${(x + r1 * Math.cos(a)).toFixed(1)}" y1="${(y + r1 * Math.sin(a)).toFixed(1)}" x2="${(x + r2 * Math.cos(a)).toFixed(1)}" y2="${(y + r2 * Math.sin(a)).toFixed(1)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  }).join('');

/* ───────────── 슈트 기호 (원점 기준, 높이 약 64) ───────────── */

const SYMBOL = {
  wands: (c, s) => `
    <rect x="-4" y="-30" width="8" height="62" rx="4" fill="${c}"/>
    <path d="M0 -30 C-10 -40 -6 -50 0 -56 C6 -50 10 -40 0 -30Z" fill="${s}"/>
    <path d="M4 -12 C14 -18 18 -12 16 -6 C10 -4 6 -8 4 -12Z" fill="${s}"/>
    <path d="M-4 6 C-14 0 -18 6 -16 12 C-10 14 -6 10 -4 6Z" fill="${s}"/>`,
  cups: (c, s) => `
    <path d="M-22 -28 H22 C22 -4 12 8 0 8 C-12 8 -22 -4 -22 -28Z" fill="${c}"/>
    <ellipse cx="0" cy="-28" rx="22" ry="5" fill="${s}"/>
    <rect x="-3" y="8" width="6" height="16" fill="${c}"/>
    <path d="M-16 32 C-16 24 16 24 16 32Z" fill="${c}"/>`,
  swords: (c, s) => `
    <path d="M0 -40 L6 -30 L6 14 L-6 14 L-6 -30Z" fill="${c}"/>
    <line x1="0" y1="-30" x2="0" y2="12" stroke="${s}" stroke-width="2"/>
    <rect x="-18" y="14" width="36" height="6" rx="3" fill="${c}"/>
    <rect x="-3" y="20" width="6" height="14" fill="${c}"/>
    <circle cx="0" cy="37" r="5" fill="${s}"/>`,
  disks: (c, s) => `
    <circle r="27" fill="${c}"/>
    <circle r="21" fill="none" stroke="${s}" stroke-width="2"/>
    ${star(0, 1, 15, s, 6, 0.55)}`,
};

const symbol = (suit, x, y, scale, theme, rotate = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${scale})">${SYMBOL[suit](theme.art, theme.soft)}</g>`;

/* ───────────── 마이너: 숫자 카드 배치 ───────────── */

const PIPS = {
  2: [[0, -0.55], [0, 0.55]],
  3: [[0, -0.75], [0, 0], [0, 0.75]],
  4: [[-0.5, -0.5], [0.5, -0.5], [-0.5, 0.5], [0.5, 0.5]],
  5: [[-0.5, -0.6], [0.5, -0.6], [0, 0], [-0.5, 0.6], [0.5, 0.6]],
  6: [[-0.5, -0.75], [0.5, -0.75], [-0.5, 0], [0.5, 0], [-0.5, 0.75], [0.5, 0.75]],
  7: [[-0.5, -0.8], [0.5, -0.8], [0, -0.4], [-0.5, 0], [0.5, 0], [-0.5, 0.8], [0.5, 0.8]],
  8: [[-0.5, -0.82], [0.5, -0.82], [-0.5, -0.27], [0.5, -0.27], [-0.5, 0.27], [0.5, 0.27], [-0.5, 0.82], [0.5, 0.82]],
  9: [[-0.55, -0.82], [0.55, -0.82], [-0.55, -0.27], [0.55, -0.27], [0, 0], [-0.55, 0.27], [0.55, 0.27], [-0.55, 0.82], [0.55, 0.82]],
  10: [[-0.55, -0.85], [0.55, -0.85], [0, -0.55], [-0.55, -0.28], [0.55, -0.28], [-0.55, 0.28], [0.55, 0.28], [0, 0.55], [-0.55, 0.85], [0.55, 0.85]],
};

function minorArt(card, t) {
  const { suit, number: n } = card;
  if (n === 1) {
    return `
      <circle cx="${CX}" cy="${CY}" r="70" fill="${t.soft}" opacity="0.25"/>
      ${rays(CX, CY, 58, 82, 16, t.soft, 3)}
      ${symbol(suit, CX, CY, 1.75, t)}`;
  }
  if (n <= 10) {
    const scale = n <= 3 ? 0.8 : n <= 6 ? 0.66 : 0.52;
    return PIPS[n]
      .map(([x, y]) => symbol(suit, CX + x * 72, CY + y * 100, scale, t))
      .join('');
  }
  // 인물 카드: 아치(왕좌) + 왕관/모자 + 슈트 기호
  const arch = `<path d="M${CX - 68} ${CY + 92} V${CY - 30} A68 68 0 0 1 ${CX + 68} ${CY - 30} V${CY + 92}Z" fill="${t.soft}" opacity="0.28"/>`;
  let head = '';
  if (n === 11) {
    head = `
      <path d="M${CX - 34} ${CY - 46} C${CX - 30} ${CY - 78} ${CX + 30} ${CY - 78} ${CX + 34} ${CY - 46}Z" fill="${t.art}"/>
      <rect x="${CX - 38}" y="${CY - 50}" width="76" height="9" rx="4" fill="${t.art}"/>
      <path d="M${CX + 14} ${CY - 70} C${CX + 40} ${CY - 100} ${CX + 58} ${CY - 92} ${CX + 62} ${CY - 84} C${CX + 44} ${CY - 84} ${CX + 30} ${CY - 74} ${CX + 18} ${CY - 64}Z" fill="${t.soft}"/>`;
  } else if (n === 12) {
    head = `
      <path d="M${CX - 36} ${CY - 44} L${CX - 36} ${CY - 74} L${CX - 18} ${CY - 58} L${CX} ${CY - 84} L${CX + 18} ${CY - 58} L${CX + 36} ${CY - 74} L${CX + 36} ${CY - 44}Z" fill="${t.art}"/>
      <circle cx="${CX}" cy="${CY - 88}" r="6" fill="${t.soft}"/>
      <circle cx="${CX - 36}" cy="${CY - 78}" r="4" fill="${t.soft}"/>
      <circle cx="${CX + 36}" cy="${CY - 78}" r="4" fill="${t.soft}"/>`;
  } else {
    head = `
      <path d="M${CX - 42} ${CY - 42} L${CX - 42} ${CY - 80} L${CX - 21} ${CY - 60} L${CX} ${CY - 94} L${CX + 21} ${CY - 60} L${CX + 42} ${CY - 80} L${CX + 42} ${CY - 42}Z" fill="${t.art}"/>
      <rect x="${CX - 46}" y="${CY - 46}" width="92" height="10" rx="3" fill="${t.art}"/>
      ${star(CX, CY - 64, 8, t.soft, 4, 0.4)}
      <circle cx="${CX - 26}" cy="${CY - 41}" r="3" fill="${t.soft}"/>
      <circle cx="${CX + 26}" cy="${CY - 41}" r="3" fill="${t.soft}"/>`;
  }
  return `${arch}${head}${symbol(card.suit, CX, CY + 34, 1.25, t)}`;
}

/* ───────────── 메이저: 상징 그림 ───────────── */

const G = THEMES.major.art; // 금색
const P = THEMES.major.soft; // 분홍
const C = '#fff4e6'; // 크림

const mini = (suit, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${SYMBOL[suit](G, P)}</g>`;

const MAJOR_ART = {
  0: () => `
    <circle cx="${CX + 50}" cy="${CY - 62}" r="20" fill="${G}"/>${rays(CX + 50, CY - 62, 26, 36, 12, G)}
    <path d="M${CX - 90} ${CY + 70} L${CX + 20} ${CY + 70} L${CX + 40} ${CY + 100} L${CX - 90} ${CY + 100}Z" fill="${P}" opacity="0.7"/>
    <line x1="${CX - 40}" y1="${CY + 50}" x2="${CX + 10}" y2="${CY - 40}" stroke="${G}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="${CX + 16}" cy="${CY - 46}" r="16" fill="${C}"/>
    <path d="M${CX - 52} ${CY + 30} c-6 -10 6 -18 12 -8 c6 -10 18 -2 12 8 l-12 14z" fill="${P}"/>`,
  1: () => `
    <path d="M${CX} ${CY - 70} c-14 -18 -40 -18 -40 0 s26 18 40 0 s40 -18 40 0 s-26 18 -40 0z" fill="none" stroke="${G}" stroke-width="5"/>
    <rect x="${CX - 4}" y="${CY - 40}" width="8" height="110" rx="4" fill="${C}"/>
    ${star(CX, CY - 44, 10, G)}
    ${mini('wands', CX - 66, CY - 10, 0.55)}${mini('cups', CX + 66, CY - 10, 0.55)}
    ${mini('swords', CX - 66, CY + 66, 0.55)}${mini('disks', CX + 66, CY + 66, 0.55)}`,
  2: () => `
    <rect x="${CX - 88}" y="${CY - 90}" width="22" height="180" fill="${C}" opacity="0.85"/>
    <rect x="${CX + 66}" y="${CY - 90}" width="22" height="180" fill="${P}" opacity="0.85"/>
    <path d="M${CX - 66} ${CY - 70} Q${CX} ${CY - 40} ${CX + 66} ${CY - 70} V${CY + 90} H${CX - 66}Z" fill="${G}" opacity="0.18"/>
    <path d="M${CX + 10} ${CY - 44} a40 40 0 1 0 0 80 a52 52 0 0 1 0 -80z" fill="${G}"/>
    ${star(CX - 30, CY + 60, 6, C)}${star(CX + 34, CY + 66, 4, C)}`,
  3: () => `
    <circle cx="${CX}" cy="${CY - 24}" r="36" fill="none" stroke="${G}" stroke-width="9"/>
    <line x1="${CX}" y1="${CY + 12}" x2="${CX}" y2="${CY + 84}" stroke="${G}" stroke-width="9" stroke-linecap="round"/>
    <line x1="${CX - 26}" y1="${CY + 48}" x2="${CX + 26}" y2="${CY + 48}" stroke="${G}" stroke-width="9" stroke-linecap="round"/>
    ${[-1, 1].map((d) => `<line x1="${CX + d * 78}" y1="${CY + 90}" x2="${CX + d * 70}" y2="${CY - 30}" stroke="${P}" stroke-width="3"/>${[0, 1, 2, 3, 4].map((i) => `<ellipse cx="${CX + d * (70 + i * 1.6)}" cy="${CY - 26 + i * 20}" rx="5" ry="10" fill="${P}" transform="rotate(${d * 25} ${CX + d * (70 + i * 1.6)} ${CY - 26 + i * 20})"/>`).join('')}`).join('')}`,
  4: () => `
    <rect x="${CX - 60}" y="${CY - 10}" width="120" height="100" rx="6" fill="${P}" opacity="0.5"/>
    ${[-1, 1].map((d) => `<path d="M${CX + d * 12} ${CY - 50} c${d * 30} -40 ${d * 70} -10 ${d * 50} 20 c${d * -14} 20 ${d * -40} 4 ${d * -26} -10" fill="none" stroke="${G}" stroke-width="8" stroke-linecap="round"/>`).join('')}
    <circle cx="${CX}" cy="${CY + 40}" r="22" fill="${G}"/>
    <line x1="${CX}" y1="${CY + 6}" x2="${CX}" y2="${CY + 18}" stroke="${G}" stroke-width="5"/>
    <line x1="${CX - 7}" y1="${CY + 10}" x2="${CX + 7}" y2="${CY + 10}" stroke="${G}" stroke-width="5"/>`,
  5: () => `
    <line x1="${CX}" y1="${CY - 86}" x2="${CX}" y2="${CY + 90}" stroke="${G}" stroke-width="7" stroke-linecap="round"/>
    ${[-62, -40, -18].map((y, i) => `<line x1="${CX - 16 - i * 7}" y1="${CY + y}" x2="${CX + 16 + i * 7}" y2="${CY + y}" stroke="${G}" stroke-width="6" stroke-linecap="round"/>`).join('')}
    ${[-1, 1].map((d) => `<g transform="rotate(${d * 35} ${CX} ${CY + 50})"><circle cx="${CX}" cy="${CY + 10}" r="9" fill="none" stroke="${C}" stroke-width="5"/><line x1="${CX}" y1="${CY + 19}" x2="${CX}" y2="${CY + 80}" stroke="${C}" stroke-width="5"/><line x1="${CX}" y1="${CY + 72}" x2="${CX + 10}" y2="${CY + 72}" stroke="${C}" stroke-width="5"/></g>`).join('')}`,
  6: () => `
    <circle cx="${CX}" cy="${CY - 70}" r="16" fill="${G}"/>${rays(CX, CY - 70, 22, 30, 10, G)}
    <circle cx="${CX - 28}" cy="${CY + 24}" r="48" fill="${C}" opacity="0.35"/>
    <circle cx="${CX + 28}" cy="${CY + 24}" r="48" fill="${P}" opacity="0.45"/>
    <path d="M${CX} ${CY + 50} c-30 -22 -30 -48 -12 -50 c8 0 12 6 12 10 c0 -4 4 -10 12 -10 c18 2 18 28 -12 50z" fill="${G}"/>`,
  7: () => `
    <path d="M${CX - 76} ${CY - 30} Q${CX} ${CY - 90} ${CX + 76} ${CY - 30}" fill="${P}" opacity="0.4"/>
    ${[-50, -20, 10, 40].map((x, i) => star(CX + x + 5, CY - 50 - (i % 2) * 10, 6, G)).join('')}
    <rect x="${CX - 54}" y="${CY - 24}" width="108" height="70" rx="6" fill="${C}" opacity="0.85"/>
    ${star(CX, CY + 10, 16, G, 8, 0.5)}
    ${[-1, 1].map((d) => `<circle cx="${CX + d * 46}" cy="${CY + 64}" r="20" fill="none" stroke="${G}" stroke-width="6"/>${rays(CX + d * 46, CY + 64, 0, 18, 6, G, 3)}`).join('')}`,
  8: () => `
    <path d="M${CX} ${CY - 84} c-10 -12 -28 -12 -28 0 s18 12 28 0 s28 -12 28 0 s-18 12 -28 0z" fill="none" stroke="${G}" stroke-width="4"/>
    ${Array.from({ length: 14 }, (_, i) => { const a = (2 * Math.PI * i) / 14; return `<ellipse cx="${(CX + 54 * Math.cos(a)).toFixed(1)}" cy="${(CY + 10 + 54 * Math.sin(a)).toFixed(1)}" rx="16" ry="26" fill="${i % 2 ? G : P}" transform="rotate(${(a * 180) / Math.PI + 90} ${(CX + 54 * Math.cos(a)).toFixed(1)} ${(CY + 10 + 54 * Math.sin(a)).toFixed(1)})"/>`; }).join('')}
    <circle cx="${CX}" cy="${CY + 10}" r="40" fill="${C}"/>
    <path d="M${CX - 14} ${CY + 2} q6 -6 10 0 M${CX + 4} ${CY + 2} q6 -6 10 0 M${CX - 8} ${CY + 24} q8 8 16 0" fill="none" stroke="${THEMES.major.bg[0]}" stroke-width="3" stroke-linecap="round"/>`,
  9: () => `
    <path d="M${CX - 96} ${CY + 96} L${CX - 40} ${CY + 30} L${CX - 10} ${CY + 60} L${CX + 40} ${CY + 10} L${CX + 96} ${CY + 96}Z" fill="${P}" opacity="0.5"/>
    <line x1="${CX + 36}" y1="${CY - 90}" x2="${CX + 36}" y2="${CY + 90}" stroke="${C}" stroke-width="6" stroke-linecap="round"/>
    <line x1="${CX + 36}" y1="${CY - 70}" x2="${CX - 10}" y2="${CY - 70}" stroke="${C}" stroke-width="4"/>
    <line x1="${CX - 10}" y1="${CY - 70}" x2="${CX - 10}" y2="${CY - 54}" stroke="${C}" stroke-width="3"/>
    <polygon points="${CX - 30},${CY - 50} ${CX + 10},${CY - 50} ${CX + 16},${CY - 20} ${CX + 10},${CY + 10} ${CX - 30},${CY + 10} ${CX - 36},${CY - 20}" fill="${G}" opacity="0.9"/>
    ${star(CX - 10, CY - 20, 13, C, 6, 0.5)}`,
  10: () => `
    <circle cx="${CX}" cy="${CY}" r="82" fill="none" stroke="${G}" stroke-width="8"/>
    <circle cx="${CX}" cy="${CY}" r="58" fill="none" stroke="${P}" stroke-width="3"/>
    ${rays(CX, CY, 18, 80, 8, G, 5)}
    <circle cx="${CX}" cy="${CY}" r="18" fill="${C}"/>
    ${[0, 1, 2, 3].map((i) => { const a = (Math.PI / 2) * i - Math.PI / 4; return star(CX + 70 * Math.cos(a), CY + 70 * Math.sin(a), 7, C); }).join('')}`,
  11: () => `
    <line x1="${CX}" y1="${CY - 90}" x2="${CX}" y2="${CY + 90}" stroke="${C}" stroke-width="5"/>
    <path d="M${CX - 7} ${CY - 90} L${CX} ${CY - 104} L${CX + 7} ${CY - 90}Z" fill="${C}"/>
    <line x1="${CX - 76}" y1="${CY - 44}" x2="${CX + 76}" y2="${CY - 44}" stroke="${G}" stroke-width="6" stroke-linecap="round"/>
    ${[-1, 1].map((d) => `<line x1="${CX + d * 72}" y1="${CY - 44}" x2="${CX + d * 50}" y2="${CY + 20}" stroke="${G}" stroke-width="2"/><line x1="${CX + d * 72}" y1="${CY - 44}" x2="${CX + d * 94}" y2="${CY + 20}" stroke="${G}" stroke-width="2"/><path d="M${CX + d * 72 - 26} ${CY + 20} Q${CX + d * 72} ${CY + 46} ${CX + d * 72 + 26} ${CY + 20}Z" fill="${G}"/>`).join('')}
    <path d="M${CX - 30} ${CY + 92} H${CX + 30} L${CX + 20} ${CY + 76} H${CX - 20}Z" fill="${P}"/>`,
  12: () => `
    <line x1="${CX - 70}" y1="${CY - 80}" x2="${CX + 70}" y2="${CY - 80}" stroke="${G}" stroke-width="10" stroke-linecap="round"/>
    <line x1="${CX - 60}" y1="${CY - 80}" x2="${CX - 60}" y2="${CY + 90}" stroke="${G}" stroke-width="8"/>
    <line x1="${CX + 60}" y1="${CY - 80}" x2="${CX + 60}" y2="${CY + 90}" stroke="${G}" stroke-width="8"/>
    <line x1="${CX}" y1="${CY - 80}" x2="${CX}" y2="${CY - 60}" stroke="${C}" stroke-width="3"/>
    <path d="M${CX} ${CY - 60} L${CX} ${CY + 20} M${CX} ${CY - 60} L${CX + 20} ${CY - 40} L${CX} ${CY - 26} M${CX} ${CY - 6} L${CX - 18} ${CY + 30} M${CX} ${CY - 6} L${CX + 18} ${CY + 30}" fill="none" stroke="${C}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${CX}" cy="${CY + 36}" r="13" fill="${C}"/>
    <circle cx="${CX}" cy="${CY + 36}" r="22" fill="none" stroke="${G}" stroke-width="2" stroke-dasharray="3 4"/>`,
  13: () => `
    <rect x="${CX - 96}" y="${CY + 40}" width="192" height="56" fill="${P}" opacity="0.35"/>
    <path d="M${CX - 50} ${CY + 40} a50 50 0 0 1 100 0z" fill="${G}"/>${rays(CX, CY + 40, 58, 74, 18, G).split('<line').filter((l, i) => i === 0 || i > 9).join('<line')}
    ${[0, 1, 2, 3, 4].map((i) => { const a = (2 * Math.PI * i) / 5 - Math.PI / 2; return `<circle cx="${(CX + 17 * Math.cos(a)).toFixed(1)}" cy="${(CY - 46 + 17 * Math.sin(a)).toFixed(1)}" r="16" fill="${C}"/>`; }).join('')}
    <circle cx="${CX}" cy="${CY - 46}" r="9" fill="${G}"/>
    <path d="M${CX} ${CY - 22} Q${CX - 6} ${CY} ${CX} ${CY + 30}" fill="none" stroke="${C}" stroke-width="4"/>`,
  14: () => `
    <polygon points="${CX},${CY - 92} ${CX + 20},${CY - 58} ${CX - 20},${CY - 58}" fill="none" stroke="${G}" stroke-width="4"/>
    <g transform="translate(${CX - 50} ${CY - 6}) rotate(-25) scale(1.1)">${SYMBOL.cups(G, P)}</g>
    <g transform="translate(${CX + 50} ${CY + 50}) rotate(15) scale(1.1)">${SYMBOL.cups(C, P)}</g>
    <path d="M${CX - 34} ${CY - 34} C${CX + 10} ${CY - 40} ${CX + 40} ${CY - 10} ${CX + 44} ${CY + 20}" fill="none" stroke="${P}" stroke-width="7" stroke-linecap="round" stroke-dasharray="1 10"/>
    <path d="M${CX - 34} ${CY - 34} C${CX + 10} ${CY - 40} ${CX + 40} ${CY - 10} ${CX + 44} ${CY + 20}" fill="none" stroke="${C}" stroke-width="3" opacity="0.7"/>`,
  15: () => `
    ${[-1, 1].map((d) => `<path d="M${CX + d * 14} ${CY - 40} C${CX + d * 30} ${CY - 70} ${CX + d * 60} ${CY - 84} ${CX + d * 70} ${CY - 70} C${CX + d * 54} ${CY - 66} ${CX + d * 36} ${CY - 50} ${CX + d * 28} ${CY - 30}Z" fill="${G}"/>`).join('')}
    <circle cx="${CX}" cy="${CY - 20}" r="26" fill="${P}"/>
    <rect x="${CX - 40}" y="${CY + 30}" width="80" height="60" rx="4" fill="${C}" opacity="0.85"/>
    ${[-1, 1].map((d) => `<path d="M${CX + d * 30} ${CY + 40} Q${CX + d * 56} ${CY + 56} ${CX + d * 70} ${CY + 90}" fill="none" stroke="${G}" stroke-width="3" stroke-dasharray="6 3"/><circle cx="${CX + d * 70}" cy="${CY + 92}" r="7" fill="none" stroke="${G}" stroke-width="3"/>`).join('')}`,
  16: () => `
    <rect x="${CX - 30}" y="${CY - 40}" width="60" height="132" fill="${C}" opacity="0.9"/>
    ${[-30, -10, 10].map((x) => `<rect x="${CX + x}" y="${CY - 54}" width="14" height="14" fill="${C}" opacity="0.9"/>`).join('')}
    <rect x="${CX - 10}" y="${CY + 50}" width="20" height="42" rx="10" fill="${THEMES.major.bg[0]}"/>
    <rect x="${CX - 6}" y="${CY - 12}" width="12" height="18" rx="6" fill="${G}"/>
    <polygon points="${CX + 70},${CY - 96} ${CX + 20},${CY - 40} ${CX + 44},${CY - 40} ${CX + 6},${CY + 14} ${CX + 64},${CY - 54} ${CX + 40},${CY - 54}" fill="${G}"/>
    ${[[-58, -10], [-70, 30], [52, 40], [64, 74]].map(([x, y]) => `<rect x="${CX + x}" y="${CY + y}" width="12" height="8" fill="${P}" transform="rotate(${x} ${CX + x} ${CY + y})"/>`).join('')}`,
  17: () => `
    ${star(CX, CY - 30, 50, G, 8, 0.4)}
    ${[[-70, -80], [70, -76], [-84, -10], [84, -4], [-60, 40], [62, 44], [0, -98]].map(([x, y]) => star(CX + x, CY + y, 8, C, 8, 0.4)).join('')}
    ${[0, 1, 2].map((i) => `<path d="M${CX - 80 + i * 6} ${CY + 66 + i * 12} q20 -8 40 0 t40 0 t40 0 t40 0" fill="none" stroke="${P}" stroke-width="3"/>`).join('')}`,
  18: () => `
    <circle cx="${CX}" cy="${CY - 52}" r="40" fill="${C}" opacity="0.9"/>
    <path d="M${CX + 6} ${CY - 92} a40 40 0 1 0 0 80 a52 52 0 0 1 0 -80z" fill="${G}"/>
    ${[-30, -10, 10, 30].map((x, i) => `<path d="M${CX + x} ${CY + 4 + (i % 2) * 10} q-4 8 0 12 q4 -4 0 -12z" fill="${P}"/>`).join('')}
    ${[-1, 1].map((d) => `<rect x="${CX + d * 70 - 12}" y="${CY + 20}" width="24" height="70" fill="${P}" opacity="0.7"/><rect x="${CX + d * 70 - 16}" y="${CY + 14}" width="32" height="8" fill="${P}" opacity="0.7"/>`).join('')}
    <path d="M${CX} ${CY + 96} C${CX - 20} ${CY + 70} ${CX + 20} ${CY + 50} ${CX} ${CY + 26}" fill="none" stroke="${C}" stroke-width="5" stroke-linecap="round"/>`,
  19: () => `
    ${Array.from({ length: 16 }, (_, i) => { const a = (2 * Math.PI * i) / 16; const r2 = i % 2 ? 76 : 90; return `<line x1="${(CX + 50 * Math.cos(a)).toFixed(1)}" y1="${(CY - 16 + 50 * Math.sin(a)).toFixed(1)}" x2="${(CX + r2 * Math.cos(a)).toFixed(1)}" y2="${(CY - 16 + r2 * Math.sin(a)).toFixed(1)}" stroke="${i % 2 ? P : G}" stroke-width="${i % 2 ? 4 : 7}" stroke-linecap="round"/>`; }).join('')}
    <circle cx="${CX}" cy="${CY - 16}" r="44" fill="${G}"/>
    <circle cx="${CX}" cy="${CY - 16}" r="32" fill="${C}" opacity="0.5"/>
    ${[-1, 1].map((d) => `<circle cx="${CX + d * 52}" cy="${CY + 84}" r="12" fill="${G}"/><circle cx="${CX + d * 52}" cy="${CY + 84}" r="5" fill="${THEMES.major.bg[0]}"/>`).join('')}`,
  20: () => `
    ${rays(CX, CY - 70, 20, 56, 12, P, 3)}
    <path d="M${CX - 60} ${CY + 10} L${CX + 30} ${CY - 60} L${CX + 40} ${CY - 48} Z" fill="${G}"/>
    <path d="M${CX + 30} ${CY - 60} q20 -18 30 -4 q-14 14 -20 16z" fill="${G}"/>
    <rect x="${CX - 30}" y="${CY - 30}" width="40" height="30" fill="${C}" transform="rotate(-38 ${CX - 10} ${CY - 15})"/>
    <path d="M${CX - 12} ${CY - 26} v20 M${CX - 20} ${CY - 18} h16" stroke="${P}" stroke-width="4" transform="rotate(-38 ${CX - 10} ${CY - 15})"/>
    ${[-50, 0, 50].map((x) => `<ellipse cx="${CX + x}" cy="${CY + 76}" rx="40" ry="16" fill="${C}" opacity="0.55"/>`).join('')}`,
  21: () => `
    <ellipse cx="${CX}" cy="${CY}" rx="62" ry="88" fill="none" stroke="${G}" stroke-width="8"/>
    ${Array.from({ length: 22 }, (_, i) => { const a = (2 * Math.PI * i) / 22; const x = CX + 62 * Math.cos(a); const y = CY + 88 * Math.sin(a); return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="4" ry="9" fill="${P}" transform="rotate(${((a * 180) / Math.PI).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }).join('')}
    ${star(CX, CY, 24, C, 5, 0.45)}
    ${mini('wands', CX - 86, CY - 86, 0.4)}${mini('cups', CX + 86, CY - 86, 0.4)}
    ${mini('swords', CX - 86, CY + 84, 0.4)}${mini('disks', CX + 86, CY + 84, 0.4)}`,
};

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

/* ───────────── 카드 조립 ───────────── */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function renderCard(card) {
  const t = THEMES[card.type === 'major' ? 'major' : card.suit];
  const rnd = hash(card.key);
  const sparkles = Array.from({ length: card.type === 'major' ? 14 : 8 }, () => {
    const x = 22 + rnd() * (W - 44);
    const y = 24 + rnd() * 270;
    return star(x, y, 1.5 + rnd() * 2.5, card.type === 'major' ? C : '#ffffff', 4, 0.35).replace('/>', ` opacity="${(0.35 + rnd() * 0.5).toFixed(2)}"/>`);
  }).join('');

  const label = card.type === 'major' ? ROMAN[card.number] : RANK_LABEL[card.number];
  const art = card.type === 'major' ? MAJOR_ART[card.number]() : minorArt(card, t);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${t.bg[0]}"/>
      <stop offset="1" stop-color="${t.bg[1]}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="16" fill="url(#bg)"/>
  ${sparkles}
  <rect x="9" y="9" width="${W - 18}" height="${H - 18}" rx="11" fill="none" stroke="${t.frame}" stroke-width="2.5"/>
  <rect x="15" y="15" width="${W - 30}" height="${H - 30}" rx="8" fill="none" stroke="${t.frame}" stroke-width="1" opacity="0.7"/>
  <text x="${CX}" y="44" text-anchor="middle" font-family="Georgia,serif" font-size="17" letter-spacing="3" fill="${t.ink}">${label}</text>
  <g>${art}</g>
  <rect x="26" y="${H - 82}" width="${W - 52}" height="52" rx="10" fill="${t.banner}"/>
  <text x="${CX}" y="${H - 54}" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="700" fill="${t.ink}">${esc(card.nameKo)}</text>
  <text x="${CX}" y="${H - 37}" text-anchor="middle" font-family="Georgia,serif" font-size="10.5" letter-spacing="1.5" fill="${t.ink}" opacity="0.8">${esc(card.name.toUpperCase())}</text>
</svg>
`;
}

/* ───────────── 실행 ───────────── */

if (majors.length !== 22) throw new Error(`메이저 카드를 22장 찾지 못했습니다 (${majors.length}장)`);
fs.mkdirSync(OUT, { recursive: true });
const all = [...majors, ...minors];
for (const card of all) fs.writeFileSync(path.join(OUT, `${card.key}.svg`), renderCard(card));
console.log(`${all.length}장 생성 → ${path.relative(ROOT, OUT)}`);
