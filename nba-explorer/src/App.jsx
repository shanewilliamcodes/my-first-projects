import { useMemo, useState } from 'react';
import { getNbaTeams, getTeamRoster, searchPlayers, PLAYER_COUNT } from './api';

/* ---------------- helpers ---------------- */

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

function PlayerCard({ p, onClick }) {
  const hurt = isHurt(p);
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/80 text-left shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:shadow-orange-500/10"
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
          {p.stats?.pts != null && (
            <span className="font-semibold text-white">{p.stats.pts} PPG</span>
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

function PlayerDetailModal({ player: p, onClose }) {
  const s = p.stats;
  const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(p.name + ' highlights')}`;

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

        {/* actions */}
        <div className="px-6 pb-8">
          <a
            href={yt}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            ▶ Watch Highlights
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---------------- main app ---------------- */

export default function App() {
  const [tab, setTab] = useState('players');
  const [query, setQuery] = useState('');
  const [viewTeam, setViewTeam] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const teams = getNbaTeams();
  const results = useMemo(() => searchPlayers(query).slice(0, 60), [query]);

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
          <div className="flex gap-1 rounded-full border border-white/10 bg-slate-800/60 p-1">
            {[
              ['players', 'Players'],
              ['teams', 'Teams'],
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
              <div className="mx-auto mb-10 max-w-xl">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type any name — “luka”, “jokic”, “steph”, or just “ja”…"
                  className="w-full rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-orange-400/60"
                />
              </div>

              {!query.trim() && (
                <p className="py-16 text-center text-slate-500">
                  Start typing to search {PLAYER_COUNT} NBA players.
                </p>
              )}
              {query.trim() && results.length === 0 && (
                <p className="py-16 text-center text-slate-400">No players match “{query}”.</p>
              )}
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {results.map((p) => (
                  <PlayerCard key={p.id} p={p} onClick={() => setSelectedPlayer(p)} />
                ))}
              </div>
            </>
          )}

          {tab === 'teams' && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {teams.map((t) => (
                <TeamCard key={t.id} t={t} onClick={() => setViewTeam(t)} />
              ))}
            </div>
          )}
        </>
      )}

      {selectedPlayer && <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />}

      <footer className="mt-16 text-center text-xs text-slate-600">Data from ESPN · Built by Shane</footer>
    </div>
  );
}
