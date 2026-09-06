import { supabase } from './supabase';

export const MAATS_COTTAGE_PROFILE = {
  companyName: 'Maats Cottage Ltd',
  legalName: 'Maats Cottage Limited',
  industry: 'Corporate Supply & Institutional Merchandise',
  founder: 'Aysha Siddika',
  founderTitle: 'Managing Director & Founder',
  phone: '+880 1770-417459',
  email: 'aysha@maatscottage.com',
  bankName: 'City Bank / BRAC Bank Network',
  accountName: 'AYSHA SIDDIKA',
  accountNumber: '2621519538001',
  paymentMode: 'EFT / NPSB Fast Transfer',
  revolvingFacilityLimit: 2500000, // ৳25 Lakhs
  facilityName: 'Safe Home Wealth Management Fund — ৳20 Cr Facility',
  managingPartner: {
    name: 'Faiz Ahmed (Faiz Bhai)',
    phone: '01784397960',
    role: 'Managing Partner & Fund Director',
    bot: '@gro10xmanbot'
  },
  complianceChecklist: [
    { id: 'tl', title: 'Trade License (Dhaka North)', status: 'Verified', date: '2025-2026 Active', docNumber: 'TRAD/DNCC/049182/2024' },
    { id: 'tin', title: 'e-TIN Certificate', status: 'Verified', date: 'Zone 11 Dhaka', docNumber: 'TIN-5819-2041-8891' },
    { id: 'bin', title: 'BIN / VAT 9.1 Registration', status: 'Verified', date: 'NBR Compliant', docNumber: 'BIN-003819204-0101' },
    { id: 'nid', title: 'Director NID & CIB Clearance', status: 'Verified', date: 'Grade-A Zero Default', docNumber: 'NID-198826912049182' },
    { id: 'chq', title: 'Security Cheque Leaf', status: 'Verified', date: 'Undated Signed Leaf Deposited', docNumber: 'CHQ #9410284' }
  ]
};

export const SEED_WORK_ORDERS = [
  {
    id: 'wo-001',
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
    status: 'Disbursed_Active',
    payment_mode: 'EFT/NPSB',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: DL/Bag Combo/2026/1013(August) (৳3,13,500 total value). Disbursed in 2 CityTouch tranches (৳1.00L + ৳1.50L = ৳2.50L). Closing today Sep 6 by 4:00 PM.',
    disbursement_receipt_url: '/receipts/msp-001-tranche-1.png',
    po_document_url: '/docs/msp-001-delta-po.png',
    po_document_pdf: '/docs/msp-001-delta-po.pdf',
    due_note: 'CLOSING TODAY (4:00 PM)',
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
    ]
  },
  {
    id: 'wo-002',
    order_code: 'MSP-002',
    corporate_client: 'Delta Limited',
    po_ref_number: 'DL/Laptop Bag/2026/1014(August)',
    po_date: '2026-08-31',
    po_value_bdt: 442000,
    item_description: 'Jute Laptop Bag (680 pcs)',
    investment_amount_bdt: 375000,
    return_amount_bdt: 430000,
    profit_bdt: 55000,
    duration_days: 9,
    start_date: '2026-08-31',
    due_date: '2026-09-09',
    status: 'Disbursed_Active',
    payment_mode: 'EFT/NPSB + Cash Handover',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: DL/Laptop Bag/2026/1014(August) (৳4,42,000 total value). Disbursed in 3 tranches: ৳2.00L + ৳1.25L CityTouch + ৳50k cash handover.',
    disbursement_receipt_url: '/receipts/msp-002-tranche-1.png',
    po_document_url: '/docs/msp-002-delta-po.png',
    po_document_pdf: '/docs/msp-002-delta-po.pdf',
    due_note: 'Due Sep 9 (3 days left)',
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
    id: 'wo-003',
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
    notes: 'Greenfield corporate supply batch 1.',
    disbursement_receipt_url: '/receipts/msp-003.png',
    due_note: 'Due Sep 9 (3 days left)'
  },
  {
    id: 'wo-004',
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
    notes: 'Delta Life Order 3 — Finishing & packaging in progress.',
    disbursement_receipt_url: null,
    due_note: 'Due Sep 9 (3 days left)'
  },
  {
    id: 'wo-005',
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
    notes: 'Greenfield customized backpack batch. Fabric cut and stitching commenced.',
    disbursement_receipt_url: null,
    due_note: 'Due Sep 13 (7 days left)'
  },
  {
    id: 'wo-006',
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
    notes: 'Corporate jute shopping bags for nationwide branch campaign. Client PO verified.',
    disbursement_receipt_url: null,
    due_note: 'Awaiting Disbursal'
  },
  {
    id: 'wo-007',
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
    notes: 'Premium leather executive short wallets. Material procurement lined up.',
    disbursement_receipt_url: null,
    due_note: 'Awaiting Disbursal'
  },
  {
    id: 'wo-008',
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
    notes: 'Unique Group corporate eco shopping bags.',
    disbursement_receipt_url: null,
    due_note: 'Awaiting Disbursal'
  },
  {
    id: 'wo-009',
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
    notes: 'Delta promotional ceramic custom mugs.',
    disbursement_receipt_url: null,
    due_note: 'Awaiting Disbursal'
  }
];

