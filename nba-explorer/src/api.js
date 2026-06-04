// TheSportsDB free API (test key "3"). No signup, no key management needed.
const BASE = 'https://www.thesportsdb.com/api/v1/json/3';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

// Search players by name, keep only basketball players.
export async function searchPlayers(name) {
  const data = await get(`/searchplayers.php?p=${encodeURIComponent(name)}`);
  const players = data.player || [];
  return players.filter((p) => p.strSport === 'Basketball');
}

// The free API caps list endpoints at 10 results, so we fetch each team by
// name in parallel to get the full 30-team league. Each result includes the
// badge, arena, founding year, and description we need.
const NBA_TEAMS = [
  'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets',
  'Chicago Bulls', 'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets',
  'Detroit Pistons', 'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers',
  'Los Angeles Clippers', 'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat',
  'Milwaukee Bucks', 'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks',
  'Oklahoma City Thunder', 'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns',
  'Portland Trail Blazers', 'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors',
  'Utah Jazz', 'Washington Wizards',
];

const CACHE_KEY = 'nba_teams_v1';
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, teams } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    if (Array.isArray(teams) && teams.length >= 25) return teams;
    return null;
  } catch {
    return null;
  }
}

function writeCache(teams) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), teams }));
  } catch {
    /* storage full / disabled — fine, we just won't cache */
  }
}

// Fetch one team by name, retrying once on failure to ride out brief blips.
async function fetchTeam(name) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const d = await get(`/searchteams.php?t=${encodeURIComponent(name)}`);
      const teams = d.teams || [];
      return teams.find((t) => t.strLeague === 'NBA') || teams[0] || null;
    } catch {
      if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
    }
  }
  return null;
}

export async function getNbaTeams() {
  const cached = readCache();
  if (cached) return cached;

  const results = await Promise.all(NBA_TEAMS.map(fetchTeam));
  const teams = results.filter(Boolean).sort((a, b) => a.strTeam.localeCompare(b.strTeam));

  // Only treat as success (and cache) if we got nearly the whole league.
  if (teams.length < 25) {
    throw new Error('Could not load the full team list. Please retry in a moment.');
  }
  writeCache(teams);
  return teams;
}
