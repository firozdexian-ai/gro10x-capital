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

const FOUNDER_ID  = 'c1a2b3c4-d5e6-7890-abcd-ef1234567891';
const BIZ_ORO_ID  = 'c1a2b3c4-d5e6-7890-abcd-ef1234567892';
const BIZ_SEGR_ID = 'c2a2b3c4-d5e6-7890-abcd-ef1234567892';
const BIZ_GRID_ID = 'c3a2b3c4-d5e6-7890-abcd-ef1234567892';
const DEAL_1_ID   = 'c1a2b3c4-d5e6-7890-abcd-ef1234567890';
const DEAL_2_ID   = 'c2a2b3c4-d5e6-7890-abcd-ef1234567890';
const DEAL_3_ID   = 'c3a2b3c4-d5e6-7890-abcd-ef1234567890';

const FAIZ_ADMIN_ID   = 'c4a2b3c4-d5e6-7890-abcd-ef1234567890';
const AYSHA_FOUNDER_ID= 'c5a2b3c4-d5e6-7890-abcd-ef1234567890';
const MAATS_BIZ_ID    = 'c6a2b3c4-d5e6-7890-abcd-ef1234567890';

async function run() {
  console.log('\n🌱 GRO10X Capital — Seeding Live Deals & Safe Home Fund...\n');

  // ── STEP 1: Founder & Team ──────────────────────────────────────────────────
  console.log('👤 Seeding Managing Partner Faiz Ahmed (Faiz Bhai)...');
  const { error: teamErr } = await sb.from('team').upsert([{
    id: FAIZ_ADMIN_ID,
    full_name: 'Faiz Ahmed',
    email: 'faiz@chillox.com',
    phone: '01784397960',
    team_type: 'admin'
  }], { onConflict: 'phone' });
  if (teamErr) { console.log('  ℹ️  Team note:', teamErr.message); }
  else { console.log('  ✅ Managing Partner Faiz Ahmed seeded'); }

  console.log('👤 Seeding founder — Tauhid Islam (Oro & Segreto)...');
  const { error: foundErr } = await sb.from('founders').upsert([{
    id: FOUNDER_ID,
    full_name: 'Tauhid Islam',
    track_record_score: 88,
    background_notes: "Co-founder of Oro Roasters and Segreto — two of Dhaka's fastest-growing specialty F&B brands. 3 operational outlets with verified monthly sales data.",
  }], { onConflict: 'id' });
  if (foundErr) { console.log('  ℹ️  Founder note:', foundErr.message); }
  else { console.log('  ✅ Founder Tauhid Islam seeded'); }

  console.log('👤 Seeding founder — Aysha Siddika (Maats Cottage Ltd)...');
  const { error: ayshaErr } = await sb.from('founders').upsert([{
    id: AYSHA_FOUNDER_ID,
    full_name: 'Aysha Siddika',
    phone: '+8801770417459',
    email: 'aysha@maatscottage.com',
    track_record_score: 92,
    background_notes: "Managing Director & Founder of Maats Cottage Ltd — Specialist manufacturer of corporate gifting, jute bags, leather goods, and institutional merchandise.",
  }], { onConflict: 'id' });
  if (ayshaErr) { console.log('  ℹ️  Founder note:', ayshaErr.message); }
  else { console.log('  ✅ Founder Aysha Siddika seeded'); }

  // ── STEP 2: Businesses ────────────────────────────────────────────────────
  console.log('\n🏢 Seeding businesses (Oro Roasters, Segreto, Safe Home / Maats)...');
  const { error: bizErr } = await sb.from('businesses').upsert([
    { id: BIZ_ORO_ID,  founder_id: FOUNDER_ID, brand_name: 'Oro Roasters',      ai_health_score: 85, is_enlisted: true, industry_sector: 'Food & Beverage', operational_months: 18 },
    { id: BIZ_SEGR_ID, founder_id: FOUNDER_ID, brand_name: 'Segreto',            ai_health_score: 82, is_enlisted: true, industry_sector: 'Food & Beverage', operational_months: 12 },
    { id: BIZ_GRID_ID, founder_id: FOUNDER_ID, brand_name: 'Safe Home Wealth Management', ai_health_score: 95, is_enlisted: true, industry_sector: 'Wealth Management', operational_months: 36 },
    { id: MAATS_BIZ_ID, founder_id: AYSHA_FOUNDER_ID, brand_name: 'Maats Cottage Ltd', company_legal_name: 'Maats Cottage Limited', ai_health_score: 92, is_enlisted: true, industry_sector: 'Corporate Supply & Merchandise', operational_months: 24 }
  ], { onConflict: 'id' });
  if (bizErr) { console.log('  ℹ️  Businesses note:', bizErr.message); }
  else { console.log('  ✅ Businesses seeded'); }

  // ── STEP 3: Funding Projects ───────────────────────────────────────────────
  console.log('\n📊 Seeding 3 live investment deals (Oro Mirpur, Oro Banani, Safe Home Fund)...');
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
      project_title: 'Safe Home Wealth Management Fund — ৳20 Cr Facility',
      project_description: 'GRO10X Safe Home Wealth Management Fund: A ৳20 Crore institutional credit facility actively deployed into verified, high-turnover corporate purchase orders and SME work orders (7–10 day turnaround, 12%–18% per-cycle gross margins). ৳5+ Crore AUM currently managed across 50+ private wealth investors. Delivers a steady 18%–22% annual fixed return with quarterly liquidity cycles.',
      funding_type: 'Wealth Management',
      target_raise_bdt: 200000000,
      amount_raised_bdt: 52500000,
      spv_name: 'Safe Home Wealth Management SPV-01',
      yield_model: '18% – 22% Annual Fixed Return (Backed by Revolving Work-Order Financing). Quarterly Distributions.',
      min_otc_investment_bdt: 1000000,
      status: 'Active Capital Raise',
      show_on_showcase: true,
    }
  ], { onConflict: 'id' });

  if (projErr) { console.log('  ℹ️  Projects note:', projErr.message); }
  else { console.log('  ✅ 3 deals updated successfully'); }

  // ── STEP 4: Work Orders (MSP 001 - MSP 009) ─────────────────────────────────
  console.log('\n📦 Seeding Work Orders for Maats Cottage Ltd (MSP-001 to MSP-009)...');
  const workOrders = [
    {
      order_code: 'MSP-001',
      corporate_client: 'Delta Life Insurance',
      item_description: 'Corporate Merchandise (Order 1)',
      investment_amount_bdt: 250000,
      return_amount_bdt: 287500,
      profit_bdt: 37500,
      duration_days: 7,
      start_date: '2026-08-30',
      due_date: '2026-09-06',
      status: 'Disbursed_Active',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'Disbursed in 2 tranches: ৳2.00L advance + ৳50k top-up = ৳2.50L. Delta Life Order 1 — Closing today Sep 6 by 4:00 PM.'
    },
    {
      order_code: 'MSP-002',
      corporate_client: 'Delta Life Insurance',
      item_description: 'Corporate Merchandise (Order 2)',
      investment_amount_bdt: 375000,
      return_amount_bdt: 430000,
      profit_bdt: 55000,
      duration_days: 7,
      start_date: '2026-09-01',
      due_date: '2026-09-08',
      status: 'Disbursed_Active',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'Delta Life Order 2 — In transit for delivery.'
    },
    {
      order_code: 'MSP-003',
      corporate_client: 'Greenfield',
      item_description: 'Institutional Supplies (Order 1)',
      investment_amount_bdt: 230000,
      return_amount_bdt: 264500,
      profit_bdt: 34500,
      duration_days: 8,
      start_date: '2026-09-01',
      due_date: '2026-09-09',
      status: 'Disbursed_Active',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'Greenfield corporate supply batch 1.'
    },
    {
      order_code: 'MSP-004',
      corporate_client: 'Delta Life Insurance',
      item_description: 'Corporate Merchandise (Order 3)',
      investment_amount_bdt: 145000,
      return_amount_bdt: 166750,
      profit_bdt: 21750,
      duration_days: 7,
      start_date: '2026-09-02',
      due_date: '2026-09-09',
      status: 'Disbursed_Active',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'Delta Life Order 3 — Finishing & packaging.'
    },
    {
      order_code: 'MSP-005',
      corporate_client: 'Greenfield',
      item_description: 'Bag pack manufacturing',
      investment_amount_bdt: 400000,
      return_amount_bdt: 475000,
      profit_bdt: 75000,
      duration_days: 10,
      start_date: '2026-09-03',
      due_date: '2026-09-13',
      status: 'Disbursed_Active',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'Greenfield customized backpack batch.'
    },
    {
      order_code: 'MSP-006',
      corporate_client: 'National Life Insurance',
      item_description: 'Jute shopping bag',
      investment_amount_bdt: 325000,
      return_amount_bdt: 375000,
      profit_bdt: 50000,
      duration_days: 10,
      start_date: '2026-09-06',
      due_date: '2026-09-16',
      status: 'Pending_Approval',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'Corporate jute bags for National Life nationwide branches.'
    },
    {
      order_code: 'MSP-007',
      corporate_client: 'National Life Insurance',
      item_description: 'Short wallet',
      investment_amount_bdt: 250000,
      return_amount_bdt: 290000,
      profit_bdt: 40000,
      duration_days: 10,
      start_date: '2026-09-07',
      due_date: '2026-09-17',
      status: 'Pending_Approval',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'Premium leather executive short wallet batch.'
    },
    {
      order_code: 'MSP-008',
      corporate_client: 'Unique Group',
      item_description: 'Jute shopping bag',
      investment_amount_bdt: 275000,
      return_amount_bdt: 315000,
      profit_bdt: 40000,
      duration_days: 10,
      start_date: '2026-09-07',
      due_date: '2026-09-17',
      status: 'Pending_Approval',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'Institutional branded eco shopping bags.'
    },
    {
      order_code: 'MSP-009',
      corporate_client: 'Delta',
      item_description: 'Mug',
      investment_amount_bdt: 190000,
      return_amount_bdt: 220000,
      profit_bdt: 30000,
      duration_days: 10,
      start_date: '2026-09-06',
      due_date: '2026-09-16',
      status: 'Pending_Approval',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'Custom ceramic branded mugs for Delta.'
    }
  ];

  try {
    await sb.from('work_orders').delete().eq('order_code', 'MSP-005B');
    const { error: woErr } = await sb.from('work_orders').upsert(workOrders, { onConflict: 'order_code' });
    if (woErr) {
      console.log('  ℹ️  Work Orders table not created in Supabase yet (Run supabase_safe_home_work_orders.sql)');
    } else {
      console.log(`  ✅ ${workOrders.length} work orders seeded into public.work_orders`);
    }
  } catch (err) {
    console.log('  ℹ️  Work Orders Supabase note:', err.message);
  }

  // ── STEP 5: Verify ──────────────────────────────────────────────────────────
  console.log('\n🔍 Verifying showcase deals...');
  const { data: check } = await sb
    .from('funding_projects')
    .select('id, project_title, target_raise_bdt, status, show_on_showcase')
    .eq('show_on_showcase', true);

  if (check) {
    console.log(`\n  ✅ ${check.length} deal(s) visible:\n`);
    check.forEach((d, i) => {
      const crore = (d.target_raise_bdt / 10000000).toFixed(1);
      console.log(`  ${i+1}. ${d.project_title} | ৳${crore} Cr | Status: ${d.status}`);
    });
  }

  console.log('\n🎉 Seed run finished. Work-Order terminal & admin tab ready!\n');
}

run().catch(err => { console.error('Fatal error:', err.message); process.exit(1); });
