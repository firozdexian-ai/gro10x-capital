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
  facilityName: 'Safe Plan Wealth Management Fund — ৳20 Cr Facility',
  foundedYear: 2016,
  headquarters: 'Solmaid Dhali Bari, Vatara, Dhaka-1212',
  website: 'www.maatscottage.com',
  companyProfilePdf: '/docs/maats-company-profile.pdf',
  showroomGallery: [
    { url: '/maats/5.jpeg', title: 'Executive Finished Leather Wallets', category: 'Leather Goods' },
    { url: '/maats/6.jpeg', title: 'Handcrafted Minimalist Leather Wallets', category: 'Leather Goods' },
    { url: '/maats/7.jpeg', title: 'Premium Full-Grain Leather Belts', category: 'Accessories' },
    { url: '/maats/8.jpeg', title: 'Hand-stitched Formal Leather Belts', category: 'Accessories' },
    { url: '/maats/2.jpeg', title: 'Greenfield Jutex Travel Kit & Duffel Bags', category: 'Jute & Canvas' },
    { url: '/maats/3.jpeg', title: 'Heavy-Duty Corporate Backpacks', category: 'Bags & Packs' },
    { url: '/maats/4.jpeg', title: 'Custom Institutional Jute Conference Bags', category: 'Corporate Gifts' },
    { url: '/maats/WhatsApp Image 2026-08-31 at 2.59.40 PM.jpeg', title: 'Finished Order Packaging & Mohakhali Dispatch Ready', category: 'Logistics' }
  ],
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
    return_date: '2026-09-06',
    settled_date: '2026-09-06',
    status: 'Settled_Repaid',
    payment_mode: 'EFT/NPSB',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: DL/Bag Combo/2026/1013(August) (৳3,13,500 total value). Disbursed in 2 CityTouch tranches (৳1.00L + ৳1.50L = ৳2.50L). 100% Repaid (৳2.875L) to Ahmed Faiz on 06 Sep 2026.',
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
    id: 'wo-003',
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
    id: 'wo-004',
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
    settlement_note: 'Full principal (৳1.45L) + profit (৳21k) returned via CityTouch (৳1,66,000) to Ahmed Faiz on 15 Sep 2026. Ref: 100012173609. Delivery confirmed via signed challan MCL_INVOICE_260913.02.',
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
    id: 'wo-005',
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
    id: 'wo-006',
    order_code: 'MSP-006',
    corporate_client: 'Unique Group',
    po_ref_number: 'PO-00474151',
    po_date: '2026-09-05',
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
    id: 'wo-007',
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
    id: 'wo-008',
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
    id: 'wo-009',
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
    id: 'wo-010',
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

const STORAGE_KEY = 'gro10x_work_orders_cache_v12';

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
 * Revert an order back to Pending_Approval (useful if accidentally disbursed)
 */
