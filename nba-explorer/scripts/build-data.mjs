// Build-time data fetcher (ESPN public API — no key, no signup).
// Pulls all 30 teams, FULL rosters, headshots, bios, and real per-game stats,
// then writes a static JSON the app reads instantly. Run with `npm run data`.
//
// Why build-time: the app makes zero live API calls, so it loads instantly and
// can't be rate-limited or CORS-blocked.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const WEB = 'https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/nba.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(url, label) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (nba-explorer build)' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === 4) throw new Error(`Failed ${label}: ${err.message}`);
      await sleep(attempt * 1500);
    }
  }
}

// Limited-concurrency map so we never fire a giant burst.
async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let i = 0;
  async function run() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

function birthPlaceStr(bp) {
  if (!bp) return '';
  return [bp.city, bp.state, bp.country].filter(Boolean).join(', ');
}

// Pull the current (latest) season's per-game averages out of the stats payload.
function parseStats(statsJson) {
  const cats = statsJson?.categories || [];
  const avg = cats.find((c) => c.name === 'averages');
  if (!avg) return null;
  const labels = avg.labels || [];
  const splits = avg.statistics || [];
  if (!splits.length) return null;
  // splits are oldest-first; pick the highest season year (current season)
  let latest = splits[0];
  for (const s of splits) {
    if ((s.season?.year || 0) >= (latest.season?.year || 0)) latest = s;
  }
  const vals = latest.stats || [];
  const m = {};
  labels.forEach((lbl, idx) => (m[lbl] = vals[idx]));
  const num = (v) => (v === undefined || v === '' ? null : v);
  return {
    season: latest.season?.displayName || null,
    gp: num(m['GP']),
    min: num(m['MIN']),
    pts: num(m['PTS']),
    reb: num(m['REB']),
    ast: num(m['AST']),
    stl: num(m['STL']),
    blk: num(m['BLK']),
    fgPct: num(m['FG%']),
    tpPct: num(m['3P%']),
    ftPct: num(m['FT%']),
  };
}

async function main() {
  console.log('Fetching teams…');
  const teamsResp = await getJSON(`${SITE}/teams`, 'teams list');
  const rawTeams = teamsResp.sports[0].leagues[0].teams.map((x) => x.team);

  const teams = [];
  const players = [];

  // teams + rosters
  await mapLimit(rawTeams, 5, async (t) => {
    try {
      const roster = await getJSON(`${SITE}/teams/${t.id}/roster`, `roster ${t.displayName}`);
      const venue = roster.team?.venue?.fullName || null;
      teams.push({
        id: t.id,
        name: t.displayName,
        abbr: t.abbreviation,
        logo: (t.logos || [])[0]?.href || null,
        color: t.color ? `#${t.color}` : null,
        location: t.location || null,
        venue,
      });
      for (const a of roster.athletes || []) {
        players.push({
          id: a.id,
          name: a.fullName || a.displayName,
          teamId: t.id,
          team: t.displayName,
          teamAbbr: t.abbreviation,
          teamLogo: (t.logos || [])[0]?.href || null,
          headshot: a.headshot?.href || null,
          jersey: a.jersey || null,
          position: a.position?.abbreviation || a.position?.name || null,
          height: a.displayHeight || null,
          weight: a.displayWeight || null,
          age: a.age || null,
          birthPlace: birthPlaceStr(a.birthPlace),
          college: a.college?.name || null,
          status: a.status?.name || 'Active',
          injury: (a.injuries && a.injuries[0]?.status) || null,
          stats: null,
        });
      }
      console.log(`✓ ${t.displayName}: ${(roster.athletes || []).length} players`);
    } catch (err) {
      console.warn(`!! skipping ${t.displayName}: ${err.message}`);
    }
  });

  // per-player stats
  console.log(`\nFetching stats for ${players.length} players…`);
  let done = 0;
  await mapLimit(players, 8, async (p) => {
    try {
      const s = await getJSON(`${WEB}/athletes/${p.id}/stats`, `stats ${p.name}`);
      p.stats = parseStats(s);
    } catch {
      p.stats = null;
    }
    if (++done % 50 === 0) console.log(`  …${done}/${players.length} stats`);
  });

  teams.sort((a, b) => a.name.localeCompare(b.name));
  players.sort((a, b) => a.name.localeCompare(b.name));

  const withStats = players.filter((p) => p.stats && p.stats.pts != null).length;
  if (teams.length < 28 || players.length < 300) {
    throw new Error(`Data looks incomplete: ${teams.length} teams, ${players.length} players`);
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(
    OUT,
    JSON.stringify(
      { generatedAt: new Date().toISOString(), teams, players },
      null,
      0
    )
  );
  // sample for eyeballing in the log
  const sample = players.find((p) => p.name.includes('Curry')) || players[0];
  console.log(`\n✅ Wrote ${teams.length} teams, ${players.length} players (${withStats} with stats) to ${OUT}`);
  console.log(`   sample: ${sample.name} — ${sample.stats ? `${sample.stats.pts} PTS, ${sample.stats.reb} REB, ${sample.stats.ast} AST` : 'no stats'}`);
}

main().catch((err) => {
  console.error('\n❌ ' + err.message);
  process.exit(1);
});
