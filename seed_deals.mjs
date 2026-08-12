// One-time deal seeder — run from project root: node seed_deals.mjs
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Load .env.local
const envContent = readFileSync('.env.local', 'utf-8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.includes('=') && !l.startsWith('#') && l.trim())
    .map(l => { const i = l.indexOf('='); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; })
);

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceKey  = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

console.log('🔗 Connecting to:', supabaseUrl);
if (!supabaseUrl) { console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL'); process.exit(1); }

const sb = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const FOUNDER_ID  = 'f1a2b3c4-d5e6-7890-abcd-ef1234567890';
const BIZ_ORO_ID  = 'b1a2b3c4-d5e6-7890-abcd-ef1234567890';
const BIZ_SEGR_ID = 'b2a2b3c4-d5e6-7890-abcd-ef1234567890';
const BIZ_GRID_ID = 'b3a2b3c4-d5e6-7890-abcd-ef1234567890';
const DEAL_1_ID   = 'p1a2b3c4-d5e6-7890-abcd-ef1234567890';
const DEAL_2_ID   = 'p2a2b3c4-d5e6-7890-abcd-ef1234567890';
const DEAL_3_ID   = 'p3a2b3c4-d5e6-7890-abcd-ef1234567890';

async function run() {
  console.log('\n🌱 GRO10X Capital — Seeding Live Deals from PDF Documents...\n');

  // ── STEP 1: Add required columns ──────────────────────────────────────────
  // These ALTER TABLE commands must be run manually in Supabase SQL Editor first:
  // ALTER TABLE funding_projects ADD COLUMN IF NOT EXISTS show_on_showcase BOOLEAN DEFAULT false;
  // ALTER TABLE funding_projects ADD COLUMN IF NOT EXISTS project_description TEXT;

  // ── STEP 2: Founder ────────────────────────────────────────────────────────
  console.log('👤 Seeding founder — Tauhid Islam (Oro & Segreto)...');
  const { error: foundErr } = await sb.from('founders').upsert([{
    id: FOUNDER_ID,
    full_name: 'Tauhid Islam',
    track_record_score: 88,
    background_notes: "Co-founder of Oro Roasters and Segreto — two of Dhaka's fastest-growing specialty F&B brands. 3 operational outlets with verified monthly sales data. Partnered with GRO10X Capital for national hub expansion targeting 15 outlets across Dhaka within 24 months.",
  }], { onConflict: 'id' });
  if (foundErr) { console.error('  ❌ Founder error:', foundErr.message); }
  else { console.log('  ✅ Founder seeded'); }

  // ── STEP 3: Businesses ────────────────────────────────────────────────────
  console.log('\n🏢 Seeding 3 businesses...');
  const { error: bizErr } = await sb.from('businesses').upsert([
    { id: BIZ_ORO_ID,  founder_id: FOUNDER_ID, brand_name: 'Oro Roasters',      ai_health_score: 85, is_enlisted: true, industry_sector: 'Food & Beverage', operational_months: 18 },
    { id: BIZ_SEGR_ID, founder_id: FOUNDER_ID, brand_name: 'Segreto',            ai_health_score: 82, is_enlisted: true, industry_sector: 'Food & Beverage', operational_months: 12 },
    { id: BIZ_GRID_ID, founder_id: FOUNDER_ID, brand_name: 'GRO10X F&B Network', ai_health_score: 90, is_enlisted: true, industry_sector: 'Food & Beverage', operational_months: 24 },
  ], { onConflict: 'id' });
  if (bizErr) { console.error('  ❌ Businesses error:', bizErr.message); }
  else { console.log('  ✅ 3 businesses seeded (Oro Roasters, Segreto, GRO10X F&B Network)'); }

  // ── STEP 4: Funding Projects ───────────────────────────────────────────────
  console.log('\n📊 Seeding 3 live investment deals...');
  const { error: projErr } = await sb.from('funding_projects').upsert([
    {
      id: DEAL_1_ID,
      business_id: BIZ_ORO_ID,
      project_title: 'Oro Roasters — Mirpur Hub',
      project_description: "Premium specialty coffee cafe in Mirpur — Dhaka's #1 FoodPanda delivery zone. 4 months verified data (Mar–Jun 2026): Avg ৳31.6 Lakhs/month revenue, 16.89% net margin. 80% of CapEx in hard physical assets. 3 investor options: Capped Yield (10% gross sales, 22% max ROI), Multiplier (12% gross sales, 1.5X buyout), or Partnership (5% floor + 35% net profit). Monthly distributions.",
      funding_type: 'Franchise',
      target_raise_bdt: 20000000,
      amount_raised_bdt: 0,
      spv_name: 'Oro Roasters Mirpur SPV — GRO10X Capital',
      yield_model: 'Option 1: 10% Gross Sales → ~৳3.16L/mo | Option 2: 12% Gross Sales → ~৳3.79L/mo (1.5X Buyout) | Option 3: 5% Floor + 35% Net Profit → ~৳3.45L/mo. All Monthly.',
      min_otc_investment_bdt: 500000,
      status: 'Active Capital Raise',
      show_on_showcase: true,
    },
    {
      id: DEAL_2_ID,
      business_id: BIZ_ORO_ID,
      project_title: 'Oro Roasters — Banani Hub',
      project_description: "New premium specialty coffee outlet in Banani — Dhaka's highest-footfall F&B corridor. Launch month (June 2026): ৳30.3 Lakhs revenue with 19.85% net margin from Day 1. Target Month 6: ৳40 Lakhs revenue, ৳8 Lakhs net profit. 80% CapEx in hard assets. GRO10X manages demand gen, delivery optimisation, and live cost control. Monthly income distributions.",
      funding_type: 'Franchise',
      target_raise_bdt: 20000000,
      amount_raised_bdt: 0,
      spv_name: 'Oro Roasters Banani SPV — GRO10X Capital',
      yield_model: 'Option 1: 10% Gross Sales → ~৳3.03L/mo | Option 2: 12% Gross Sales → ~৳3.63L/mo (1.5X Buyout) | Option 3: 5% Floor + 35% Net Profit → ~৳3.62L/mo. All Monthly.',
      min_otc_investment_bdt: 500000,
      status: 'Active Capital Raise',
      show_on_showcase: true,
    },
    {
      id: DEAL_3_ID,
      business_id: BIZ_GRID_ID,
      project_title: 'GRO10X National Grid — 10-Hub F&B SPV',
      project_description: "Master growth vehicle: single SPV funding 10 Oro Roasters & Segreto hubs across Dhaka. Phase 1 (Banani + Mirpur) already operational. Phase 2 target: ৳4.5 Crore/month combined network revenue by Month 24. GRO10X carries zero payroll or real estate liability. 2-year cumulative profit projection: ৳8.1 Crore. Stable 20% investor yield via gross revenue structure.",
      funding_type: 'Equity',
      target_raise_bdt: 200000000,
      amount_raised_bdt: 0,
      spv_name: 'GRO10X F&B National Grid SPV-01',
      yield_model: '20% Annual via Gross Revenue Structure. 10% Corporate Yield secured. GRO10X 2.5% Success Fee + 2.5% Monthly Mgmt Fee on network sales. Semi-Annual Distributions.',
      min_otc_investment_bdt: 2500000,
      status: 'Origination',
      show_on_showcase: true,
    }
  ], { onConflict: 'id' });

  if (projErr) { console.error('  ❌ Projects error:', projErr.message); }
  else { console.log('  ✅ 3 deals seeded successfully'); }

  // ── STEP 5: Verify ──────────────────────────────────────────────────────────
  console.log('\n🔍 Verifying seeded deals visible on showcase...');
  const { data: check, error: checkErr } = await sb
    .from('funding_projects')
    .select('project_title, target_raise_bdt, status, show_on_showcase, businesses(brand_name, industry_sector)')
    .eq('show_on_showcase', true)
    .order('created_at', { ascending: false });

  if (checkErr) {
    console.error('  ❌ Verify error:', checkErr.message);
    console.log('\n  ⚠️  If you see column errors, please run in Supabase SQL Editor first:');
    console.log('  ALTER TABLE funding_projects ADD COLUMN IF NOT EXISTS show_on_showcase BOOLEAN DEFAULT false;');
    console.log('  ALTER TABLE funding_projects ADD COLUMN IF NOT EXISTS project_description TEXT;');
  } else {
    console.log(`\n  ✅ ${check.length} deal(s) will appear on /showcase:\n`);
    check.forEach((d, i) => {
      const crore = (d.target_raise_bdt / 10000000).toFixed(1);
      console.log(`  ${i+1}. ${d.project_title}`);
      console.log(`     Brand: ${d.businesses?.brand_name} | Raise: ৳${crore} Crore | Status: ${d.status}`);
    });
  }

  console.log('\n🎉 Seed complete! Open https://gro10x-capital-rho.vercel.app/showcase to see live deals.\n');
}

run().catch(err => { console.error('Fatal error:', err.message); process.exit(1); });
