/* ------------------------------------------------------------------ *
 * Health Explorer — curated reference data
 *
 * Everything here is general, educational information drawn from public
 * health sources (CDC, NIH/MedlinePlus, Mayo Clinic, ClinCalc DrugStats).
 * Prescription counts are approximate U.S. annual figures and are meant
 * for ranking/scale, not precision. NOT medical advice.
 * ------------------------------------------------------------------ */

// Generated condition guides (authored + verified in bulk, merged by
// scripts/merge-conditions.mjs). Combined with the hand-curated set below.
import GENERATED_CONDITIONS from './data/conditions.generated.json';

/* ---------------- specialties ---------------- */
// `treats` is a short plain-English list. `find` is the phrase used when
// the user clicks "Find a provider" (fed into a maps search).
export const SPECIALTIES = [
  { id: 'primary-care', name: 'Primary Care', emoji: '🩺', find: 'primary care doctor',
    blurb: 'Your first stop for almost anything — checkups, common illnesses, screening, and referrals to specialists.',
    treats: ['Annual physicals', 'Colds & flu', 'High blood pressure', 'Diabetes', 'Routine screening'] },
  { id: 'cardiology', name: 'Cardiology', emoji: '❤️', find: 'cardiologist',
    blurb: 'Heart and blood-vessel specialists — rhythm problems, blocked arteries, heart failure, and blood pressure that needs extra help.',
    treats: ['Heart disease', 'Heart failure', 'Atrial fibrillation', 'High blood pressure', 'High cholesterol'] },
  { id: 'endocrinology', name: 'Endocrinology', emoji: '🦋', find: 'endocrinologist',
    blurb: 'Hormone and metabolism specialists — diabetes, thyroid, and bone density.',
    treats: ['Type 2 diabetes', 'Thyroid disorders', 'Osteoporosis', 'Obesity'] },
  { id: 'pulmonology', name: 'Pulmonology', emoji: '🫁', find: 'pulmonologist',
    blurb: 'Lung and breathing specialists — asthma, COPD, and chronic cough.',
    treats: ['Asthma', 'COPD', 'Pneumonia', 'Sleep apnea'] },
  { id: 'psychiatry', name: 'Psychiatry & Mental Health', emoji: '🧠', find: 'psychiatrist',
    blurb: 'Mental-health specialists — mood, anxiety, attention, and sleep, with medication and therapy options.',
    treats: ['Depression', 'Anxiety', 'ADHD', 'Insomnia', 'Bipolar disorder'] },
  { id: 'gastroenterology', name: 'Gastroenterology', emoji: '🥑', find: 'gastroenterologist',
    blurb: 'Digestive-system specialists — reflux, gut disorders, liver, and colon screening.',
    treats: ['Acid reflux (GERD)', 'IBS', 'Colon cancer screening', 'Liver disease'] },
  { id: 'neurology', name: 'Neurology', emoji: '⚡', find: 'neurologist',
    blurb: 'Brain and nervous-system specialists — headaches, seizures, stroke, and memory.',
    treats: ['Migraine', 'Epilepsy', 'Stroke', "Alzheimer's", "Parkinson's"] },
  { id: 'oncology', name: 'Oncology', emoji: '🎗️', find: 'oncologist',
    blurb: 'Cancer specialists — diagnosis, treatment planning, chemotherapy, and survivorship care.',
    treats: ['Breast cancer', 'Lung cancer', 'Prostate cancer', 'Colorectal cancer'] },
  { id: 'dermatology', name: 'Dermatology', emoji: '🧴', find: 'dermatologist',
    blurb: 'Skin, hair, and nail specialists — rashes, acne, skin-cancer checks, and chronic skin conditions.',
    treats: ['Eczema', 'Psoriasis', 'Acne', 'Skin cancer'] },
  { id: 'rheumatology', name: 'Rheumatology', emoji: '🦴', find: 'rheumatologist',
    blurb: 'Joint, muscle, and autoimmune specialists — arthritis and inflammatory disease.',
    treats: ['Rheumatoid arthritis', 'Osteoarthritis', 'Gout', 'Lupus'] },
  { id: 'nephrology', name: 'Nephrology', emoji: '🫘', find: 'nephrologist',
    blurb: 'Kidney specialists — chronic kidney disease, dialysis, and hard-to-control blood pressure.',
    treats: ['Chronic kidney disease', 'Kidney stones', 'Dialysis care'] },
  { id: 'urology', name: 'Urology', emoji: '🚹', find: 'urologist',
    blurb: 'Urinary-tract and male reproductive specialists — prostate, stones, and infections.',
    treats: ['Enlarged prostate (BPH)', 'Urinary tract infections', 'Kidney stones', 'Prostate cancer'] },
  { id: 'allergy', name: 'Allergy & Immunology', emoji: '🤧', find: 'allergist',
    blurb: 'Allergy and immune-system specialists — seasonal allergies, food allergy, and asthma overlap.',
    treats: ['Allergic rhinitis', 'Food allergies', 'Asthma', 'Eczema'] },
  { id: 'infectious-disease', name: 'Infectious Disease', emoji: '🦠', find: 'infectious disease doctor',
    blurb: 'Specialists in infections — complex or persistent illness from bacteria, viruses, and fungi.',
    treats: ['COVID-19', 'Pneumonia', 'HIV', 'Hard-to-treat infections'] },
  { id: 'orthopedics', name: 'Orthopedics', emoji: '🦵', find: 'orthopedic doctor',
    blurb: 'Bone, joint, and muscle specialists — injuries, joint replacement, and back problems.',
    treats: ['Osteoarthritis', 'Fractures', 'Back pain', 'Sports injuries'] },
  { id: 'obgyn', name: 'OB/GYN', emoji: '🌸', find: 'OB-GYN',
    blurb: "Women's reproductive-health specialists — pregnancy, contraception, and gynecologic care.",
    treats: ['Pregnancy care', 'Contraception', 'Menopause', 'Pelvic health'] },
  { id: 'ophthalmology', name: 'Ophthalmology', emoji: '👁️', find: 'eye doctor (ophthalmologist)',
    blurb: 'Eye specialists — vision, glaucoma, cataracts, and diabetic eye disease.',
    treats: ['Glaucoma', 'Cataracts', 'Diabetic eye disease', 'Macular degeneration'] },
  { id: 'ent', name: 'ENT (Ear, Nose & Throat)', emoji: '👂', find: 'ENT doctor',
    blurb: 'Specialists for the ear, nose, throat, sinuses, and related head/neck conditions.',
    treats: ['Sinus infections', 'Hearing loss', 'Tonsillitis', 'Sleep apnea'] },
];

/* ---------------- conditions ---------------- *
 * Each condition:
 *  id, name, aka, specialtyId, category, prevalence,
 *  overview, symptoms[], drugs[] (RANKED — most common first;
 *    each {name, class, note}), redFlags (when to seek urgent care),
 *  resources[] {label, url}
 */
