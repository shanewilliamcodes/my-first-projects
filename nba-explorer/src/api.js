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

// One team's roster, sorted by name.
export function getTeamRoster(teamId) {
  return PLAYERS.filter((p) => p.teamId === teamId).sort((a, b) => a.name.localeCompare(b.name));
}

// Lowercase + strip accents so "jokic" matches "Jokić", "doncic" -> "Dončić".
function fold(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

const FOLDED = PLAYERS.map((p) => fold(p.name));

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
      return a.name.localeCompare(b.name);
    })
    .map((m) => m.p);
}
