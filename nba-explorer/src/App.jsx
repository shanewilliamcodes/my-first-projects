import { useEffect, useMemo, useState } from 'react';
import { getNbaTeams, getTeamRoster, searchPlayers, getLeaders, getPlayerById, PLAYER_COUNT } from './api';
import { fetchNews, fetchStandings, fetchGames, fetchTeamStats } from './live';
import awardsData from './data/awards.json';

/* ---------------- helpers ---------------- */

const enc = encodeURIComponent;

// Small hook for live ESPN fetches with loading/error states.
function useLive(fn, run) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  useEffect(() => {
    if (!run) return;
    let alive = true;
    setState({ loading: true, error: null, data: null });
    fn()
      .then((d) => alive && setState({ loading: false, error: null, data: d }))
      .catch((e) => alive && setState({ loading: false, error: e.message, data: null }));
    return () => {
      alive = false;
    };
  }, [run]);
  return state;
}

function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-orange-400" />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
const ytUrl = (name) => `https://www.youtube.com/results?search_query=${enc(name + ' highlights')}`;
const wikiUrl = (name) => `https://en.wikipedia.org/wiki/Special:Search?search=${enc(name)}&go=Go`;
const espnUrl = (id) => `https://www.espn.com/nba/player/_/id/${id}`;
const xUrl = (name) => `https://x.com/search?q=${enc(name + ' NBA')}`;

function Pill({ children }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
      {children}
    </span>
  );
}

function isHurt(p) {
  return !!p.injury || (p.status && p.status.toLowerCase() !== 'active');
}

/* ---------------- player card ---------------- */

const STAT_LABEL = { pts: 'PPG', reb: 'RPG', ast: 'APG', stl: 'SPG', blk: 'BPG', min: 'MPG' };