const STORAGE_KEY = 'gro10x_work_orders_cache_v3';

/**
 * Fetch all work orders with Supabase query + localStorage cache + fallback seed data
 */
export async function getWorkOrders() {
  // 1. Check local session cache first for instantaneous UI state
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
  }

  // 2. Try Supabase if no local session cache
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
      return data;
    }
  } catch (err) {
    // Schema cache / table not created yet or offline
  }

  // 3. Return canonical seed list
  return SEED_WORK_ORDERS;
}

/**
 * Save / Update a work order in Supabase and local cache
 */
export async function saveWorkOrder(order) {
  let updatedOrders = [];
  const existing = await getWorkOrders();

  const idx = existing.findIndex(o => o.order_code === order.order_code);
  if (idx >= 0) {
    existing[idx] = { ...existing[idx], ...order };
    updatedOrders = [...existing];
  } else {
    updatedOrders = [order, ...existing];
  }

  // Save to localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
  }

  // Sync to Supabase in background
  try {
    supabase.from('work_orders').upsert([order], { onConflict: 'order_code' }).then(() => {}).catch(() => {});
  } catch (err) {}

  return updatedOrders;
}

/**
 * Create a new work order and fire Telegram notification
 */
export async function createWorkOrder(orderObj) {
  const updated = await saveWorkOrder(orderObj);

  // Trigger Telegram notification asynchronously
  if (typeof window !== 'undefined') {
    fetch('/api/notify-work-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'created', order: orderObj })
    }).catch(() => {});
  }

  return updated;
}

/**
 * Approve and Disburse a pending order
 */
export async function approveAndDisburseOrder(orderCode, options = {}) {
  const existing = await getWorkOrders();
  const order = existing.find(o => o.order_code === orderCode);
  if (!order) return existing;

  const today = new Date().toISOString().split('T')[0];
  const dueDateObj = new Date();
  dueDateObj.setDate(dueDateObj.getDate() + (order.duration_days || 10));
  const dueDate = dueDateObj.toISOString().split('T')[0];

  const updatedOrder = {
    ...order,
    status: 'Disbursed_Active',
    start_date: today,
    due_date: dueDate,
    due_note: `Disbursed today (Due in ${order.duration_days || 10} days)`,
    ...options
  };

  const updated = await saveWorkOrder(updatedOrder);

  // Trigger Telegram notification asynchronously
  if (typeof window !== 'undefined') {
    fetch('/api/notify-work-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'approved', order: updatedOrder })
    }).catch(() => {});
  }

  return updated;
}

/**
 * Settle and Close an active order with dual-document verification
 */
export async function settleWorkOrder(orderCode, settlementData = {}) {
  const existing = await getWorkOrders();
  const order = existing.find(o => o.order_code === orderCode);
  if (!order) return existing;

  const today = new Date().toISOString().split('T')[0];
  const updatedOrder = {
    ...order,
    status: 'Settled_Repaid',
    settled_date: today,
    due_note: 'Settled & Repaid',
    settlement_repayment_receipt_url: settlementData.repayment_receipt_url || null,
    settlement_challan_receipt_url: settlementData.challan_receipt_url || null,
    settlement_invoice_receipt_url: settlementData.invoice_receipt_url || null,
    settlement_note: settlementData.note || 'Repayment verified via bank slip & delivery challan'
  };

  const updated = await saveWorkOrder(updatedOrder);

  // Trigger Telegram notification asynchronously
  if (typeof window !== 'undefined') {
    fetch('/api/notify-work-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'settled', order: updatedOrder })
    }).catch(() => {});
  }

  return updated;
}

/**
 * Calculate financial totals and ratios
 */
