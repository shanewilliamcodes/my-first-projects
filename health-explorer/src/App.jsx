import { useMemo, useState, useEffect } from 'react';
import {
  CONDITIONS, TOP_DRUGS, SPECIALTIES, CONDITION_COUNT, SCREENINGS,
  specialtyById, conditionById, conditionsForSpecialty, guessSpecialtyId,
  searchAll, costPlusUrl, goodRxUrl, trumpRxUrl,
  findProviderUrl, zocdocUrl, healthgradesUrl, medlineSearchUrl,
} from './data';
import {
  searchConditionsLive, fetchOverview, fetchPubMed, fetchDrugLabel,
} from './live';

/* ============================ helpers ============================ */

// The handful of conditions most people search first — featured on Home.
const FEATURED_IDS = [
  'hypertension', 'type-2-diabetes', 'high-cholesterol', 'heart-disease',
  'asthma', 'depression', 'anxiety', 'breast-cancer',
];

const CATEGORY_ORDER = [
  'Heart & Circulation', 'Hormones & Metabolism', 'Mental Health',
  'Lungs & Breathing', 'Digestive Health', 'Brain & Nerves',
  'Bones & Joints', 'Cancer', 'Kidneys & Urinary', 'Skin',
  'Allergy & Immune', 'Infections', 'Blood',
  "Women's Health", "Men's Health", 'Eyes & Vision', 'Ear, Nose & Throat',
];

// Quick-search suggestions shown under the hero.
const POPULAR_SEARCHES = [
  'High blood pressure', 'Diabetes', 'Anxiety', 'Shingles',
  'Pancreatic cancer', 'Sleep apnea', 'ADHD', 'Ozempic',
];

// Small hook for live fetches with loading/error states (mirrors the NBA app).
function useLive(fn, deps) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  useEffect(() => {
    let alive = true;
    Promise.resolve()
      .then(() => { if (alive) setState({ loading: true, error: null, data: null }); })
      .then(fn)
      .then((d) => alive && setState({ loading: false, error: null, data: d }))
      .catch((e) => alive && setState({ loading: false, error: e.message || 'Something went wrong', data: null }));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

// Saved conditions/drugs, persisted in localStorage.
function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('he:favs'));
      if (raw && Array.isArray(raw.conditions) && Array.isArray(raw.drugs)) return raw;
    } catch { /* fresh start */ }
    return { conditions: [], drugs: [] };
  });
  useEffect(() => {
    try { localStorage.setItem('he:favs', JSON.stringify(favs)); } catch { /* quota */ }
  }, [favs]);
  const toggleFav = (kind, key) =>
    setFavs((f) => {
      const has = f[kind].includes(key);
      return { ...f, [kind]: has ? f[kind].filter((x) => x !== key) : [...f[kind], key] };
    });
  return [favs, toggleFav];
}

// Last few things the user opened (conditions/drugs), persisted locally.
// Keys look like "c:hypertension" or "d:Atorvastatin".
function useRecents() {
  const [recents, setRecents] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('he:recents'));
      if (Array.isArray(raw)) return raw.filter((x) => typeof x === 'string');
    } catch { /* fresh start */ }
    return [];
  });
  useEffect(() => {
    try { localStorage.setItem('he:recents', JSON.stringify(recents)); } catch { /* quota */ }
  }, [recents]);
  const pushRecent = (key) =>
    setRecents((r) => [key, ...r.filter((x) => x !== key)].slice(0, 8));
  return [recents, pushRecent];
}

function Star({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={active ? 'Remove from saved' : 'Save for quick access'}
      className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
        active ? 'bg-amber-400/20 text-amber-300' : 'bg-white/10 text-slate-400 hover:text-amber-300'
      }`}
    >
      {active ? '★' : '☆'}
    </button>
  );
}

function Spinner({ label }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/15 border-t-emerald-400" />
      {label && <p className="text-sm text-slate-400">{label}</p>}
    </div>
  );
}

function Pill({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-white/10 text-slate-200',
    emerald: 'bg-emerald-500/15 text-emerald-300',
    cyan: 'bg-cyan-500/15 text-cyan-300',
    rose: 'bg-rose-500/15 text-rose-300',
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

function LinkBtn({ href, children, color = 'bg-white/10 hover:bg-white/20' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold text-white transition ${color}`}
    >
      {children}
    </a>
  );
}

/* ============================ cards ============================ */

function ConditionCard({ c, onClick }) {
  const spec = specialtyById(c.specialtyId);
  return (
    <button
      onClick={onClick}
      className="group flex w-full min-w-0 flex-col gap-2 rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/60 to-slate-900/70 p-5 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-emerald-500/10"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-2xl">{spec?.emoji}</span>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {c.category}
        </span>
      </div>
      <h3 className="text-base font-bold leading-tight text-white">{c.name}</h3>
      {c.aka && <p className="truncate text-xs text-slate-400">{c.aka}</p>}
      <p className="mt-auto pt-1 text-xs font-medium text-emerald-300/90">{spec?.name}</p>
    </button>
  );
}

function SpecialtyCard({ s, onClick }) {
  const count = conditionsForSpecialty(s.id).length;
  return (
    <button
      onClick={onClick}
      className="group flex w-full min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-slate-800/50 p-5 text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:bg-slate-800/80"
    >
      <div className="flex items-center gap-3">
        <span className="text-3xl">{s.emoji}</span>
        <h3 className="text-base font-bold leading-tight text-white">{s.name}</h3>
      </div>
      <p className="text-sm leading-relaxed text-slate-400">{s.blurb}</p>
      {count > 0 && <Pill tone="cyan">{count} condition{count === 1 ? '' : 's'} in this guide</Pill>}
    </button>
  );
}

function DrugRow({ d, onConditionClick, onOpenDrug }) {
  return (
    <div
      onClick={() => onOpenDrug?.(d)}
      className="flex cursor-pointer items-center gap-3 border-b border-white/5 px-3 py-3 transition hover:bg-white/[0.04] sm:gap-4 sm:px-4"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-sm font-bold tabular-nums text-emerald-300 sm:h-10 sm:w-10">
        {d.rank}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-bold text-white">{d.name}</span>
          {d.brand && <span className="text-xs text-slate-400">{d.brand}</span>}
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
          <span>{d.class}</span>
          <span className="text-slate-600">•</span>
          {d.conditionId ? (
            <button
              onClick={(e) => { e.stopPropagation(); onConditionClick(d.conditionId); }}
              className="font-medium text-emerald-300/90 hover:text-emerald-200 hover:underline"
            >
              {d.use}
            </button>
          ) : (
            <span>{d.use}</span>
          )}
        </div>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <div className="text-sm font-semibold tabular-nums text-white">{d.rx}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-500">Rx / yr</div>
      </div>
      <span className="shrink-0 text-slate-600">›</span>
    </div>
  );
}