function PlayerCard({ p, onClick, statKey = 'pts' }) {
  const hurt = isHurt(p);
  return (
    <button
      onClick={onClick}
      className="group relative w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/80 text-left shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:shadow-orange-500/10"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-b from-orange-500/20 to-transparent">
        {p.headshot ? (
          <img
            src={p.headshot}
            alt={p.name}
            loading="lazy"
            className="absolute bottom-0 left-1/2 h-full -translate-x-1/2 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-30">🏀</div>
        )}
        {p.jersey && (
          <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 text-xs font-bold text-white">
            #{p.jersey}
          </span>
        )}
        {hurt && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-semibold text-white">
            {p.injury || 'Out'}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-base font-bold text-white">{p.name}</h3>
        <p className="truncate text-sm text-orange-300/90">{p.team}</p>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">{p.position || '—'}</span>
          {p.stats?.[statKey] != null && (
            <span className="font-semibold text-white">
              {p.stats[statKey]} {STAT_LABEL[statKey]}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ---------------- team card ---------------- */

function TeamCard({ t, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-800/50 p-5 text-center shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-slate-800/80"
    >
      <div className="flex h-20 w-20 items-center justify-center">
        {t.logo ? (
          <img
            src={t.logo}
            alt={t.name}
            loading="lazy"
            className="max-h-20 max-w-20 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span className="text-3xl">🏀</span>
        )}
      </div>
      <div>
        <div className="text-sm font-bold text-white">{t.name}</div>
        <div className="text-xs text-slate-400">{t.venue || t.location}</div>
      </div>
    </button>
  );
}

/* ---------------- team roster view ---------------- */

function TeamRosterView({ team, onBack, onSelectPlayer }) {
  const roster = useMemo(() => getTeamRoster(team.id), [team.id]);

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
      >
        ← All teams
      </button>

      <div className="mb-8 flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-gradient-to-b from-orange-500/15 to-transparent p-8 text-center">
        {team.logo && <img src={team.logo} alt={team.name} className="h-24 w-24 object-contain drop-shadow-2xl" />}
        <h2 className="text-2xl font-extrabold text-white">{team.name}</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {(team.venue || team.location) && <Pill>📍 {team.venue || team.location}</Pill>}
          <Pill>{roster.length} players</Pill>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
        {roster.map((p) => (
          <PlayerCard key={p.id} p={p} onClick={() => onSelectPlayer(p)} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- stat box ---------------- */

function StatBox({ label, value, big }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white/5 px-2 py-3">
      <span className={`font-extrabold tabular-nums text-white ${big ? 'text-2xl' : 'text-lg'}`}>
        {value ?? '—'}
      </span>
      <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
    </div>
  );
}

/* ---------------- player detail modal ---------------- */

function LinkBtn({ href, color, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${color}`}
    >
      {children}
    </a>
  );
}

function PlayerDetailModal({ player: p, onClose }) {
  const s = p.stats;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          ✕
        </button>

        {/* hero */}
        <div className="flex flex-col items-center gap-2 bg-gradient-to-b from-orange-500/20 to-transparent px-6 pt-8 pb-4 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative h-40 w-40 shrink-0">
            {p.headshot ? (
              <img src={p.headshot} alt={p.name} className="absolute bottom-0 h-full w-full object-contain drop-shadow-2xl" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl opacity-30">🏀</div>
            )}
          </div>
          <div className="text-center sm:pb-3 sm:text-left">
            {p.jersey && <div className="text-sm font-bold text-orange-300">#{p.jersey} · {p.position}</div>}
            <h2 className="text-2xl font-extrabold text-white">{p.name}</h2>
            <p className="text-orange-300/90">{p.team}</p>
            {isHurt(p) && <p className="mt-1 text-sm font-semibold text-red-400">{p.injury || p.status}</p>}
          </div>
        </div>

        {/* season stat line */}
        {s && s.pts != null ? (
          <div className="px-6 pb-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {s.season || 'Season'} averages
            </div>
            <div className="grid grid-cols-3 gap-2">
              <StatBox label="PTS" value={s.pts} big />
              <StatBox label="REB" value={s.reb} big />
              <StatBox label="AST" value={s.ast} big />
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
              <StatBox label="MIN" value={s.min} />
              <StatBox label="STL" value={s.stl} />
              <StatBox label="BLK" value={s.blk} />
              <StatBox label="FG%" value={s.fgPct} />
              <StatBox label="3P%" value={s.tpPct} />
              <StatBox label="FT%" value={s.ftPct} />
            </div>
            {s.gp != null && (
              <p className="mt-2 text-center text-xs text-slate-500">Based on {s.gp} games played</p>
            )}
          </div>
        ) : (
          <p className="px-6 pb-4 text-center text-sm text-slate-500">No stats available yet this season.</p>
        )}

        {/* bio pills */}
        <div className="flex flex-wrap justify-center gap-2 px-6 pb-4 sm:justify-start">
          {p.height && <Pill>📏 {p.height}</Pill>}
          {p.weight && <Pill>⚖️ {p.weight}</Pill>}
          {p.age && <Pill>🎂 {p.age} yrs</Pill>}
          {p.college && <Pill>🎓 {p.college}</Pill>}
          {p.birthPlace && <Pill>📍 {p.birthPlace}</Pill>}
        </div>

        {/* embedded highlight video (top scorers) */}
        {p.highlightVideo && (
          <div className="px-6 pb-4">
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${p.highlightVideo}`}
                title={`${p.name} highlights`}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* actions */}
        <div className="flex flex-wrap gap-2 px-6 pb-8">
          {!p.highlightVideo && (
            <LinkBtn href={ytUrl(p.name)} color="bg-red-600 hover:bg-red-500">▶ Highlights</LinkBtn>
          )}
          <LinkBtn href={espnUrl(p.id)} color="bg-white/10 hover:bg-white/20">ESPN Profile</LinkBtn>
          <LinkBtn href={wikiUrl(p.name)} color="bg-white/10 hover:bg-white/20">Wikipedia</LinkBtn>
          <LinkBtn href={xUrl(p.name)} color="bg-white/10 hover:bg-white/20">𝕏 Search</LinkBtn>
        </div>
      </div>
    </div>
  );
}

/* ---------------- compare ---------------- */

function PlayerPicker({ picked, onPick, onClear }) {
  const [q, setQ] = useState('');
  const matches = useMemo(() => (q.trim() ? searchPlayers(q).slice(0, 6) : []), [q]);

  if (picked) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-800/60 p-3">
        {picked.headshot && <img src={picked.headshot} alt="" className="h-12 w-12 shrink-0 object-contain" />}
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold text-white">{picked.name}</div>
          <div className="truncate text-xs text-orange-300">{picked.team}</div>
        </div>
        <button onClick={onClear} className="shrink-0 text-slate-400 transition hover:text-white">✕</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a player…"
        className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-orange-400/60"
      />
      {matches.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-slate-800 shadow-2xl">
          {matches.map((p) => (
            <button
              key={p.id}
              onClick={() => { onPick(p); setQ(''); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-white/10"
            >
              {p.headshot && <img src={p.headshot} alt="" className="h-8 w-8 shrink-0 object-contain" />}
              <span className="truncate text-sm text-white">{p.name}</span>
              <span className="ml-auto shrink-0 text-xs text-slate-400">{p.stats?.pts} PPG</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TeamPicker({ picked, onPick, onClear }) {
  const [q, setQ] = useState('');
  const teams = getNbaTeams();
  const matches = q.trim()
    ? teams.filter((t) => t.name.toLowerCase().includes(q.toLowerCase())).slice(0, 8)
    : [];

  if (picked) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800/60 p-3">
        {picked.logo && <img src={picked.logo} alt="" className="h-10 w-10 shrink-0 object-contain" />}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold leading-tight text-white">{picked.name}</div>
        </div>
        <button onClick={onClear} className="shrink-0 text-slate-400 transition hover:text-white">✕</button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a team…"
        className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-orange-400/60"
      />
      {matches.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-white/10 bg-slate-800 shadow-2xl">
          {matches.map((t) => (
            <button
              key={t.id}
              onClick={() => { onPick(t); setQ(''); }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left transition hover:bg-white/10"
            >
              {t.logo && <img src={t.logo} alt="" className="h-8 w-8 shrink-0 object-contain" />}
              <span className="truncate text-sm text-white">{t.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// One comparison row. `better` = 'high' | 'low' | null (null = no winner).
function StatRow({ label, aVal, bVal, better }) {
  const an = parseFloat(aVal);
  const bn = parseFloat(bVal);
  const valid = better && !isNaN(an) && !isNaN(bn) && an !== bn;
  const aWin = valid && (better === 'high' ? an > bn : an < bn);
  const bWin = valid && (better === 'high' ? bn > an : bn < an);
  return (
    <div className="grid grid-cols-3 items-center border-b border-white/5 last:border-0">
      <div className={`px-3 py-3 text-right text-lg font-bold tabular-nums ${aWin ? 'text-emerald-400' : 'text-white'}`}>
        {aVal ?? '—'}
      </div>
      <div className="px-1 py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className={`px-3 py-3 text-left text-lg font-bold tabular-nums ${bWin ? 'text-emerald-400' : 'text-white'}`}>
        {bVal ?? '—'}
      </div>
    </div>
  );
}

const COMPARE_ROWS = [
  ['pts', 'Points'], ['reb', 'Rebounds'], ['ast', 'Assists'], ['stl', 'Steals'],
  ['blk', 'Blocks'], ['min', 'Minutes'], ['fgPct', 'FG%'], ['tpPct', '3P%'], ['ftPct', 'FT%'],
];

const TEAM_ROWS = [
  { key: 'record', label: 'Record', better: null },
  { key: 'winPercent', label: 'Win %', better: 'high' },
  { key: 'ppg', label: 'Points / G', better: 'high' },
  { key: 'oppPpg', label: 'Opp Pts / G', better: 'low' },
  { key: 'diff', label: 'Point Diff', better: 'high' },
  { key: 'seed', label: 'Conf. Seed', better: 'low' },
  { key: 'streak', label: 'Streak', better: null },
  { key: 'lastTen', label: 'Last 10', better: null },
];

function ComparePanel({ children }) {
  return <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-slate-800/40">{children}</div>;
}

function CompareView() {
  const [mode, setMode] = useState('players');
  const [pa, setPa] = useState(null);
  const [pb, setPb] = useState(null);
  const [ta, setTa] = useState(null);
  const [tb, setTb] = useState(null);
  const teamStats = useLive(fetchTeamStats, mode === 'teams');

  return (
    <div className="mx-auto max-w-2xl">
      {/* mode toggle */}
      <div className="mb-6 flex justify-center">
        <div className="flex gap-1 rounded-full border border-white/10 bg-slate-800/60 p-1">
          {[['players', 'Players'], ['teams', 'Teams']].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setMode(k)}
              className={`rounded-full px-5 py-1.5 text-sm font-semibold transition ${
                mode === k ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {mode === 'players' ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <PlayerPicker picked={pa} onPick={setPa} onClear={() => setPa(null)} />
            <PlayerPicker picked={pb} onPick={setPb} onClear={() => setPb(null)} />
          </div>
          {pa && pb ? (
            <ComparePanel>
              {COMPARE_ROWS.map(([k, label]) => (
                <StatRow key={k} label={label} aVal={pa.stats?.[k]} bVal={pb.stats?.[k]} better="high" />
              ))}
            </ComparePanel>
          ) : (
            <p className="mt-10 text-center text-slate-500">Pick two players to compare their season stats.</p>
          )}
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <TeamPicker picked={ta} onPick={setTa} onClear={() => setTa(null)} />
            <TeamPicker picked={tb} onPick={setTb} onClear={() => setTb(null)} />
          </div>
          {ta && tb ? (
            teamStats.loading ? (
              <Spinner label="Loading team stats…" />
            ) : teamStats.error ? (
              <p className="mt-10 text-center text-slate-400">Couldn’t load team stats right now.</p>
            ) : (() => {
              const sa = teamStats.data?.[ta.id];
              const sb = teamStats.data?.[tb.id];
              if (!sa || !sb) return <p className="mt-10 text-center text-slate-400">Stats unavailable for these teams.</p>;
              return (
                <ComparePanel>
                  {TEAM_ROWS.map((r) => (
                    <StatRow key={r.key} label={r.label} aVal={sa[r.key]} bVal={sb[r.key]} better={r.better} />
                  ))}
                </ComparePanel>
              );
            })()
          ) : (
            <p className="mt-10 text-center text-slate-500">Pick two teams to compare their season stats.</p>
          )}
        </>
      )}
    </div>
  );
}

/* ---------------- news ---------------- */

function NewsTab({ active }) {
  const { loading, error, data } = useLive(fetchNews, active);
  if (loading) return <Spinner label="Loading the latest NBA news…" />;
  if (error) return <p className="py-16 text-center text-slate-400">Couldn’t load news right now.</p>;

  return (
    <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
      {(data || []).map((a) => (
        <a
          key={a.id}
          href={a.link}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-800/50 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/40"
        >
          {a.image && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={a.image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className="flex flex-1 flex-col p-4">
            <h3 className="font-bold leading-snug text-white">{a.headline}</h3>
            {a.description && <p className="mt-2 line-clamp-3 text-sm text-slate-400">{a.description}</p>}
            <span className="mt-3 text-xs text-orange-300/80">{timeAgo(a.published)}</span>
          </div>
        </a>
      ))}
    </div>
  );
}

/* ---------------- playoffs / standings ---------------- */

function SeriesCard({ ev }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-orange-500/15 to-transparent p-5">
      <div className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-orange-300">
        {ev.seriesTitle || 'NBA Playoffs'}
      </div>
      <div className="flex items-center justify-center gap-4">
        {ev.competitors.map((c, i) => (
          <div key={i} className="flex items-center gap-3">
            {i === 1 && <span className="text-sm text-slate-500">vs</span>}
            <div className="flex flex-col items-center gap-1">
              {c.logo && <img src={c.logo} alt="" className="h-12 w-12 object-contain" />}
              <span className="text-sm font-bold text-white">{c.abbr}</span>
              {ev.state !== 'pre' && c.score != null && c.score !== '' && (
                <span className={`text-lg font-extrabold ${c.winner ? 'text-emerald-400' : 'text-white'}`}>{c.score}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-center text-sm text-slate-300">
        {ev.series || ev.status}
      </div>
    </div>
  );
}

function StandingsTable({ title, rows }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-800/40">
      <div className="border-b border-white/10 px-4 py-3 text-sm font-bold text-white">{title}</div>
      {rows.map((t, i) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-2 text-sm ${i < 8 ? '' : 'opacity-60'} ${
            i === 7 ? 'border-b-2 border-orange-500/40' : 'border-b border-white/5'
          }`}
        >
          <span className="w-5 text-right text-xs font-bold text-slate-400">{t.seed === 99 ? i + 1 : t.seed}</span>
          {t.logo && <img src={t.logo} alt="" className="h-6 w-6 object-contain" />}
          <span className="flex-1 truncate font-medium text-white">{t.name}</span>
          <span className="tabular-nums text-slate-300">{t.wins}-{t.losses}</span>
          <span className="w-10 text-right text-xs text-slate-500">{t.streak}</span>
        </div>
      ))}
    </div>
  );
}

function PlayoffsTab({ active }) {
  const games = useLive(fetchGames, active);
  const standings = useLive(fetchStandings, active);

  return (
    <div className="mx-auto max-w-4xl">
      {/* live games / series */}
      {games.loading ? (
        <Spinner label="Loading playoff games…" />
      ) : games.error ? null : (
        <div className="mb-10">
          <h2 className="mb-4 text-center text-lg font-bold text-white">
            {games.data?.seasonType === 3 ? 'Playoffs — Live' : "Today's Games"}
          </h2>
          {games.data?.events?.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {games.data.events.map((ev) => (
                <SeriesCard key={ev.id} ev={ev} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500">No games scheduled right now — check the standings below.</p>
          )}
        </div>
      )}

      {/* standings */}
      <h2 className="mb-4 text-center text-lg font-bold text-white">Standings</h2>
      {standings.loading ? (
        <Spinner />
      ) : standings.error ? (
        <p className="py-8 text-center text-slate-400">Couldn’t load standings.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <StandingsTable title="Eastern Conference" rows={standings.data.east} />
          <StandingsTable title="Western Conference" rows={standings.data.west} />
        </div>
      )}
      <p className="mt-4 text-center text-xs text-slate-600">Top 8 seeds shown bold · live from ESPN</p>
    </div>
  );
}

/* ---------------- awards ---------------- */

const AWARD_ORDER = [
  'MVP', 'Defensive Player of the Year', 'Rookie of the Year', 'Most Improved Player',
  'Sixth Man of the Year', 'Clutch Player of the Year', 'Twyman-Stokes Teammate of the Year Award',
  'All-NBA 1st Team', 'All-NBA 2nd Team', 'All-NBA 3rd Team',
  'All-Defensive 1st Team', 'All-Defensive 2nd Team',
  'All-Rookie 1st Team', 'All-Rookie 2nd Team',
  'NBA Cup MVP', 'NBA Cup All-Tournament Team',
  'NBA Eastern Conference Finals MVP', 'NBA Western Conference Finals MVP', 'All-Star MVP',
];

function WinnerChip({ w, onSelect, big }) {
  const player = getPlayerById(w.id);
  const headshot = player?.headshot || w.headshot;
  const team = player?.team;
  const inner = (
    <>
      <div className={`relative ${big ? 'h-28 w-28' : 'h-16 w-16'} overflow-hidden rounded-full bg-gradient-to-b from-orange-500/20 to-slate-800`}>
        {headshot ? (
          <img src={headshot} alt="" loading="lazy" className="absolute bottom-0 left-1/2 h-[130%] -translate-x-1/2 object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-2xl opacity-40">🏀</div>
        )}
      </div>
      <div className={`mt-2 font-bold text-white ${big ? 'text-lg' : 'text-xs'} leading-tight`}>{w.name}</div>
      {team && <div className="text-[11px] text-orange-300/80">{team}</div>}
    </>
  );
  const cls = `flex flex-col items-center text-center ${player ? 'transition hover:-translate-y-0.5' : ''}`;
  return player ? (
    <button onClick={() => onSelect(player)} className={cls}>{inner}</button>
  ) : (
    <div className={cls}>{inner}</div>
  );
}

function AwardsTab({ onSelectPlayer }) {
  const awards = useMemo(
    () =>
      [...awardsData.awards].sort((a, b) => {
        const ai = AWARD_ORDER.indexOf(a.name);
        const bi = AWARD_ORDER.indexOf(b.name);
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      }),
    []
  );
  const singles = awards.filter((a) => a.winners.length === 1);
  const teams = awards.filter((a) => a.winners.length > 1);

  return (
    <div className="mx-auto max-w-5xl">
      <p className="mb-8 text-center text-sm text-slate-400">{awardsData.season - 1}-{String(awardsData.season).slice(2)} season awards & honors</p>

      {/* individual awards */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {singles.map((a) => (
          <div key={a.name} className="flex flex-col items-center rounded-2xl border border-white/10 bg-gradient-to-b from-orange-500/10 to-slate-900/60 p-5 shadow-lg">
            <div className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-orange-300">🏆 {a.name}</div>
            <WinnerChip w={a.winners[0]} onSelect={onSelectPlayer} big />
          </div>
        ))}
      </div>

      {/* team honors */}
      <div className="space-y-6">
        {teams.map((a) => (
          <div key={a.name} className="rounded-2xl border border-white/10 bg-slate-800/40 p-5">
            <div className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-orange-300">{a.name}</div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {a.winners.map((w) => (
                <WinnerChip key={w.id} w={w} onSelect={onSelectPlayer} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- main app ---------------- */

export default function App() {
  const [tab, setTab] = useState('players');
  const [query, setQuery] = useState('');
  const [leaderStat, setLeaderStat] = useState('pts');
  const [viewTeam, setViewTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const teams = getNbaTeams();
  const results = useMemo(() => searchPlayers(query).slice(0, 60), [query]);
  const leaders = useMemo(() => getLeaders(leaderStat, 30), [leaderStat]);
  const searching = query.trim().length > 0;

  const LEADER_TABS = [
    ['pts', 'Points'],
    ['reb', 'Rebounds'],
    ['ast', 'Assists'],
    ['stl', 'Steals'],
    ['blk', 'Blocks'],
    ['min', 'Minutes'],
  ];

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20">
      {/* header */}
      <header className="flex flex-col items-center gap-5 py-10 text-center">
        <button onClick={() => setViewTeam(null)} className="text-4xl font-black tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">NBA</span>{' '}
          Explorer
        </button>
        <p className="max-w-md text-sm text-slate-400">
          Search any player for real season stats, or browse all 30 teams and their full rosters.
        </p>

        {!viewTeam && (
          <div className="flex flex-wrap justify-center gap-1 rounded-3xl border border-white/10 bg-slate-800/60 p-1">
            {[
              ['players', 'Players'],
              ['teams', 'Teams'],
              ['compare', 'Compare'],
              ['playoffs', 'Playoffs'],
              ['awards', 'Awards'],
              ['news', 'News'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  tab === key ? 'bg-orange-500 text-white shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </header>

      {viewTeam ? (
        <TeamRosterView team={viewTeam} onBack={() => setViewTeam(null)} onSelectPlayer={setSelectedPlayer} />
      ) : (
        <>
          {tab === 'players' && (
            <>
              <div className="mx-auto mb-8 max-w-xl">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${PLAYER_COUNT} players — “luka”, “jokic”, or just “ja”…`}
                  className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-orange-400/60"
                />
              </div>

              {searching ? (
                <>
                  {results.length === 0 && (
                    <p className="py-16 text-center text-slate-400">No players match “{query}”.</p>
                  )}
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                    {results.map((p) => (
                      <PlayerCard key={p.id} p={p} onClick={() => setSelectedPlayer(p)} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* league leaders (default view — stars first) */}
                  <div className="mb-6 flex flex-col items-center gap-3">
                    <h2 className="text-lg font-bold text-white">League Leaders</h2>
                    <div className="flex flex-wrap justify-center gap-1 rounded-3xl border border-white/10 bg-slate-800/60 p-1">
                      {LEADER_TABS.map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => setLeaderStat(key)}
                          className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                            leaderStat === key ? 'bg-orange-500 text-white' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                    {leaders.map((p, i) => (
                      <div key={p.id} className="relative min-w-0">
                        <span className="absolute -left-1 -top-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white shadow">
                          {i + 1}
                        </span>
                        <PlayerCard p={p} statKey={leaderStat} onClick={() => setSelectedPlayer(p)} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'teams' && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {teams.map((t) => (
                <TeamCard key={t.id} t={t} onClick={() => setViewTeam(t)} />
              ))}
            </div>
          )}

          {tab === 'compare' && <CompareView />}

          {tab === 'playoffs' && <PlayoffsTab active={tab === 'playoffs'} />}

          {tab === 'awards' && <AwardsTab onSelectPlayer={setSelectedPlayer} />}

          {tab === 'news' && <NewsTab active={tab === 'news'} />}
        </>
      )}

      {selectedPlayer && <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}

      <footer className="mt-16 text-center text-xs text-slate-600">Data from ESPN · Built by Shane</footer>
    </div>
  );
}