const CURATED_CONDITIONS = [
  {
    id: 'hypertension',
    name: 'High Blood Pressure',
    aka: 'Hypertension',
    specialtyId: 'cardiology',
    category: 'Heart & Circulation',
    prevalence: '~48% of U.S. adults (≈120 million)',
    overview:
      'Blood pressure is the force of blood pushing against artery walls. When it stays high over time, it quietly strains the heart, kidneys, and brain — raising the risk of heart attack and stroke. It usually causes no symptoms, which is why it’s called a “silent” condition and why regular checks matter.',
    symptoms: ['Usually none', 'Sometimes headaches or dizziness when very high', 'Found on a routine blood-pressure check'],
    drugs: [
      { name: 'Lisinopril', class: 'ACE inhibitor', note: 'Common first-choice; relaxes blood vessels.' },
      { name: 'Amlodipine', class: 'Calcium channel blocker', note: 'Widely used, well tolerated.' },
      { name: 'Losartan', class: 'ARB', note: 'Alternative to ACE inhibitors if cough develops.' },
      { name: 'Hydrochlorothiazide', class: 'Thiazide diuretic', note: '“Water pill” that lowers fluid volume.' },
      { name: 'Metoprolol', class: 'Beta blocker', note: 'Often added when heart rate or heart disease is involved.' },
    ],
    redFlags: 'A reading of 180/120 or higher with chest pain, shortness of breath, vision change, or weakness is an emergency — call 911.',
    resources: [
      { label: 'CDC — High Blood Pressure', url: 'https://www.cdc.gov/high-blood-pressure/' },
      { label: 'American Heart Association', url: 'https://www.heart.org/en/health-topics/high-blood-pressure' },
    ],
  },
  {
    id: 'type-2-diabetes',
    name: 'Type 2 Diabetes',
    aka: 'Diabetes mellitus type 2',
    specialtyId: 'endocrinology',
    category: 'Hormones & Metabolism',
    prevalence: '~38 million Americans (about 1 in 10)',
    overview:
      'In type 2 diabetes the body either resists insulin or doesn’t make enough of it, so blood sugar runs high. Over years, high sugar damages blood vessels and nerves. It’s strongly tied to weight, activity, and genetics, and is often managed with lifestyle changes plus medication.',
    symptoms: ['Increased thirst and urination', 'Fatigue', 'Blurred vision', 'Slow-healing cuts', 'Often none early on'],
    drugs: [
      { name: 'Metformin', class: 'Biguanide', note: 'Standard first-line; lowers sugar production in the liver.' },
      { name: 'Semaglutide (Ozempic/Wegovy)', class: 'GLP-1 agonist', note: 'Injectable; also aids weight loss.' },
      { name: 'Empagliflozin (Jardiance)', class: 'SGLT2 inhibitor', note: 'Also protects heart and kidneys.' },
      { name: 'Glipizide', class: 'Sulfonylurea', note: 'Older, inexpensive; can cause low blood sugar.' },
      { name: 'Insulin (various)', class: 'Hormone', note: 'Used when other drugs aren’t enough.' },
    ],
    redFlags: 'Confusion, fruity breath, vomiting, or very high sugar with deep rapid breathing needs emergency care.',
    resources: [
      { label: 'CDC — Diabetes', url: 'https://www.cdc.gov/diabetes/' },
      { label: 'American Diabetes Association', url: 'https://diabetes.org/' },
    ],
  },
  {
    id: 'high-cholesterol',
    name: 'High Cholesterol',
    aka: 'Hyperlipidemia',
    specialtyId: 'cardiology',
    category: 'Heart & Circulation',
    prevalence: '~86 million U.S. adults have elevated levels',
    overview:
      'Cholesterol is a waxy fat in the blood. Too much “LDL” cholesterol builds up as plaque inside arteries, narrowing them and raising the risk of heart attack and stroke. Like high blood pressure, it usually has no symptoms and is found through a blood test.',
    symptoms: ['No symptoms', 'Detected on a cholesterol (lipid) blood panel'],
    drugs: [
      { name: 'Atorvastatin (Lipitor)', class: 'Statin', note: 'Most-prescribed cholesterol drug in the U.S.' },
      { name: 'Rosuvastatin (Crestor)', class: 'Statin', note: 'Strong LDL-lowering option.' },
      { name: 'Simvastatin', class: 'Statin', note: 'Older, inexpensive statin.' },
      { name: 'Ezetimibe (Zetia)', class: 'Absorption inhibitor', note: 'Added when a statin alone isn’t enough.' },
      { name: 'PCSK9 inhibitors (Repatha)', class: 'Injectable antibody', note: 'For very high risk or statin intolerance.' },
    ],
    redFlags: 'Cholesterol itself isn’t an emergency, but sudden chest pain or stroke symptoms always are — call 911.',
    resources: [
      { label: 'CDC — Cholesterol', url: 'https://www.cdc.gov/cholesterol/' },
      { label: 'MedlinePlus — Cholesterol', url: 'https://medlineplus.gov/cholesterol.html' },
    ],
  },
  {
    id: 'heart-disease',
    name: 'Coronary Heart Disease',
    aka: 'Coronary artery disease, CAD',
    specialtyId: 'cardiology',
    category: 'Heart & Circulation',
    prevalence: 'Leading cause of death in the U.S. (~20 million adults)',
    overview:
      'Coronary heart disease is the build-up of plaque in the arteries that feed the heart muscle. When flow is reduced it causes chest pain (angina); a full blockage causes a heart attack. Risk factors include high blood pressure, high cholesterol, smoking, diabetes, and family history.',
    symptoms: ['Chest pressure or pain, often with exertion', 'Shortness of breath', 'Pain in arm, jaw, or back', 'Fatigue'],
    drugs: [
      { name: 'Aspirin (low-dose)', class: 'Antiplatelet', note: 'Helps prevent clots in established disease.' },
      { name: 'Atorvastatin', class: 'Statin', note: 'Lowers cholesterol and stabilizes plaque.' },
      { name: 'Metoprolol', class: 'Beta blocker', note: 'Eases the heart’s workload.' },
      { name: 'Lisinopril', class: 'ACE inhibitor', note: 'Protects the heart and lowers pressure.' },
      { name: 'Nitroglycerin', class: 'Nitrate', note: 'Relieves angina (chest pain) quickly.' },
    ],
    redFlags: 'Chest pain lasting more than a few minutes, especially with sweating, nausea, or arm/jaw pain — call 911 immediately.',
    resources: [
      { label: 'CDC — Heart Disease', url: 'https://www.cdc.gov/heart-disease/' },
      { label: 'American Heart Association', url: 'https://www.heart.org/' },
    ],
  },
  {
    id: 'asthma',
    name: 'Asthma',
    aka: 'Reactive airway disease',
    specialtyId: 'pulmonology',
    category: 'Lungs & Breathing',
    prevalence: '~25 million Americans (1 in 13)',
    overview:
      'Asthma is a long-term condition where the airways become inflamed and narrow in response to triggers like allergens, cold air, or exercise. This causes wheezing and trouble breathing. It’s very treatable, and most people control it well with the right inhalers.',
    symptoms: ['Wheezing', 'Shortness of breath', 'Chest tightness', 'Coughing, often at night'],
    drugs: [
      { name: 'Albuterol', class: 'Short-acting bronchodilator', note: '“Rescue” inhaler for quick relief.' },
      { name: 'Fluticasone', class: 'Inhaled steroid', note: 'Daily “controller” that reduces inflammation.' },
      { name: 'Fluticasone/Salmeterol (Advair)', class: 'Steroid + long-acting combo', note: 'Two-in-one daily controller.' },
      { name: 'Montelukast (Singulair)', class: 'Leukotriene blocker', note: 'Oral pill, helpful with allergies.' },
      { name: 'Budesonide', class: 'Inhaled steroid', note: 'Another common controller inhaler.' },
    ],
    redFlags: 'A rescue inhaler that isn’t working, lips/fingertips turning blue, or struggling to speak full sentences — call 911.',
    resources: [
      { label: 'CDC — Asthma', url: 'https://www.cdc.gov/asthma/' },
      { label: 'MedlinePlus — Asthma', url: 'https://medlineplus.gov/asthma.html' },
    ],
  },
  {
    id: 'copd',
    name: 'COPD',
    aka: 'Chronic obstructive pulmonary disease, emphysema',
    specialtyId: 'pulmonology',
    category: 'Lungs & Breathing',
    prevalence: '~15 million diagnosed U.S. adults',
    overview:
      'COPD is long-term lung damage — usually from smoking — that makes it hard to move air out of the lungs. It includes emphysema and chronic bronchitis. Damage can’t be reversed, but quitting smoking and the right inhalers slow it down and ease breathing.',
    symptoms: ['Ongoing cough, often with mucus', 'Shortness of breath that worsens over time', 'Wheezing', 'Frequent chest infections'],
    drugs: [
      { name: 'Tiotropium (Spiriva)', class: 'Long-acting bronchodilator', note: 'Daily inhaler that keeps airways open.' },
      { name: 'Albuterol', class: 'Short-acting bronchodilator', note: 'Quick relief of flare-ups.' },
      { name: 'Fluticasone/Salmeterol', class: 'Steroid + bronchodilator', note: 'Combination inhaler for frequent flares.' },
      { name: 'Roflumilast', class: 'PDE-4 inhibitor', note: 'Pill that reduces severe flare-ups.' },
      { name: 'Prednisone', class: 'Oral steroid', note: 'Short courses during flare-ups.' },
    ],
    redFlags: 'Severe breathlessness, blue lips, confusion, or a flare that rescue inhalers don’t relieve — seek emergency care.',
    resources: [
      { label: 'CDC — COPD', url: 'https://www.cdc.gov/copd/' },
      { label: 'American Lung Association', url: 'https://www.lung.org/lung-health-diseases/lung-disease-lookup/copd' },
    ],
  },
  {
    id: 'depression',
    name: 'Depression',
    aka: 'Major depressive disorder',
    specialtyId: 'psychiatry',
    category: 'Mental Health',
    prevalence: '~21 million U.S. adults each year',
    overview:
      'Depression is more than feeling down — it’s a persistent low mood or loss of interest that interferes with daily life for weeks or longer. It’s a real medical condition involving brain chemistry, stress, and genetics, and it responds well to therapy, medication, or both.',
    symptoms: ['Persistent sadness or emptiness', 'Loss of interest or pleasure', 'Sleep and appetite changes', 'Fatigue', 'Trouble concentrating'],
    drugs: [
      { name: 'Sertraline (Zoloft)', class: 'SSRI', note: 'Common first-choice antidepressant.' },
      { name: 'Escitalopram (Lexapro)', class: 'SSRI', note: 'Well tolerated; also helps anxiety.' },
      { name: 'Bupropion (Wellbutrin)', class: 'NDRI', note: 'Less sexual side effect; can boost energy.' },
      { name: 'Fluoxetine (Prozac)', class: 'SSRI', note: 'Long-acting, widely used.' },
      { name: 'Duloxetine (Cymbalta)', class: 'SNRI', note: 'Helps when pain accompanies depression.' },
    ],
    redFlags: 'Thoughts of suicide or self-harm — call or text 988 (Suicide & Crisis Lifeline) any time, or 911 if someone is in danger.',
    resources: [
      { label: 'NIMH — Depression', url: 'https://www.nimh.nih.gov/health/topics/depression' },
      { label: '988 Suicide & Crisis Lifeline', url: 'https://988lifeline.org/' },
    ],
  },
  {
    id: 'anxiety',
    name: 'Anxiety Disorders',
    aka: 'Generalized anxiety, panic disorder',
    specialtyId: 'psychiatry',
    category: 'Mental Health',
    prevalence: '~40 million U.S. adults — the most common mental-health condition',
    overview:
      'Anxiety disorders involve excessive worry or fear that is hard to control and out of proportion to the situation. It can show up physically — racing heart, restlessness, trouble sleeping. Therapy (especially CBT) and medication are both very effective.',
    symptoms: ['Excessive worry', 'Restlessness or feeling on edge', 'Racing heart', 'Trouble sleeping', 'Difficulty concentrating'],
    drugs: [
      { name: 'Escitalopram (Lexapro)', class: 'SSRI', note: 'Common first-line for ongoing anxiety.' },
      { name: 'Sertraline (Zoloft)', class: 'SSRI', note: 'Also treats panic disorder.' },
      { name: 'Buspirone', class: 'Anti-anxiety', note: 'Non-sedating, non-habit-forming.' },
      { name: 'Venlafaxine (Effexor)', class: 'SNRI', note: 'Alternative for generalized anxiety.' },
      { name: 'Alprazolam (Xanax)', class: 'Benzodiazepine', note: 'Fast relief but habit-forming — short-term only.' },
    ],
    redFlags: 'Chest pain or a first-ever panic attack can mimic a heart problem — when in doubt, get checked. For crisis thoughts, call/text 988.',
    resources: [
      { label: 'NIMH — Anxiety Disorders', url: 'https://www.nimh.nih.gov/health/topics/anxiety-disorders' },
      { label: 'Anxiety & Depression Assoc.', url: 'https://adaa.org/' },
    ],
  },
  {
    id: 'hypothyroidism',
    name: 'Hypothyroidism',
    aka: 'Underactive thyroid',
    specialtyId: 'endocrinology',
    category: 'Hormones & Metabolism',
    prevalence: '~5 in 100 Americans over age 12',
    overview:
      'The thyroid is a small gland in the neck that sets the body’s “speed.” When it’s underactive it makes too little hormone, slowing metabolism. It’s easy to diagnose with a blood test and is treated by replacing the missing hormone with a daily pill.',
    symptoms: ['Fatigue', 'Weight gain', 'Feeling cold', 'Dry skin and hair', 'Constipation', 'Low mood'],
    drugs: [
      { name: 'Levothyroxine (Synthroid)', class: 'Thyroid hormone', note: 'Standard treatment; one of the most-prescribed U.S. drugs.' },
      { name: 'Liothyronine (T3)', class: 'Thyroid hormone', note: 'Sometimes added to levothyroxine.' },
      { name: 'Desiccated thyroid (Armour)', class: 'Natural thyroid extract', note: 'Alternative some patients prefer.' },
    ],
    redFlags: 'Rare but serious: extreme cold, confusion, and sleepiness (myxedema) needs emergency care.',
    resources: [
      { label: 'NIDDK — Hypothyroidism', url: 'https://www.niddk.nih.gov/health-information/endocrine-diseases/hypothyroidism' },
      { label: 'American Thyroid Association', url: 'https://www.thyroid.org/' },
    ],
  },
  {
    id: 'gerd',
    name: 'Acid Reflux (GERD)',
    aka: 'Gastroesophageal reflux disease, heartburn',
    specialtyId: 'gastroenterology',
    category: 'Digestive Health',
    prevalence: '~20% of U.S. adults',
    overview:
      'GERD is when stomach acid repeatedly flows back up into the esophagus, causing heartburn and irritation. Occasional reflux is normal; frequent reflux can damage the esophagus over time. Diet changes, weight loss, and acid-reducing medicine usually control it well.',
    symptoms: ['Burning chest discomfort (heartburn)', 'Sour taste or regurgitation', 'Trouble swallowing', 'Worse when lying down'],
    drugs: [
      { name: 'Omeprazole (Prilosec)', class: 'Proton pump inhibitor', note: 'Strongly reduces stomach acid; available OTC.' },
      { name: 'Pantoprazole (Protonix)', class: 'Proton pump inhibitor', note: 'Common prescription option.' },
      { name: 'Famotidine (Pepcid)', class: 'H2 blocker', note: 'Milder acid reducer for as-needed use.' },
      { name: 'Esomeprazole (Nexium)', class: 'Proton pump inhibitor', note: 'Another widely used PPI.' },
      { name: 'Antacids (Tums)', class: 'Acid neutralizer', note: 'Fast, short-term relief.' },
    ],
    redFlags: 'Trouble swallowing, vomiting blood, black stools, or unexplained weight loss needs prompt evaluation.',
    resources: [
      { label: 'NIDDK — GERD', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/acid-reflux-ger-gerd-adults' },
      { label: 'MedlinePlus — GERD', url: 'https://medlineplus.gov/gerd.html' },
    ],
  },
  {
    id: 'osteoarthritis',
    name: 'Osteoarthritis',
    aka: 'Degenerative joint disease, “wear-and-tear” arthritis',
    specialtyId: 'orthopedics',
    category: 'Bones & Joints',
    prevalence: '~33 million U.S. adults — the most common form of arthritis',
    overview:
      'Osteoarthritis is the gradual breakdown of cartilage, the cushion at the ends of bones. Without it, joints become stiff and painful, especially the knees, hips, and hands. It’s linked to age, prior injury, and weight. Treatment focuses on pain relief, movement, and protecting the joint.',
    symptoms: ['Joint pain with use', 'Stiffness, worse in the morning', 'Reduced range of motion', 'Grinding or clicking'],
    drugs: [
      { name: 'Acetaminophen (Tylenol)', class: 'Pain reliever', note: 'Gentle first-line for mild pain.' },
      { name: 'Ibuprofen', class: 'NSAID', note: 'Reduces pain and inflammation.' },
      { name: 'Naproxen (Aleve)', class: 'NSAID', note: 'Longer-acting anti-inflammatory.' },
      { name: 'Diclofenac gel', class: 'Topical NSAID', note: 'Rubbed on the joint, fewer body-wide effects.' },
      { name: 'Corticosteroid injections', class: 'Steroid', note: 'Given in-office for stubborn joints.' },
    ],
    redFlags: 'A hot, red, swollen joint with fever could be infection — seek care promptly.',
    resources: [
      { label: 'CDC — Osteoarthritis', url: 'https://www.cdc.gov/arthritis/types/osteoarthritis.htm' },
      { label: 'Arthritis Foundation', url: 'https://www.arthritis.org/' },
    ],
  },
  {
    id: 'rheumatoid-arthritis',
    name: 'Rheumatoid Arthritis',
    aka: 'RA',
    specialtyId: 'rheumatology',
    category: 'Bones & Joints',
    prevalence: '~1.3 million U.S. adults',
    overview:
      'Rheumatoid arthritis is an autoimmune disease — the immune system mistakenly attacks the lining of the joints, causing inflammation, pain, and over time joint damage. Unlike osteoarthritis it often affects joints symmetrically. Early treatment with modern drugs can prevent much of the damage.',
    symptoms: ['Symmetric joint pain and swelling', 'Morning stiffness lasting over an hour', 'Fatigue', 'Often hands, wrists, and feet'],
    drugs: [
      { name: 'Methotrexate', class: 'DMARD', note: 'Cornerstone treatment that slows the disease.' },
      { name: 'Hydroxychloroquine', class: 'DMARD', note: 'Often combined with methotrexate.' },
      { name: 'Adalimumab (Humira)', class: 'Biologic (TNF blocker)', note: 'Injectable for moderate-to-severe RA.' },
      { name: 'Etanercept (Enbrel)', class: 'Biologic (TNF blocker)', note: 'Another widely used biologic.' },
      { name: 'Prednisone', class: 'Steroid', note: 'Short-term control of flares.' },
    ],
    redFlags: 'Sudden severe joint swelling with fever, or signs of infection while on immune-suppressing drugs, needs prompt care.',
    resources: [
      { label: 'NIAMS — Rheumatoid Arthritis', url: 'https://www.niams.nih.gov/health-topics/rheumatoid-arthritis' },
      { label: 'Arthritis Foundation', url: 'https://www.arthritis.org/diseases/rheumatoid-arthritis' },
    ],
  },
  {
    id: 'migraine',
    name: 'Migraine',
    aka: 'Migraine headache',
    specialtyId: 'neurology',
    category: 'Brain & Nerves',
    prevalence: '~39 million Americans',
    overview:
      'A migraine is far more than a bad headache — it’s a neurological event causing intense, often one-sided throbbing pain, frequently with nausea and sensitivity to light and sound. Attacks can last hours to days. Some medicines stop an attack; others, taken daily, prevent them.',
    symptoms: ['Throbbing, often one-sided head pain', 'Nausea or vomiting', 'Sensitivity to light and sound', 'Visual “aura” in some people'],
    drugs: [
      { name: 'Sumatriptan (Imitrex)', class: 'Triptan', note: 'Stops an attack in progress.' },
      { name: 'Ibuprofen / Naproxen', class: 'NSAID', note: 'Helps mild-to-moderate attacks.' },
      { name: 'Rizatriptan (Maxalt)', class: 'Triptan', note: 'Fast-acting attack reliever.' },
      { name: 'Propranolol', class: 'Beta blocker', note: 'Taken daily to prevent migraines.' },
      { name: 'CGRP blockers (Aimovig, Nurtec)', class: 'Newer preventive', note: 'Monthly injection or pill for frequent migraine.' },
    ],
    redFlags: '“The worst headache of your life,” a sudden thunderclap headache, or headache with weakness, confusion, or stiff neck — call 911.',
    resources: [
      { label: 'NINDS — Migraine', url: 'https://www.ninds.nih.gov/health-information/disorders/migraine' },
      { label: 'American Migraine Foundation', url: 'https://americanmigrainefoundation.org/' },
    ],
  },
  {
    id: 'allergic-rhinitis',
    name: 'Seasonal Allergies',
    aka: 'Allergic rhinitis, hay fever',
    specialtyId: 'allergy',
    category: 'Allergy & Immune',
    prevalence: '~25% of U.S. adults',
    overview:
      'Allergic rhinitis is the immune system overreacting to harmless things like pollen, dust, or pet dander, releasing histamine that inflames the nose and eyes. It’s very common and rarely dangerous, but it can significantly affect sleep and quality of life. Many effective treatments are available over the counter.',
    symptoms: ['Sneezing', 'Runny or stuffy nose', 'Itchy, watery eyes', 'Postnasal drip'],
    drugs: [
      { name: 'Loratadine (Claritin)', class: 'Antihistamine', note: 'Non-drowsy daily allergy pill (OTC).' },
      { name: 'Cetirizine (Zyrtec)', class: 'Antihistamine', note: 'Effective, mildly sedating for some.' },
      { name: 'Fluticasone nasal (Flonase)', class: 'Nasal steroid spray', note: 'Best for nasal congestion (OTC).' },
      { name: 'Fexofenadine (Allegra)', class: 'Antihistamine', note: 'Non-drowsy alternative.' },
      { name: 'Montelukast (Singulair)', class: 'Leukotriene blocker', note: 'Prescription option, helps asthma overlap.' },
    ],
    redFlags: 'Trouble breathing, throat swelling, or hives after a sting/food may be anaphylaxis — use epinephrine and call 911.',
    resources: [
      { label: 'AAAAI — Allergic Rhinitis', url: 'https://www.aaaai.org/conditions-treatments/allergies/rhinitis' },
      { label: 'MedlinePlus — Hay Fever', url: 'https://medlineplus.gov/hayfever.html' },
    ],
  },
  {
    id: 'obesity',
    name: 'Obesity',
    aka: 'Overweight, high BMI',
    specialtyId: 'endocrinology',
    category: 'Hormones & Metabolism',
    prevalence: '~42% of U.S. adults',
    overview:
      'Obesity is excess body fat that raises the risk of diabetes, heart disease, joint problems, and more. It’s recognized as a chronic medical condition shaped by genetics, environment, and metabolism — not simply willpower. Treatment spans nutrition, activity, newer medications, and sometimes surgery.',
    symptoms: ['Higher body-mass index (BMI ≥ 30)', 'Often tied to high blood pressure, blood sugar, or cholesterol', 'Joint strain', 'Sleep apnea'],
    drugs: [
      { name: 'Semaglutide (Wegovy)', class: 'GLP-1 agonist', note: 'Weekly injection with strong weight-loss results.' },
      { name: 'Tirzepatide (Zepbound)', class: 'GIP/GLP-1 agonist', note: 'Newer dual-action weekly injection.' },
      { name: 'Phentermine', class: 'Appetite suppressant', note: 'Short-term use.' },
      { name: 'Naltrexone/Bupropion (Contrave)', class: 'Combination pill', note: 'Reduces appetite and cravings.' },
      { name: 'Orlistat (Alli)', class: 'Fat-absorption blocker', note: 'OTC option; blocks dietary fat.' },
    ],
    redFlags: 'Obesity itself isn’t an emergency, but chest pain, severe breathlessness, or fainting always warrant urgent care.',
    resources: [
      { label: 'CDC — Obesity', url: 'https://www.cdc.gov/obesity/' },
      { label: 'NIDDK — Weight Management', url: 'https://www.niddk.nih.gov/health-information/weight-management' },
    ],
  },
  {
    id: 'ckd',
    name: 'Chronic Kidney Disease',
    aka: 'CKD',
    specialtyId: 'nephrology',
    category: 'Kidneys & Urinary',
    prevalence: '~35 million U.S. adults (1 in 7), many undiagnosed',
    overview:
      'The kidneys filter waste and extra fluid from the blood. In chronic kidney disease they slowly lose that ability, usually because of diabetes or high blood pressure. It often has no early symptoms and is found through blood and urine tests. Slowing it down protects against kidney failure.',
    symptoms: ['Often none early', 'Swelling in legs or feet', 'Fatigue', 'Foamy urine', 'Found on blood/urine tests'],
    drugs: [
      { name: 'Lisinopril / Losartan', class: 'ACE inhibitor / ARB', note: 'Protect the kidneys and lower pressure.' },
      { name: 'Empagliflozin (Jardiance)', class: 'SGLT2 inhibitor', note: 'Shown to slow kidney decline.' },
      { name: 'Furosemide (Lasix)', class: 'Diuretic', note: 'Removes excess fluid and swelling.' },
      { name: 'Sodium bicarbonate', class: 'Alkalinizer', note: 'Corrects acid buildup in the blood.' },
      { name: 'Phosphate binders', class: 'Mineral binder', note: 'Used in advanced disease.' },
    ],
    redFlags: 'Little or no urine, severe swelling, confusion, or trouble breathing needs emergency care.',
    resources: [
      { label: 'CDC — Chronic Kidney Disease', url: 'https://www.cdc.gov/kidney-disease/' },
      { label: 'National Kidney Foundation', url: 'https://www.kidney.org/' },
    ],
  },
  {
    id: 'afib',
    name: 'Atrial Fibrillation',
    aka: 'AFib, irregular heartbeat',
    specialtyId: 'cardiology',
    category: 'Heart & Circulation',
    prevalence: '~6 million Americans',
    overview:
      'AFib is the most common irregular heart rhythm — the upper chambers quiver instead of beating steadily. This can cause palpitations and, importantly, lets blood pool and form clots that may cause a stroke. Treatment controls the rhythm or rate and prevents clots.',
    symptoms: ['Fluttering or racing heartbeat', 'Fatigue', 'Shortness of breath', 'Dizziness', 'Sometimes no symptoms'],
    drugs: [
      { name: 'Apixaban (Eliquis)', class: 'Blood thinner (DOAC)', note: 'Prevents stroke-causing clots.' },
      { name: 'Rivaroxaban (Xarelto)', class: 'Blood thinner (DOAC)', note: 'Once-daily clot prevention.' },
      { name: 'Metoprolol', class: 'Beta blocker', note: 'Slows a fast heart rate.' },
      { name: 'Diltiazem', class: 'Calcium channel blocker', note: 'Another rate-control option.' },
      { name: 'Warfarin', class: 'Blood thinner', note: 'Older thinner needing regular blood tests.' },
    ],
    redFlags: 'Fainting, chest pain, or stroke signs (face droop, arm weakness, slurred speech) — call 911.',
    resources: [
      { label: 'CDC — Atrial Fibrillation', url: 'https://www.cdc.gov/heart-disease/about/atrial-fibrillation.html' },
      { label: 'American Heart Association — AFib', url: 'https://www.heart.org/en/health-topics/atrial-fibrillation' },
    ],
  },
  {
    id: 'heart-failure',
    name: 'Heart Failure',
    aka: 'Congestive heart failure, CHF',
    specialtyId: 'cardiology',
    category: 'Heart & Circulation',
    prevalence: '~6.7 million U.S. adults',
    overview:
      'Heart failure doesn’t mean the heart has stopped — it means it can’t pump as well as it should, so fluid backs up in the lungs and legs. It’s usually caused by prior heart attacks, high blood pressure, or valve problems. Modern medication combinations greatly improve symptoms and survival.',
    symptoms: ['Shortness of breath, worse lying flat', 'Swelling in legs, ankles, or belly', 'Fatigue', 'Rapid weight gain from fluid'],
    drugs: [
      { name: 'Lisinopril / Sacubitril-valsartan (Entresto)', class: 'ACE inhibitor / ARNI', note: 'Foundational therapy.' },
      { name: 'Carvedilol / Metoprolol', class: 'Beta blocker', note: 'Improves long-term heart function.' },
      { name: 'Furosemide (Lasix)', class: 'Diuretic', note: 'Removes fluid to ease breathing.' },
      { name: 'Spironolactone', class: 'Aldosterone blocker', note: 'Improves survival in heart failure.' },
      { name: 'Dapagliflozin (Farxiga)', class: 'SGLT2 inhibitor', note: 'Now a core heart-failure medicine.' },
    ],
    redFlags: 'Severe breathlessness, gaining several pounds in a day or two, or chest pain — seek urgent care.',
    resources: [
      { label: 'CDC — Heart Failure', url: 'https://www.cdc.gov/heart-disease/about/heart-failure.html' },
      { label: 'American Heart Association', url: 'https://www.heart.org/en/health-topics/heart-failure' },
    ],
  },
  {
    id: 'breast-cancer',
    name: 'Breast Cancer',
    aka: '',
    specialtyId: 'oncology',
    category: 'Cancer',
    prevalence: '~300,000 new U.S. cases each year — most common cancer in women',
    overview:
      'Breast cancer is the uncontrolled growth of cells in the breast. Caught early through screening (mammograms), it’s highly treatable. Treatment depends on the tumor type and may combine surgery, radiation, and medicines targeted to the cancer’s biology. Survival has improved dramatically over recent decades.',
    symptoms: ['A new lump in the breast or underarm', 'Change in breast size or shape', 'Skin dimpling or nipple change', 'Often found on a screening mammogram before symptoms'],
    drugs: [
      { name: 'Tamoxifen', class: 'Hormone therapy', note: 'Blocks estrogen in hormone-driven cancers.' },
      { name: 'Anastrozole / Letrozole', class: 'Aromatase inhibitor', note: 'Lowers estrogen after menopause.' },
      { name: 'Trastuzumab (Herceptin)', class: 'Targeted antibody', note: 'For HER2-positive cancers.' },
      { name: 'Palbociclib (Ibrance)', class: 'CDK4/6 inhibitor', note: 'For advanced hormone-positive cancer.' },
      { name: 'Chemotherapy (various)', class: 'Cytotoxic', note: 'Used based on stage and tumor type.' },
    ],
    redFlags: 'Any new breast lump, skin change, or nipple discharge should be evaluated — don’t wait for a screening.',
    resources: [
      { label: 'CDC — Breast Cancer', url: 'https://www.cdc.gov/breast-cancer/' },
      { label: 'American Cancer Society', url: 'https://www.cancer.org/cancer/types/breast-cancer.html' },
    ],
  },
  {
    id: 'lung-cancer',
    name: 'Lung Cancer',
    aka: '',
    specialtyId: 'oncology',
    category: 'Cancer',
    prevalence: '~235,000 new U.S. cases yearly — leading cause of cancer death',
    overview:
      'Lung cancer begins in the lungs, most often linked to smoking but also occurring in non-smokers. Because early lung cancer rarely causes symptoms, screening with low-dose CT scans for high-risk people saves lives. Targeted therapies and immunotherapy have transformed treatment in recent years.',
    symptoms: ['Persistent cough or change in a chronic cough', 'Coughing up blood', 'Chest pain', 'Shortness of breath', 'Unexplained weight loss'],
    drugs: [
      { name: 'Pembrolizumab (Keytruda)', class: 'Immunotherapy', note: 'Helps the immune system attack the cancer.' },
      { name: 'Osimertinib (Tagrisso)', class: 'Targeted therapy', note: 'For EGFR-mutated tumors.' },
      { name: 'Carboplatin + Pemetrexed', class: 'Chemotherapy', note: 'Common chemo combination.' },
      { name: 'Alectinib', class: 'Targeted therapy', note: 'For ALK-positive tumors.' },
      { name: 'Atezolizumab (Tecentriq)', class: 'Immunotherapy', note: 'Another immune-checkpoint option.' },
    ],
    redFlags: 'Coughing up blood, severe breathlessness, or chest pain needs prompt evaluation.',
    resources: [
      { label: 'CDC — Lung Cancer', url: 'https://www.cdc.gov/lung-cancer/' },
      { label: 'American Cancer Society', url: 'https://www.cancer.org/cancer/types/lung-cancer.html' },
    ],
  },
  {
    id: 'prostate-cancer',
    name: 'Prostate Cancer',
    aka: '',
    specialtyId: 'urology',
    category: 'Cancer',
    prevalence: '~300,000 new U.S. cases yearly — most common cancer in men',
    overview:
      'Prostate cancer grows in the prostate, a gland below the bladder in men. Many cases grow slowly and may only need monitoring (“active surveillance”), while others need treatment. A PSA blood test and exam help detect it. Most men diagnosed with it live a long time.',
    symptoms: ['Often none early', 'Trouble urinating or weak stream', 'Frequent nighttime urination', 'Blood in urine or semen', 'Found via PSA test'],
    drugs: [
      { name: 'Leuprolide (Lupron)', class: 'Hormone therapy', note: 'Lowers testosterone that fuels the cancer.' },
      { name: 'Enzalutamide (Xtandi)', class: 'Anti-androgen', note: 'Blocks hormone signaling in advanced disease.' },
      { name: 'Abiraterone (Zytiga)', class: 'Hormone synthesis blocker', note: 'For advanced prostate cancer.' },
      { name: 'Docetaxel', class: 'Chemotherapy', note: 'Used in advanced cases.' },
      { name: 'Bicalutamide', class: 'Anti-androgen', note: 'Often combined with other hormone therapy.' },
    ],
    redFlags: 'Inability to urinate, blood in the urine, or severe bone pain warrants prompt care.',
    resources: [
      { label: 'CDC — Prostate Cancer', url: 'https://www.cdc.gov/prostate-cancer/' },
      { label: 'American Cancer Society', url: 'https://www.cancer.org/cancer/types/prostate-cancer.html' },
    ],
  },
  {
    id: 'colorectal-cancer',
    name: 'Colorectal Cancer',
    aka: 'Colon cancer, bowel cancer',
    specialtyId: 'oncology',
    category: 'Cancer',
    prevalence: '~150,000 new U.S. cases each year',
    overview:
      'Colorectal cancer starts in the colon or rectum, usually from precancerous growths called polyps. Screening (such as a colonoscopy starting at age 45) can find and remove polyps before they turn into cancer, making this one of the most preventable cancers. Caught early, it’s very treatable.',
    symptoms: ['Change in bowel habits', 'Blood in the stool', 'Abdominal pain or cramping', 'Unexplained weight loss', 'Often none early — screening matters'],
    drugs: [
      { name: 'FOLFOX (oxaliplatin-based)', class: 'Chemotherapy', note: 'Common combination regimen.' },
      { name: 'Capecitabine', class: 'Oral chemotherapy', note: 'Pill form of 5-FU chemo.' },
      { name: 'Bevacizumab (Avastin)', class: 'Targeted therapy', note: 'Blocks the tumor’s blood supply.' },
      { name: 'Cetuximab', class: 'Targeted antibody', note: 'For certain tumor genetics.' },
      { name: 'Pembrolizumab', class: 'Immunotherapy', note: 'For specific (MSI-high) tumors.' },
    ],
    redFlags: 'Rectal bleeding, black stools, or a sudden change in bowel habits should be checked promptly.',
    resources: [
      { label: 'CDC — Colorectal Cancer', url: 'https://www.cdc.gov/colorectal-cancer/' },
      { label: 'American Cancer Society', url: 'https://www.cancer.org/cancer/types/colon-rectal-cancer.html' },
    ],
  },
  {
    id: 'skin-cancer',
    name: 'Skin Cancer',
    aka: 'Melanoma, basal & squamous cell carcinoma',
    specialtyId: 'dermatology',
    category: 'Cancer',
    prevalence: 'Most common cancer in the U.S. — millions of cases yearly',
    overview:
      'Skin cancer is the abnormal growth of skin cells, usually from sun (UV) damage. The common types (basal and squamous cell) are highly curable. Melanoma is less common but more dangerous and can spread if not caught early. Watching moles for change and protecting skin from the sun are key.',
    symptoms: ['A new or changing mole', 'A sore that won’t heal', 'Asymmetry, irregular border, or multiple colors', 'A spot that itches or bleeds'],
    drugs: [
      { name: 'Surgical removal', class: 'Procedure', note: 'Most early skin cancers are cured by removal.' },
      { name: 'Imiquimod cream', class: 'Topical immune therapy', note: 'For some superficial skin cancers.' },
      { name: 'Fluorouracil (5-FU) cream', class: 'Topical chemo', note: 'Treats precancers and superficial cancers.' },
      { name: 'Pembrolizumab / Nivolumab', class: 'Immunotherapy', note: 'For advanced melanoma.' },
      { name: 'Vemurafenib / Dabrafenib', class: 'Targeted therapy', note: 'For BRAF-mutated melanoma.' },
    ],
    redFlags: 'A mole that changes in size, shape, or color, or a sore that won’t heal — get a skin check.',
    resources: [
      { label: 'CDC — Skin Cancer', url: 'https://www.cdc.gov/skin-cancer/' },
      { label: 'American Academy of Dermatology', url: 'https://www.aad.org/public/diseases/skin-cancer' },
    ],
  },
  {
    id: 'uti',
    name: 'Urinary Tract Infection',
    aka: 'UTI, bladder infection',
    specialtyId: 'primary-care',
    category: 'Kidneys & Urinary',
    prevalence: 'Over 8 million U.S. visits per year; very common in women',
    overview:
      'A UTI is a bacterial infection of the urinary system, most often the bladder. It causes burning with urination and a frequent urge to go. Most are easily cured with a short course of antibiotics. Infections that reach the kidneys are more serious and need prompt care.',
    symptoms: ['Burning with urination', 'Frequent, urgent need to urinate', 'Cloudy or strong-smelling urine', 'Pelvic discomfort'],
    drugs: [
      { name: 'Nitrofurantoin (Macrobid)', class: 'Antibiotic', note: 'Common first-line for simple bladder infections.' },
      { name: 'Trimethoprim-sulfamethoxazole (Bactrim)', class: 'Antibiotic', note: 'Widely used where resistance is low.' },
      { name: 'Cephalexin (Keflex)', class: 'Antibiotic', note: 'Alternative, also used in pregnancy.' },
      { name: 'Fosfomycin', class: 'Antibiotic', note: 'Single-dose option.' },
      { name: 'Phenazopyridine (Azo)', class: 'Bladder analgesic', note: 'Eases burning; doesn’t treat the infection.' },
    ],
    redFlags: 'Fever, back/flank pain, nausea, or vomiting may mean a kidney infection — seek care the same day.',
    resources: [
      { label: 'MedlinePlus — UTI', url: 'https://medlineplus.gov/urinarytractinfections.html' },
      { label: 'NIDDK — Bladder Infection', url: 'https://www.niddk.nih.gov/health-information/urologic-diseases/bladder-infection-uti-in-adults' },
    ],
  },
  {
    id: 'pneumonia',
    name: 'Pneumonia',
    aka: 'Lung infection',
    specialtyId: 'pulmonology',
    category: 'Lungs & Breathing',
    prevalence: '~1.4 million U.S. ER visits each year',
    overview:
      'Pneumonia is an infection that inflames the air sacs of one or both lungs, which may fill with fluid. It can be caused by bacteria, viruses, or fungi. Most healthy people recover with treatment, but it can be serious for the very young, older adults, and those with chronic illness.',
    symptoms: ['Cough, often with phlegm', 'Fever and chills', 'Shortness of breath', 'Chest pain when breathing', 'Fatigue'],
    drugs: [
      { name: 'Amoxicillin', class: 'Antibiotic', note: 'Common first-line for bacterial pneumonia.' },
      { name: 'Azithromycin (Z-Pak)', class: 'Antibiotic', note: 'Covers “atypical” bacteria.' },
      { name: 'Doxycycline', class: 'Antibiotic', note: 'Alternative oral option.' },
      { name: 'Levofloxacin', class: 'Antibiotic', note: 'For more severe or resistant cases.' },
      { name: 'Ceftriaxone', class: 'IV antibiotic', note: 'Used in the hospital.' },
    ],
    redFlags: 'Trouble breathing, blue lips, confusion, or a high fever that won’t come down — seek emergency care.',
    resources: [
      { label: 'CDC — Pneumonia', url: 'https://www.cdc.gov/pneumonia/' },
      { label: 'American Lung Association', url: 'https://www.lung.org/lung-health-diseases/lung-disease-lookup/pneumonia' },
    ],
  },
  {
    id: 'covid-19',
    name: 'COVID-19',
    aka: 'SARS-CoV-2 infection',
    specialtyId: 'infectious-disease',
    category: 'Infections',
    prevalence: 'Ongoing seasonal circulation in the U.S.',
    overview:
      'COVID-19 is a respiratory illness caused by the coronavirus SARS-CoV-2. Most people have mild-to-moderate symptoms and recover at home, but it can be serious for older adults and those with health conditions. Vaccines and antiviral pills reduce the risk of severe illness.',
    symptoms: ['Fever or chills', 'Cough', 'Sore throat', 'Loss of taste or smell', 'Fatigue and body aches'],
    drugs: [
      { name: 'Nirmatrelvir-ritonavir (Paxlovid)', class: 'Antiviral', note: 'Pill for higher-risk people, taken early.' },
      { name: 'Remdesivir', class: 'Antiviral', note: 'IV antiviral, often used in hospital.' },
      { name: 'Dexamethasone', class: 'Steroid', note: 'For those needing oxygen.' },
      { name: 'Acetaminophen / Ibuprofen', class: 'Symptom relief', note: 'For fever and aches at home.' },
      { name: 'COVID-19 vaccines', class: 'Prevention', note: 'Updated vaccines lower severe-illness risk.' },
    ],
    redFlags: 'Trouble breathing, persistent chest pressure, confusion, or bluish lips — call 911.',
    resources: [
      { label: 'CDC — COVID-19', url: 'https://www.cdc.gov/covid/' },
      { label: 'MedlinePlus — COVID-19', url: 'https://medlineplus.gov/covid19coronavirusdisease2019.html' },
    ],
  },
  {
    id: 'osteoporosis',
    name: 'Osteoporosis',
    aka: 'Bone thinning',
    specialtyId: 'endocrinology',
    category: 'Bones & Joints',
    prevalence: '~10 million Americans, mostly women over 50',
    overview:
      'Osteoporosis is when bones lose density and become fragile, making fractures more likely — even from a minor fall. It’s common after menopause and usually has no symptoms until a bone breaks. A bone-density scan (DEXA) detects it, and treatment plus calcium, vitamin D, and exercise protect against fractures.',
    symptoms: ['No symptoms until a fracture', 'Loss of height over time', 'Stooped posture', 'Back pain from spine fractures'],
    drugs: [
      { name: 'Alendronate (Fosamax)', class: 'Bisphosphonate', note: 'Common weekly pill that strengthens bone.' },
      { name: 'Risedronate (Actonel)', class: 'Bisphosphonate', note: 'Another oral option.' },
      { name: 'Zoledronic acid (Reclast)', class: 'Bisphosphonate', note: 'Once-a-year IV infusion.' },
      { name: 'Denosumab (Prolia)', class: 'Antibody', note: 'Injection every 6 months.' },
      { name: 'Calcium + Vitamin D', class: 'Supplement', note: 'Supports bone health alongside treatment.' },
    ],
    redFlags: 'Sudden severe back pain or a fall with inability to bear weight could be a fracture — seek care.',
    resources: [
      { label: 'NIAMS — Osteoporosis', url: 'https://www.niams.nih.gov/health-topics/osteoporosis' },
      { label: 'Bone Health & Osteoporosis Foundation', url: 'https://www.bonehealthandosteoporosis.org/' },
    ],
  },
  {
    id: 'epilepsy',
    name: 'Epilepsy',
    aka: 'Seizure disorder',
    specialtyId: 'neurology',
    category: 'Brain & Nerves',
    prevalence: '~3.4 million Americans',
    overview:
      'Epilepsy is a brain condition that causes recurring seizures — sudden bursts of electrical activity that can briefly change awareness, movement, or sensation. Causes range from genetics to injury, and in many cases no cause is found. Most people achieve good seizure control with daily medication.',
    symptoms: ['Recurrent seizures', 'Temporary confusion or staring spells', 'Uncontrolled jerking movements', 'Loss of awareness'],
    drugs: [
      { name: 'Levetiracetam (Keppra)', class: 'Anti-seizure', note: 'Widely used, broad-spectrum.' },
      { name: 'Lamotrigine (Lamictal)', class: 'Anti-seizure', note: 'Well tolerated long-term.' },
      { name: 'Valproate (Depakote)', class: 'Anti-seizure', note: 'Effective for several seizure types.' },
      { name: 'Carbamazepine', class: 'Anti-seizure', note: 'For focal seizures.' },
      { name: 'Lacosamide (Vimpat)', class: 'Anti-seizure', note: 'Add-on for focal seizures.' },
    ],
    redFlags: 'A seizure lasting over 5 minutes, repeated seizures, or a first-ever seizure — call 911.',
    resources: [
      { label: 'CDC — Epilepsy', url: 'https://www.cdc.gov/epilepsy/' },
      { label: 'Epilepsy Foundation', url: 'https://www.epilepsy.com/' },
    ],
  },
  {
    id: 'alzheimers',
    name: "Alzheimer's Disease",
    aka: 'Dementia',
    specialtyId: 'neurology',
    category: 'Brain & Nerves',
    prevalence: '~6.9 million Americans age 65+',
    overview:
      'Alzheimer’s is the most common cause of dementia — a progressive disease that damages memory and thinking. It develops slowly, starting with forgetfulness and advancing over years. There’s no cure yet, but treatments can ease symptoms, and newer drugs aim to slow early disease.',
    symptoms: ['Memory loss that disrupts daily life', 'Trouble with words or planning', 'Confusion about time or place', 'Mood and personality changes'],
    drugs: [
      { name: 'Donepezil (Aricept)', class: 'Cholinesterase inhibitor', note: 'Eases symptoms in mild-to-moderate disease.' },
      { name: 'Memantine (Namenda)', class: 'NMDA blocker', note: 'For moderate-to-severe disease.' },
      { name: 'Rivastigmine (Exelon)', class: 'Cholinesterase inhibitor', note: 'Available as a skin patch.' },
      { name: 'Lecanemab (Leqembi)', class: 'Anti-amyloid antibody', note: 'Newer infusion that may slow early disease.' },
      { name: 'Galantamine', class: 'Cholinesterase inhibitor', note: 'Another symptom-easing option.' },
    ],
    redFlags: 'Sudden confusion, a sharp change in behavior, or getting lost in a familiar place needs prompt evaluation.',
    resources: [
      { label: 'NIA — Alzheimer’s', url: 'https://www.nia.nih.gov/health/alzheimers' },
      { label: "Alzheimer's Association", url: 'https://www.alz.org/' },
    ],
  },
  {
    id: 'parkinsons',
    name: "Parkinson's Disease",
    aka: '',
    specialtyId: 'neurology',
    category: 'Brain & Nerves',
    prevalence: '~1 million Americans',
    overview:
      'Parkinson’s is a progressive disorder in which brain cells that make dopamine slowly die off, affecting movement. It typically causes tremor, stiffness, and slowness, developing gradually over years. Medication that replaces or mimics dopamine controls symptoms well, especially in earlier stages.',
    symptoms: ['Tremor, often starting in one hand', 'Slowed movement', 'Muscle stiffness', 'Balance problems', 'Small handwriting'],
    drugs: [
      { name: 'Carbidopa-levodopa (Sinemet)', class: 'Dopamine replacement', note: 'Most effective core treatment.' },
      { name: 'Pramipexole (Mirapex)', class: 'Dopamine agonist', note: 'Often used in earlier disease.' },
      { name: 'Ropinirole', class: 'Dopamine agonist', note: 'Another agonist option.' },
      { name: 'Rasagiline (Azilect)', class: 'MAO-B inhibitor', note: 'Extends dopamine’s effect.' },
      { name: 'Amantadine', class: 'Antiviral / movement', note: 'Helps involuntary movements.' },
    ],
    redFlags: 'Sudden inability to move, high fever with rigidity, or falls with injury — seek care promptly.',
    resources: [
      { label: 'NINDS — Parkinson’s', url: 'https://www.ninds.nih.gov/health-information/disorders/parkinsons-disease' },
      { label: "Parkinson's Foundation", url: 'https://www.parkinson.org/' },
    ],
  },
  {
    id: 'stroke',
    name: 'Stroke',
    aka: 'Brain attack, CVA',
    specialtyId: 'neurology',
    category: 'Brain & Nerves',
    prevalence: '~800,000 strokes in the U.S. each year',
    overview:
      'A stroke happens when blood flow to part of the brain is cut off — by a clot (ischemic) or a bleed (hemorrhagic) — and brain cells begin to die within minutes. It’s a medical emergency where fast treatment saves brain function. Remember F.A.S.T.: Face drooping, Arm weakness, Speech difficulty, Time to call 911.',
    symptoms: ['Sudden face drooping', 'Arm or leg weakness, usually one side', 'Slurred or confused speech', 'Sudden vision or balance loss', 'Sudden severe headache'],
    drugs: [
      { name: 'Alteplase / Tenecteplase (tPA)', class: 'Clot-buster', note: 'Given fast in the ER for clot strokes.' },
      { name: 'Aspirin', class: 'Antiplatelet', note: 'Helps prevent another stroke.' },
      { name: 'Clopidogrel (Plavix)', class: 'Antiplatelet', note: 'Reduces future clot risk.' },
      { name: 'Atorvastatin', class: 'Statin', note: 'Lowers stroke risk going forward.' },
      { name: 'Apixaban (Eliquis)', class: 'Blood thinner', note: 'When stroke is caused by AFib.' },
    ],
    redFlags: 'ANY sudden weakness, speech trouble, facial droop, or vision loss — call 911 immediately. Minutes matter.',
    resources: [
      { label: 'CDC — Stroke', url: 'https://www.cdc.gov/stroke/' },
      { label: 'American Stroke Association', url: 'https://www.stroke.org/' },
    ],
  },
  {
    id: 'eczema',
    name: 'Eczema',
    aka: 'Atopic dermatitis',
    specialtyId: 'dermatology',
    category: 'Skin',
    prevalence: '~31 million Americans',
    overview:
      'Eczema is a chronic condition where the skin barrier is weakened, leaving skin dry, itchy, and prone to inflamed red or scaly patches. It often starts in childhood and runs in families alongside allergies and asthma. Gentle skin care, moisturizers, and anti-inflammatory creams keep it under control.',
    symptoms: ['Dry, itchy skin', 'Red or scaly patches', 'Flare-ups in skin folds (elbows, knees)', 'Skin that thickens with scratching'],
    drugs: [
      { name: 'Moisturizers / emollients', class: 'Skin barrier', note: 'Foundation of every eczema routine.' },
      { name: 'Hydrocortisone / Triamcinolone', class: 'Topical steroid', note: 'Calms flare-ups.' },
      { name: 'Tacrolimus (Protopic)', class: 'Topical immune modulator', note: 'Steroid-free option for the face.' },
      { name: 'Dupilumab (Dupixent)', class: 'Biologic injection', note: 'For moderate-to-severe eczema.' },
      { name: 'Antihistamines', class: 'Itch relief', note: 'Help with itching, especially at night.' },
    ],
    redFlags: 'Skin that becomes very painful, oozing, crusted, or feverish may be infected — seek care.',
    resources: [
      { label: 'NIAMS — Atopic Dermatitis', url: 'https://www.niams.nih.gov/health-topics/atopic-dermatitis' },
      { label: 'National Eczema Association', url: 'https://nationaleczema.org/' },
    ],
  },
  {
    id: 'psoriasis',
    name: 'Psoriasis',
    aka: '',
    specialtyId: 'dermatology',
    category: 'Skin',
    prevalence: '~7.5 million U.S. adults',
    overview:
      'Psoriasis is an autoimmune condition where skin cells multiply too fast, piling up into thick, scaly plaques — often on the elbows, knees, and scalp. It can also affect the joints (psoriatic arthritis). It isn’t contagious. Treatments range from creams to powerful biologic injections that can clear the skin.',
    symptoms: ['Thick, red patches with silvery scale', 'Itching or burning', 'Dry, cracked skin', 'Sometimes joint pain'],
    drugs: [
      { name: 'Topical steroids', class: 'Anti-inflammatory cream', note: 'First-line for limited disease.' },
      { name: 'Calcipotriene', class: 'Vitamin D cream', note: 'Slows skin-cell overgrowth.' },
      { name: 'Methotrexate', class: 'DMARD', note: 'For widespread disease.' },
      { name: 'Adalimumab (Humira)', class: 'Biologic (TNF blocker)', note: 'For moderate-to-severe psoriasis.' },
      { name: 'Secukinumab / Ustekinumab', class: 'Biologic', note: 'Newer injections that can clear the skin.' },
    ],
    redFlags: 'Widespread redness with fever or peeling skin (erythrodermic psoriasis) is a medical emergency.',
    resources: [
      { label: 'NIAMS — Psoriasis', url: 'https://www.niams.nih.gov/health-topics/psoriasis' },
      { label: 'National Psoriasis Foundation', url: 'https://www.psoriasis.org/' },
    ],
  },
  {
    id: 'insomnia',
    name: 'Insomnia',
    aka: 'Sleep difficulty',
    specialtyId: 'psychiatry',
    category: 'Mental Health',
    prevalence: '~1 in 3 adults have symptoms; ~10% chronic insomnia',
    overview:
      'Insomnia is trouble falling asleep, staying asleep, or waking too early, despite the chance to sleep — and feeling tired during the day as a result. It can be short-term (stress, travel) or chronic. The most effective long-term treatment is a structured therapy (CBT-I); medications are usually for short-term help.',
    symptoms: ['Trouble falling or staying asleep', 'Waking too early', 'Daytime tiredness', 'Irritability or trouble focusing'],
    drugs: [
      { name: 'Melatonin', class: 'Sleep hormone (OTC)', note: 'Mild aid, useful for sleep-timing issues.' },
      { name: 'Trazodone', class: 'Sedating antidepressant', note: 'Common off-label sleep aid.' },
      { name: 'Zolpidem (Ambien)', class: 'Sedative-hypnotic', note: 'Short-term use for falling asleep.' },
      { name: 'Eszopiclone (Lunesta)', class: 'Sedative-hypnotic', note: 'Another short-term option.' },
      { name: 'Doxepin (low-dose)', class: 'Sedating antihistamine', note: 'Helps with staying asleep.' },
    ],
    redFlags: 'Loud snoring with gasping or pauses in breathing may be sleep apnea — ask about a sleep study.',
    resources: [
      { label: 'NHLBI — Insomnia', url: 'https://www.nhlbi.nih.gov/health/insomnia' },
      { label: 'Sleep Foundation', url: 'https://www.sleepfoundation.org/insomnia' },
    ],
  },
  {
    id: 'adhd',
    name: 'ADHD',
    aka: 'Attention-deficit/hyperactivity disorder',
    specialtyId: 'psychiatry',
    category: 'Mental Health',
    prevalence: '~7 million U.S. children; ~6% of adults',
    overview:
      'ADHD is a brain-based condition affecting attention, impulse control, and activity level. It’s not a lack of effort — it reflects how the brain regulates focus. It often continues into adulthood. A combination of behavioral strategies and medication helps most people function much better.',
    symptoms: ['Trouble focusing or finishing tasks', 'Easily distracted', 'Restlessness or fidgeting', 'Impulsiveness', 'Disorganization'],
    drugs: [
      { name: 'Methylphenidate (Ritalin/Concerta)', class: 'Stimulant', note: 'Common first-line; improves focus.' },
      { name: 'Amphetamine salts (Adderall)', class: 'Stimulant', note: 'Widely used stimulant.' },
      { name: 'Lisdexamfetamine (Vyvanse)', class: 'Stimulant', note: 'Long-acting, once daily.' },
      { name: 'Atomoxetine (Strattera)', class: 'Non-stimulant', note: 'Option when stimulants aren’t suitable.' },
      { name: 'Guanfacine', class: 'Non-stimulant', note: 'Helpful for impulsivity, often in kids.' },
    ],
    redFlags: 'New chest pain, fainting, or significant mood changes on stimulant medication should be reported to a doctor.',
    resources: [
      { label: 'CDC — ADHD', url: 'https://www.cdc.gov/adhd/' },
      { label: 'CHADD', url: 'https://chadd.org/' },
    ],
  },
  {
    id: 'ibs',
    name: 'Irritable Bowel Syndrome',
    aka: 'IBS',
    specialtyId: 'gastroenterology',
    category: 'Digestive Health',
    prevalence: '~10–15% of U.S. adults',
    overview:
      'IBS is a common disorder of how the gut and brain communicate, causing belly pain along with changes in bowel habits — diarrhea, constipation, or both. It doesn’t damage the bowel or lead to cancer, but it can really affect daily life. Diet changes, stress management, and targeted medicines help.',
    symptoms: ['Abdominal pain or cramping', 'Bloating', 'Diarrhea, constipation, or alternating', 'Relief after a bowel movement'],
    drugs: [
      { name: 'Fiber supplements (psyllium)', class: 'Bulking agent', note: 'Helps constipation-type IBS.' },
      { name: 'Dicyclomine', class: 'Antispasmodic', note: 'Eases cramping.' },
      { name: 'Loperamide (Imodium)', class: 'Anti-diarrheal', note: 'For diarrhea-predominant IBS.' },
      { name: 'Linaclotide (Linzess)', class: 'Secretagogue', note: 'For IBS with constipation.' },
      { name: 'Peppermint oil', class: 'Herbal antispasmodic', note: 'Can ease cramping and bloating.' },
    ],
    redFlags: 'Blood in the stool, weight loss, fever, or symptoms that wake you at night are NOT typical IBS — get evaluated.',
    resources: [
      { label: 'NIDDK — IBS', url: 'https://www.niddk.nih.gov/health-information/digestive-diseases/irritable-bowel-syndrome' },
      { label: 'MedlinePlus — IBS', url: 'https://medlineplus.gov/irritablebowelsyndrome.html' },
    ],
  },
  {
    id: 'gout',
    name: 'Gout',
    aka: 'Gouty arthritis',
    specialtyId: 'rheumatology',
    category: 'Bones & Joints',
    prevalence: '~9 million U.S. adults',
    overview:
      'Gout is a form of arthritis caused by uric-acid crystals building up in a joint, triggering sudden, intense pain — classically in the big toe. Attacks can be set off by certain foods, alcohol, or dehydration. Medicines treat the flare, and others lower uric acid to prevent future attacks.',
    symptoms: ['Sudden, severe joint pain (often the big toe)', 'Redness, warmth, and swelling', 'Pain that peaks within hours', 'Tenderness to even light touch'],
    drugs: [
      { name: 'Ibuprofen / Naproxen', class: 'NSAID', note: 'Eases an acute attack.' },
      { name: 'Colchicine', class: 'Anti-inflammatory', note: 'Targets gout flares specifically.' },
      { name: 'Prednisone', class: 'Steroid', note: 'For flares when NSAIDs can’t be used.' },
      { name: 'Allopurinol', class: 'Urate-lowering', note: 'Daily preventive that lowers uric acid.' },
      { name: 'Febuxostat (Uloric)', class: 'Urate-lowering', note: 'Alternative preventive.' },
    ],
    redFlags: 'A hot, swollen joint with fever could be a joint infection rather than gout — seek prompt care.',
    resources: [
      { label: 'NIAMS — Gout', url: 'https://www.niams.nih.gov/health-topics/gout' },
      { label: 'Arthritis Foundation — Gout', url: 'https://www.arthritis.org/diseases/gout' },
    ],
  },
  {
    id: 'bph',
    name: 'Enlarged Prostate',
    aka: 'BPH, benign prostatic hyperplasia',
    specialtyId: 'urology',
    category: 'Kidneys & Urinary',
    prevalence: 'About half of men by age 60, most by 80',
    overview:
      'As men age, the prostate often enlarges and presses on the urethra, making it harder to urinate. This is benign (not cancer) but can be bothersome. Symptoms include a weak stream and frequent nighttime trips. Medicines relax or shrink the prostate, and procedures help when needed.',
    symptoms: ['Weak or interrupted urine stream', 'Frequent urination, especially at night', 'Urgency', 'Trouble starting or fully emptying'],
    drugs: [
      { name: 'Tamsulosin (Flomax)', class: 'Alpha blocker', note: 'Relaxes the prostate to improve flow.' },
      { name: 'Finasteride', class: '5-alpha reductase inhibitor', note: 'Shrinks the prostate over months.' },
      { name: 'Dutasteride (Avodart)', class: '5-alpha reductase inhibitor', note: 'Similar shrinking effect.' },
      { name: 'Tadalafil (Cialis)', class: 'PDE-5 inhibitor', note: 'Eases symptoms; also treats ED.' },
      { name: 'Combination (Jalyn)', class: 'Alpha blocker + reductase inhibitor', note: 'For larger prostates.' },
    ],
    redFlags: 'Sudden complete inability to urinate is an emergency — seek immediate care.',
    resources: [
      { label: 'NIDDK — Enlarged Prostate', url: 'https://www.niddk.nih.gov/health-information/urologic-diseases/prostate-problems/prostate-enlargement-benign-prostatic-hyperplasia' },
      { label: 'Urology Care Foundation', url: 'https://www.urologyhealth.org/urology-a-z/b/benign-prostatic-hyperplasia-(bph)' },
    ],
  },
  {
    id: 'anemia',
    name: 'Anemia',
    aka: 'Low red blood cells / iron deficiency',
    specialtyId: 'primary-care',
    category: 'Blood',
    prevalence: 'Very common; iron-deficiency anemia affects millions',
    overview:
      'Anemia means the blood carries less oxygen than it should, usually because of too few red blood cells or too little hemoglobin. The most common cause is low iron. It leaves people tired and pale. Finding and treating the underlying cause — and replacing iron or vitamins — usually resolves it.',
    symptoms: ['Fatigue and weakness', 'Pale skin', 'Shortness of breath', 'Dizziness', 'Cold hands and feet'],
    drugs: [
      { name: 'Ferrous sulfate', class: 'Iron supplement', note: 'Standard treatment for iron-deficiency anemia.' },
      { name: 'Ferrous gluconate', class: 'Iron supplement', note: 'Gentler-on-the-stomach iron option.' },
      { name: 'Vitamin B12', class: 'Vitamin', note: 'For B12-deficiency anemia.' },
      { name: 'Folic acid', class: 'Vitamin', note: 'For folate-deficiency anemia.' },
      { name: 'IV iron', class: 'Iron infusion', note: 'When pills aren’t tolerated or absorbed.' },
    ],
    redFlags: 'Chest pain, fainting, very fast heartbeat, or black/bloody stools with anemia need prompt evaluation.',
    resources: [
      { label: 'NHLBI — Anemia', url: 'https://www.nhlbi.nih.gov/health/anemia' },
      { label: 'MedlinePlus — Anemia', url: 'https://medlineplus.gov/anemia.html' },
    ],
  },
];

// Full condition list: curated guides first, then the generated library.
export const CONDITIONS = [...CURATED_CONDITIONS, ...GENERATED_CONDITIONS];

/* ---------------- top prescribed drugs (U.S., ranked) ---------------- *
 * Approximate annual U.S. prescriptions, used for ranking/scale only.
 * Source basis: ClinCalc DrugStats / public prescription data.
 */
export const TOP_DRUGS = [
  { rank: 1,  name: 'Atorvastatin', brand: 'Lipitor', class: 'Statin', use: 'High cholesterol', conditionId: 'high-cholesterol', rx: '~118M' },
  { rank: 2,  name: 'Levothyroxine', brand: 'Synthroid', class: 'Thyroid hormone', use: 'Underactive thyroid', conditionId: 'hypothyroidism', rx: '~102M' },
  { rank: 3,  name: 'Metformin', brand: 'Glucophage', class: 'Biguanide', use: 'Type 2 diabetes', conditionId: 'type-2-diabetes', rx: '~92M' },
  { rank: 4,  name: 'Lisinopril', brand: 'Prinivil/Zestril', class: 'ACE inhibitor', use: 'High blood pressure', conditionId: 'hypertension', rx: '~88M' },
  { rank: 5,  name: 'Amlodipine', brand: 'Norvasc', class: 'Calcium channel blocker', use: 'High blood pressure', conditionId: 'hypertension', rx: '~80M' },
  { rank: 6,  name: 'Metoprolol', brand: 'Lopressor/Toprol', class: 'Beta blocker', use: 'Blood pressure / heart', conditionId: 'heart-disease', rx: '~68M' },
  { rank: 7,  name: 'Albuterol', brand: 'Ventolin/ProAir', class: 'Bronchodilator', use: 'Asthma / COPD', conditionId: 'asthma', rx: '~64M' },
  { rank: 8,  name: 'Omeprazole', brand: 'Prilosec', class: 'Proton pump inhibitor', use: 'Acid reflux (GERD)', conditionId: 'gerd', rx: '~58M' },
  { rank: 9,  name: 'Losartan', brand: 'Cozaar', class: 'ARB', use: 'High blood pressure', conditionId: 'hypertension', rx: '~56M' },
  { rank: 10, name: 'Gabapentin', brand: 'Neurontin', class: 'Anticonvulsant', use: 'Nerve pain / seizures', conditionId: 'epilepsy', rx: '~52M' },
  { rank: 11, name: 'Hydrochlorothiazide', brand: 'Microzide', class: 'Thiazide diuretic', use: 'High blood pressure', conditionId: 'hypertension', rx: '~46M' },
  { rank: 12, name: 'Sertraline', brand: 'Zoloft', class: 'SSRI', use: 'Depression / anxiety', conditionId: 'depression', rx: '~44M' },
  { rank: 13, name: 'Simvastatin', brand: 'Zocor', class: 'Statin', use: 'High cholesterol', conditionId: 'high-cholesterol', rx: '~42M' },
  { rank: 14, name: 'Montelukast', brand: 'Singulair', class: 'Leukotriene blocker', use: 'Asthma / allergies', conditionId: 'asthma', rx: '~40M' },
  { rank: 15, name: 'Escitalopram', brand: 'Lexapro', class: 'SSRI', use: 'Depression / anxiety', conditionId: 'anxiety', rx: '~38M' },
  { rank: 16, name: 'Rosuvastatin', brand: 'Crestor', class: 'Statin', use: 'High cholesterol', conditionId: 'high-cholesterol', rx: '~38M' },
  { rank: 17, name: 'Bupropion', brand: 'Wellbutrin', class: 'NDRI', use: 'Depression', conditionId: 'depression', rx: '~36M' },
  { rank: 18, name: 'Furosemide', brand: 'Lasix', class: 'Loop diuretic', use: 'Fluid / heart failure', conditionId: 'heart-failure', rx: '~34M' },
  { rank: 19, name: 'Pantoprazole', brand: 'Protonix', class: 'Proton pump inhibitor', use: 'Acid reflux (GERD)', conditionId: 'gerd', rx: '~32M' },
  { rank: 20, name: 'Trazodone', brand: 'Desyrel', class: 'Sedating antidepressant', use: 'Sleep / depression', conditionId: 'insomnia', rx: '~30M' },
  { rank: 21, name: 'Dulaglutide', brand: 'Trulicity', class: 'GLP-1 agonist', use: 'Type 2 diabetes', conditionId: 'type-2-diabetes', rx: '~30M' },
  { rank: 22, name: 'Amoxicillin', brand: 'Amoxil', class: 'Antibiotic', use: 'Bacterial infections', conditionId: 'pneumonia', rx: '~28M' },
  { rank: 23, name: 'Prednisone', brand: 'Deltasone', class: 'Corticosteroid', use: 'Inflammation / flares', conditionId: 'copd', rx: '~26M' },
  { rank: 24, name: 'Tamsulosin', brand: 'Flomax', class: 'Alpha blocker', use: 'Enlarged prostate', conditionId: 'bph', rx: '~24M' },
  { rank: 25, name: 'Fluticasone', brand: 'Flonase/Flovent', class: 'Corticosteroid', use: 'Allergies / asthma', conditionId: 'allergic-rhinitis', rx: '~24M' },
  { rank: 26, name: 'Apixaban', brand: 'Eliquis', class: 'Blood thinner (DOAC)', use: 'Clot / stroke prevention', conditionId: 'afib', rx: '~22M' },
  { rank: 27, name: 'Fluoxetine', brand: 'Prozac', class: 'SSRI', use: 'Depression / anxiety', conditionId: 'depression', rx: '~22M' },
  { rank: 28, name: 'Atenolol', brand: 'Tenormin', class: 'Beta blocker', use: 'Blood pressure / heart', conditionId: 'hypertension', rx: '~20M' },
  { rank: 29, name: 'Duloxetine', brand: 'Cymbalta', class: 'SNRI', use: 'Depression / nerve pain', conditionId: 'depression', rx: '~20M' },
  { rank: 30, name: 'Insulin glargine', brand: 'Lantus', class: 'Long-acting insulin', use: 'Diabetes', conditionId: 'type-2-diabetes', rx: '~20M' },
  { rank: 31, name: 'Clopidogrel', brand: 'Plavix', class: 'Antiplatelet', use: 'Clot / stroke prevention', conditionId: 'stroke', rx: '~19M' },
  { rank: 32, name: 'Meloxicam', brand: 'Mobic', class: 'NSAID', use: 'Arthritis pain', conditionId: 'osteoarthritis', rx: '~18M' },
  { rank: 33, name: 'Methylphenidate', brand: 'Ritalin/Concerta', class: 'Stimulant', use: 'ADHD', conditionId: 'adhd', rx: '~18M' },
  { rank: 34, name: 'Sumatriptan', brand: 'Imitrex', class: 'Triptan', use: 'Migraine', conditionId: 'migraine', rx: '~16M' },
  { rank: 35, name: 'Alendronate', brand: 'Fosamax', class: 'Bisphosphonate', use: 'Osteoporosis', conditionId: 'osteoporosis', rx: '~14M' },
  { rank: 36, name: 'Allopurinol', brand: 'Zyloprim', class: 'Urate-lowering', use: 'Gout', conditionId: 'gout', rx: '~14M' },
  { rank: 37, name: 'Semaglutide', brand: 'Ozempic/Wegovy', class: 'GLP-1 agonist', use: 'Diabetes / weight', conditionId: 'type-2-diabetes', rx: '~13M' },
  { rank: 38, name: 'Empagliflozin', brand: 'Jardiance', class: 'SGLT2 inhibitor', use: 'Diabetes / heart / kidney', conditionId: 'type-2-diabetes', rx: '~12M' },
  { rank: 39, name: 'Donepezil', brand: 'Aricept', class: 'Cholinesterase inhibitor', use: "Alzheimer's", conditionId: 'alzheimers', rx: '~10M' },
  { rank: 40, name: 'Levetiracetam', brand: 'Keppra', class: 'Anticonvulsant', use: 'Epilepsy / seizures', conditionId: 'epilepsy', rx: '~10M' },
  { rank: 41, name: 'Pravastatin', brand: 'Pravachol', class: 'Statin', use: 'High cholesterol', conditionId: 'high-cholesterol', rx: '~10M' },
  { rank: 42, name: 'Citalopram', brand: 'Celexa', class: 'SSRI', use: 'Depression', conditionId: 'depression', rx: '~9M' },
  { rank: 43, name: 'Carvedilol', brand: 'Coreg', class: 'Beta blocker', use: 'Heart failure', conditionId: 'heart-failure', rx: '~9M' },
  { rank: 44, name: 'Venlafaxine', brand: 'Effexor', class: 'SNRI', use: 'Depression / anxiety', conditionId: 'anxiety', rx: '~9M' },
  { rank: 45, name: 'Tramadol', brand: 'Ultram', class: 'Opioid analgesic', use: 'Moderate pain', conditionId: 'osteoarthritis', rx: '~9M' },
  { rank: 46, name: 'Cyclobenzaprine', brand: 'Flexeril', class: 'Muscle relaxant', use: 'Muscle spasm / back pain', conditionId: 'osteoarthritis', rx: '~8M' },
  { rank: 47, name: 'Hydroxyzine', brand: 'Atarax/Vistaril', class: 'Antihistamine', use: 'Anxiety / itching', conditionId: 'anxiety', rx: '~8M' },
  { rank: 48, name: 'Cetirizine', brand: 'Zyrtec', class: 'Antihistamine', use: 'Allergies', conditionId: 'allergic-rhinitis', rx: '~8M' },
  { rank: 49, name: 'Glipizide', brand: 'Glucotrol', class: 'Sulfonylurea', use: 'Type 2 diabetes', conditionId: 'type-2-diabetes', rx: '~8M' },
  { rank: 50, name: 'Spironolactone', brand: 'Aldactone', class: 'Aldosterone blocker', use: 'Heart failure / blood pressure', conditionId: 'heart-failure', rx: '~8M' },
  { rank: 51, name: 'Pregabalin', brand: 'Lyrica', class: 'Nerve-pain agent', use: 'Nerve pain / seizures', conditionId: 'epilepsy', rx: '~7M' },
  { rank: 52, name: 'Tizanidine', brand: 'Zanaflex', class: 'Muscle relaxant', use: 'Muscle spasm', conditionId: 'osteoarthritis', rx: '~7M' },
  { rank: 53, name: 'Clonazepam', brand: 'Klonopin', class: 'Benzodiazepine', use: 'Anxiety / seizures', conditionId: 'anxiety', rx: '~7M' },
  { rank: 54, name: 'Lorazepam', brand: 'Ativan', class: 'Benzodiazepine', use: 'Anxiety', conditionId: 'anxiety', rx: '~7M' },
  { rank: 55, name: 'Alprazolam', brand: 'Xanax', class: 'Benzodiazepine', use: 'Anxiety', conditionId: 'anxiety', rx: '~7M' },
  { rank: 56, name: 'Famotidine', brand: 'Pepcid', class: 'H2 blocker', use: 'Acid reflux (GERD)', conditionId: 'gerd', rx: '~7M' },
  { rank: 57, name: 'Potassium chloride', brand: 'Klor-Con', class: 'Electrolyte', use: 'Low potassium', conditionId: null, rx: '~7M' },
  { rank: 58, name: 'Warfarin', brand: 'Coumadin', class: 'Anticoagulant', use: 'Clot prevention', conditionId: 'afib', rx: '~6M' },
  { rank: 59, name: 'Rivaroxaban', brand: 'Xarelto', class: 'Blood thinner (DOAC)', use: 'Clot / stroke prevention', conditionId: 'afib', rx: '~6M' },
  { rank: 60, name: 'Hydralazine', brand: 'Apresoline', class: 'Vasodilator', use: 'High blood pressure', conditionId: 'hypertension', rx: '~6M' },
  { rank: 61, name: 'Amphetamine/dextroamphetamine', brand: 'Adderall', class: 'Stimulant', use: 'ADHD', conditionId: 'adhd', rx: '~6M' },
  { rank: 62, name: 'Lisdexamfetamine', brand: 'Vyvanse', class: 'Stimulant', use: 'ADHD', conditionId: 'adhd', rx: '~6M' },
  { rank: 63, name: 'Topiramate', brand: 'Topamax', class: 'Anticonvulsant', use: 'Seizures / migraine', conditionId: 'migraine', rx: '~6M' },
  { rank: 64, name: 'Lamotrigine', brand: 'Lamictal', class: 'Anticonvulsant / mood', use: 'Seizures / bipolar', conditionId: 'epilepsy', rx: '~6M' },
  { rank: 65, name: 'Quetiapine', brand: 'Seroquel', class: 'Antipsychotic', use: 'Bipolar / schizophrenia', conditionId: null, rx: '~6M' },
  { rank: 66, name: 'Aripiprazole', brand: 'Abilify', class: 'Antipsychotic', use: 'Depression / bipolar', conditionId: null, rx: '~5M' },
  { rank: 67, name: 'Mirtazapine', brand: 'Remeron', class: 'Antidepressant', use: 'Depression / sleep', conditionId: 'depression', rx: '~5M' },
  { rank: 68, name: 'Amitriptyline', brand: 'Elavil', class: 'Tricyclic', use: 'Depression / nerve pain', conditionId: 'depression', rx: '~5M' },
  { rank: 69, name: 'Ondansetron', brand: 'Zofran', class: 'Antiemetic', use: 'Nausea / vomiting', conditionId: null, rx: '~5M' },
  { rank: 70, name: 'Azithromycin', brand: 'Zithromax', class: 'Antibiotic', use: 'Bacterial infections', conditionId: 'pneumonia', rx: '~5M' },
  { rank: 71, name: 'Doxycycline', brand: 'Vibramycin', class: 'Antibiotic', use: 'Bacterial infections', conditionId: 'pneumonia', rx: '~5M' },
  { rank: 72, name: 'Cephalexin', brand: 'Keflex', class: 'Antibiotic', use: 'Bacterial infections', conditionId: 'uti', rx: '~5M' },
  { rank: 73, name: 'Ciprofloxacin', brand: 'Cipro', class: 'Antibiotic', use: 'Bacterial infections', conditionId: 'uti', rx: '~5M' },
  { rank: 74, name: 'Sulfamethoxazole-trimethoprim', brand: 'Bactrim', class: 'Antibiotic', use: 'Infections / UTI', conditionId: 'uti', rx: '~5M' },
  { rank: 75, name: 'Nitrofurantoin', brand: 'Macrobid', class: 'Antibiotic', use: 'Urinary tract infection', conditionId: 'uti', rx: '~4M' },
  { rank: 76, name: 'Clindamycin', brand: 'Cleocin', class: 'Antibiotic', use: 'Bacterial / skin infections', conditionId: null, rx: '~4M' },
  { rank: 77, name: 'Fluconazole', brand: 'Diflucan', class: 'Antifungal', use: 'Fungal / yeast infections', conditionId: null, rx: '~4M' },
  { rank: 78, name: 'Valacyclovir', brand: 'Valtrex', class: 'Antiviral', use: 'Herpes / shingles', conditionId: null, rx: '~4M' },
  { rank: 79, name: 'Acetaminophen-hydrocodone', brand: 'Norco/Vicodin', class: 'Opioid analgesic', use: 'Moderate-to-severe pain', conditionId: null, rx: '~4M' },
  { rank: 80, name: 'Oxycodone', brand: 'OxyContin', class: 'Opioid analgesic', use: 'Severe pain', conditionId: null, rx: '~4M' },
  { rank: 81, name: 'Naproxen', brand: 'Aleve', class: 'NSAID', use: 'Pain / inflammation', conditionId: 'osteoarthritis', rx: '~4M' },
  { rank: 82, name: 'Ibuprofen', brand: 'Advil/Motrin', class: 'NSAID', use: 'Pain / inflammation', conditionId: 'osteoarthritis', rx: '~4M' },
  { rank: 83, name: 'Diclofenac', brand: 'Voltaren', class: 'NSAID', use: 'Arthritis pain', conditionId: 'osteoarthritis', rx: '~4M' },
  { rank: 84, name: 'Celecoxib', brand: 'Celebrex', class: 'NSAID (COX-2)', use: 'Arthritis pain', conditionId: 'osteoarthritis', rx: '~4M' },
  { rank: 85, name: 'Estradiol', brand: 'Estrace', class: 'Estrogen hormone', use: 'Menopause symptoms', conditionId: null, rx: '~4M' },
  { rank: 86, name: 'Ethinyl estradiol/norgestimate', brand: 'Ortho Tri-Cyclen', class: 'Oral contraceptive', use: 'Birth control', conditionId: null, rx: '~4M' },
  { rank: 87, name: 'Finasteride', brand: 'Proscar/Propecia', class: '5-alpha reductase inhibitor', use: 'Enlarged prostate / hair loss', conditionId: 'bph', rx: '~4M' },
  { rank: 88, name: 'Sitagliptin', brand: 'Januvia', class: 'DPP-4 inhibitor', use: 'Type 2 diabetes', conditionId: 'type-2-diabetes', rx: '~3M' },
  { rank: 89, name: 'Dapagliflozin', brand: 'Farxiga', class: 'SGLT2 inhibitor', use: 'Diabetes / heart / kidney', conditionId: 'heart-failure', rx: '~3M' },
  { rank: 90, name: 'Ezetimibe', brand: 'Zetia', class: 'Cholesterol absorption inhibitor', use: 'High cholesterol', conditionId: 'high-cholesterol', rx: '~3M' },
  { rank: 91, name: 'Fenofibrate', brand: 'Tricor', class: 'Fibrate', use: 'High triglycerides', conditionId: 'high-cholesterol', rx: '~3M' },
  { rank: 92, name: 'Diltiazem', brand: 'Cardizem', class: 'Calcium channel blocker', use: 'Blood pressure / AFib', conditionId: 'afib', rx: '~3M' },
  { rank: 93, name: 'Propranolol', brand: 'Inderal', class: 'Beta blocker', use: 'Blood pressure / migraine', conditionId: 'migraine', rx: '~3M' },
  { rank: 94, name: 'Tiotropium', brand: 'Spiriva', class: 'Long-acting bronchodilator', use: 'COPD', conditionId: 'copd', rx: '~3M' },
  { rank: 95, name: 'Budesonide-formoterol', brand: 'Symbicort', class: 'Steroid + bronchodilator', use: 'Asthma / COPD', conditionId: 'asthma', rx: '~3M' },
  { rank: 96, name: 'Insulin aspart', brand: 'Novolog', class: 'Rapid-acting insulin', use: 'Diabetes', conditionId: 'type-2-diabetes', rx: '~3M' },
  { rank: 97, name: 'Methotrexate', brand: 'Trexall', class: 'DMARD', use: 'Rheumatoid arthritis', conditionId: 'rheumatoid-arthritis', rx: '~2M' },
  { rank: 98, name: 'Adalimumab', brand: 'Humira', class: 'Biologic (TNF blocker)', use: 'Autoimmune disease', conditionId: 'rheumatoid-arthritis', rx: '~2M' },
  { rank: 99, name: 'Tadalafil', brand: 'Cialis', class: 'PDE-5 inhibitor', use: 'Enlarged prostate / ED', conditionId: 'bph', rx: '~2M' },
  { rank: 100, name: 'Latanoprost', brand: 'Xalatan', class: 'Prostaglandin eye drop', use: 'Glaucoma', conditionId: null, rx: '~2M' },
];

/* ---------------- recommended checkups, screenings & vaccines ---------------- *
 * General adult guidance at the USPSTF/CDC consumer level. Ages are the
 * typical recommended ranges; individuals with risk factors may start
 * earlier — the UI says to ask your doctor. NOT medical advice.
 */
export const SCREENINGS = [
  // -- screenings --
  { id: 'bp-check', kind: 'screening', emoji: '🩺', name: 'Blood pressure check', who: 'all', ageMin: 18, ageMax: null,
    freq: 'At least once a year', why: 'High blood pressure has no symptoms but quietly drives heart attacks and strokes. A 30-second cuff reading catches it.' },
  { id: 'cholesterol', kind: 'screening', emoji: '🫀', name: 'Cholesterol (lipid) panel', who: 'all', ageMin: 20, ageMax: null,
    freq: 'Every 4–6 years; more often after 40 or with risk factors', why: 'A simple blood test that estimates your heart-disease risk and whether a statin would help.' },
  { id: 'diabetes-screen', kind: 'screening', emoji: '🍬', name: 'Blood sugar (A1C) test', who: 'all', ageMin: 35, ageMax: 70,
    freq: 'Every 3 years, more often if overweight or prediabetic', why: '1 in 5 people with diabetes don’t know they have it. Catching prediabetes early can reverse it.' },
  { id: 'colorectal', kind: 'screening', emoji: '🎗️', name: 'Colon cancer screening', who: 'all', ageMin: 45, ageMax: 75,
    freq: 'Colonoscopy every 10 years, or a stool test every 1–3 years', why: 'Finds and removes polyps before they become cancer — one of the most preventable major cancers.' },
  { id: 'mammogram', kind: 'screening', emoji: '🌸', name: 'Mammogram (breast cancer)', who: 'women', ageMin: 40, ageMax: 74,
    freq: 'Every 2 years (some choose yearly)', why: 'Finds breast cancer years before it can be felt, when treatment works best.' },
  { id: 'cervical', kind: 'screening', emoji: '🔬', name: 'Cervical cancer screening (Pap/HPV)', who: 'women', ageMin: 21, ageMax: 65,
    freq: 'Pap every 3 years, or Pap + HPV every 5 years', why: 'Cervical cancer is almost entirely preventable with regular screening.' },
  { id: 'lung-ct', kind: 'screening', emoji: '🫁', name: 'Lung cancer scan (low-dose CT)', who: 'all', ageMin: 50, ageMax: 80,
    freq: 'Yearly — only for current/former heavy smokers (20+ pack-years)', why: 'Catches lung cancer early in people at high risk from smoking.' },
  { id: 'psa', kind: 'screening', emoji: '🧪', name: 'Prostate cancer (PSA) — a conversation', who: 'men', ageMin: 55, ageMax: 69,
    freq: 'Discuss the pros and cons with your doctor', why: 'PSA testing has trade-offs; the recommendation is to decide together with your doctor.' },
  { id: 'dexa', kind: 'screening', emoji: '🦴', name: 'Bone density scan (DEXA)', who: 'women', ageMin: 65, ageMax: null,
    freq: 'At 65, repeat per your doctor (earlier if risk factors)', why: 'Finds osteoporosis before the first fracture.' },
  { id: 'aaa', kind: 'screening', emoji: '🫀', name: 'Abdominal aortic aneurysm ultrasound', who: 'men', ageMin: 65, ageMax: 75,
    freq: 'Once — for men who have ever smoked', why: 'A one-time painless ultrasound that can catch a silent, dangerous bulge in the aorta.' },
  { id: 'hep-c', kind: 'screening', emoji: '🧫', name: 'Hepatitis C blood test', who: 'all', ageMin: 18, ageMax: 79,
    freq: 'At least once in adulthood', why: 'Millions carry hep C without symptoms — and it’s now curable with pills.' },
  { id: 'hiv', kind: 'screening', emoji: '🎀', name: 'HIV test', who: 'all', ageMin: 15, ageMax: 65,
    freq: 'At least once; yearly if higher risk', why: 'Modern treatment means a normal lifespan — but only if you know.' },
  { id: 'depression-screen', kind: 'screening', emoji: '🧠', name: 'Depression check-in', who: 'all', ageMin: 18, ageMax: null,
    freq: 'At routine visits', why: 'Two quick questions at a checkup can catch depression early. Treatment works.' },
  { id: 'eye-exam', kind: 'screening', emoji: '👁️', name: 'Comprehensive eye exam', who: 'all', ageMin: 40, ageMax: null,
    freq: 'Every 1–2 years (yearly with diabetes)', why: 'Glaucoma and diabetic eye disease steal vision silently; an exam catches them early.' },
  { id: 'dental', kind: 'screening', emoji: '🦷', name: 'Dental cleaning & exam', who: 'all', ageMin: 18, ageMax: null,
    freq: 'Every 6 months', why: 'Gum disease is linked to heart health, and small cavities are cheap; big ones aren’t.' },
  // -- vaccines --
  { id: 'flu-shot', kind: 'vaccine', emoji: '💉', name: 'Flu shot', who: 'all', ageMin: 18, ageMax: null,
    freq: 'Every fall', why: 'Cuts your risk of flu — and makes it much milder if you do catch it.' },
  { id: 'covid-vax', kind: 'vaccine', emoji: '💉', name: 'Updated COVID-19 vaccine', who: 'all', ageMin: 18, ageMax: null,
    freq: 'Yearly updated dose (especially 65+ or higher-risk)', why: 'Keeps protection current against severe illness.' },
  { id: 'tdap', kind: 'vaccine', emoji: '💉', name: 'Tdap / tetanus booster', who: 'all', ageMin: 18, ageMax: null,
    freq: 'Every 10 years', why: 'Tetanus protection fades — and the Tdap version also protects newborns around you from whooping cough.' },
  { id: 'shingles-vax', kind: 'vaccine', emoji: '💉', name: 'Shingles vaccine (Shingrix)', who: 'all', ageMin: 50, ageMax: null,
    freq: 'Two doses, once', why: 'Over 90% effective at preventing shingles and its lingering nerve pain.' },
  { id: 'pneumonia-vax', kind: 'vaccine', emoji: '💉', name: 'Pneumococcal (pneumonia) vaccine', who: 'all', ageMin: 50, ageMax: null,
    freq: 'Once (sometimes a second dose later)', why: 'Protects against the most common cause of bacterial pneumonia.' },
  { id: 'hpv-vax', kind: 'vaccine', emoji: '💉', name: 'HPV vaccine', who: 'all', ageMin: 18, ageMax: 26,
    freq: 'Catch-up series through age 26', why: 'Prevents the virus behind most cervical, throat, and other HPV cancers.' },
  { id: 'rsv-vax', kind: 'vaccine', emoji: '💉', name: 'RSV vaccine', who: 'all', ageMin: 75, ageMax: null,
    freq: 'Once (60+ with health conditions: ask your doctor)', why: 'RSV hospitalizes thousands of older adults each winter.' },
];

/* ---------------- external link builders ---------------- */
const enc = encodeURIComponent;

// Cheaper-medication and price-comparison destinations.
export const costPlusUrl = (drug) =>
  `https://costplusdrugs.com/medications/?search=${enc(drug)}`;
export const goodRxUrl = (drug) =>
  `https://www.goodrx.com/${enc(drug.toLowerCase().replace(/\s+/g, '-'))}`;
export const trumpRxUrl = () => 'https://trumprx.gov/';

// "Find a provider" — opens a maps search for the specialty near the user.
export const findProviderUrl = (specialtyFind) =>
  `https://www.google.com/maps/search/${enc(specialtyFind + ' near me')}`;
export const zocdocUrl = (specialtyFind) =>
  `https://www.zocdoc.com/search?query=${enc(specialtyFind)}`;
export const healthgradesUrl = (specialtyFind) =>
  `https://www.healthgrades.com/usearch?what=${enc(specialtyFind)}`;

// Learn-more search on trusted sources.
export const medlineSearchUrl = (term) =>
  `https://medlineplus.gov/search/?query=${enc(term)}`;

/* ---------------- lookups & search ---------------- */
export const specialtyById = (id) => SPECIALTIES.find((s) => s.id === id);
export const conditionById = (id) => CONDITIONS.find((c) => c.id === id);
export const conditionsForSpecialty = (id) =>
  CONDITIONS.filter((c) => c.specialtyId === id);

export const CONDITION_COUNT = CONDITIONS.length;
export const DRUG_COUNT = TOP_DRUGS.length;
export const SPECIALTY_COUNT = SPECIALTIES.length;

// Guess a likely specialty for a free-text (live) condition name, so we can
// still offer a sensible "find care" suggestion for conditions not in our
// curated set. Falls back to Primary Care.
const SPECIALTY_KEYWORDS = [
  ['oncology', /cancer|carcinoma|tumor|tumour|neoplasm|lymphoma|leukemia|melanoma|sarcoma/],
  ['cardiology', /heart|cardiac|coronary|arrhythmi|hypertension|blood pressure|cholesterol|aort|valve|angina/],
  ['neurology', /brain|seizure|epilep|migraine|headache|stroke|parkinson|alzheimer|dementia|multiple sclerosis|neuropath|nerve/],
  ['psychiatry', /depress|anxiety|bipolar|schizophren|adhd|ptsd|insomnia|panic|ocd|mental/],
  ['endocrinology', /diabet|thyroid|hormone|adrenal|pituitary|osteoporos|metaboli/],
  ['pulmonology', /asthma|copd|lung|pulmonary|bronch|respiratory|pneumonia|sleep apnea/],
  ['gastroenterology', /stomach|bowel|intestin|colon|liver|hepat|gastr|reflux|gerd|crohn|colitis|ulcer|ibs|pancreatit/],
  ['dermatology', /skin|eczema|psoriasis|acne|rash|dermat|melanoma/],
  ['rheumatology', /arthritis|lupus|gout|rheumat|autoimmune|fibromyalgia/],
  ['nephrology', /kidney|renal|nephr|dialysis/],
  ['urology', /prostate|urinary|bladder|urolog|kidney stone|erectile/],
  ['allergy', /allerg|hay fever|rhinitis|hives|anaphyl/],
  ['infectious-disease', /infection|hiv|hepatitis|covid|influenza|tuberculosis|sepsis|virus|bacteria/],
  ['orthopedics', /fracture|bone|joint|knee|hip|spine|back pain|ligament|tendon|osteoarthritis/],
  ['obgyn', /pregnan|menstru|menopause|ovari|uterine|cervical|gynecolog/],
  ['ophthalmology', /eye|vision|glaucoma|cataract|retina|macular/],
  ['ent', /ear|sinus|throat|tonsil|hearing|nasal|larynx/],
  ['primary-care', /anemia|blood count|clotting|hemophilia|platelet/],
];
export function guessSpecialtyId(text) {
  const t = (text || '').toLowerCase();
  for (const [id, re] of SPECIALTY_KEYWORDS) if (re.test(t)) return id;
  return 'primary-care';
}

// Unified search across conditions and drugs.
export function searchAll(query) {
  const q = query.trim().toLowerCase();
  if (!q) return { conditions: [], drugs: [] };
  const conditions = CONDITIONS.filter((c) =>
    [c.name, c.aka, c.category, c.overview].join(' ').toLowerCase().includes(q)
  );
  const drugs = TOP_DRUGS.filter((d) =>
    [d.name, d.brand, d.class, d.use].join(' ').toLowerCase().includes(q)
  );
  return { conditions, drugs };
}
