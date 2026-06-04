// LIVE data — fetched in the browser at runtime (not baked at build time),
// because news, standings, and playoff results change constantly. ESPN's
// public site API allows browser (CORS) requests for these endpoints.

const SITE = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';
const SITE2 = 'https://site.api.espn.com/apis/v2/sports/basketball/nba';

export async function fetchNews() {
  const r = await fetch(`${SITE}/news?limit=30`);
  if (!r.ok) throw new Error(`news ${r.status}`);
  const d = await r.json();
  return (d.articles || []).map((a) => ({
    id: a.id,
    headline: a.headline,
    description: a.description,
    published: a.published,
    image: (a.images || []).find((i) => i.url)?.url || null,
    link: a.links?.web?.href || null,
  }));
}

function mapStandingsNode(node) {
  return (node.standings?.entries || [])
    .map((e) => {
      const stat = (n) => (e.stats.find((s) => s.name === n) || {}).displayValue;
      return {
        id: e.team.id,
        name: e.team.displayName,
        logo: (e.team.logos || [])[0]?.href || null,
        seed: parseInt(stat('playoffSeed'), 10) || 99,
        wins: stat('wins'),
        losses: stat('losses'),
        pct: stat('winPercent'),
        streak: stat('streak'),
      };
    })
    .sort((a, b) => a.seed - b.seed);
}

export async function fetchStandings() {
  const r = await fetch(`${SITE2}/standings`);
  if (!r.ok) throw new Error(`standings ${r.status}`);
  const d = await r.json();
  const children = d.children || [];
  const east = children.find((c) => /east/i.test(c.name)) || children[0];
  const west = children.find((c) => /west/i.test(c.name)) || children[1];
  return { east: mapStandingsNode(east), west: mapStandingsNode(west) };
}

export async function fetchGames() {
  const r = await fetch(`${SITE}/scoreboard`);
  if (!r.ok) throw new Error(`scoreboard ${r.status}`);
  const d = await r.json();
  const seasonType = d.season?.type; // 3 = postseason
  const events = (d.events || []).map((ev) => {
    const c = ev.competitions?.[0] || {};
    const competitors = (c.competitors || []).map((cp) => ({
      name: cp.team?.displayName,
      abbr: cp.team?.abbreviation,
      logo: cp.team?.logo || (cp.team?.logos || [])[0]?.href || null,
      score: cp.score,
      winner: cp.winner,
      home: cp.homeAway === 'home',
    }));
    return {
      id: ev.id,
      name: ev.name,
      shortName: ev.shortName,
      date: ev.date,
      status: c.status?.type?.description || ev.status?.type?.description,
      state: c.status?.type?.state, // pre / in / post
      series: c.series?.summary || null,
      seriesTitle: c.series?.title || null,
      competitors,
    };
  });
  return { seasonType, events };
}
