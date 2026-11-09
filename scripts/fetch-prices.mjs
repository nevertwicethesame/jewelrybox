// Daily gold/silver spot fetch. Writes prices.json at the repo root.
// On any failure it exits non-zero and leaves the existing prices.json alone.
const KEY = process.env.METALCHARTS_KEY;
const URL_ = process.env.PRICES_URL || 'https://api.metalcharts.org/v1/prices/?currency=USD&unit=toz';
const OUT = process.env.PRICES_OUT || 'prices.json';
const TROY_OZ_G = 31.1034768;
const KARATS = { 18: 0.750, 14: 0.585, 9: 0.375 };
const SANE = { XAU: [300, 20000], XAG: [3, 500] }; // USD per troy oz; catches unit mix-ups
const ATTEMPTS = 2;

const fail = (msg) => { console.error('FAILED:', msg); process.exit(1); };
const round2 = (n) => Math.round(n * 100) / 100;

async function once() {
  const res = await fetch(URL_, { headers: { Authorization: `Bearer ${KEY}` } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  if (body.success !== true) throw new Error('success was not true');
  const gold = body.data?.XAU?.price;
  const silver = body.data?.XAG?.price;
  for (const [sym, v] of [['XAU', gold], ['XAG', silver]]) {
    const [lo, hi] = SANE[sym];
    if (typeof v !== 'number' || !(v >= lo && v <= hi)) {
      throw new Error(`${sym} price ${v} outside ${lo}-${hi}`);
    }
  }
  return { body, gold, silver };
}

if (!KEY) fail('METALCHARTS_KEY is not set');

let result, lastErr;
for (let i = 1; i <= ATTEMPTS; i++) {
  try { result = await once(); break; }
  catch (e) { lastErr = e; console.error(`attempt ${i}: ${e.message}`);
    if (i < ATTEMPTS) await new Promise(r => setTimeout(r, 60000)); }
}
if (!result) fail(lastErr?.message || 'unknown');

const { body, gold, silver } = result;
const out = {
  updated: new Date().toISOString(),   // when this job ran
  asOf: body.timestamp ?? null,        // when the quote was taken
  source: 'MetalCharts',
  stale: body.isStale === true,
  gold: {
    usdPerOz: round2(gold),
    usdPerGram: round2(gold / TROY_OZ_G),
    karat: Object.fromEntries(Object.entries(KARATS).map(([k, f]) => [k, round2(gold * f)])),
  },
  silver: {
    usdPerOz: round2(silver),
    usdPerGram: round2(silver / TROY_OZ_G),
  },
};

const { writeFile } = await import('node:fs/promises');
await writeFile(OUT, JSON.stringify(out, null, 2) + '\n');
console.log('wrote', OUT, JSON.stringify(out.gold.karat), 'silver', out.silver.usdPerOz);
