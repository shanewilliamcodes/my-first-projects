// Build-time data fetcher.
// Pulls all 30 NBA teams + their rosters from TheSportsDB ONCE and writes a
// static JSON file the app reads instantly. Run locally with `npm run data`,
// and the GitHub Action runs it before every deploy so the data stays fresh.
//
// Why: fetching in the browser hits CORS blocks (some endpoints) and rate
// limits (bursts). Doing it here — server-side, sequentially — avoids both.

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = 'https://www.thesportsdb.com/api/v1/json/3';
const OUT = resolve(dirname(fileURLToPath(import.meta.url)), '../src/data/nba.json');

const TEAMS = [
  'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
  'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
  'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
  'Los Angeles Clippers', 'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat',
  'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks',
  'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns',
  'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors',
  'Utah Jazz', 'Washington Wizards',
];

// The free roster endpoint caps at 10 players per team — and sorts them
// alphabetically by first name, which cuts most superstars. So we also pull a
// curated list of star players by name to guarantee the household names are
// searchable. (Their current team comes from the API, not this list.)
const STARS = [
  'LeBron James', 'Stephen Curry', 'Kevin Durant', 'Giannis Antetokounmpo',
  'Nikola Jokic', 'Luka Doncic', 'Jayson Tatum', 'Joel Embiid', 'Kawhi Leonard',
  'Jimmy Butler', 'Damian Lillard', 'Anthony Davis', 'Devin Booker', 'Kyrie Irving',
  'James Harden', 'Paul George', 'Donovan Mitchell', 'Trae Young', 'Ja Morant',
  'Zion Williamson', 'Shai Gilgeous-Alexander', 'Jaylen Brown', 'Jalen Brunson',
  'Tyrese Haliburton', 'Anthony Edwards', 'De\'Aaron Fox', 'Domantas Sabonis',
  'Pascal Siakam', 'Bam Adebayo', 'Tyler Herro', 'Karl-Anthony Towns',
  'Rudy Gobert', 'Jaren Jackson Jr', 'Klay Thompson', 'Draymond Green',
  'Jamal Murray', 'Aaron Gordon', 'Bradley Beal', 'Kristaps Porzingis',
  'Derrick White', 'Jrue Holiday', 'Mikal Bridges', 'OG Anunoby', 'Julius Randle',
  'Cade Cunningham', 'Paolo Banchero', 'Franz Wagner', 'Scottie Barnes',
  'Victor Wembanyama', 'Chet Holmgren', 'Jalen Williams', 'Alperen Sengun',
  'Jalen Green', 'Fred VanVleet', 'Lauri Markkanen', 'Zach LaVine',
  'Nikola Vucevic', 'DeMar DeRozan', 'Dejounte Murray', 'LaMelo Ball',
  'Brandon Miller', 'Jakob Poeltl', 'RJ Barrett', 'Immanuel Quickley',
  'Kyle Kuzma', 'Jordan Poole', 'Coby White', 'Josh Giddey', 'Evan Mobley',
  'Darius Garland', 'Tyrese Maxey', 'CJ McCollum', 'Brandon Ingram',
  'Desmond Bane', 'Jakob Poeltl', 'Myles Turner', 'Bennedict Mathurin',
  'Austin Reaves', 'Deandre Ayton', 'Norman Powell', 'Ivica Zubac',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch JSON, retrying patiently with long backoff to ride out the free-tier
// rate limit (HTTP 429). Worst case it waits several minutes on a single call.
async function getJSON(path, label) {
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === 8) throw new Error(`Failed ${label}: ${err.message}`);
      const wait = Math.min(attempt * 12000, 70000); // 12s,24s,36s,48s,60s,70s,70s
      console.log(`   …${label} ${err.message}, waiting ${wait / 1000}s (try ${attempt})`);
      await sleep(wait);
    }
  }
}

function trim(s, n = 800) {
  if (!s) return '';
  return s.length > n ? s.slice(0, n).trimEnd() + '…' : s;
}

