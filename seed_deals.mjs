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
  console.log('\n🌱 GRO10X Capital — Seeding Live Deals & Safe Plan Fund...\n');

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
  console.log('\n🏢 Seeding businesses (Oro Roasters, Segreto, Safe Plan / Maats)...');
  const { error: bizErr } = await sb.from('businesses').upsert([
    { id: BIZ_ORO_ID,  founder_id: FOUNDER_ID, brand_name: 'Oro Roasters',      ai_health_score: 85, is_enlisted: true, industry_sector: 'Food & Beverage', operational_months: 18 },
    { id: BIZ_SEGR_ID, founder_id: FOUNDER_ID, brand_name: 'Segreto',            ai_health_score: 82, is_enlisted: true, industry_sector: 'Food & Beverage', operational_months: 12 },
    { id: BIZ_GRID_ID, founder_id: FOUNDER_ID, brand_name: 'Safe Plan Wealth Management', ai_health_score: 95, is_enlisted: true, industry_sector: 'Wealth Management', operational_months: 36 },
    { id: MAATS_BIZ_ID, founder_id: AYSHA_FOUNDER_ID, brand_name: 'Maats Cottage Ltd', company_legal_name: 'Maats Cottage Limited', ai_health_score: 92, is_enlisted: true, industry_sector: 'Corporate Supply & Merchandise', operational_months: 24 }
  ], { onConflict: 'id' });
  if (bizErr) { console.log('  ℹ️  Businesses note:', bizErr.message); }
  else { console.log('  ✅ Businesses seeded'); }

  // ── STEP 3: Funding Projects ───────────────────────────────────────────────
  console.log('\n📊 Seeding 3 live investment deals (Oro Mirpur, Oro Banani, Safe Plan Fund)...');
  const { error: projErr } = await sb.from('funding_projects').upsert([
    {
      id: DEAL_1_ID,
      business_id: BIZ_ORO_ID,
      project_title: 'Oro Roasters — Mirpur Hub',
      project_description: "Premium specialty coffee cafe in Mirpur — Dhaka's #1 FoodPanda delivery zone. 4 months verified data (Mar–Jun 2026): Avg ৳31.6 Lakhs/month revenue, 16.89% net margin. 80% of CapEx in hard physical assets. 3 investor options: Capped Yield (10% gross sales, 22% max ROI), Multiplier (12% gross sales, 1.5X buyout), or Partnership (5% floor + 35% net profit). Monthly distributions.",
      funding_type: 'Franchise Expansion',
      target_raise_bdt: 4500000,
      amount_raised_bdt: 4500000,
      spv_name: 'Oro Mirpur SPV Ltd',
      yield_model: '3 Options: 10% Gross Sales (Capped 22% ROI) · 12% Gross Sales (1.5X Buyout) · 5% Floor + 35% Net Profit',
      yield_option_1_name: 'Capped Yield',
      yield_option_1_rate: 10,
      yield_option_2_name: 'Multiplier',
      yield_option_2_rate: 12,
      yield_option_3_name: 'Partnership',
      yield_option_3_rate: 35,
      min_otc_investment_bdt: 500000,
      status: 'Active Capital Raise',
      show_on_showcase: true,
    },
    {
      id: DEAL_2_ID,
      business_id: BIZ_ORO_ID,
      project_title: 'Oro Roasters — Banani Hub',
      project_description: 'High-footfall flagship cafe on Road 11 Banani. 6 months verified POS data (Jan–Jun 2026): Avg ৳38.2 Lakhs/month gross sales, 18.5% net margin. High-density corporate expat clientele. 3 options: Capped Yield (10%), Multiplier (12%), Partnership (35%). Monthly bank distributions.',
      funding_type: 'Franchise Expansion',
      target_raise_bdt: 6000000,
      amount_raised_bdt: 3000000,
      spv_name: 'Oro Banani SPV Ltd',
      yield_model: '3 Options: 10% Gross Sales (Capped 22% ROI) · 12% Gross Sales (1.5X Buyout) · 5% Floor + 35% Net Profit',
      yield_option_1_name: 'Capped Yield',
      yield_option_1_rate: 10,
      yield_option_2_name: 'Multiplier',
      yield_option_2_rate: 12,
      yield_option_3_name: 'Partnership',
      yield_option_3_rate: 35,
      min_otc_investment_bdt: 500000,
      status: 'Active Capital Raise',
      show_on_showcase: true,
    },
    {
      id: DEAL_3_ID,
      business_id: BIZ_GRID_ID,
      project_title: 'Safe Plan Wealth Management Fund — ৳20 Cr Facility',
      project_description: 'GRO10X Safe Plan Wealth Management Fund: A ৳20 Crore institutional credit facility actively deployed into verified, high-turnover corporate purchase orders and SME work orders (7–10 day turnaround, 12%–18% per-cycle gross margins). ৳5+ Crore AUM currently managed across 50+ private wealth investors. Delivers a steady 18%–22% annual fixed return with quarterly liquidity cycles.',
      funding_type: 'Wealth Management',
      target_raise_bdt: 200000000,
      amount_raised_bdt: 52500000,
      spv_name: 'Safe Plan Wealth Management SPV-01',
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
      corporate_client: 'Delta Limited',
      po_ref_number: 'DL/Bag Combo/2026/1013(August)',
      po_date: '2026-08-30',
      po_value_bdt: 313500,
      item_description: 'Cross Body Bag (550 pcs) & Jute Carrying Bag (550 pcs)',
      investment_amount_bdt: 250000,
      return_amount_bdt: 287500,
      profit_bdt: 37500,
      duration_days: 7,
      start_date: '2026-08-30',
      due_date: '2026-09-06',
      return_date: '2026-09-06',
      settled_date: '2026-09-06',
      status: 'Settled_Repaid',
      payment_mode: 'EFT/NPSB',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'PO Ref: DL/Bag Combo/2026/1013(August) (৳3,13,500 total value). Disbursed in 2 CityTouch tranches (৳1.00L + ৳1.50L = ৳2.50L). 100% Repaid (৳2.875L) to Ahmed Faiz on 06 Sep 2026. Return date: 06 Sep 2026.',
      disbursement_receipt_url: '/receipts/msp-001-tranche-1.png',
      po_document_url: '/docs/msp-001-delta-po.png',
      po_document_pdf: '/docs/msp-001-delta-po.pdf',
      delivery_challan_url: '/docs/msp-001-delta-delivery-challan.png',
      delivery_challan_invoice_no: 'MCL_INVOICE_260907',
      delivery_received_date: '07 Sep 2026',
      delivery_received_by: 'Kamal (Delta Limited)',
      settlement_repayment_receipt_url: '/receipts/msp-001-full-repayment-slips.png',
      settlement_challan_receipt_url: '/docs/msp-001-delta-delivery-challan.png',
      settlement_note: 'Full principal (৳2.50L) + profit (৳37.5k) returned via 2 CityTouch tranches (৳1.86L + ৳1.015L = ৳2.875L) to Ahmed Faiz on 06 Sep 2026. Delivery confirmed via signed challan MCL_INVOICE_260907.',
      due_note: 'Settled & Repaid on 06 Sep',
      tranche_info: '2 Tranches: ৳1.00L + ৳1.50L CityTouch',
      disbursement_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 100000,
          date: '30 Aug 2026, 12:58 PM',
          ref_no: '100009619443',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-001-tranche-1.png'
        },
        {
          tranche_no: 2,
          amount_bdt: 150000,
          date: '30 Aug 2026, 09:16 PM',
          ref_no: '100009716502',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-001-tranche-2.png'
        }
      ],
      repayment_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 186000,
          date: '06 Sep 2026, 06:01 PM',
          ref_no: '100010794713',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-001-repayment-tranche-1.png'
        },
        {
          tranche_no: 2,
          amount_bdt: 101500,
          date: '06 Sep 2026, 06:02 PM',
          ref_no: '100010795080',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-001-repayment-tranche-2.png'
        }
      ]
    },
    {
      order_code: 'MSP-002',
      corporate_client: 'Delta Limited',
      po_ref_number: 'DL/Laptop Bag/2026/1014(August)',
      po_date: '2026-08-31',
      po_value_bdt: 442000,
      item_description: 'Jute Laptop Bag (680 pcs)',
      investment_amount_bdt: 375000,
      return_amount_bdt: 430000,
      profit_bdt: 55000,
      duration_days: 8,
      start_date: '2026-08-31',
      due_date: '2026-09-08',
      return_date: '2026-09-08',
      status: 'Disbursed_Active',
      payment_mode: 'EFT/NPSB + Cash Handover',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'PO Ref: DL/Laptop Bag/2026/1014(August) (৳4,42,000 total value). Disbursed in 3 tranches: ৳2.00L + ৳1.25L CityTouch + ৳50k cash handover. Return date: 08 Sep 2026.',
      disbursement_receipt_url: '/receipts/msp-002-tranche-1.png',
      po_document_url: '/docs/msp-002-delta-po.png',
      po_document_pdf: '/docs/msp-002-delta-po.pdf',
      delivery_challan_url: '/docs/msp-002-delta-delivery-challan.png',
      delivery_challan_invoice_no: 'MCL_INVOICE_260909.02',
      delivery_received_date: '09 Sep 2026',
      delivery_received_by: 'Kamal (Delta Limited)',
      due_note: 'Matured Sep 8 (Pending Repayment Slip)',
      tranche_info: '3 Tranches: ৳2.00L + ৳1.25L CityTouch + ৳50k Cash Handover',
      disbursement_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 200000,
          date: '31 Aug 2026, 05:30 PM',
          ref_no: '100009840628',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-002-tranche-1.png'
        },
        {
          tranche_no: 2,
          amount_bdt: 125000,
          date: '01 Sep 2026, 05:33 PM',
          ref_no: '100010014539',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-002-tranche-2.png'
        },
        {
          tranche_no: 3,
          amount_bdt: 50000,
          date: '01 Sep 2026, 07:05 PM',
          ref_no: 'CASH-HANDOVER-01',
          method: 'Cash Handover to Aysha Siddika Husband/Driver',
          receipt_url: '/receipts/msp-002-tranche-3-cash-comms.png',
          note: 'Confirmed via WhatsApp chat with Aysha Siddika & Firoz'
        }
      ]
    },
    {
      order_code: 'MSP-003',
      corporate_client: 'Greenfield Jutex',
      po_ref_number: 'GFJ/09/2026/212',
      po_date: '2026-09-02',
      po_value_bdt: 292500,
      item_description: 'Travel Kit Bag (650 pcs)',
      investment_amount_bdt: 230000,
      return_amount_bdt: 264500,
      profit_bdt: 34500,
      duration_days: 7,
      start_date: '2026-09-02',
      due_date: '2026-09-09',
      return_date: '2026-09-09',
      settled_date: '2026-09-15',
      status: 'Settled_Repaid',
      payment_mode: 'City Bank Transfer (CityTouch)',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'PO Ref: GFJ/09/2026/212 (৳2,92,500 PO value). Disbursed ৳2.30L via CityTouch on 02 Sep 2026. 100% Repaid (৳2.645L) to Ahmed Faiz on 15 Sep 2026.',
      disbursement_receipt_url: '/receipts/msp-003-004-combined-disbursement.png',
      po_document_url: '/docs/msp-003-greenfield-po.png',
      po_document_pdf: '/docs/msp-003-greenfield-po.pdf',
      delivery_challan_url: '/docs/msp-003-greenfield-delivery-challan.png',
      delivery_challan_invoice_no: 'MCL_INVOICE_260913',
      delivery_received_date: '13 Sep 2026',
      delivery_received_by: 'Shakil Ahmed (Greenfield Jutex)',
      settlement_repayment_receipt_url: '/receipts/msp-003-repayment.png',
      settlement_challan_receipt_url: '/docs/msp-003-greenfield-delivery-challan.png',
      settlement_note: 'Full principal (৳2.30L) + profit (৳34.5k) returned via CityTouch (৳2,64,500) to Ahmed Faiz on 15 Sep 2026. Ref: 100012161837. Delivery verified via signed challan MCL_INVOICE_260913.',
      due_note: 'Settled & Repaid on 15 Sep',
      tranche_info: 'Single Combined Tranche: ৳2.30L (Part of ৳3.75L transfer)',
      is_combined_disbursement: true,
      disbursement_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 230000,
          date: '02 Sep 2026, 05:00 PM',
          ref_no: '100010172846',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-003-004-combined-disbursement.png',
          is_combined: true,
          note: 'Disbursed in combined ৳3,75,000 single transfer with MSP-004 (2.3L + 1.45L) by Faiz Ahmed to Aysha Siddika'
        }
      ],
      repayment_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 264500,
          date: '15 Sep 2026, 10:35 AM',
          ref_no: '100012161837',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-003-repayment.png',
          note: 'Full settlement of ৳2.645L transferred by Aysha Siddika to Ahmed Faiz'
        }
      ]
    },
    {
      order_code: 'MSP-004',
      corporate_client: 'Delta Limited',
      po_ref_number: 'DL/Key Ring/2026/1016(September)',
      po_date: '2026-09-02',
      po_value_bdt: 194625,
      item_description: 'Leather Key Ring with ID Hook (2,250 pcs)',
      investment_amount_bdt: 145000,
      return_amount_bdt: 166000,
      profit_bdt: 21000,
      duration_days: 7,
      start_date: '2026-09-02',
      due_date: '2026-09-09',
      return_date: '2026-09-09',
      settled_date: '2026-09-15',
      status: 'Settled_Repaid',
      payment_mode: 'City Bank Transfer (CityTouch)',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'PO Ref: DL/Key Ring/2026/1016(September) (৳1,94,625 PO value). Disbursed ৳1.45L via CityTouch on 02 Sep 2026. 100% Repaid (৳1.66L) to Ahmed Faiz on 15 Sep 2026.',
      disbursement_receipt_url: '/receipts/msp-003-004-combined-disbursement.png',
      po_document_url: '/docs/msp-004-delta-po.png',
      po_document_pdf: '/docs/msp-004-delta-po.pdf',
      delivery_challan_url: '/docs/msp-004-delta-delivery-challan.png',
      delivery_challan_invoice_no: 'MCL_INVOICE_260913.02',
      delivery_received_date: '13 Sep 2026',
      delivery_received_by: 'Kamal (Delta Limited)',
      settlement_repayment_receipt_url: '/receipts/msp-004-repayment.png',
      settlement_challan_receipt_url: '/docs/msp-004-delta-delivery-challan.png',
      settlement_note: 'Full principal (৳1.45L) + profit (৳21k) returned via CityTouch (৳1,66,000) to Ahmed Faiz on 15 Sep 2026. Ref: 100012173609. Delivery verified via signed challan MCL_INVOICE_260913.02.',
      due_note: 'Settled & Repaid on 15 Sep',
      tranche_info: 'Single Combined Tranche: ৳1.45L (Part of ৳3.75L transfer)',
      is_combined_disbursement: true,
      disbursement_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 145000,
          date: '02 Sep 2026, 05:00 PM',
          ref_no: '100010172846',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-003-004-combined-disbursement.png',
          is_combined: true,
          note: 'Disbursed in combined ৳3,75,000 single transfer with MSP-003 (2.3L + 1.45L) by Faiz Ahmed to Aysha Siddika'
        }
      ],
      repayment_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 166000,
          date: '15 Sep 2026, 11:48 AM',
          ref_no: '100012173609',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-004-repayment.png',
          note: 'Full settlement of ৳1.66L transferred by Aysha Siddika to Ahmed Faiz'
        }
      ]
    },
    {
      order_code: 'MSP-005',
      corporate_client: 'Greenfield Jutex',
      po_ref_number: 'GFJ/09/2026/214',
      po_date: '2026-09-03',
      po_value_bdt: 486000,
      item_description: 'Back Pack (450 pcs)',
      investment_amount_bdt: 400000,
      return_amount_bdt: 475000,
      profit_bdt: 75000,
      duration_days: 10,
      start_date: '2026-09-03',
      due_date: '2026-09-13',
      return_date: '2026-09-13',
      status: 'Disbursed_Active',
      payment_mode: 'City Bank Transfer (CityTouch)',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'PO Ref: GFJ/09/2026/214 (৳4,86,000 PO value). Disbursed in 2 CityTouch tranches: ৳3.00L (Sep 3) + ৳1.00L (Sep 4) = ৳4.00L total. Return date: 13 Sep 2026.',
      disbursement_receipt_url: '/receipts/msp-005-tranche-1.png',
      po_document_url: '/docs/msp-005-greenfield-po.png',
      po_document_pdf: '/docs/msp-005-greenfield-po.pdf',
      delivery_challan_url: '/docs/msp-005-greenfield-delivery-challan.png',
      delivery_challan_invoice_no: 'MCL_INVOICE_260915',
      delivery_received_date: '15 Sep 2026',
      delivery_received_by: 'Shakil Ahmed (Greenfield Jutex)',
      due_note: 'Due Sep 13 (4 days left)',
      tranche_info: '2 Tranches: ৳3.00L + ৳1.00L CityTouch',
      disbursement_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 300000,
          date: '03 Sep 2026, 07:28 PM',
          ref_no: '100010368445',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-005-tranche-1.png',
          note: 'Tranche 1: ৳3.00L disbursed via CityTouch to Aysha Siddika'
        },
        {
          tranche_no: 2,
          amount_bdt: 100000,
          date: '04 Sep 2026, 07:24 PM',
          ref_no: '100010489125',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-005-tranche-2.png',
          note: 'Tranche 2: ৳1.00L top-up disbursed via CityTouch to Aysha Siddika'
        }
      ]
    },
    {
      order_code: 'MSP-006',
      corporate_client: 'Unique Group',
      po_ref_number: 'PO-00474151',
      po_date: '2026-09-06',
      po_value_bdt: 374000,
      item_description: 'Jute Shopping Bag (2,000 pcs)',
      investment_amount_bdt: 325000,
      return_amount_bdt: 375000,
      profit_bdt: 50000,
      duration_days: 13,
      start_date: '2026-09-06',
      due_date: '2026-09-19',
      return_date: '2026-09-19',
      status: 'Disbursed_Active',
      payment_mode: 'City Bank Transfer (CityTouch)',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'PO Ref: PO-00474151 (৳3,74,000 PO value with VAT). Disbursed in combined ৳5,15,000 single transfer (৳3.25L for MSP-006 + ৳1.90L for MSP-009) to Aysha Siddika on 06 Sep 2026. Return date: 19 Sep 2026.',
      disbursement_receipt_url: '/receipts/msp-006-009-combined-disbursement.png',
      po_document_url: '/docs/msp-006-unique-po.png',
      po_document_pdf: '/docs/msp-006-unique-po.pdf',
      due_note: 'Due Sep 19 (10 days left)',
      tranche_info: 'Single Combined Tranche: ৳3.25L (Part of ৳5.15L transfer)',
      is_combined_disbursement: true,
      disbursement_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 325000,
          date: '06 Sep 2026, 05:54 PM',
          ref_no: '100010793142',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-006-009-combined-disbursement.png',
          is_combined: true,
          note: 'Disbursed in combined ৳5,15,000 single transfer with MSP-009 (3.25L + 1.90L) to Aysha Siddika'
        }
      ]
    },
    {
      order_code: 'MSP-007',
      corporate_client: 'National Life Insurance PLC',
      po_ref_number: 'NLIC-PO-078422',
      po_date: '2026-09-07',
      po_value_bdt: 310000,
      item_description: 'Short Wallet (680 pcs)',
      investment_amount_bdt: 250000,
      return_amount_bdt: 290000,
      profit_bdt: 40000,
      duration_days: 8,
      start_date: '2026-09-10',
      due_date: '2026-09-18',
      return_date: '2026-09-18',
      status: 'Disbursed_Active',
      payment_mode: 'City Bank Transfer (CityTouch)',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'PO Ref: NLIC-PO-078422 (৳3,10,000 PO value). Disbursed ৳2.50L via CityTouch on 10 Sep 2026. Return date: 18 Sep 2026.',
      disbursement_receipt_url: '/receipts/msp-007-disbursement.png',
      po_document_url: '/docs/msp-007-national-life-po.png',
      po_document_pdf: '/docs/msp-007-national-life-po.pdf',
      due_note: 'Due Sep 18 (7 days left)',
      tranche_info: 'Single Tranche: ৳2.50L CityTouch',
      disbursement_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 250000,
          date: '10 Sep 2026, 06:35 PM',
          ref_no: '100011514433',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-007-disbursement.png',
          note: 'Disbursed ৳2.50L via CityTouch by Faiz Ahmed on 10 Sep 2026'
        }
      ]
    },
    {
      order_code: 'MSP-008',
      corporate_client: 'National Life Insurance PLC',
      po_ref_number: 'NLIC-PO-078420',
      po_date: '2026-09-06',
      po_value_bdt: 400000,
      item_description: 'Jute Shopping Bag (2,800 pcs)',
      investment_amount_bdt: 275000,
      return_amount_bdt: 315000,
      profit_bdt: 40000,
      duration_days: 9,
      start_date: '2026-09-10',
      due_date: '2026-09-19',
      return_date: '2026-09-19',
      status: 'Disbursed_Active',
      payment_mode: 'City Bank Transfer (CityTouch)',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'PO Ref: NLIC-PO-078420 (৳4,00,000 PO value). Disbursed ৳2.75L via CityTouch on 10 Sep 2026. Return date: 19 Sep 2026.',
      disbursement_receipt_url: '/receipts/msp-008-disbursement.png',
      po_document_url: '/docs/msp-008-national-life-po.png',
      po_document_pdf: '/docs/msp-008-national-life-po.pdf',
      due_note: 'Due Sep 19 (8 days left)',
      tranche_info: 'Single Tranche: ৳2.75L CityTouch',
      disbursement_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 275000,
          date: '10 Sep 2026, 06:40 PM',
          ref_no: '100011515558',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-008-disbursement.png',
          note: 'Disbursed ৳2.75L via CityTouch by Faiz Ahmed on 10 Sep 2026'
        }
      ]
    },
    {
      order_code: 'MSP-009',
      corporate_client: 'Delta Limited',
      po_ref_number: 'DL/MUG/2026/2114(September)',
      po_date: '2026-09-06',
      po_value_bdt: 241500,
      item_description: 'Porcelain mug four color branding (1,150 pcs)',
      investment_amount_bdt: 190000,
      return_amount_bdt: 220000,
      profit_bdt: 30000,
      duration_days: 9,
      start_date: '2026-09-06',
      due_date: '2026-09-15',
      return_date: '2026-09-15',
      status: 'Disbursed_Active',
      payment_mode: 'City Bank Transfer (CityTouch)',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'PO Ref: DL/MUG/2026/2114(September) (৳2,41,500 PO value). Disbursed in combined ৳5,15,000 single transfer (৳3.25L for MSP-006 + ৳1.90L for MSP-009) to Aysha Siddika on 06 Sep 2026. Return date: 15 Sep 2026.',
      disbursement_receipt_url: '/receipts/msp-006-009-combined-disbursement.png',
      po_document_url: '/docs/msp-009-delta-po.png',
      po_document_pdf: '/docs/msp-009-delta-po.pdf',
      due_note: 'Due Sep 15 (6 days left)',
      tranche_info: 'Single Combined Tranche: ৳1.90L (Part of ৳5.15L transfer)',
      is_combined_disbursement: true,
      disbursement_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 190000,
          date: '06 Sep 2026, 05:54 PM',
          ref_no: '100010793142',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-006-009-combined-disbursement.png',
          is_combined: true,
          note: 'Disbursed in combined ৳5,15,000 single transfer with MSP-006 (3.25L + 1.90L) to Aysha Siddika'
        }
      ]
    },
    {
      order_code: 'MSP-010',
      corporate_client: 'Sheltech (Pvt.) Ltd.',
      po_ref_number: 'Sheltech/Brand/26-000142',
      po_date: '2026-09-14',
      po_value_bdt: 640000,
      item_description: 'Sheltech Branded Printed Mug (2,000 pcs)',
      investment_amount_bdt: 550000,
      return_amount_bdt: 610000,
      profit_bdt: 60000,
      duration_days: 3,
      start_date: '2026-09-14',
      due_date: '2026-09-17',
      return_date: '2026-09-17',
      status: 'Disbursed_Active',
      payment_mode: 'City Bank Transfer (CityTouch)',
      bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
      notes: 'PO Ref: Sheltech/Brand/26-000142 (৳6,40,000 PO value). 2,000 pcs porcelain ceramic mugs with 24K Gold branding @ ৳320. Disbursed ৳5.50L via CityTouch on 14 Sep 2026. Return date: 17 Sep 2026.',
      disbursement_receipt_url: '/receipts/msp-010-disbursement.png',
      po_document_url: '/docs/msp-010-sheltech-po.png',
      po_document_pdf: '/docs/msp-010-sheltech-po.pdf',
      due_note: 'Due Sep 17 (3 days left)',
      tranche_info: 'Single Tranche: ৳5.50L CityTouch',
      disbursement_transfers: [
        {
          tranche_no: 1,
          amount_bdt: 550000,
          date: '14 Sep 2026, 05:57 PM',
          ref_no: '100012081695',
          method: 'City Bank Transfer (CityTouch)',
          receipt_url: '/receipts/msp-010-disbursement.png',
          note: 'Disbursed ৳5.50L via CityTouch by Faiz Ahmed on 14 Sep 2026'
        }
      ]
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