export async function revertOrderToPending(orderCode) {
  const existing = await getWorkOrders();
  const order = existing.find(o => o.order_code === orderCode);
  if (!order) return existing;

  const updatedOrder = {
    ...order,
    status: 'Pending_Approval',
    start_date: null,
    due_note: 'Awaiting Disbursal',
    disbursement_receipt_url: null,
    disbursement_transfers: []
  };

  const updated = await saveWorkOrder(updatedOrder);
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
 * Format ISO date string (YYYY-MM-DD) into readable British / BD business date (e.g. 08 Sep 2026)
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return 'TBD';
  try {
    const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Dynamically computes real-time due status and countdown relative to today's date
 */
export function computeDueStatus(order, refDate = new Date()) {
  if (!order) return '';
  if (order.status === 'Settled_Repaid') return order.due_note || 'Settled & Repaid';
  if (order.status === 'Pending_Approval') return order.due_note || 'Awaiting Partner Sign-off';
  if (!order.due_date && !order.return_date) return order.due_note || '';

  const targetDateStr = order.due_date || order.return_date;
  const today = new Date(refDate);
  today.setHours(0, 0, 0, 0);

  const due = new Date(targetDateStr + (targetDateStr.includes('T') ? '' : 'T00:00:00'));
  due.setHours(0, 0, 0, 0);

  if (isNaN(due.getTime())) return order.due_note || '';

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const displayDate = formatDisplayDate(targetDateStr);

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    return `🔴 ${absDays} Day${absDays > 1 ? 's' : ''} Overdue (was due ${displayDate})`;
  }
  if (diffDays === 0) {
    return `🚨 DUE TODAY (${displayDate})`;
  }
  if (diffDays === 1) {
    return `⚠️ Due Tomorrow (${displayDate})`;
  }
  if (diffDays <= 3) {
    return `⚠️ Due ${displayDate} (${diffDays} days left)`;
  }
  return `Due ${displayDate} (${diffDays} days left)`;
}

/**
 * Generates formatted text for WhatsApp group updates ("Maats Cottage small work order")
 */
export function generateWhatsAppBroadcast(orders = []) {
  const metrics = calculateLedgerMetrics(orders);
  const activeOrders = orders.filter(o => o.status === 'Disbursed_Active');
  const pendingOrders = orders.filter(o => o.status === 'Pending_Approval');
  const settledOrders = orders.filter(o => o.status === 'Settled_Repaid');

  const headroom = 2500000 - metrics.totalDisbursedActive;
  const headroomLine = headroom >= 0
    ? `• Available Fund Headroom: *৳${(headroom / 100000).toFixed(2)} Lac* (of ৳25.00L Limit)`
    : `• Available Fund Headroom: *৳0.00 Lac* (Active ৳${(metrics.totalDisbursedActive / 100000).toFixed(2)}L deployed of ৳25.00L Limit — 109.6% Peak Revolving)`;

  const lines = [
    `🏢 *GRO10X CAPITAL × SAFE PLAN WEALTH MANAGEMENT FUND*`,
    `📋 *WORK-ORDER FINANCING STATUS UPDATE*`,
    `🗓️ *Date:* ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    `Borrower: *Maats Cottage Ltd* (Aysha Siddika)`,
    `Managing Partner: *Faiz Ahmed* (01784397960)`,
    `───────────────────────────────`,
    `📊 *PORTFOLIO SUMMARY:*`,
    `• Active Capital Deployed: *৳${(metrics.totalDisbursedActive / 100000).toFixed(2)} Lac* (${activeOrders.length} Orders)`,
    `• Expected Gross Return: *৳${(metrics.totalExpectedReturnActive / 100000).toFixed(2)} Lac*`,
    `• Net Cycle Profit: *৳${(metrics.totalActiveProfit / 1000).toFixed(0)}k* (${metrics.avgMarginActivePct}%)`,
    `• Total Settled & Repaid: *৳${(metrics.totalSettledCapital / 100000).toFixed(2)} Lac* (${settledOrders.length} Order${settledOrders.length === 1 ? '' : 's'} Completed ✓)`,
    headroomLine,
    `• Pending Disbursal Requests: *৳${(metrics.totalPendingCapital / 100000).toFixed(2)} Lac* (${pendingOrders.length} Orders)`,
    `───────────────────────────────`,
    `⚡ *ACTIVE DEPLOYMENTS:*`
  ];

  activeOrders.forEach(o => {
    const invLac = (Number(o.investment_amount_bdt) / 100000).toFixed(2);
    const retLac = (Number(o.return_amount_bdt) / 100000).toFixed(2);
    const profitK = (Number(o.profit_bdt || (o.return_amount_bdt - o.investment_amount_bdt)) / 1000).toFixed(0);
    const dueStatus = computeDueStatus(o);
    const alert = dueStatus ? ` — *${dueStatus}*` : '';
    lines.push(`▸ *${o.order_code}* | ${o.corporate_client} (${o.item_description})`);
    lines.push(`  Disbursed: ৳${invLac}L → Return: ৳${retLac}L (+৳${profitK}k)${alert}`);
  });

  if (settledOrders.length > 0) {
    lines.push(`───────────────────────────────`);
    lines.push(`✅ *COMPLETED & FULLY REPAID:*`);
    settledOrders.forEach(o => {
      const invLac = (Number(o.investment_amount_bdt) / 100000).toFixed(2);
      const retLac = (Number(o.return_amount_bdt) / 100000).toFixed(2);
      const profitK = (Number(o.profit_bdt || (o.return_amount_bdt - o.investment_amount_bdt)) / 1000).toFixed(0);
      lines.push(`▸ *${o.order_code}* | ${o.corporate_client} (${o.item_description})`);
      lines.push(`  Settled: ৳${retLac}L on ${o.settled_date || '06 Sep'} (Principal ৳${invLac}L + Profit ৳${profitK}k) ✓`);
    });
  }

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
