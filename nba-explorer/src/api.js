// All NBA data is fetched ONCE at build time (see scripts/build-data.mjs) and
// baked into data/nba.json. The app reads it directly — no runtime API calls,
// so it can never be rate-limited, CORS-blocked, or slow to load.
import data from './data/nba.json';

export const TEAMS = data.teams;

// The free roster feed mixes in coaches, owners, and execs. Real players always
// have a playing position (Guard / Forward / Center), so we filter on that to
// drop the non-players cleanly.
export const PLAYERS = data.players.filter((p) => /guard|forward|center/i.test(p.strPosition || ''));
export const PLAYER_COUNT = PLAYERS.length;
export const GENERATED_AT = data.generatedAt;

// All 30 teams (already sorted alphabetically in the data file).
export function getNbaTeams() {
  return TEAMS;
}

// One team's roster, sorted by name.
export function getTeamRoster(teamId) {
  return PLAYERS.filter((p) => p.idTeam === teamId).sort((a, b) =>
    a.strPlayer.localeCompare(b.strPlayer)
  );
}

// Lowercase + strip accents so "jokic" matches "Jokić", "doncic" -> "Dončić".
function fold(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

// Pre-fold every name once so search stays instant.
const FOLDED = PLAYERS.map((p) => fold(p.strPlayer));

// Instant client-side substring search. Prefix matches rank first, so "ste"
// surfaces "Stephen Curry" before "Kelly Oubre". Empty query returns nothing.
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
