import { useMemo, useState } from 'react';
import { getNbaTeams, getTeamRoster, searchPlayers, PLAYER_COUNT } from './api';

/* ---------------- helpers ---------------- */

function ageFrom(dateStr) {
  if (!dateStr) return null;
  const b = new Date(dateStr);
  if (isNaN(b)) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}

function normUrl(u) {
  if (!u) return null;
  return u.startsWith('http') ? u : `https://${u}`;
}

function Pill({ children }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
      {children}
    </span>
  );
}

/* ---------------- player card ---------------- */

function PlayerCard({ p, onClick }) {
  const img = p.strCutout || p.strThumb;
  const injured = p.strStatus && p.strStatus.toLowerCase() !== 'active';

  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/80 text-left shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:shadow-orange-500/10"
    >
      <div className="relative h-48 overflow-hidden bg-gradient-to-b from-orange-500/20 to-transparent">
        {img ? (
          <img
            src={img}
            alt={p.strPlayer}
            loading="lazy"
            className="absolute bottom-0 left-1/2 h-full -translate-x-1/2 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-30">🏀</div>
        )}
        {p.strNumber && (
          <span className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 text-xs font-bold text-white">
            #{p.strNumber}
          </span>
        )}
        {p.strStatus && (
          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-semibold ${
              injured ? 'bg-red-500/90 text-white' : 'bg-emerald-500/90 text-white'
            }`}
          >
            {p.strStatus}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-base font-bold text-white">{p.strPlayer}</h3>
        <p className="truncate text-sm text-orange-300/90">{p.strTeam || 'Free Agent'}</p>
        {p.strPosition && <p className="mt-1 truncate text-xs text-slate-400">{p.strPosition}</p>}
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
        {t.strBadge ? (
          <img
            src={t.strBadge}
            alt={t.strTeam}
            loading="lazy"
            className="max-h-20 max-w-20 object-contain transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span className="text-3xl">🏀</span>
        )}
      </div>
      <div>
        <div className="text-sm font-bold text-white">{t.strTeam}</div>
        <div className="text-xs text-slate-400">{t.strStadium}</div>
      </div>
    </button>
  );
}

/* ---------------- team roster view ---------------- */

function TeamRosterView({ team, onBack, onSelectPlayer }) {
  const roster = useMemo(() => getTeamRoster(team.idTeam), [team.idTeam]);

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
      >
        ← All teams
      </button>

      <div className="mb-8 flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-gradient-to-b from-orange-500/15 to-transparent p-8 text-center">
        {team.strBadge && (
          <img src={team.strBadge} alt={team.strTeam} className="h-24 w-24 object-contain drop-shadow-2xl" />
        )}
        <h2 className="text-2xl font-extrabold text-white">{team.strTeam}</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {team.strStadium && <Pill>🏟️ {team.strStadium}</Pill>}
          {team.intFormedYear && <Pill>Est. {team.intFormedYear}</Pill>}
          {team.strLocation && <Pill>📍 {team.strLocation}</Pill>}
        </div>
      </div>

      <h3 className="mb-4 text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
        Roster ({roster.length})
      </h3>

      {roster.length === 0 ? (
        <p className="py-10 text-center text-slate-500">No roster data for this team.</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {roster.map((p) => (
            <PlayerCard key={p.idPlayer} p={p} onClick={() => onSelectPlayer(p)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- player detail modal ---------------- */

function PlayerDetailModal({ player: p, onClose }) {
  const img = p.strCutout || p.strThumb;
  const age = ageFrom(p.dateBorn);
  const yt = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    p.strPlayer + ' highlights'
  )}`;
  const twitter = normUrl(p.strTwitter);
  const insta = normUrl(p.strInstagram);

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
          <div className="relative h-44 w-36 shrink-0">
            {img ? (
              <img src={img} alt={p.strPlayer} className="absolute bottom-0 h-full w-full object-contain drop-shadow-2xl" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl opacity-30">🏀</div>
            )}
          </div>
          <div className="text-center sm:pb-3 sm:text-left">
            {p.strNumber && <div className="text-sm font-bold text-orange-300">#{p.strNumber}</div>}
            <h2 className="text-2xl font-extrabold text-white">{p.strPlayer}</h2>
            <p className="text-orange-300/90">{p.strTeam || 'Free Agent'}</p>
          </div>
        </div>

        {/* stat pills */}
        <div className="flex flex-wrap justify-center gap-2 px-6 pb-4 sm:justify-start">
          {p.strPosition && <Pill>{p.strPosition}</Pill>}
          {p.strHeight && <Pill>📏 {p.strHeight}</Pill>}
          {p.strWeight && <Pill>⚖️ {p.strWeight}</Pill>}
          {age && <Pill>🎂 {age} yrs</Pill>}
          {p.strNationality && <Pill>{p.strNationality}</Pill>}
          {p.strStatus && <Pill>{p.strStatus}</Pill>}
        </div>

        {/* action buttons */}
        <div className="flex flex-wrap gap-2 px-6 pb-4">
          <a
            href={yt}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500"
          >
            ▶ Watch Highlights
          </a>
          {twitter && (
            <a href={twitter} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              𝕏 / Twitter
            </a>
          )}
          {insta && (
            <a href={insta} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
              Instagram
            </a>
          )}
        </div>

        {/* bio */}
        <p className="px-6 pb-8 text-sm leading-relaxed text-slate-300">
          {p.strDescriptionEN
            ? p.strDescriptionEN
            : `${p.strPlayer} plays for the ${p.strTeam}. Tap “Watch Highlights” to see them in action.`}
        </p>
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
        <button
          onClick={() => setViewTeam(null)}
          className="text-4xl font-black tracking-tight sm:text-6xl"
        >
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            NBA
          </span>{' '}
          Explorer
        </button>
        <p className="max-w-md text-sm text-slate-400">
          Search any NBA player or browse all 30 teams and their rosters — real photos and logos.
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

      {/* TEAM ROSTER VIEW (overrides tabs) */}
      {viewTeam ? (
        <TeamRosterView
          team={viewTeam}
          onBack={() => setViewTeam(null)}
          onSelectPlayer={setSelectedPlayer}
        />
      ) : (
        <>
          {/* PLAYERS TAB */}
          {tab === 'players' && (
            <>
              <div className="mx-auto mb-10 max-w-xl">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type any name — even “steph”, “curry”, or just “ja”…"
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
                  <PlayerCard key={p.idPlayer} p={p} onClick={() => setSelectedPlayer(p)} />
                ))}
              </div>
            </>
          )}

          {/* TEAMS TAB */}
          {tab === 'teams' && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {teams.map((t) => (
                <TeamCard key={t.idTeam} t={t} onClick={() => setViewTeam(t)} />
              ))}
            </div>
          )}
        </>
      )}

      {selectedPlayer && (
        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

      <footer className="mt-16 text-center text-xs text-slate-600">
        Data from TheSportsDB · Built by Shane
      </footer>
    </div>
  );
}
