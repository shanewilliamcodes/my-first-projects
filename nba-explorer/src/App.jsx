import { useEffect, useState } from 'react';
import { searchPlayers, getNbaTeams } from './api';

/* ---------- small helpers ---------- */

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

function Spinner() {
  return (
    <div className="flex justify-center py-16">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-orange-400" />
    </div>
  );
}

/* ---------- player card ---------- */

function PlayerCard({ p }) {
  const img = p.strCutout || p.strThumb;
  const age = ageFrom(p.dateBorn);
  const injured = p.strStatus && p.strStatus.toLowerCase() !== 'active';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/80 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/40 hover:shadow-orange-500/10">
      <div className="relative h-56 overflow-hidden bg-gradient-to-b from-orange-500/20 to-transparent">
        {img ? (
          <img
            src={img}
            alt={p.strPlayer}
            className="absolute bottom-0 left-1/2 h-full -translate-x-1/2 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl opacity-30">🏀</div>
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
        <h3 className="truncate text-lg font-bold text-white">{p.strPlayer}</h3>
        <p className="truncate text-sm text-orange-300/90">{p.strTeam || 'Free Agent'}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {p.strPosition && (
            <span className="rounded-md bg-white/10 px-2 py-1 font-medium text-slate-200">
              {p.strPosition}
            </span>
          )}
          {age && (
            <span className="rounded-md bg-white/10 px-2 py-1 font-medium text-slate-200">
              Age {age}
            </span>
          )}
          {p.strNationality && (
            <span className="rounded-md bg-white/10 px-2 py-1 font-medium text-slate-200">
              {p.strNationality}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- team card + detail ---------- */

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

function TeamDetail({ t, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          ✕
        </button>
        <div className="flex flex-col items-center gap-4 bg-gradient-to-b from-orange-500/15 to-transparent p-8">
          {t.strBadge && (
            <img src={t.strBadge} alt={t.strTeam} className="h-28 w-28 object-contain drop-shadow-2xl" />
          )}
          <h2 className="text-center text-2xl font-extrabold text-white">{t.strTeam}</h2>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {t.strStadium && <Pill>🏟️ {t.strStadium}</Pill>}
            {t.intFormedYear && <Pill>Est. {t.intFormedYear}</Pill>}
            {t.strLocation && <Pill>📍 {t.strLocation}</Pill>}
            {t.intStadiumCapacity && <Pill>{Number(t.intStadiumCapacity).toLocaleString()} seats</Pill>}
          </div>
        </div>
        {t.strDescriptionEN && (
          <p className="max-h-60 overflow-y-auto px-8 pb-8 text-sm leading-relaxed text-slate-300">
            {t.strDescriptionEN}
          </p>
        )}
      </div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="rounded-full bg-white/10 px-3 py-1 font-medium text-slate-200">{children}</span>
  );
}

/* ---------- main app ---------- */

export default function App() {
  const [tab, setTab] = useState('players');

  // players
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [loadingP, setLoadingP] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  // teams
  const [teams, setTeams] = useState([]);
  const [loadingT, setLoadingT] = useState(false);
  const [teamError, setTeamError] = useState('');
  const [activeTeam, setActiveTeam] = useState(null);

  function loadTeams() {
    setLoadingT(true);
    setTeamError('');
    getNbaTeams()
      .then(setTeams)
      .catch(() => setTeamError('Couldn’t load teams — the free data service is busy.'))
      .finally(() => setLoadingT(false));
  }

  async function runSearch(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoadingP(true);
    setError('');
    setSearched(true);
    try {
      setPlayers(await searchPlayers(query.trim()));
    } catch (err) {
      setError('Could not load players. Try again in a moment.');
      setPlayers([]);
    } finally {
      setLoadingP(false);
    }
  }

  useEffect(() => {
    if (tab === 'teams' && teams.length === 0 && !loadingT && !teamError) {
      loadTeams();
    }
  }, [tab, teams.length, loadingT, teamError]);

  return (
    <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20">
      {/* header */}
      <header className="flex flex-col items-center gap-5 py-10 text-center">
        <h1 className="text-4xl font-black tracking-tight sm:text-6xl">
          <span className="bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
            NBA
          </span>{' '}
          Explorer
        </h1>
        <p className="max-w-md text-sm text-slate-400">
          Search any NBA player or browse all 30 teams — real photos, logos, and stats.
        </p>

        {/* tabs */}
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
      </header>

      {error && (
        <p className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-center text-sm text-red-300">
          {error}
        </p>
      )}

      {/* PLAYERS TAB */}
      {tab === 'players' && (
        <>
          <form onSubmit={runSearch} className="mx-auto mb-10 flex max-w-xl gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “LeBron James” or “Curry”…"
              className="flex-1 rounded-xl border border-white/10 bg-slate-800/70 px-4 py-3 text-white placeholder-slate-500 outline-none transition focus:border-orange-400/60"
            />
            <button
              type="submit"
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-400 active:scale-95"
            >
              Search
            </button>
          </form>

          {loadingP && <Spinner />}

          {!loadingP && searched && players.length === 0 && !error && (
            <p className="py-16 text-center text-slate-400">No basketball players found for “{query}”.</p>
          )}

          {!loadingP && !searched && (
            <p className="py-16 text-center text-slate-500">
              👆 Search for a player to see their card.
            </p>
          )}

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {players.map((p) => (
              <PlayerCard key={p.idPlayer} p={p} />
            ))}
          </div>
        </>
      )}

      {/* TEAMS TAB */}
      {tab === 'teams' && (
        <>
          {loadingT && <Spinner />}

          {!loadingT && teamError && (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <p className="text-slate-400">{teamError}</p>
              <button
                onClick={loadTeams}
                className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-400 active:scale-95"
              >
                Retry
              </button>
            </div>
          )}

          {!loadingT && !teamError && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {teams.map((t) => (
                <TeamCard key={t.idTeam} t={t} onClick={() => setActiveTeam(t)} />
              ))}
            </div>
          )}

          {activeTeam && <TeamDetail t={activeTeam} onClose={() => setActiveTeam(null)} />}
        </>
      )}

      <footer className="mt-16 text-center text-xs text-slate-600">
        Data from TheSportsDB · Built by Shane
      </footer>
    </div>
  );
}