const teamFields = (t) => ({
  idTeam: t.idTeam,
  strTeam: t.strTeam,
  strBadge: t.strBadge,
  strStadium: t.strStadium,
  intFormedYear: t.intFormedYear,
  strLocation: t.strLocation,
  intStadiumCapacity: t.intStadiumCapacity,
  strDescriptionEN: trim(t.strDescriptionEN, 1200),
});

const playerFields = (p, badge) => ({
  idPlayer: p.idPlayer,
  strPlayer: p.strPlayer,
  strTeam: p.strTeam,
  idTeam: p.idTeam,
  teamBadge: badge,
  strPosition: p.strPosition,
  strNumber: p.strNumber,
  dateBorn: p.dateBorn,
  strNationality: p.strNationality,
  strHeight: p.strHeight,
  strWeight: p.strWeight,
  strThumb: p.strThumb,
  strCutout: p.strCutout,
  strStatus: p.strStatus,
  strTwitter: p.strTwitter,
  strInstagram: p.strInstagram,
  strDescriptionEN: trim(p.strDescriptionEN, 800),
});

async function main() {
  const teams = [];
  const players = [];
  const seen = new Set();

  for (const name of TEAMS) {
   try {
    // 1) team metadata (badge, arena, etc.)
    const td = await getJSON(`/searchteams.php?t=${encodeURIComponent(name)}`, `team ${name}`);
    const team = (td.teams || []).find((t) => t.strLeague === 'NBA') || (td.teams || [])[0];
    if (!team) {
      console.warn(`!! no team data for ${name}`);
      continue;
    }
    teams.push(teamFields(team));
    await sleep(2600);

    // 2) roster (full player records — height, weight, bio, photo, socials)
    const rd = await getJSON(`/lookup_all_players.php?id=${team.idTeam}`, `roster ${name}`);
    const roster = (rd.player || []).filter((p) => p.strSport === 'Basketball');
    for (const p of roster) {
      if (p.idPlayer && !seen.has(p.idPlayer)) {
        seen.add(p.idPlayer);
        players.push(playerFields(p, team.strBadge));
      }
    }
    console.log(`✓ ${name}: ${roster.length} players`);
    await sleep(2600);
   } catch (err) {
     console.warn(`!! skipping ${name}: ${err.message}`);
   }
  }

  // 3) curated stars — one lookup each by name, mapped to their current NBA
  // team. Lighter detail than roster players, but guarantees the household
  // names are searchable with a photo.
  const teamByName = new Map(teams.map((t) => [t.strTeam, t]));
  console.log(`\nFetching ${STARS.length} star players…`);
  for (const starName of STARS) {
    try {
      const sd = await getJSON(
        `/searchplayers.php?p=${encodeURIComponent(starName)}`,
        `star ${starName}`
      );
      // pick the basketball result that plays for one of our NBA teams
      const hit = (sd.player || []).find(
        (p) => p.strSport === 'Basketball' && teamByName.has(p.strTeam)
      );
      await sleep(2600);
      if (!hit) {
        console.warn(`!! ${starName}: no current NBA match`);
        continue;
      }
      if (seen.has(hit.idPlayer)) {
        console.log(`· ${starName}: already in a roster`);
        continue;
      }
      const team = teamByName.get(hit.strTeam);
      seen.add(hit.idPlayer);
      players.push(playerFields(hit, team?.strBadge));
      console.log(`★ ${starName} → ${hit.strTeam}`);
    } catch (err) {
      console.warn(`!! ${starName}: ${err.message}`);
    }
  }

  teams.sort((a, b) => a.strTeam.localeCompare(b.strTeam));
  players.sort((a, b) => a.strPlayer.localeCompare(b.strPlayer));

  if (teams.length < 25 || players.length < 100) {
    throw new Error(`Data looks incomplete: ${teams.length} teams, ${players.length} players`);
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(
    OUT,
    JSON.stringify({ generatedAt: new Date().toISOString(), teams, players }, null, 0)
  );
  console.log(`\n✅ Wrote ${teams.length} teams and ${players.length} players to ${OUT}`);
}

main().catch((err) => {
  console.error('\n❌ ' + err.message);
  process.exit(1);
});
