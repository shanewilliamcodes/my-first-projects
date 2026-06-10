/* Merge per-specialty condition files (src/data/conditions/*.json) into
 * src/data/conditions.generated.json, validating shape and uniqueness.
 * Run: npm run conditions
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const srcDir = join(root, '..', 'src', 'data', 'conditions');
const outFile = join(root, '..', 'src', 'data', 'conditions.generated.json');

const SPECIALTIES = [
  'primary-care', 'cardiology', 'endocrinology', 'pulmonology', 'psychiatry',
  'gastroenterology', 'neurology', 'oncology', 'dermatology', 'rheumatology',
  'nephrology', 'urology', 'allergy', 'infectious-disease', 'orthopedics',
  'obgyn', 'ophthalmology', 'ent',
];
const CATEGORIES = new Set([
  'Heart & Circulation', 'Hormones & Metabolism', 'Mental Health',
  'Lungs & Breathing', 'Digestive Health', 'Brain & Nerves', 'Bones & Joints',
  'Cancer', 'Kidneys & Urinary', 'Skin', 'Allergy & Immune', 'Infections',
  'Blood', "Women's Health", "Men's Health", 'Eyes & Vision', 'Ear, Nose & Throat',
]);
// ids that already exist hand-curated in data.js — generated files must not collide
const CURATED_IDS = new Set([
  'hypertension', 'type-2-diabetes', 'high-cholesterol', 'heart-disease', 'asthma',
  'copd', 'depression', 'anxiety', 'hypothyroidism', 'gerd', 'osteoarthritis',
  'rheumatoid-arthritis', 'migraine', 'allergic-rhinitis', 'obesity', 'ckd', 'afib',
  'heart-failure', 'breast-cancer', 'lung-cancer', 'prostate-cancer', 'colorectal-cancer',
  'skin-cancer', 'uti', 'pneumonia', 'covid-19', 'osteoporosis', 'epilepsy', 'alzheimers',
  'parkinsons', 'stroke', 'eczema', 'psoriasis', 'insomnia', 'adhd', 'ibs', 'gout',
  'bph', 'anemia',
]);

const errors = [];
const seen = new Set();
const merged = [];

let files = [];
try {
  files = readdirSync(srcDir).filter((f) => f.endsWith('.json')).sort();
} catch {
  console.error(`No ${srcDir} directory — nothing to merge.`);
  process.exit(1);
}

for (const f of files) {
  let arr;
  try {
    arr = JSON.parse(readFileSync(join(srcDir, f), 'utf8'));
  } catch (e) {
    errors.push(`${f}: invalid JSON — ${e.message}`);
    continue;
  }
  if (!Array.isArray(arr)) { errors.push(`${f}: not an array`); continue; }
  for (const c of arr) {
    const where = `${f} → ${c?.id || '??'}`;
    if (!c.id || !c.name || !c.overview || !c.redFlags || !c.prevalence) {
      errors.push(`${where}: missing core field`); continue;
    }
    if (typeof c.aka !== 'string') c.aka = '';
    if (!SPECIALTIES.includes(c.specialtyId)) { errors.push(`${where}: bad specialtyId "${c.specialtyId}"`); continue; }
    if (!CATEGORIES.has(c.category)) { errors.push(`${where}: bad category "${c.category}"`); continue; }
    if (!Array.isArray(c.symptoms) || c.symptoms.length < 3) { errors.push(`${where}: symptoms too short`); continue; }
    if (!Array.isArray(c.drugs) || c.drugs.length < 2 || c.drugs.length > 6 ||
        c.drugs.some((d) => !d.name || !d.class || !d.note)) {
      errors.push(`${where}: bad drugs array`); continue;
    }
    if (!Array.isArray(c.resources) || c.resources.length < 1 ||
        c.resources.some((r) => !r.label || !/^https:\/\//.test(r.url || ''))) {
      errors.push(`${where}: bad resources`); continue;
    }
    if (seen.has(c.id) || CURATED_IDS.has(c.id)) { errors.push(`${where}: duplicate id`); continue; }
    seen.add(c.id);
    merged.push(c);
  }
}

if (errors.length) {
  console.error(`✗ ${errors.length} problem(s):`);
  for (const e of errors) console.error('  - ' + e);
}
writeFileSync(outFile, JSON.stringify(merged, null, 1));
console.log(`✓ merged ${merged.length} conditions from ${files.length} files → conditions.generated.json`);
process.exit(errors.length ? 1 : 0);
