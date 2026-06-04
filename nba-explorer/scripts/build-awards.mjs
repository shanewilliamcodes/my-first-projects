// Build-time awards fetcher (ESPN core API — no key). Annual data, so we bake
// it once into src/data/awards.json. Run with `npm run awards`.
// Kept separate from nba.json so refreshing awards never disturbs the player
// data or the (quota-limited) highlight videos.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CORE = 'https://sports.core.api.espn.com/v2/sports/basketball/leagues/nba';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/awards.json');

// NBA season year: Oct+ belongs to next calendar year's season.
const now = new Date();
const SEASON = now.getMonth() >= 9 ? now.getFullYear() + 1 : now.getFullYear();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === 4) throw err;
      await sleep(attempt * 1000);
    }
  }
}

async function mapLimit(items, limit, worker) {
  const out = new Array(items.length);
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return out;
}

function idFromRef(ref) {
  const m = (ref || '').match(/athletes\/(\d+)/);
  return m ? m[1] : null;
}

async function main() {
  console.log(`Fetching ${SEASON} NBA awards…`);
  const list = await getJSON(`${CORE}/seasons/${SEASON}/awards`);
  const awardRefs = (list.items || []).map((i) => i.$ref);

  const awards = await mapLimit(awardRefs, 4, async (ref) => {
    const a = await getJSON(ref);
    const winners = await mapLimit(a.winners || [], 4, async (w) => {
      try {
        const ath = await getJSON(w.athlete.$ref);
        return {
          id: ath.id || idFromRef(w.athlete.$ref),
          name: ath.displayName || ath.fullName,
          headshot: ath.headshot?.href || null,
        };
      } catch {
        return null;
      }
    });
    console.log(`✓ ${a.name}: ${winners.filter(Boolean).length} winner(s)`);
    return { name: a.name, winners: winners.filter(Boolean) };
  });

  const populated = awards.filter((a) => a.winners.length);
  if (populated.length < 3) throw new Error(`Only ${populated.length} awards populated — aborting`);

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), season: SEASON, awards: populated }, null, 0));
  console.log(`\n✅ Wrote ${populated.length} awards (${SEASON}) to ${OUT}`);
}

main().catch((err) => {
  console.error('\n❌ ' + err.message);
  process.exit(1);
});
