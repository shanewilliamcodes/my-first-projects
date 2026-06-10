/* ------------------------------------------------------------------ *
 * Health Explorer — LIVE data layer
 *
 * Every endpoint here was verified to send `Access-Control-Allow-Origin: *`,
 * so the browser can call them directly — no backend, no API key, no signup.
 * (Same idea as the NBA app's live.js / ESPN calls.)
 *
 * Sources (all free, public, reliable):
 *   • NLM Clinical Tables   — condition search (thousands of conditions)
 *   • Wikipedia REST        — plain-English overview text
 *   • PubMed E-utilities    — peer-reviewed research articles (the "news")
 *   • openFDA               — official drug labeling (uses, warnings)
 *   • MedlinePlus           — authoritative consumer links
 * ------------------------------------------------------------------ */

const enc = encodeURIComponent;

/* ---------- tiny localStorage cache (24h) so we don't re-hit APIs ---------- */
const TTL = 24 * 60 * 60 * 1000;
function cached(key, fn) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const { t, v } = JSON.parse(raw);
      if (Date.now() - t < TTL) return Promise.resolve(v);
    }
  } catch { /* ignore */ }
  return fn().then((v) => {
    try { localStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch { /* quota */ }
    return v;
  });
}

async function getJSON(url, retries = 2) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Request failed (${res.status})`);
    return await res.json();
  } catch (e) {
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 500));
      return getJSON(url, retries - 1);
    }
    throw e;
  }
}

// PubMed (E-utilities) allows ~3 requests/sec per IP without an API key.
// Serialize PubMed calls through a queue with a small gap so bursts
// (e.g. several condition cards + the News tab) never trip the limit.
let pmQueue = Promise.resolve();
function pmGetJSON(url) {
  const run = () => getJSON(url, 2);
  const result = pmQueue.then(run, run);
  pmQueue = result.catch(() => {}).then(() => new Promise((r) => setTimeout(r, 350)));
  return result;
}

/* ================================================================== *
 * 1) CONDITION SEARCH — NLM Clinical Tables
 *    Returns plain-English condition names + a MedlinePlus link.
 *    Response shape: [total, [codes], null, [[primary, consumer, info_link], ...]]
 * ================================================================== */
export async function searchConditionsLive(term) {
  const q = term.trim();
  if (q.length < 2) return [];
  const url =
    `https://clinicaltables.nlm.nih.gov/api/conditions/v3/search?terms=${enc(q)}` +
    `&maxList=25&df=primary_name,consumer_name,info_link_data`;
  return cached(`ct:${q.toLowerCase()}`, () => getJSON(url)).then((data) => {
    const rows = data?.[3] || [];
    return rows.map((r) => {
      const [primary, consumer, infoLink] = r;
      // info_link_data looks like "http://...url,Topic Name"
      const url = (infoLink || '').split(',')[0] || '';
      return {
        id: primary,                       // stable-ish key
        name: consumer || primary,         // consumer-friendly label
        technicalName: primary,
        medlineUrl: url.replace(/^http:/, 'https:'),
      };
    });
  });
}

/* ================================================================== *
 * 2) OVERVIEW TEXT — Wikipedia REST summary
 * ================================================================== */
export async function fetchOverview(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${enc(title)}`;
  return cached(`wiki:${title.toLowerCase()}`, async () => {
    try {
      const d = await getJSON(url);
      if (d.type === 'disambiguation' || !d.extract) return null;
      return {
        extract: d.extract,
        url: d.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${enc(title)}`,
        thumbnail: d.thumbnail?.source || null,
      };
    } catch {
      return null;
    }
  });
}

/* ================================================================== *
 * 3) RESEARCH / NEWS — PubMed E-utilities (esearch -> esummary)
 *    Returns recent, dated, journal-sourced articles. Reliable by design.
 * ================================================================== */
const EUTILS = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export async function fetchPubMed(term, { retmax = 20, recentDays = 1825 } = {}) {
  const q = term.trim();
  if (!q) return [];
  const key = `pm:v2:${q.toLowerCase()}:${retmax}`;
  return cached(key, async () => {
    // Search, newest first; restrict to recent entries via PubMed's reldate
    // param (number of days back) so the feed feels current.
    const base = `${EUTILS}/esearch.fcgi?db=pubmed&retmode=json&sort=date&retmax=${retmax}&term=${enc(q)}`;
    let ids;
    try {
      const s = await pmGetJSON(`${base}&datetype=pdat&reldate=${recentDays}`);
      ids = s?.esearchresult?.idlist || [];
    } catch { ids = []; }
    // Fallback without the date filter if nothing came back.
    if (!ids.length) {
      const s2 = await pmGetJSON(base).catch(() => null);
      ids = s2?.esearchresult?.idlist || [];
    }
    if (!ids.length) return [];

    const sum = await pmGetJSON(`${EUTILS}/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(',')}`);
    const r = sum?.result || {};
    return (r.uids || []).map((id) => {
      const a = r[id] || {};
      const authors = (a.authors || []).map((x) => x.name).slice(0, 3).join(', ');
      return {
        id,
        title: a.title || 'Untitled',
        journal: a.fulljournalname || a.source || '',
        date: a.pubdate || a.epubdate || '',
        authors: authors + ((a.authors || []).length > 3 ? ', et al.' : ''),
        type: (a.pubtype || [])[0] || '',
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
      };
    });
  });
}

/* ================================================================== *
 * 4) DRUG FACTS — openFDA drug labeling
 *    Official FDA label: what it's used for + key warnings.
 * ================================================================== */
function firstSentence(text, max = 320) {
  if (!text) return '';
  let clean = String(text).replace(/\s+/g, ' ').trim();
  // Strip the boilerplate section headers FDA labels start with.
  clean = clean
    .replace(/^[\d.\s]*(INDICATIONS?\s+AND\s+USAGE|INDICATIONS?|DOSAGE\s+AND\s+ADMINISTRATION|WARNINGS?(\s+AND\s+PRECAUTIONS?)?|BOXED\s+WARNING|PURPOSE)[:\s-]*/i, '')
    .trim();
  const cut = clean.slice(0, max);
  return cut + (clean.length > max ? '…' : '');
}

export async function fetchDrugLabel(name) {
  const n = name.trim().toLowerCase().replace(/\s*\(.*?\)\s*/g, '').split('/')[0].trim();
  if (!n) return null;
  return cached(`fda:${n}`, async () => {
    const tryUrl = (field) =>
      `https://api.fda.gov/drug/label.json?search=openfda.${field}:"${enc(n)}"&limit=1`;
    try {
      let d = await getJSON(tryUrl('generic_name')).catch(() => null);
      if (!d?.results?.length) d = await getJSON(tryUrl('brand_name')).catch(() => null);
      const r = d?.results?.[0];
      if (!r) return null;
      return {
        usage: firstSentence(r.indications_and_usage?.[0] || r.purpose?.[0] || ''),
        warning: firstSentence(r.warnings?.[0] || r.boxed_warning?.[0] || '', 280),
        generic: r.openfda?.generic_name?.[0] || '',
        brand: r.openfda?.brand_name?.[0] || '',
      };
    } catch {
      return null;
    }
  });
}
