// All NBA data is fetched ONCE at build time (see scripts/build-data.mjs, ESPN
// public API) and baked into data/nba.json. The app reads it directly — no
// runtime API calls, so it can never be rate-limited, CORS-blocked, or slow.
import data from './data/nba.json';

export const TEAMS = data.teams;
export const PLAYERS = data.players;
export const PLAYER_COUNT = PLAYERS.length;
export const GENERATED_AT = data.generatedAt;

// All 30 teams (already sorted by name in the data file).
export function getNbaTeams() {
  return TEAMS;
}

// Numeric value of a stat (they're stored as strings like "33.5"); -1 if none.
function statNum(p, key) {
  const n = parseFloat(p.stats?.[key]);
  return isNaN(n) ? -1 : n;
}

// One team's roster, best players first (by points per game).
export function getTeamRoster(teamId) {
  return PLAYERS.filter((p) => p.teamId === teamId).sort((a, b) => statNum(b, 'pts') - statNum(a, 'pts'));
}

// League leaders for a given stat — the default "stars first" view.
export function getLeaders(key = 'pts', n = 30) {
  return PLAYERS.filter((p) => p.stats && p.stats[key] != null)
    .slice()
    .sort((a, b) => statNum(b, key) - statNum(a, key))
    .slice(0, n);
}

// Lowercase + strip accents so "jokic" matches "Jokić", "doncic" -> "Dončić".
function fold(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

const FOLDED = PLAYERS.map((p) => fold(p.name));

const BY_ID = new Map(PLAYERS.map((p) => [String(p.id), p]));
export function getPlayerById(id) {
  return BY_ID.get(String(id)) || null;
}

// Instant client-side substring search. Prefix matches rank first.
export function searchPlayers(query) {
  const q = fold(query.trim());
  if (!q) return [];
  const matches = [];
  for (let i = 0; i < PLAYERS.length; i++) {
    if (FOLDED[i].includes(q)) matches.push({ p: PLAYERS[i], name: FOLDED[i] });
  }
  return matches
    .sort((a, b) => {
      const ap = a.name.startsWith(q) ? 0 : 1;
      const bp = b.name.startsWith(q) ? 0 : 1;
      if (ap !== bp) return ap - bp;
      // within the same relevance tier, bigger stars (higher PPG) first
      return statNum(b.p, 'pts') - statNum(a.p, 'pts');
    })
    .map((m) => m.p);
}