/* ============================ price links ============================ */

function PriceLinks({ drug }) {
  // Strip parenthetical brand notes so the search term is the drug name only.
  const clean = drug.replace(/\s*\(.*?\)\s*/g, '').split('/')[0].trim();
  return (
    <div className="flex flex-wrap gap-1.5">
      <a href={costPlusUrl(clean)} target="_blank" rel="noopener noreferrer"
        className="rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-emerald-500/20 hover:text-emerald-200">
        Cost Plus
      </a>
      <a href={goodRxUrl(clean)} target="_blank" rel="noopener noreferrer"
        className="rounded-md bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:bg-emerald-500/20 hover:text-emerald-200">
        GoodRx
      </a>
    </div>
  );
}

/* ============================ research (PubMed) ============================ */

function PubMedList({ items }) {
  if (!items?.length) {
    return <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">No recent articles found. Try another topic.</p>;
  }
  return (
    <div className="space-y-3">
      {items.map((a) => (
        <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer"
          className="block rounded-2xl border border-white/10 bg-slate-800/40 p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:bg-slate-800/70">
          <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
            {a.journal && <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 font-semibold text-emerald-300">{a.journal}</span>}
            {a.date && <span className="text-slate-500">{a.date}</span>}
            {a.type && <span className="text-slate-600">· {a.type}</span>}
          </div>
          <h3 className="font-semibold leading-snug text-white">{a.title}</h3>
          {a.authors && <p className="mt-1 text-xs text-slate-400">{a.authors}</p>}
        </a>
      ))}
    </div>
  );
}

const NEWS_TOPICS = [
  { label: 'Cancer therapy', q: 'cancer treatment' },
  { label: 'Pancreatic cancer', q: 'pancreatic cancer therapy' },
  { label: 'Diabetes & GLP-1', q: 'GLP-1 diabetes obesity' },
  { label: 'Heart disease', q: 'cardiovascular disease treatment' },
  { label: "Alzheimer's", q: "Alzheimer disease treatment" },
  { label: 'Vaccines', q: 'vaccine efficacy' },
  { label: 'Mental health', q: 'depression anxiety treatment' },
  { label: 'Obesity drugs', q: 'obesity pharmacotherapy weight loss' },
];

function NewsView() {
  const [topic, setTopic] = useState(NEWS_TOPICS[0]);
  const [input, setInput] = useState('');
  const [activeQuery, setActiveQuery] = useState(NEWS_TOPICS[0].q);
  const [activeLabel, setActiveLabel] = useState(NEWS_TOPICS[0].label);

  const { loading, error, data } = useLive(() => fetchPubMed(activeQuery, { retmax: 24 }), [activeQuery]);

  const runSearch = (e) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    setActiveQuery(q); setActiveLabel(q); setTopic(null);
  };
  const pickTopic = (t) => { setTopic(t); setActiveQuery(t.q); setActiveLabel(t.label); setInput(''); };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Health research & news</h2>
        <p className="text-sm text-slate-400">
          Recent, peer-reviewed studies from <span className="text-slate-300">PubMed</span> (U.S. National Library of Medicine) — real science, no clickbait.
        </p>
      </div>

      <form onSubmit={runSearch} className="mb-4">
        <div className="relative">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search any health topic — e.g. “immunotherapy melanoma”…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-20 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-400/50 focus:bg-white/10"
          />
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">🔬</span>
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-900 transition hover:bg-emerald-400">
            Search
          </button>
        </div>
      </form>

      <div className="mb-6 flex flex-wrap gap-2">
        {NEWS_TOPICS.map((t) => (
          <button key={t.label} onClick={() => pickTopic(t)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              topic?.label === t.label ? 'bg-emerald-500 text-slate-900' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <p className="mb-3 text-sm text-slate-400">
        Showing latest for <span className="font-semibold text-white">“{activeLabel}”</span>
      </p>

      {loading ? <Spinner label="Searching PubMed…" />
        : error ? <p className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-6 text-center text-rose-200">Couldn’t load research right now. {error}</p>
        : <PubMedList items={data} />}

      <p className="mt-6 text-center text-xs text-slate-600">
        Results link to PubMed.gov. Studies are individual findings, not medical guidance.
      </p>
    </div>
  );
}

/* ============================ condition modal ============================ */

function ConditionModal({ condition: c, onClose, onOpenDrug, isFav, onToggleFav }) {
  const spec = specialtyById(c.specialtyId);
  const research = useLive(() => fetchPubMed(`${c.name} treatment`, { retmax: 5 }), [c.id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative my-4 w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <Star active={isFav} onClick={onToggleFav} />
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
          >
            ✕
          </button>
        </div>

        {/* header */}
        <div className="rounded-t-3xl bg-gradient-to-b from-emerald-500/20 to-transparent px-6 pt-8 pb-5">
          <div className="mb-2 text-4xl">{spec?.emoji}</div>
          <h2 className="text-2xl font-extrabold text-white">{c.name}</h2>
          {c.aka && <p className="text-sm text-slate-400">also called {c.aka}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill tone="emerald">{c.category}</Pill>
            <Pill tone="cyan">{spec?.name}</Pill>
          </div>
        </div>

        <div className="space-y-6 px-6 pb-8">
          {/* prevalence */}
          <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm">
            <span className="font-semibold text-emerald-300">How common: </span>
            <span className="text-slate-300">{c.prevalence}</span>
          </div>

          {/* overview */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Overview</h3>
            <p className="text-[15px] leading-relaxed text-slate-200">{c.overview}</p>
          </section>

          {/* symptoms */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Common signs</h3>
            <ul className="flex flex-wrap gap-2">
              {c.symptoms.map((s) => (
                <li key={s} className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-slate-200">{s}</li>
              ))}
            </ul>
          </section>

          {/* treatments & medications, ranked */}
          <section>
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-400">
              Common treatments &amp; medications
            </h3>
            <p className="mb-3 text-xs text-slate-500">
              Ranked roughly most-to-least common. Tap a medication for FDA facts and cash prices — no insurance needed.
            </p>
            <div className="space-y-2">
              {c.drugs.map((d, i) => {
                // Procedures, devices, and home care aren't medications — no FDA
                // label or price links for those. Careful: "Chemotherapy",
                // "Immunotherapy" etc. ARE drugs, so "therapy" alone only
                // counts when it's the entire class.
                const cls = (d.class || '').trim();
                const isMed =
                  !/\b(procedure|surgery|surgical|device|maneuver|home care|lifestyle|irrigation|rinse|implant|vestibular|counseling|physical therapy)\b/i.test(cls) &&
                  !/^(therapy|home care|prevention|supplement|skin barrier|emergency rescue|electrolyte|vaccine[s]?( \(.*\))?)$/i.test(cls);
                const open = () => onOpenDrug({ name: d.name, class: d.class, use: c.name, conditionId: c.id });
                return (
                  <div
                    key={d.name}
                    role={isMed ? 'button' : undefined}
                    tabIndex={isMed ? 0 : undefined}
                    onClick={isMed ? open : undefined}
                    onKeyDown={isMed ? (e) => e.key === 'Enter' && open() : undefined}
                    className={`rounded-2xl border border-white/10 bg-white/[0.03] p-3.5 transition ${
                      isMed ? 'cursor-pointer hover:border-emerald-400/40 hover:bg-white/[0.06]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-xs font-bold text-emerald-300">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <span className="font-bold text-white">{d.name}</span>
                          <span className="text-xs text-cyan-300/80">{d.class}</span>
                        </div>
                        <p className="mt-0.5 text-sm text-slate-400">{d.note}</p>
                        {isMed && (
                          <div className="mt-2" onClick={(e) => e.stopPropagation()}><PriceLinks drug={d.name} /></div>
                        )}
                      </div>
                      {isMed && <span className="mt-1 shrink-0 text-xs font-semibold text-emerald-300/70">Details ›</span>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <LinkBtn href={trumpRxUrl()} color="bg-white/10 hover:bg-white/20">🏛️ TrumpRx.gov</LinkBtn>
              <LinkBtn href={costPlusUrl(c.drugs[0]?.name || c.name)} color="bg-white/10 hover:bg-white/20">
                💊 Cost Plus Drugs
              </LinkBtn>
            </div>
          </section>

          {/* find a provider */}
          <section className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] p-4">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-cyan-200">
              📍 Find care near you
            </h3>
            <p className="mb-3 text-sm text-slate-300">
              This is usually treated by a <span className="font-semibold text-white">{spec?.name}</span> (or start with your primary-care doctor).
            </p>
            <div className="flex flex-wrap gap-2">
              <LinkBtn href={findProviderUrl(spec?.find || c.name)} color="bg-cyan-600/80 hover:bg-cyan-500">
                🗺️ Search near me
              </LinkBtn>
              <LinkBtn href={zocdocUrl(spec?.find || c.name)} color="bg-white/10 hover:bg-white/20">Zocdoc</LinkBtn>
              <LinkBtn href={healthgradesUrl(spec?.find || c.name)} color="bg-white/10 hover:bg-white/20">Healthgrades</LinkBtn>
            </div>
          </section>

          {/* red flags */}
          {c.redFlags && (
            <section className="rounded-2xl border border-rose-400/30 bg-rose-500/[0.08] p-4">
              <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-rose-200">
                ⚠️ When to get urgent help
              </h3>
              <p className="text-sm leading-relaxed text-rose-100/90">{c.redFlags}</p>
            </section>
          )}

          {/* resources */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Learn more</h3>
            <div className="flex flex-wrap gap-2">
              {c.resources.map((r) => (
                <LinkBtn key={r.url} href={r.url}>🔗 {r.label}</LinkBtn>
              ))}
              <LinkBtn href={medlineSearchUrl(c.name)}>🔍 MedlinePlus</LinkBtn>
            </div>
          </section>

          {/* latest research (live PubMed) */}
          <section>
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-400">Latest research</h3>
            <p className="mb-3 text-xs text-slate-500">Recent peer-reviewed studies from PubMed (NIH).</p>
            {research.loading ? <Spinner label="Loading research…" />
              : research.error ? <p className="text-sm text-slate-500">Couldn’t load research right now.</p>
              : <PubMedList items={research.data} />}
          </section>
        </div>
      </div>
    </div>
  );
}

/* ============================ live condition modal ============================ */

function LiveConditionModal({ live, onClose }) {
  const spec = specialtyById(guessSpecialtyId(`${live.name} ${live.technicalName || ''}`));
  const overview = useLive(() => fetchOverview(live.technicalName || live.name), [live.id]);
  const research = useLive(() => fetchPubMed(`${live.technicalName || live.name} treatment`, { retmax: 5 }), [live.id]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div className="relative my-4 w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">✕</button>

        <div className="rounded-t-3xl bg-gradient-to-b from-cyan-500/20 to-transparent px-6 pt-8 pb-5">
          <div className="mb-2 text-4xl">{spec?.emoji}</div>
          <h2 className="text-2xl font-extrabold text-white">{live.name}</h2>
          {live.technicalName && live.technicalName !== live.name && (
            <p className="text-sm text-slate-400">medical term: {live.technicalName}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Pill tone="cyan">Likely seen by: {spec?.name}</Pill>
            <Pill tone="emerald">Live from NIH</Pill>
          </div>
        </div>

        <div className="space-y-6 px-6 pb-8">
          {/* overview */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Overview</h3>
            {overview.loading ? <Spinner label="Loading overview…" />
              : overview.data ? (
                <>
                  <p className="text-[15px] leading-relaxed text-slate-200">{overview.data.extract}</p>
                  <a href={overview.data.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-semibold text-emerald-300 hover:underline">
                    Source: Wikipedia →
                  </a>
                </>
              ) : (
                <p className="text-sm text-slate-400">No quick summary available — see the trusted links below for details.</p>
              )}
          </section>

          {/* find care */}
          <section className="rounded-2xl border border-cyan-400/20 bg-cyan-500/[0.06] p-4">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-cyan-200">📍 Find care near you</h3>
            <p className="mb-3 text-sm text-slate-300">
              Often handled by a <span className="font-semibold text-white">{spec?.name}</span> — or start with your primary-care doctor.
            </p>
            <div className="flex flex-wrap gap-2">
              <LinkBtn href={findProviderUrl(spec?.find || live.name)} color="bg-cyan-600/80 hover:bg-cyan-500">🗺️ Search near me</LinkBtn>
              <LinkBtn href={zocdocUrl(spec?.find || live.name)} color="bg-white/10 hover:bg-white/20">Zocdoc</LinkBtn>
              <LinkBtn href={healthgradesUrl(spec?.find || live.name)} color="bg-white/10 hover:bg-white/20">Healthgrades</LinkBtn>
            </div>
          </section>

          {/* learn more */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Learn more</h3>
            <div className="flex flex-wrap gap-2">
              {live.medlineUrl && <LinkBtn href={live.medlineUrl}>🔗 MedlinePlus</LinkBtn>}
              <LinkBtn href={medlineSearchUrl(live.technicalName || live.name)}>🔍 Search MedlinePlus</LinkBtn>
            </div>
          </section>

          {/* latest research */}
          <section>
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-400">Latest research</h3>
            <p className="mb-3 text-xs text-slate-500">Recent peer-reviewed studies from PubMed (NIH).</p>
            {research.loading ? <Spinner label="Loading research…" />
              : research.error ? <p className="text-sm text-slate-500">Couldn’t load research right now.</p>
              : <PubMedList items={research.data} />}
          </section>

          <p className="text-center text-xs text-slate-600">
            This entry is pulled live from public NIH/Wikipedia sources and isn’t hand-reviewed. Educational only — not medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================ drug modal ============================ */

function DrugModal({ drug: d, onClose, onOpenCondition, isFav, onToggleFav }) {
  const cond = d.conditionId ? conditionById(d.conditionId) : null;
  const label = useLive(() => fetchDrugLabel(d.name), [d.name]);
  const cleanName = d.name.replace(/\s*\(.*?\)\s*/g, '').split('/')[0].trim();

  // Capture-phase Esc: when this modal is stacked above a condition page,
  // Esc closes only this one (the modal underneath never sees the event).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-sm sm:p-6" onClick={onClose}>
      <div className="relative my-4 w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="absolute right-4 top-4 z-10 flex gap-2">
          <Star active={isFav} onClick={onToggleFav} />
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">✕</button>
        </div>

        <div className="rounded-t-3xl bg-gradient-to-b from-emerald-500/20 to-transparent px-6 pt-8 pb-5">
          <div className="mb-2 text-4xl">💊</div>
          <h2 className="text-2xl font-extrabold capitalize text-white">{d.name}</h2>
          {d.brand && <p className="text-sm text-slate-400">brand name: {d.brand}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {d.class && <Pill tone="cyan">{d.class}</Pill>}
            {d.rank && <Pill tone="emerald">#{d.rank} most prescribed in U.S.</Pill>}
          </div>
        </div>

        <div className="space-y-6 px-6 pb-8">
          {/* what it treats */}
          {d.use && (
            <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm">
              <span className="font-semibold text-emerald-300">Commonly used for: </span>
              {cond ? (
                <button onClick={() => { onClose(); onOpenCondition(cond.id); }} className="text-slate-200 underline decoration-dotted hover:text-white">
                  {d.use}
                </button>
              ) : (
                <span className="text-slate-200">{d.use}</span>
              )}
              {d.rx && <span className="text-slate-500"> · ~{d.rx.replace('~', '')} prescriptions/year</span>}
            </div>
          )}

          {/* official FDA facts */}
          <section>
            <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-400">What the FDA label says</h3>
            <p className="mb-3 text-xs text-slate-500">Plain summary from the official openFDA drug label.</p>
            {label.loading ? <Spinner label="Loading FDA label…" />
              : label.data ? (
                <div className="space-y-3">
                  {label.data.usage && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-300">Approved use</div>
                      <p className="text-sm leading-relaxed text-slate-200">{label.data.usage}</p>
                    </div>
                  )}
                  {label.data.warning && (
                    <div className="rounded-2xl border border-amber-400/25 bg-amber-500/[0.07] p-3.5">
                      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-300">Key warning</div>
                      <p className="text-sm leading-relaxed text-amber-100/90">{label.data.warning}</p>
                    </div>
                  )}
                  {label.data.sideEffects && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-cyan-300">Common side effects</div>
                      <p className="text-sm leading-relaxed text-slate-300">{label.data.sideEffects}</p>
                    </div>
                  )}
                  {label.data.interactions && (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3.5">
                      <div className="mb-1 text-xs font-bold uppercase tracking-wide text-cyan-300">Interactions to know about</div>
                      <p className="text-sm leading-relaxed text-slate-300">{label.data.interactions}</p>
                    </div>
                  )}
                  <a
                    href={`https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=${encodeURIComponent(cleanName)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-block text-xs font-semibold text-emerald-300 hover:underline"
                  >
                    Read the full official label (DailyMed, NIH) →
                  </a>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No official label summary was found for this name. Use the links below for details.</p>
              )}
          </section>

          {/* prices */}
          <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-4">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-emerald-200">💰 Pay less (no insurance needed)</h3>
            <p className="mb-3 text-sm text-slate-300">Compare cash prices for <span className="font-semibold text-white">{cleanName}</span>.</p>
            <div className="flex flex-wrap gap-2">
              <LinkBtn href={costPlusUrl(cleanName)} color="bg-emerald-600/80 hover:bg-emerald-500">💊 Cost Plus Drugs</LinkBtn>
              <LinkBtn href={goodRxUrl(cleanName)} color="bg-white/10 hover:bg-white/20">GoodRx</LinkBtn>
              <LinkBtn href={trumpRxUrl()} color="bg-white/10 hover:bg-white/20">🏛️ TrumpRx.gov</LinkBtn>
            </div>
          </section>

          {/* learn more */}
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-400">Learn more</h3>
            <div className="flex flex-wrap gap-2">
              <LinkBtn href={medlineSearchUrl(cleanName)}>🔍 MedlinePlus</LinkBtn>
              <LinkBtn href={`https://www.drugs.com/search.php?searchterm=${encodeURIComponent(cleanName)}`}>🔗 Drugs.com</LinkBtn>
            </div>
          </section>

          <p className="text-center text-xs text-slate-600">
            Educational only — not a recommendation. Never start, stop, or change a medication without your prescriber.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================ search ============================ */

// Debounce a value so we don't hit the live API on every keystroke.
function useDebounced(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}

function SearchResults({ query, onOpenCondition, onOpenLive, onOpenDrug, onClear }) {
  const { conditions, drugs } = useMemo(() => searchAll(query), [query]);
  const debounced = useDebounced(query.trim(), 350);

  const live = useLive(
    () => (debounced.length >= 2 ? searchConditionsLive(debounced) : Promise.resolve([])),
    [debounced]
  );

  // Drop live results that essentially duplicate a curated condition we already show.
  const curatedNames = useMemo(
    () => new Set(conditions.flatMap((c) => [c.name.toLowerCase(), (c.aka || '').toLowerCase()].filter(Boolean))),
    [conditions]
  );
  const liveExtra = (live.data || []).filter((x) => {
    const n = x.name.toLowerCase();
    return ![...curatedNames].some((cn) => cn && (n.includes(cn) || cn.includes(n)));
  }).slice(0, 18);

  const empty = conditions.length === 0 && drugs.length === 0 && !live.loading && liveExtra.length === 0;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {empty ? 'No matches for' : `Results for`} <span className="font-semibold text-white">“{query}”</span>
        </p>
        <button onClick={onClear} className="text-sm font-semibold text-emerald-300 hover:underline">Clear</button>
      </div>

      {empty && (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
          Try a condition (like “diabetes”) or a drug name (like “lisinopril”).
        </p>
      )}

      {conditions.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
            In-depth guides ({conditions.length})
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {conditions.map((c) => (
              <ConditionCard key={c.id} c={c} onClick={() => onOpenCondition(c.id)} />
            ))}
          </div>
        </section>
      )}

      {drugs.length > 0 && (
        <section className="mb-8">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
            Drugs ({drugs.length})
          </h3>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
            {drugs.map((d) => (
              <DrugRow key={d.rank} d={d} onConditionClick={onOpenCondition} onOpenDrug={onOpenDrug} />
            ))}
          </div>
        </section>
      )}

      {/* infinite conditions — live from NIH */}
      <section>
        <h3 className="mb-1 text-sm font-bold uppercase tracking-wider text-slate-400">More conditions</h3>
        <p className="mb-3 text-xs text-slate-500">
          Searched live across the U.S. National Library of Medicine — thousands of conditions.
        </p>
        {live.loading ? <Spinner label="Searching the medical library…" />
          : liveExtra.length === 0 ? <p className="text-sm text-slate-500">No additional conditions matched.</p>
          : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {liveExtra.map((x) => (
                <button key={x.id} onClick={() => onOpenLive(x)}
                  className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-800/40 px-4 py-3 text-left transition hover:border-cyan-400/40 hover:bg-slate-800/70">
                  <span className="min-w-0 truncate text-sm font-medium text-white">{x.name}</span>
                  <span className="shrink-0 text-xs text-cyan-300">View →</span>
                </button>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}

/* ============================ tabs / views ============================ */

function HomeView({ onOpenCondition, onGoTab, onOpenSpecialty, onOpenDrug, onSearch, favs, recents }) {
  const featured = FEATURED_IDS.map(conditionById).filter(Boolean);
  const topTen = TOP_DRUGS.slice(0, 10);
  const [heroQ, setHeroQ] = useState('');
  const savedConditions = (favs?.conditions || []).map(conditionById).filter(Boolean);
  const savedDrugs = favs?.drugs || [];
  // Resolve recent keys ("c:id" / "d:name") to display items; drop stale ids.
  const recentItems = (recents || [])
    .map((key) => {
      const [t, ...rest] = key.split(':');
      const k = rest.join(':');
      if (t === 'c') {
        const c = conditionById(k);
        return c ? { key, label: c.name, open: () => onOpenCondition(c.id) } : null;
      }
      return { key, label: k, open: () => onOpenDrug(TOP_DRUGS.find((d) => d.name === k) || { name: k }) };
    })
    .filter(Boolean)
    .slice(0, 6);

  const submitHero = (e) => {
    e.preventDefault();
    if (heroQ.trim()) onSearch(heroQ.trim());
  };

  return (
    <div className="space-y-12">
      {/* hero — search is the product */}
      <section className="mx-auto max-w-3xl pt-2 text-center sm:pt-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
          ✚ Built on NIH, FDA &amp; PubMed data
        </div>
        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
          Any condition. Any drug.<br className="hidden sm:block" /> Explained in plain English.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-400 sm:text-lg">
          What it is, who treats it, what's usually prescribed, where to find care —
          and how to pay less for your medication.
        </p>

        <form onSubmit={submitHero} className="mx-auto mt-7 max-w-xl">
          <div className="relative">
            <input
              value={heroQ}
              onChange={(e) => setHeroQ(e.target.value)}
              placeholder="Try “shingles”, “metformin”, or “chest pain”…"
              className="w-full rounded-2xl border border-white/15 bg-white/5 py-4 pl-12 pr-28 text-base text-white placeholder-slate-500 shadow-xl outline-none transition focus:border-emerald-400/60 focus:bg-white/10"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500">🔍</span>
            <button type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-900 transition hover:bg-emerald-400">
              Search
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {POPULAR_SEARCHES.map((p) => (
            <button key={p} onClick={() => onSearch(p)}
              className="rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-emerald-500/20 hover:text-emerald-200">
              {p}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-600">
          Searches the U.S. National Library of Medicine — thousands of conditions, plus the top 100 drugs.
        </p>
      </section>

      {/* recently viewed */}
      {recentItems.length > 0 && (
        <section className="-mt-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">🕘 Recent:</span>
            {recentItems.map((r) => (
              <button key={r.key} onClick={r.open}
                className="rounded-full bg-white/5 px-3.5 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/15 hover:text-white">
                {r.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* saved items */}
      {(savedConditions.length > 0 || savedDrugs.length > 0) && (
        <section>
          <h2 className="mb-1 text-xl font-bold text-white">⭐ Your saved items</h2>
          <p className="mb-4 text-sm text-slate-400">Tap the star on any condition or drug to keep it here.</p>
          {savedConditions.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {savedConditions.map((c) => (
                <ConditionCard key={c.id} c={c} onClick={() => onOpenCondition(c.id)} />
              ))}
            </div>
          )}
          {savedDrugs.length > 0 && (
            <div className={`flex flex-wrap gap-2 ${savedConditions.length > 0 ? 'mt-4' : ''}`}>
              {savedDrugs.map((name) => (
                <button key={name} onClick={() => onOpenDrug(TOP_DRUGS.find((d) => d.name === name) || { name })}
                  className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/20">
                  💊 {name}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* most-searched conditions */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Most-searched conditions</h2>
            <p className="text-sm text-slate-400">The big ones — each with a full plain-English guide.</p>
          </div>
          <button onClick={() => onGoTab('conditions')} className="text-sm font-semibold text-emerald-300 hover:underline">
            View all →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((c) => (
            <ConditionCard key={c.id} c={c} onClick={() => onOpenCondition(c.id)} />
          ))}
        </div>
      </section>

      {/* top drugs preview */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Top 10 prescribed drugs</h2>
            <p className="text-sm text-slate-400">Tap any drug for FDA facts and ways to pay less.</p>
          </div>
          <button onClick={() => onGoTab('drugs')} className="text-sm font-semibold text-emerald-300 hover:underline">
            See the top 100 →
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
          {topTen.map((d) => (
            <DrugRow key={d.rank} d={d} onConditionClick={onOpenCondition} onOpenDrug={onOpenDrug} />
          ))}
        </div>
      </section>

      {/* all specialties, compact */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Browse by specialty</h2>
            <p className="text-sm text-slate-400">Every kind of doctor, and what they treat.</p>
          </div>
          <button onClick={() => onGoTab('specialties')} className="text-sm font-semibold text-emerald-300 hover:underline">
            Details →
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SPECIALTIES.map((s) => (
            <button key={s.id} onClick={() => onOpenSpecialty(s.id)}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-slate-800/40 px-3 py-4 text-center transition hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-800/70">
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-xs font-semibold leading-tight text-white">{s.name}</span>
              <span className="text-[10px] text-slate-500">{conditionsForSpecialty(s.id).length} guides</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function ConditionsView({ onOpenCondition }) {
  const [cat, setCat] = useState('All');
  const cats = ['All', ...CATEGORY_ORDER.filter((c) => CONDITIONS.some((x) => x.category === c))];
  const list = cat === 'All' ? CONDITIONS : CONDITIONS.filter((c) => c.category === cat);

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Condition guides</h2>
        <p className="text-sm text-slate-400">
          {CONDITION_COUNT} in-depth plain-English guides — and thousands more conditions via the search bar above.
        </p>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
              cat === c ? 'bg-emerald-500 text-slate-900' : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((c) => (
          <ConditionCard key={c.id} c={c} onClick={() => onOpenCondition(c.id)} />
        ))}
      </div>
      <p className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-sm text-slate-400">
        Don't see what you're looking for? Type it in the <span className="font-semibold text-emerald-300">search bar</span> at the top —
        we search the entire U.S. National Library of Medicine.
      </p>
    </div>
  );
}

function DrugsView({ onOpenCondition, onOpenDrug }) {
  const [lookup, setLookup] = useState('');

  // One box does both: filters the top-100 list as you type, and
  // submitting looks any drug up via the FDA if it's not in the list.
  const q = lookup.trim().toLowerCase();
  const filtered = q
    ? TOP_DRUGS.filter((d) => [d.name, d.brand, d.class, d.use].join(' ').toLowerCase().includes(q))
    : TOP_DRUGS;

  const submitLookup = (e) => {
    e.preventDefault();
    const name = lookup.trim();
    if (!name) return;
    // Exactly one match in the list? Open it rich; otherwise FDA lookup.
    onOpenDrug(filtered.length === 1 ? filtered[0] : { name });
    setLookup('');
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Most prescribed drugs in the U.S.</h2>
        <p className="text-sm text-slate-400">
          Ranked by approximate annual prescriptions. Tap a drug for FDA facts, what it treats, and ways to pay less.
        </p>
      </div>

      {/* look up ANY drug via the FDA */}
      <form onSubmit={submitLookup} className="mb-6">
        <div className="relative">
          <input
            value={lookup}
            onChange={(e) => setLookup(e.target.value)}
            placeholder="Filter the list, or look up any drug — e.g. “Ozempic”, “amoxicillin”…"
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-24 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-400/50 focus:bg-white/10"
          />
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">💊</span>
          <button type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-slate-900 transition hover:bg-emerald-400">
            Look up
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-600">
          {q && filtered.length > 0
            ? `${filtered.length} match${filtered.length === 1 ? '' : 'es'} in the top 100 — or press Look up for the FDA label.`
            : 'Typing filters the top 100; pressing Look up pulls the official FDA label for any U.S. drug.'}
        </p>
      </form>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40">
        {filtered.map((d) => (
          <DrugRow key={d.rank} d={d} onConditionClick={onOpenCondition} onOpenDrug={onOpenDrug} />
        ))}
        {filtered.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-400">
            Not in the top 100 — press <span className="font-semibold text-emerald-300">Look up</span> to pull “{lookup.trim()}” from the FDA.
          </p>
        )}
      </div>
    </div>
  );
}

function SpecialtiesView({ onOpenSpecialty }) {
  const [helperQ, setHelperQ] = useState('');
  const [suggestion, setSuggestion] = useState(null);

  const submitHelper = (e) => {
    e.preventDefault();
    const q = helperQ.trim();
    if (q) setSuggestion({ q, spec: specialtyById(guessSpecialtyId(q)) });
  };

  return (
    <div>
      {/* which doctor do I need? */}
      <section className="mb-8 rounded-3xl border border-cyan-400/20 bg-cyan-500/[0.06] p-5 sm:p-6">
        <h2 className="text-lg font-bold text-white">🤔 Not sure which kind of doctor you need?</h2>
        <p className="mt-1 text-sm text-slate-400">
          Type the condition or problem and we'll point you to the right specialty.
        </p>
        <form onSubmit={submitHelper} className="mt-4">
          <div className="relative max-w-xl">
            <input
              value={helperQ}
              onChange={(e) => setHelperQ(e.target.value)}
              placeholder="e.g. “itchy rash”, “chest pain”, “kidney stones”…"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-28 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-400/50 focus:bg-white/10"
            />
            <button type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-cyan-500 px-3.5 py-2 text-xs font-bold text-slate-900 transition hover:bg-cyan-400">
              Who treats it?
            </button>
          </div>
        </form>
        {suggestion && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-sm text-slate-300">
              For <span className="font-semibold text-white">“{suggestion.q}”</span>, you'd usually start with a{' '}
              <span className="font-bold text-cyan-300">{suggestion.spec.emoji} {suggestion.spec.find}</span>.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => onOpenSpecialty(suggestion.spec.id)}
                className="rounded-xl bg-cyan-600/80 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500">
                See what they treat
              </button>
              <LinkBtn href={findProviderUrl(suggestion.spec.find)}>🗺️ Find one near me</LinkBtn>
            </div>
            <p className="mt-3 text-xs text-slate-600">
              Rough guide only — your primary-care doctor can always point you to the right specialist.
            </p>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPECIALTIES.map((s) => (
          <SpecialtyCard key={s.id} s={s} onClick={() => onOpenSpecialty(s.id)} />
        ))}
      </div>
    </div>
  );
}

function SpecialtyDetail({ specialty: s, onBack, onOpenCondition }) {
  const list = conditionsForSpecialty(s.id);
  return (
    <div>
      <button onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">
        ← All specialties
      </button>

      <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-b from-cyan-500/15 to-transparent p-8 text-center">
        <div className="text-5xl">{s.emoji}</div>
        <h2 className="mt-2 text-2xl font-extrabold text-white">{s.name}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-300">{s.blurb}</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <LinkBtn href={findProviderUrl(s.find)} color="bg-cyan-600/80 hover:bg-cyan-500">🗺️ Find a {s.name} near me</LinkBtn>
          <LinkBtn href={zocdocUrl(s.find)} color="bg-white/10 hover:bg-white/20">Zocdoc</LinkBtn>
        </div>
      </div>

      {list.length > 0 ? (
        <>
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">
            Conditions in this guide
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((c) => (
              <ConditionCard key={c.id} c={c} onClick={() => onOpenCondition(c.id)} />
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-slate-400">
          We don’t have a detailed guide entry for this specialty yet — but you can still find a provider above.
        </p>
      )}
    </div>
  );
}

/* ============================ checkups ============================ */

function ScreeningCard({ s, dimmed }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-slate-800/40 p-4 ${dimmed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{s.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-white">{s.name}</h3>
            {s.who !== 'all' && <Pill tone="cyan">{s.who === 'women' ? 'Women' : 'Men'}</Pill>}
            <Pill>{s.ageMax ? `Ages ${s.ageMin}–${s.ageMax}` : `${s.ageMin}+`}</Pill>
          </div>
          <p className="mt-1 text-sm font-medium text-emerald-300/90">{s.freq}</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-400">{s.why}</p>
        </div>
      </div>
    </div>
  );
}

function CheckupsView() {
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('all');

  const n = parseInt(age, 10);
  const hasAge = !Number.isNaN(n) && n >= 18 && n <= 120;

  const fitsSex = (s) => s.who === 'all' || sex === 'all' || s.who === sex;
  const dueNow = SCREENINGS.filter((s) => fitsSex(s) && hasAge && n >= s.ageMin && (s.ageMax == null || n <= s.ageMax));
  const comingUp = SCREENINGS.filter((s) => fitsSex(s) && hasAge && n < s.ageMin);
  const all = SCREENINGS.filter(fitsSex);

  const section = (title, list, dimmed = false) =>
    list.length > 0 && (
      <section className="mb-8">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">{title}</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.map((s) => <ScreeningCard key={s.id} s={s} dimmed={dimmed} />)}
        </div>
      </section>
    );

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">Checkups, screenings &amp; vaccines</h2>
        <p className="text-sm text-slate-400">
          The routine care most adults should get — based on standard U.S. guidance (USPSTF &amp; CDC).
          Enter your age to see your personal checklist.
        </p>
      </div>

      {/* personalize */}
      <div className="mb-8 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
          Your age
          <input
            type="number" min="18" max="120" value={age} onChange={(e) => setAge(e.target.value)}
            placeholder="e.g. 45"
            className="w-24 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none focus:border-emerald-400/50"
          />
        </label>
        <div className="flex gap-1.5">
          {[['all', 'Everyone'], ['women', 'Women'], ['men', 'Men']].map(([v, l]) => (
            <button key={v} onClick={() => setSex(v)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${
                sex === v ? 'bg-emerald-500 text-slate-900' : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {hasAge ? (
        <>
          {section(`✅ Recommended at age ${n}`, dueNow)}
          {section('🗓️ Coming up later', comingUp, true)}
        </>
      ) : (
        section('All recommendations', all)
      )}

      <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center text-xs text-slate-500">
        General guidance only — family history and personal risk can change what's right for you.
        Bring this list to your next checkup and decide together with your doctor.
      </p>
    </div>
  );
}

/* ============================ root ============================ */

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'conditions', label: 'Conditions' },
  { id: 'drugs', label: 'Drugs' },
  { id: 'specialties', label: 'Specialties' },
  { id: 'checkups', label: 'Checkups' },
  { id: 'news', label: 'News' },
];

// Shareable URLs: #c/<condition-id>, #d/<drug name>, #s/<specialty-id>, #<tab>.
function parseHash(hash) {
  const h = decodeURIComponent((hash || '').replace(/^#/, ''));
  if (h.startsWith('c/')) return { conditionId: h.slice(2) };
  if (h.startsWith('d/')) return { drugName: h.slice(2) };
  if (h.startsWith('s/')) return { specialtyId: h.slice(2), tab: 'specialties' };
  if (TABS.some((t) => t.id === h)) return { tab: h };
  return {};
}
const drugByName = (name) =>
  TOP_DRUGS.find((d) => d.name.toLowerCase() === (name || '').toLowerCase()) || (name ? { name } : null);

export default function App() {
  // Restore state from a shared link on first load.
  const init = useMemo(() => parseHash(window.location.hash), []);
  const [tab, setTab] = useState(init.tab || 'home');
  const [query, setQuery] = useState('');
  const [openConditionId, setOpenConditionId] = useState(
    init.conditionId && conditionById(init.conditionId) ? init.conditionId : null
  );
  const [openSpecialtyId, setOpenSpecialtyId] = useState(
    init.specialtyId && specialtyById(init.specialtyId) ? init.specialtyId : null
  );
  const [openLive, setOpenLive] = useState(null);
  const [openDrug, setOpenDrug] = useState(init.drugName ? drugByName(init.drugName) : null);
  const [favs, toggleFav] = useFavorites();
  const [recents, pushRecent] = useRecents();

  // Track what gets opened for the "Recently viewed" strip on Home.
  useEffect(() => {
    if (openConditionId) pushRecent(`c:${openConditionId}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openConditionId]);
  useEffect(() => {
    if (openDrug?.name) pushRecent(`d:${openDrug.name}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDrug?.name]);

  // Keep the URL hash in sync so any view is shareable.
  useEffect(() => {
    const h = openDrug ? `d/${openDrug.name}`
      : openConditionId ? `c/${openConditionId}`
      : openSpecialtyId ? `s/${openSpecialtyId}`
      : tab !== 'home' ? tab : '';
    const cur = decodeURIComponent(window.location.hash.replace(/^#/, ''));
    if (cur === h) return;
    if (h) window.location.hash = h;
    else window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }, [tab, openConditionId, openSpecialtyId, openDrug]);

  // Back/forward buttons walk through modals and tabs naturally.
  useEffect(() => {
    const onHash = () => {
      const p = parseHash(window.location.hash);
      if (p.conditionId && conditionById(p.conditionId)) {
        setOpenConditionId(p.conditionId); setOpenDrug(null); return;
      }
      if (p.drugName) { setOpenDrug(drugByName(p.drugName)); return; }
      setOpenConditionId(null); setOpenDrug(null);
      setOpenSpecialtyId(p.specialtyId && specialtyById(p.specialtyId) ? p.specialtyId : null);
      setTab(p.tab || 'home');
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const openCondition = conditionById(openConditionId);
  const openSpecialty = specialtyById(openSpecialtyId);
  const searching = query.trim().length > 0;

  const goTab = (t) => { setTab(t); setQuery(''); setOpenSpecialtyId(null); window.scrollTo(0, 0); };

  return (
    <div className="relative z-10 min-h-full">
      {/* header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07120f]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => goTab('home')} className="flex shrink-0 items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-lg font-black text-white">✚</span>
              <span className="hidden text-lg font-extrabold tracking-tight text-white sm:block">
                Health<span className="text-emerald-400">Explorer</span>
              </span>
            </button>

            {/* search */}
            <div className="relative flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a condition or drug…"
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-9 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-400/50 focus:bg-white/10"
              />
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              {query && (
                <button onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">✕</button>
              )}
            </div>
          </div>

          {/* tabs */}
          {!searching && (
            <nav className="mt-3 flex gap-1 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => goTab(t.id)}
                  className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    tab === t.id ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* disclaimer */}
      <div className="border-b border-amber-400/10 bg-amber-500/[0.06]">
        <p className="mx-auto max-w-6xl px-4 py-2 text-center text-xs text-amber-200/80">
          ⓘ Educational information only — not medical advice. Always talk to a licensed clinician about your care.
          In an emergency call <span className="font-semibold">911</span>.
        </p>
      </div>

      {/* main */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {searching ? (
          <SearchResults query={query} onOpenCondition={setOpenConditionId} onOpenLive={setOpenLive} onOpenDrug={setOpenDrug} onClear={() => setQuery('')} />
        ) : openSpecialty ? (
          <SpecialtyDetail specialty={openSpecialty} onBack={() => setOpenSpecialtyId(null)} onOpenCondition={setOpenConditionId} />
        ) : tab === 'home' ? (
          <HomeView onOpenCondition={setOpenConditionId} onGoTab={goTab} onOpenSpecialty={setOpenSpecialtyId} onOpenDrug={setOpenDrug} onSearch={setQuery} favs={favs} recents={recents} />
        ) : tab === 'conditions' ? (
          <ConditionsView onOpenCondition={setOpenConditionId} />
        ) : tab === 'drugs' ? (
          <DrugsView onOpenCondition={setOpenConditionId} onOpenDrug={setOpenDrug} />
        ) : tab === 'checkups' ? (
          <CheckupsView />
        ) : tab === 'news' ? (
          <NewsView />
        ) : (
          <SpecialtiesView onOpenSpecialty={setOpenSpecialtyId} />
        )}
      </main>

      {/* footer */}
      <footer className="border-t border-white/10 px-4 py-8">
        <div className="mx-auto max-w-6xl space-y-3 text-center text-xs text-slate-500">
          <p>
            Health Explorer is a personal educational project. Condition guides draw on public sources
            (CDC, NIH/MedlinePlus); search covers the U.S. National Library of Medicine; drug facts come
            from the official FDA label. Drug rankings are approximate and for scale only.
          </p>
          <p>
            It does <span className="font-semibold text-slate-400">not</span> provide medical advice, diagnosis, or treatment.
            Prescription decisions belong to you and your clinician. Cost-comparison links go to third-party sites we don’t control.
          </p>
          <p className="text-slate-600">Crisis support: call or text <span className="font-semibold text-slate-400">988</span> · Emergencies: <span className="font-semibold text-slate-400">911</span></p>
          <p>
            <a href="https://shanewilliamcodes.github.io/my-first-projects/" className="font-semibold text-slate-500 transition hover:text-emerald-300">
              ← All apps by Shane
            </a>
          </p>
        </div>
      </footer>

      {openCondition && (
        <ConditionModal
          condition={openCondition}
          onClose={() => setOpenConditionId(null)}
          onOpenDrug={setOpenDrug}
          isFav={favs.conditions.includes(openCondition.id)}
          onToggleFav={() => toggleFav('conditions', openCondition.id)}
        />
      )}

      {openLive && (
        <LiveConditionModal live={openLive} onClose={() => setOpenLive(null)} />
      )}

      {openDrug && (
        <DrugModal
          drug={openDrug}
          onClose={() => setOpenDrug(null)}
          onOpenCondition={setOpenConditionId}
          isFav={favs.drugs.includes(openDrug.name)}
          onToggleFav={() => toggleFav('drugs', openDrug.name)}
        />
      )}
    </div>
  );
}