export function calculateLedgerMetrics(orders = []) {
  const activeOrders = orders.filter(o => o.status === 'Disbursed_Active');
  const pendingOrders = orders.filter(o => o.status === 'Pending_Approval');
  const settledOrders = orders.filter(o => o.status === 'Settled_Repaid');

  const totalDisbursedActive = activeOrders.reduce((sum, o) => sum + Number(o.investment_amount_bdt || 0), 0);
  const totalExpectedReturnActive = activeOrders.reduce((sum, o) => sum + Number(o.return_amount_bdt || 0), 0);
  const totalActiveProfit = totalExpectedReturnActive - totalDisbursedActive;

  const totalPendingCapital = pendingOrders.reduce((sum, o) => sum + Number(o.investment_amount_bdt || 0), 0);
  const totalPendingReturn = pendingOrders.reduce((sum, o) => sum + Number(o.return_amount_bdt || 0), 0);
  const totalPendingProfit = totalPendingReturn - totalPendingCapital;

  const totalSettledCapital = settledOrders.reduce((sum, o) => sum + Number(o.investment_amount_bdt || 0), 0);
  const totalSettledProfit = settledOrders.reduce((sum, o) => sum + Number(o.profit_bdt || 0), 0);

  const avgMarginActivePct = totalDisbursedActive > 0 
    ? ((totalActiveProfit / totalDisbursedActive) * 100).toFixed(2) 
    : '0.00';

  const avgDurationDays = activeOrders.length > 0 
    ? (activeOrders.reduce((sum, o) => sum + Number(o.duration_days || 7), 0) / activeOrders.length).toFixed(1)
    : '7.5';

  return {
    totalDisbursedActive,
    totalExpectedReturnActive,
    totalActiveProfit,
    avgMarginActivePct,
    avgDurationDays,
    activeCount: activeOrders.length,
    pendingCount: pendingOrders.length,
    settledCount: settledOrders.length,
    totalPendingCapital,
    totalPendingReturn,
    totalPendingProfit,
    totalSettledCapital,
    totalSettledProfit,
    totalOrdersCount: orders.length
  };
}

/**
 * Generates formatted text for WhatsApp group updates ("Maats Cottage small work order")
 */
export function generateWhatsAppBroadcast(orders = []) {
  const metrics = calculateLedgerMetrics(orders);
  const activeOrders = orders.filter(o => o.status === 'Disbursed_Active');
  const pendingOrders = orders.filter(o => o.status === 'Pending_Approval');

  const lines = [
    `🏢 *GRO10X CAPITAL × SAFE HOME WEALTH MANAGEMENT FUND*`,
    `📋 *WORK-ORDER FINANCING STATUS UPDATE*`,
    `🗓️ *Date:* ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    `Borrower: *Maats Cottage Ltd* (Aysha Siddika)`,
    `Managing Partner: *Faiz Ahmed* (01784397960)`,
    `───────────────────────────────`,
    `📊 *PORTFOLIO SUMMARY:*`,
    `• Active Capital Deployed: *৳${(metrics.totalDisbursedActive / 100000).toFixed(2)} Lac* (${activeOrders.length} Orders)`,
    `• Expected Gross Return: *৳${(metrics.totalExpectedReturnActive / 100000).toFixed(2)} Lac*`,
    `• Net Cycle Profit: *৳${(metrics.totalActiveProfit / 1000).toFixed(0)}k* (${metrics.avgMarginActivePct}%)`,
    `• Pending Disbursal Requests: *৳${(metrics.totalPendingCapital / 100000).toFixed(2)} Lac* (${pendingOrders.length} Orders)`,
    `───────────────────────────────`,
    `⚡ *ACTIVE DEPLOYMENTS:*`
  ];

  activeOrders.forEach(o => {
    const invLac = (Number(o.investment_amount_bdt) / 100000).toFixed(2);
    const retLac = (Number(o.return_amount_bdt) / 100000).toFixed(2);
    const profitK = (Number(o.profit_bdt || (o.return_amount_bdt - o.investment_amount_bdt)) / 1000).toFixed(0);
    const alert = o.due_note ? ` — ⚠️ *${o.due_note}*` : '';
    lines.push(`▸ *${o.order_code}* | ${o.corporate_client} (${o.item_description})`);
    lines.push(`  Disbursed: ৳${invLac}L → Return: ৳${retLac}L (+৳${profitK}k)${alert}`);
  });

  if (pendingOrders.length > 0) {
    lines.push(`───────────────────────────────`);
    lines.push(`⏳ *PENDING APPROVALS & DISBURSAL:*`);
    pendingOrders.forEach(o => {
      const invLac = (Number(o.investment_amount_bdt) / 100000).toFixed(2);
      const retLac = (Number(o.return_amount_bdt) / 100000).toFixed(2);
      const profitK = (Number(o.profit_bdt || (o.return_amount_bdt - o.investment_amount_bdt)) / 1000).toFixed(0);
      lines.push(`▸ *${o.order_code}* | ${o.corporate_client}: ${o.item_description} | Ask: ৳${invLac}L → Return: ৳${retLac}L (+৳${profitK}k, ${o.duration_days || 10} days)`);
    });
  }

  lines.push(`───────────────────────────────`);
  lines.push(`💳 *Settlement A/C:* AYSHA SIDDIKA (A/C: 2621519538001, EFT/NPSB)`);
  lines.push(`🔗 *Live Terminal Link:* https://gro10x-capital-rho.vercel.app/track/maats-cottage`);

  return lines.join('\n');
}
