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
    status: 'Settled_Repaid',
    payment_mode: 'EFT/NPSB + Cash Handover',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: DL/Laptop Bag/2026/1014(August) (৳4,42,000 total value). Disbursed in 3 tranches: ৳2.00L + ৳1.25L CityTouch + ৳50k cash handover. 100% Repaid (৳4.30L) to Ahmed Faiz on 21 Sep 2026.',
    disbursement_receipt_url: '/receipts/msp-002-tranche-1.png',
    po_document_url: '/docs/msp-002-delta-po.png',
    po_document_pdf: '/docs/msp-002-delta-po.pdf',
    delivery_challan_url: '/docs/msp-002-delta-delivery-challan.png',
    delivery_challan_invoice_no: 'MCL_INVOICE_260909.02',
    delivery_received_date: '09 Sep 2026',
    delivery_received_by: 'Kamal (Delta Limited)',
    settlement_repayment_receipt_url: '/receipts/msp-002-repayment.png',
    settlement_challan_receipt_url: '/docs/msp-002-delta-delivery-challan.png',
    settlement_note: 'Full principal (৳3.75L) + profit (৳55k) returned via CityTouch (৳4,30,000) to Ahmed Faiz on 21 Sep 2026. Ref: 100013027031. Delivery confirmed via signed challan MCL_INVOICE_260909.02.',
    settled_date: '2026-09-21',
    due_note: 'Settled & Repaid on 21 Sep',
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
    ],
    repayment_transfers: [
      {
        tranche_no: 1,
        amount_bdt: 430000,
        date: '21 Sep 2026, 10:27 AM',
        ref_no: '100013027031',
        method: 'City Bank Transfer (CityTouch)',
        receipt_url: '/receipts/msp-002-repayment.png',
        note: 'Full settlement of ৳4.30L transferred by Aysha Siddika to Ahmed Faiz'
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
    settled_date: '2026-09-22',
    status: 'Settled_Repaid',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: GFJ/09/2026/214 (৳4,86,000 PO value). Disbursed in 2 CityTouch tranches: ৳3.00L (Sep 3) + ৳1.00L (Sep 4) = ৳4.00L total. Settled & Repaid on 22 Sep 2026.',
    disbursement_receipt_url: '/receipts/msp-005-tranche-1.png',
    po_document_url: '/docs/msp-005-greenfield-po.png',
    po_document_pdf: '/docs/msp-005-greenfield-po.pdf',
    delivery_challan_url: '/docs/msp-005-greenfield-delivery-challan.png',
    delivery_challan_invoice_no: 'MCL_INVOICE_260915',
    delivery_received_date: '15 Sep 2026',
    delivery_received_by: 'Shakil Ahmed (Greenfield Jutex)',
    due_note: 'Settled & Repaid on 22 Sep',
    settlement_note: 'Full settlement (৳4.75L) repaid by Aysha Siddika on 22 Sep 2026; confirmed received in WhatsApp group chat.',
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
    settled_date: '2026-09-22',
    status: 'Settled_Repaid',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: DL/MUG/2026/2114(September) (৳2,41,500 PO value). Disbursed in combined ৳5,15,000 single transfer (৳3.25L for MSP-006 + ৳1.90L for MSP-009) to Aysha Siddika on 06 Sep 2026. 100% Repaid (৳2.20L) on 22 Sep 2026.',
    disbursement_receipt_url: '/receipts/msp-006-009-combined-disbursement.png',
    po_document_url: '/docs/msp-009-delta-po.png',
    po_document_pdf: '/docs/msp-009-delta-po.pdf',
    due_note: 'Settled & Repaid on 22 Sep',
    settlement_note: 'Full settlement (৳2.20L) repaid by Aysha Siddika on 22 Sep 2026; confirmed received in WhatsApp group chat.',
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
  },
  {
    id: 'wo-011',
    order_code: 'MSP-011',
    corporate_client: 'Delta Limited',
    po_ref_number: 'DL/Combo/2026/1042 (September)',
    po_date: '2026-09-15',
    po_value_bdt: 425250,
    item_description: 'Thermal Flask 500ml (300 pcs) & Leather Card Holder (255 pcs)',
    investment_amount_bdt: 350000,
    return_amount_bdt: 405000,
    profit_bdt: 55000,
    duration_days: 10,
    start_date: '2026-09-15',
    due_date: '2026-09-25',
    return_date: '2026-09-25',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: DL/Combo/2026/1042 (September) (৳4,25,250 PO value). Thermal Flask 500ml (300 pcs @ ৳950) + Leather Card Holder (255 pcs @ ৳550). Disbursed ৳3.50L via CityTouch on 15 Sep 2026. 10 days. Expected Return: ৳4.05L (+৳55k profit). Delivery: 25 Sep 2026 to Delta Warehouse Mohakhali.',
    disbursement_receipt_url: '/receipts/msp-011-disbursement.png',
    po_document_pdf: '/docs/msp-011-delta-po.pdf',
    due_note: 'Due Sep 25 (4 days left)',
    tranche_info: 'Single Tranche: ৳3.50L CityTouch',
    disbursement_transfers: [
      {
        tranche_no: 1,
        amount_bdt: 350000,
        date: '15 Sep 2026, 06:42 PM',
        ref_no: '100012248834',
        method: 'City Bank Transfer (CityTouch)',
        receipt_url: '/receipts/msp-011-disbursement.png',
        note: 'Disbursed ৳3.50L via CityTouch by Faiz Ahmed to Aysha Siddika on 15 Sep 2026'
      }
    ]
  },
  {
    id: 'wo-012',
    order_code: 'MSP-012',
    corporate_client: 'Sheltech (Pvt.) Ltd.',
    po_ref_number: 'Sheltech/Brand/26-000151',
    po_date: '2026-09-15',
    po_value_bdt: 302400,
    item_description: 'Ceramic Tableware Set (72 pcs @ ৳4,200)',
    investment_amount_bdt: 260000,
    return_amount_bdt: 290000,
    profit_bdt: 30000,
    duration_days: 5,
    start_date: '2026-09-15',
    due_date: '2026-09-20',
    return_date: '2026-09-20',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: Sheltech/Brand/26-000151 (৳3,02,400 PO value). Ceramic tableware set (72 pcs @ ৳4,200). Disbursed ৳2.60L via CityTouch on 15 Sep 2026. 5 days tenor. Expected return: ৳2.90L (+৳30k profit). Due date: 20 Sep 2026.',
    disbursement_receipt_url: '/receipts/msp-012-disbursement.png',
    po_document_pdf: '/docs/msp-012-sheltech-po.pdf',
    due_note: 'Due Sep 20 (5 days tenor)',
    tranche_info: 'Single Tranche: ৳2.60L CityTouch',
    disbursement_transfers: [
      {
        tranche_no: 1,
        amount_bdt: 260000,
        date: '15 Sep 2026, 07:03 PM',
        ref_no: '100012252879',
        method: 'City Bank Transfer (CityTouch)',
        receipt_url: '/receipts/msp-012-disbursement.png',
        note: 'Disbursed ৳2.60L via CityTouch by Faiz Ahmed to Aysha Siddika on 15 Sep 2026'
      }
    ]
  },
  {
    id: 'wo-013',
    order_code: 'MSP-013',
    corporate_client: 'Delta Pharma / Delta Limited',
    po_ref_number: 'DL/Combo/2026/1051 (September)',
    po_date: '2026-09-16',
    po_value_bdt: 220000,
    item_description: 'Pen Drive 32GB (500 pcs) & Leather Key Ring (2,000 pcs)',
    investment_amount_bdt: 170000,
    return_amount_bdt: 200000,
    profit_bdt: 30000,
    duration_days: 10,
    start_date: '2026-09-16',
    due_date: '2026-09-26',
    return_date: '2026-09-26',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: DL/Combo/2026/1051 (September) (৳2,20,000 PO value). Pen Drive (500 pcs @ ৳300) + Key Ring (2,000 pcs @ ৳35). Disbursed ৳1.70L via CityTouch on 16 Sep 2026. 10 days tenor. Expected return: ৳2.00L (+৳30k profit). Delivery: 26 Sep 2026 to Delta Warehouse Mohakhali.',
    disbursement_receipt_url: '/receipts/msp-013-disbursement.png',
    po_document_pdf: '/docs/msp-013-delta-po.pdf',
    due_note: 'Due Sep 26 (5 days left)',
    tranche_info: 'Single Tranche: ৳1.70L CityTouch',
    disbursement_transfers: [
      {
        tranche_no: 1,
        amount_bdt: 170000,
        date: '16 Sep 2026, 05:34 PM',
        ref_no: '100012398765',
        method: 'City Bank Transfer (CityTouch)',
        receipt_url: '/receipts/msp-013-disbursement.png',
        note: 'Disbursed ৳1.70L via CityTouch by Faiz Ahmed to Aysha Siddika on 16 Sep 2026'
      }
    ]
  },
  {
    id: 'wo-014',
    order_code: 'MSP-014',
    corporate_client: 'Delta Pharma / Delta Limited',
    po_ref_number: 'DL/PO/2026/1058 (September)',
    po_date: '2026-09-17',
    po_value_bdt: 2516000,
    item_description: 'Jute Bag (1k), Diary (1k), Pen (2k), Umbrella (800), T-Shirt (1.2k), Folder (800), ID Holder (3k), Water Bottle (2k)',
    investment_amount_bdt: 2120000,
    return_amount_bdt: 2500000,
    profit_bdt: 380000,
    duration_days: 7,
    start_date: '2026-09-17',
    due_date: '2026-09-24',
    return_date: '2026-09-24',
    status: 'Disbursed_Active',
    payment_mode: 'BRAC RTGS + City Bank Transfer',
    bank_account_info: 'Maats Cottage Ltd (DBBL A/C: 2081200001490) & AYSHA SIDDIKA (City A/C: 2621519538001)',
    notes: 'PO Ref: DL/PO/2026/1058 (September) (৳25,16,000 PO value). Disbursed in 2 tranches: ৳20.00L BRAC RTGS to DBBL + ৳1.20L CityTouch = ৳21.20L on 17 Sep 2026. 5-7 days sharp. Expected Return: ৳25.00L (+৳3.80L profit).',
    disbursement_receipt_url: '/receipts/msp-014-tranche-1-brac-rtgs.png',
    po_document_pdf: '/docs/msp-014-delta-po.pdf',
    due_note: 'Due Sep 24 (3 days left)',
    tranche_info: '2 Tranches: ৳20.00L BRAC RTGS + ৳1.20L CityTouch',
    disbursement_transfers: [
      {
        tranche_no: 1,
        amount_bdt: 2000000,
        date: '17 Sep 2026, 11:53 AM',
        ref_no: 'BRAC-RTGS-GULSHAN-01',
        method: 'BRAC Bank RTGS to DBBL (A/C: 2081200001490)',
        receipt_url: '/receipts/msp-014-tranche-1-brac-rtgs.png',
        note: 'Tranche 1: ৳20.00L disbursed via BRAC Bank RTGS by Ahmed Faiz to Maats Cottage Limited'
      },
      {
        tranche_no: 2,
        amount_bdt: 120000,
        date: '17 Sep 2026, 09:34 PM',
        ref_no: '100012601686',
        method: 'City Bank Transfer (CityTouch)',
        receipt_url: '/receipts/msp-014-tranche-2-citytouch.png',
        note: 'Tranche 2: ৳1.20L disbursed via CityTouch to Aysha Siddika'
      }
    ]
  },
  {
    id: 'wo-015',
    order_code: 'MSP-015',
    corporate_client: 'Crown Cement PLC',
    po_ref_number: '4001726541',
    po_date: '2026-09-20',
    po_value_bdt: 337900,
    item_description: 'ID Card Holder (1,500 pcs) & Pen Drive (500 pcs)',
    investment_amount_bdt: 250000,
    return_amount_bdt: 290000,
    profit_bdt: 40000,
    duration_days: 10,
    start_date: '2026-09-20',
    due_date: '2026-09-30',
    return_date: '2026-09-30',
    settled_date: '2026-09-30',
    status: 'Settled_Repaid',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: 4001726541 / PR: 12000063114 (৳3,37,900 Gross PO value). Disbursed ৳2.50L via CityTouch on 20 Sep 2026. 100% Repaid (৳2.90L) on 30 Sep 2026.',
    disbursement_receipt_url: '/receipts/msp-015-disbursement.png',
    po_document_pdf: '/docs/msp-015-crown-cement-po.pdf',
    due_note: 'Settled & Repaid on 30 Sep',
    settlement_note: 'Full principal (৳2.50L) + profit (৳40k) returned via bank transfer on 30 Sep 2026 (Confirmed by Faiz Ahmed: "MSP015 Payment received").',
    tranche_info: 'Single Tranche: ৳2.50L CityTouch',
    disbursement_transfers: [
      {
        tranche_no: 1,
        amount_bdt: 250000,
        date: '20 Sep 2026, 03:41 PM',
        ref_no: '100012924065',
        method: 'City Bank Transfer (CityTouch)',
        receipt_url: '/receipts/msp-015-disbursement.png',
        note: 'Disbursed ৳2.50L via CityTouch by Faiz Ahmed to Aysha Siddika on 20 Sep 2026'
      }
    ]
  },
  {
    id: 'wo-016',
    order_code: 'MSP-016',
    corporate_client: 'National Life Insurance PLC',
    po_ref_number: 'NLIC-PO-078512',
    po_date: '2026-09-20',
    po_value_bdt: 520000,
    item_description: 'Jute Shopping Bag (2,500 pcs)',
    investment_amount_bdt: 450000,
    return_amount_bdt: 505000,
    profit_bdt: 55000,
    duration_days: 10,
    start_date: '2026-09-20',
    due_date: '2026-09-30',
    return_date: '2026-09-30',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: NLIC-PO-078512 (৳5,20,000 PO value). 2,500 pcs Jute Shopping Bags @ ৳208. Disbursed ৳4.50L via CityTouch on 20 Sep 2026. Return: ৳5.05L (+৳55k profit). Due date: 30 Sep 2026.',
    disbursement_receipt_url: '/receipts/msp-016-disbursement.png',
    po_document_pdf: '/docs/msp-016-national-life-po.pdf',
    due_note: 'Due Sep 30 (9 days left)',
    tranche_info: 'Single Tranche: ৳4.50L CityTouch',
    disbursement_transfers: [
      {
        tranche_no: 1,
        amount_bdt: 450000,
        date: '20 Sep 2026, 04:06 PM',
        ref_no: '100012928876',
        method: 'City Bank Transfer (CityTouch)',
        receipt_url: '/receipts/msp-016-disbursement.png',
        note: 'Disbursed ৳4.50L via CityTouch by Faiz Ahmed to Aysha Siddika on 20 Sep 2026'
      }
    ]
  },
  {
    id: 'wo-017',
    order_code: 'MSP-017',
    corporate_client: 'Sheltech (Pvt.) Ltd.',
    po_ref_number: 'Sheltech/Combo/Brand/26-000192',
    po_date: '2026-09-21',
    po_value_bdt: 330000,
    item_description: 'Thermal Flux (700 pcs) & Ballpoint Pen (1,000 pcs)',
    investment_amount_bdt: 275000,
    return_amount_bdt: 315000,
    profit_bdt: 40000,
    duration_days: 5,
    start_date: '2026-09-21',
    due_date: '2026-09-26',
    return_date: '2026-09-26',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: Sheltech/Combo/Brand/26-000192 (৳3,30,000 PO value). Thermal flux (700 pcs @ ৳450) + Ballpoint pen (1,000 pcs @ ৳15). Disbursed ৳2.75L via CityTouch on 21 Sep 2026. 5 days tenor. Expected Return: ৳3.15L (+৳40k profit). Due date: 26 Sep 2026.',
    disbursement_receipt_url: '/receipts/msp-017-disbursement.png',
    po_document_pdf: '/docs/msp-017-sheltech-po.pdf',
    due_note: 'Due Sep 26 (5 days left)',
    tranche_info: 'Single Tranche: ৳2.75L CityTouch',
    disbursement_transfers: [
      {
        tranche_no: 1,
        amount_bdt: 275000,
        date: '21 Sep 2026, 04:28 PM',
        ref_no: '100013089285',
        method: 'City Bank Transfer (CityTouch)',
        receipt_url: '/receipts/msp-017-disbursement.png',
        note: 'Disbursed ৳2.75L via CityTouch by Faiz Ahmed to Aysha Siddika on 21 Sep 2026'
      }
    ]
  },
  {
    id: 'wo-018',
    order_code: 'MSP-018',
    corporate_client: 'Sheltech (Pvt.) Ltd.',
    po_ref_number: 'Sheltech/Combo/Brand/26-000193',
    po_date: '2026-09-21',
    po_value_bdt: 315000,
    item_description: 'ID Card Holder (700 pcs) & Leather Belt (450 pcs)',
    investment_amount_bdt: 260000,
    return_amount_bdt: 300000,
    profit_bdt: 40000,
    duration_days: 5,
    start_date: '2026-09-21',
    due_date: '2026-09-26',
    return_date: '2026-09-26',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: Sheltech/Combo/Brand/26-000193 (৳3,15,000 PO value). ID card holder (700 pcs @ ৳45) + Leather belt (450 pcs @ ৳630). Disbursed ৳2.60L on 21 Sep 2026. 5 days tenor. Expected Return: ৳3.00L (+৳40k profit). Due date: 26 Sep 2026.',
    po_document_pdf: '/docs/msp-018-sheltech-po.pdf',
    due_note: 'Due Sep 26 (5 days left)',
    tranche_info: 'Single Tranche: ৳2.60L CityTouch'
  },
  {
    id: 'wo-019',
    order_code: 'MSP-019',
    corporate_client: 'Crown Cement PLC',
    po_ref_number: '4001726621',
    po_date: '2026-09-22',
    po_value_bdt: 2350000,
    item_description: 'Crown Cement Institutional Promotional Merchandise Package',
    investment_amount_bdt: 2100000,
    return_amount_bdt: 2350000,
    profit_bdt: 250000,
    duration_days: 1,
    start_date: '2026-09-22',
    due_date: '2026-09-23',
    return_date: '2026-09-23',
    settled_date: '2026-09-23',
    status: 'Settled_Repaid',
    payment_mode: 'EFT / Fast Bank Transfer & Cash Handover',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: 4001726621 (CROWN CEMENT PLC_PO_4001726621_.pdf). Cash Received Acknowledgement issued. Disbursed Sep 22; payment completed 21 lac on 23 Sep 2026.',
    po_document_pdf: '/docs/msp-019-crown-cement-po.pdf',
    due_note: 'Settled & Repaid on 23 Sep',
    settlement_note: 'Full settlement completed on 23 Sep 2026 (Confirmed by Faiz Ahmed: "MSP019 payment complete. 21 lac").',
    tranche_info: 'Full ৳21.00L Disbursal & Repayment'
  },
  {
    id: 'wo-020',
    order_code: 'MSP-020',
    corporate_client: 'Greenfield Jutex',
    po_ref_number: 'GFJ/09/2026/Leather-Belt',
    po_date: '2026-09-22',
    po_value_bdt: 325000,
    item_description: 'Finished Leather Belts (500 pcs)',
    investment_amount_bdt: 270000,
    return_amount_bdt: 307000,
    profit_bdt: 37000,
    duration_days: 10,
    start_date: '2026-09-22',
    due_date: '2026-10-01',
    return_date: '2026-10-01',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: GREENFIELD JUTEX_PO_Leather Belt.pdf. Investment ৳2.70L, return ৳3.07L (+৳37k profit). Disbursed 23 Sep 10:03 AM via CityTouch.',
    po_document_pdf: '/docs/msp-020-greenfield-po.pdf',
    due_note: 'Due 01 Oct',
    tranche_info: 'Single Tranche: ৳2.70L CityTouch'
  },
  {
    id: 'wo-021',
    order_code: 'MSP-021',
    corporate_client: 'Novelty',
    po_ref_number: 'NVLT-PO-KF-00721',
    po_date: '2026-09-22',
    po_value_bdt: 165000,
    item_description: 'Custom Branded Key Rings (1,800 pcs)',
    investment_amount_bdt: 130000,
    return_amount_bdt: 150000,
    profit_bdt: 20000,
    duration_days: 7,
    start_date: '2026-09-22',
    due_date: '2026-09-29',
    return_date: '2026-09-29',
    settled_date: '2026-09-30',
    status: 'Settled_Repaid',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: NVLT-PO-KF-00721.pdf. Disbursed 23 Sep 10:08 AM. 100% Repaid (৳1.50L) on 30 Sep 2026 (Faiz Ahmed confirmed: "MSP021 Payment received").',
    po_document_pdf: '/docs/msp-021-novelty-po.pdf',
    due_note: 'Settled & Repaid on 30 Sep',
    settlement_note: 'Full principal (৳1.30L) + profit (৳20k) returned via bank transfer on 30 Sep 2026.',
    tranche_info: 'Single Tranche: ৳1.30L CityTouch'
  },
  {
    id: 'wo-022',
    order_code: 'MSP-022',
    corporate_client: 'Greenfield Jutex',
    po_ref_number: 'GFJ/09/2026/Umbrella-01',
    po_date: '2026-09-23',
    po_value_bdt: 450000,
    item_description: 'Corporate Promotional Umbrellas (1,000 pcs)',
    investment_amount_bdt: 370000,
    return_amount_bdt: 430000,
    profit_bdt: 60000,
    duration_days: 10,
    start_date: '2026-09-23',
    due_date: '2026-10-03',
    return_date: '2026-10-03',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: GREENFIELD JUTEX_PO_UMBRELLA.pdf. Disbursed 23 Sep 11:31 PM via CityTouch. Tenor: 10 days. Expected return: ৳4.30L (+৳60k profit).',
    po_document_pdf: '/docs/msp-022-greenfield-po.pdf',
    due_note: 'Due 03 Oct',
    tranche_info: 'Single Tranche: ৳3.70L CityTouch'
  },
  {
    id: 'wo-023',
    order_code: 'MSP-023',
    corporate_client: 'Delta Pharma / Delta Limited',
    po_ref_number: 'DL/PO/1124',
    po_date: '2026-09-23',
    po_value_bdt: 435000,
    item_description: 'Executive Short Leather Wallets (850 pcs)',
    investment_amount_bdt: 355000,
    return_amount_bdt: 415000,
    profit_bdt: 60000,
    duration_days: 10,
    start_date: '2026-09-23',
    due_date: '2026-10-03',
    return_date: '2026-10-03',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: DELTA PO_1124.pdf. Disbursed 23 Sep 11:40 PM via CityTouch. Tenor: 10 days. Expected return: ৳4.15L (+৳60k profit).',
    po_document_pdf: '/docs/msp-023-delta-po.pdf',
    due_note: 'Due 03 Oct',
    tranche_info: 'Single Tranche: ৳3.55L CityTouch'
  },
  {
    id: 'wo-024',
    order_code: 'MSP-024',
    corporate_client: 'Sheltech (Pvt.) Ltd.',
    po_ref_number: 'Sheltech/Belt/2026/089',
    po_date: '2026-09-23',
    po_value_bdt: 410000,
    item_description: 'Sheltech Full-Grain Leather Belts (600 pcs)',
    investment_amount_bdt: 335000,
    return_amount_bdt: 385000,
    profit_bdt: 50000,
    duration_days: 10,
    start_date: '2026-09-23',
    due_date: '2026-10-03',
    return_date: '2026-10-03',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: Sheltech_PO_Leather Belt.pdf. Disbursed 23 Sep 11:47 PM via CityTouch. Tenor: 10 days. Expected return: ৳3.85L (+৳50k profit).',
    po_document_pdf: '/docs/msp-024-sheltech-po.pdf',
    due_note: 'Due 03 Oct',
    tranche_info: 'Single Tranche: ৳3.35L CityTouch'
  },
  {
    id: 'wo-025',
    order_code: 'MSP-025',
    corporate_client: 'National Life Insurance PLC',
    po_ref_number: 'NLIC-PO-078590',
    po_date: '2026-09-23',
    po_value_bdt: 340000,
    item_description: 'Card Holders (1,200 pcs) & Jute Carrying Bags (1,000 pcs)',
    investment_amount_bdt: 270000,
    return_amount_bdt: 315000,
    profit_bdt: 45000,
    duration_days: 10,
    start_date: '2026-09-23',
    due_date: '2026-10-03',
    return_date: '2026-10-03',
    settled_date: '2026-10-05',
    status: 'Settled_Repaid',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: National_Life_Insurance_PLC_PO.pdf. Disbursed 23 Sep 11:54 PM. Payment confirmation slips forwarded on 05 Oct 2026.',
    po_document_pdf: '/docs/msp-025-national-life-po.pdf',
    due_note: 'Settled & Repaid on 05 Oct',
    settlement_note: 'Repayment slips (2 images) forwarded by Faiz Ahmed in group chat on 05 Oct 2026.',
    tranche_info: 'Single Tranche: ৳2.70L CityTouch'
  },
  {
    id: 'wo-026',
    order_code: 'MSP-026',
    corporate_client: 'Novelty',
    po_ref_number: 'NVLT-PO-005563',
    po_date: '2026-09-24',
    po_value_bdt: 675000,
    item_description: 'Ceramic Mugs (1k), USB Pen Drives (600 pcs), Thermal Flasks (500 pcs)',
    investment_amount_bdt: 550000,
    return_amount_bdt: 635000,
    profit_bdt: 85000,
    duration_days: 10,
    start_date: '2026-09-24',
    due_date: '2026-10-04',
    return_date: '2026-10-04',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: NVLT-PO-005563.pdf. Disbursed 24 Sep 05:35 PM via CityTouch. Tenor: 10 days. Expected return: ৳6.35L (+৳85k profit).',
    po_document_pdf: '/docs/msp-026-novelty-po.pdf',
    due_note: 'Due 04 Oct',
    tranche_info: 'Single Tranche: ৳5.50L CityTouch'
  },
  {
    id: 'wo-027',
    order_code: 'MSP-027',
    corporate_client: 'Sheltech (Pvt.) Ltd.',
    po_ref_number: 'Sheltech/PO/000263',
    po_date: '2026-09-24',
    po_value_bdt: 495000,
    item_description: 'Cross Body Bags (600 pcs) & Branded Jute Bags (800 pcs)',
    investment_amount_bdt: 400000,
    return_amount_bdt: 465000,
    profit_bdt: 65000,
    duration_days: 10,
    start_date: '2026-09-24',
    due_date: '2026-10-04',
    return_date: '2026-10-04',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: Sheltech_PO_000263.pdf. Disbursed 24 Sep 05:45 PM via CityTouch. Tenor: 10 days. Expected return: ৳4.65L (+৳65k profit).',
    po_document_pdf: '/docs/msp-027-sheltech-po.pdf',
    due_note: 'Due 04 Oct',
    tranche_info: 'Single Tranche: ৳4.00L CityTouch'
  },
  {
    id: 'wo-028',
    order_code: 'MSP-028',
    corporate_client: 'Delta Pharma / Delta Limited',
    po_ref_number: 'Delta/PO/27-09-2026',
    po_date: '2026-09-27',
    po_value_bdt: 680000,
    item_description: 'Branded Pens, Ceramic Mugs, Leather Card Holders, Executive Notepads',
    investment_amount_bdt: 555000,
    return_amount_bdt: 635000,
    profit_bdt: 80000,
    duration_days: 5,
    start_date: '2026-09-27',
    due_date: '2026-10-01',
    return_date: '2026-10-01',
    settled_date: '2026-10-05',
    status: 'Settled_Repaid',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: Delta_PO_27-09-2026.pdf. Disbursed 27 Sep 07:04 PM. Repayment slip forwarded by Faiz Ahmed on 05 Oct 2026.',
    po_document_pdf: '/docs/msp-028-delta-po.pdf',
    due_note: 'Settled & Repaid on 05 Oct',
    settlement_note: 'Repayment slip image forwarded on 05 Oct 2026 (Due date: 01 Oct).',
    tranche_info: 'Single Tranche: ৳5.55L CityTouch'
  },
  {
    id: 'wo-029',
    order_code: 'MSP-029',
    corporate_client: 'Novelty',
    po_ref_number: 'NVLT-PO-005612',
    po_date: '2026-09-28',
    po_value_bdt: 730000,
    item_description: 'Heavy Umbrellas (1,200 pcs) & Dual-Port Power Banks (400 pcs)',
    investment_amount_bdt: 600000,
    return_amount_bdt: 680000,
    profit_bdt: 80000,
    duration_days: 5,
    start_date: '2026-09-28',
    due_date: '2026-10-03',
    return_date: '2026-10-03',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'Investment ৳6.00L, 5 days, closing 03 Oct. Expected return: ৳6.80L (+৳80k profit). Disbursed 28 Sep 04:47 PM.',
    due_note: 'Due 03 Oct',
    tranche_info: 'Single Tranche: ৳6.00L CityTouch'
  },
  {
    id: 'wo-030',
    order_code: 'MSP-030',
    corporate_client: 'UX Garments Ltd',
    po_ref_number: '4001-151147',
    po_date: '2026-09-30',
    po_value_bdt: 510000,
    item_description: 'Institutional Custom Jute Conference Bags (2,400 pcs)',
    investment_amount_bdt: 420000,
    return_amount_bdt: 480000,
    profit_bdt: 60000,
    duration_days: 10,
    start_date: '2026-09-30',
    due_date: '2026-10-10',
    return_date: '2026-10-10',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: UX GARMS LTD_PO_4001-151147.pdf. Disbursed 30 Sep 04:18 PM. Tenor: 10 days. Expected return: ৳4.80L (+৳60k profit).',
    po_document_pdf: '/docs/msp-030-ux-garments-po.pdf',
    due_note: 'Due 10 Oct',
    tranche_info: 'Single Tranche: ৳4.20L CityTouch'
  },
  {
    id: 'wo-031',
    order_code: 'MSP-031',
    corporate_client: 'Greenfield Jutex',
    po_ref_number: 'GFJ/09/2026/Runner-Jaynamaz',
    po_date: '2026-09-30',
    po_value_bdt: 440000,
    item_description: 'Decorative Table Runners & Embroidered Jaynamaz Sets (800 sets)',
    investment_amount_bdt: 360000,
    return_amount_bdt: 412000,
    profit_bdt: 52000,
    duration_days: 10,
    start_date: '2026-09-30',
    due_date: '2026-10-10',
    return_date: '2026-10-10',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'Disbursed 30 Sep 04:24 PM. Tenor: 10 days. Expected return: ৳4.12L (+৳52k profit).',
    due_note: 'Due 10 Oct',
    tranche_info: 'Single Tranche: ৳3.60L CityTouch'
  },
  {
    id: 'wo-032',
    order_code: 'MSP-032',
    corporate_client: 'Delta Pharma / Delta Limited',
    po_ref_number: 'DL/Keyring/2026/1089',
    po_date: '2026-09-30',
    po_value_bdt: 220000,
    item_description: 'Premium Leather Keyrings with Embossed Logo (2,500 pcs)',
    investment_amount_bdt: 175000,
    return_amount_bdt: 200000,
    profit_bdt: 25000,
    duration_days: 7,
    start_date: '2026-09-30',
    due_date: '2026-10-07',
    return_date: '2026-10-07',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'Disbursed 30 Sep 04:50 PM. Tenor: 7 days. Expected return: ৳2.00L (+৳25k profit).',
    due_note: 'Due 07 Oct',
    tranche_info: 'Single Tranche: ৳1.75L CityTouch'
  },
  {
    id: 'wo-033',
    order_code: 'MSP-033',
    corporate_client: 'Crown Cement PLC',
    po_ref_number: 'Crown/Brand/2026/0411',
    po_date: '2026-10-01',
    po_value_bdt: 235000,
    item_description: 'Crown Cement Metallic Ringed Keyrings (2,800 pcs)',
    investment_amount_bdt: 190000,
    return_amount_bdt: 215000,
    profit_bdt: 25000,
    duration_days: 4,
    start_date: '2026-10-01',
    due_date: '2026-10-05',
    return_date: '2026-10-05',
    status: 'Disbursed_Active',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'PO Ref: Crown Cement PLC_PO.pdf. Disbursed 01 Oct 01:55 PM via CityTouch. Tenor: 4 days. Expected return: ৳2.15L (+৳25k profit).',
    po_document_pdf: '/docs/msp-033-crown-cement-po.pdf',
    due_note: 'Due 05 Oct',
    tranche_info: 'Single Tranche: ৳1.90L CityTouch'
  },
  {
    id: 'wo-034',
    order_code: 'MSP-034',
    corporate_client: 'Crown Cement PLC',
    po_ref_number: '4001798620',
    po_date: '2026-10-01',
    po_value_bdt: 2250000,
    item_description: 'Institutional Mega Kit: Power bank, Umbrella, Branded Pen, Pocket Diary, Key Ring, Branded Mug, Small Jute Bag, Pendrive, Tumbler',
    investment_amount_bdt: 1875000,
    return_amount_bdt: 2150000,
    profit_bdt: 275000,
    duration_days: 10,
    start_date: '2026-10-01',
    due_date: '2026-10-10',
    return_date: '2026-10-10',
    status: 'Pending_Approval',
    payment_mode: 'BRAC RTGS / City Bank Transfer',
    bank_account_info: 'Maats Cottage Ltd (DBBL A/C: 2081200001490)',
    notes: 'PO Ref: Crown Cement_PO_4001798620.pdf. Mega-order ৳18.75L capital ask, ৳2.75L net profit. Tenor: 7-10 days. Forwarded in group chat on 01-02 Oct.',
    po_document_pdf: '/docs/msp-034-crown-cement-po.pdf',
    due_note: 'Awaiting Partner Sign-off (৳18.75L Mega-ticket)',
    tranche_info: 'Under Review / Ready for RTGS'
  },
  {
    id: 'wo-035',
    order_code: 'MSP-035',
    corporate_client: 'ACI',
    po_ref_number: 'ACI/Corp/2026/0912',
    po_date: '2026-10-01',
    po_value_bdt: 195000,
    item_description: 'ACI Corporate Keyrings with Custom Enamel Finish (2,000 pcs)',
    investment_amount_bdt: 160000,
    return_amount_bdt: 185000,
    profit_bdt: 25000,
    duration_days: 4,
    start_date: '2026-10-01',
    due_date: '2026-10-05',
    return_date: '2026-10-05',
    settled_date: '2026-10-06',
    status: 'Settled_Repaid',
    payment_mode: 'City Bank Transfer (CityTouch)',
    bank_account_info: 'AYSHA SIDDIKA (A/C: 2621519538001)',
    notes: 'Disbursed 01 Oct 03:13 PM. Settled on 06 Oct (Faiz Ahmed forwarded settlement slip at 03:56 PM on 06 Oct).',
    due_note: 'Settled & Repaid on 06 Oct',
    settlement_note: 'Full principal (৳1.60L) + profit (৳25k) returned via bank transfer on 06 Oct 2026.',
    tranche_info: 'Single Tranche: ৳1.60L CityTouch'
  }
];

const STORAGE_KEY = 'gro10x_work_orders_cache_v35';

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
          // Reconcile with SEED_WORK_ORDERS for any newly added orders
          const cachedCodes = new Set(parsed.map(o => o.order_code));
          const missingSeeds = SEED_WORK_ORDERS.filter(s => !cachedCodes.has(s.order_code));
          if (missingSeeds.length > 0) {
            const merged = [...parsed, ...missingSeeds];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
            return merged;
          }
          return parsed;
        }
      } catch (e) {}
    }
  }

  // 2. Try Supabase if no local session cache with fast offline timeout
  try {
    const fetchPromise = supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ data: null, error: true }), 1200));
    const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

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

  // ── PARTNERSHIP WIN-WIN DYNAMICS METRICS ──
  // 1. Total Fund Given So Far (Lifetime Cumulative Disbursed: Settled + Active)
  const totalLifetimeDisbursed = totalSettledCapital + totalDisbursedActive;

  // 2. Fund Earnings (What Gro10x / Partner Fund has earned)
  const totalFundProfitRealized = totalSettledProfit;
  const totalFundProfitPipeline = totalActiveProfit;
  const totalFundProfitLifetime = totalFundProfitRealized + totalFundProfitPipeline;

  // 3. Client Earnings (What Maats Cottage Ltd has earned from this partnership)
  const totalClientProfitRealized = settledOrders.reduce((sum, o) => {
    const poVal = Number(o.po_value_bdt || 0);
    const retVal = Number(o.return_amount_bdt || 0);
    return sum + (poVal > 0 ? Math.max(0, poVal - retVal) : 0);
  }, 0);

  const totalClientProfitPipeline = activeOrders.reduce((sum, o) => {
    const poVal = Number(o.po_value_bdt || 0);
    const retVal = Number(o.return_amount_bdt || 0);
    return sum + (poVal > 0 ? Math.max(0, poVal - retVal) : 0);
  }, 0);

  const totalClientProfitLifetime = totalClientProfitRealized + totalClientProfitPipeline;

  // 4. Gross Margin, Markup & Overall Economic Value Created
  const relevantOrders = orders.filter(o => o.status === 'Settled_Repaid' || o.status === 'Disbursed_Active');
  const totalPoValueLifetime = relevantOrders.reduce((sum, o) => sum + Number(o.po_value_bdt || o.return_amount_bdt || 0), 0);
  const totalGrossProfitLifetime = Math.max(0, totalPoValueLifetime - totalLifetimeDisbursed);
  
  const grossMarginPct = totalPoValueLifetime > 0 
    ? ((totalGrossProfitLifetime / totalPoValueLifetime) * 100).toFixed(1) 
    : '0.0';
  const markupPct = totalLifetimeDisbursed > 0 
    ? ((totalGrossProfitLifetime / totalLifetimeDisbursed) * 100).toFixed(1) 
    : '0.0';

  // 5. Apples-to-Apples Value Splits
  const realizedTotalValue = totalFundProfitRealized + totalClientProfitRealized;
  const realizedFundSharePct = realizedTotalValue > 0 ? ((totalFundProfitRealized / realizedTotalValue) * 100).toFixed(1) : '0.0';
  const realizedClientSharePct = realizedTotalValue > 0 ? ((totalClientProfitRealized / realizedTotalValue) * 100).toFixed(1) : '0.0';

  const lifetimeTotalValue = totalFundProfitLifetime + totalClientProfitLifetime;
  const lifetimeFundSharePct = lifetimeTotalValue > 0 ? ((totalFundProfitLifetime / lifetimeTotalValue) * 100).toFixed(1) : '0.0';
  const lifetimeClientSharePct = lifetimeTotalValue > 0 ? ((totalClientProfitLifetime / lifetimeTotalValue) * 100).toFixed(1) : '0.0';

  // 6. Corporate Client Aggregated Impact Breakdown
  const clientMap = {};
  relevantOrders.forEach(o => {
    const name = o.corporate_client?.trim() || 'Other';
    if (!clientMap[name]) {
      clientMap[name] = {
        name,
        orderCount: 0,
        totalPoValue: 0,
        totalDisbursed: 0,
        fundProfit: 0,
        clientProfit: 0
      };
    }
    const inv = Number(o.investment_amount_bdt || 0);
    const ret = Number(o.return_amount_bdt || 0);
    const po = Number(o.po_value_bdt || ret || 0);
    const fProfit = Number(o.profit_bdt || (ret - inv) || 0);
    const cProfit = Math.max(0, po - ret);

    clientMap[name].orderCount += 1;
    clientMap[name].totalPoValue += po;
    clientMap[name].totalDisbursed += inv;
    clientMap[name].fundProfit += fProfit;
    clientMap[name].clientProfit += cProfit;
  });

  const clientBreakdown = Object.values(clientMap).sort((a, b) => b.totalPoValue - a.totalPoValue);

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
    totalOrdersCount: orders.length,
    // Partnership Win-Win Dynamics
    totalLifetimeDisbursed,
    totalFundProfitRealized,
    totalFundProfitPipeline,
    totalFundProfitLifetime,
    totalClientProfitRealized,
    totalClientProfitPipeline,
    totalClientProfitLifetime,
    // Impact Analysis & Margins
    totalPoValueLifetime,
    totalGrossProfitLifetime,
    grossMarginPct,
    markupPct,
    realizedTotalValue,
    realizedFundSharePct,
    realizedClientSharePct,
    lifetimeTotalValue,
    lifetimeFundSharePct,
    lifetimeClientSharePct,
    clientBreakdown
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

  const limit = MAATS_COTTAGE_PROFILE.revolvingFacilityLimit || 2500000;
  const headroom = limit - metrics.totalDisbursedActive;
  const headroomLine = headroom >= 0
    ? `• Available Fund Headroom: *৳${(headroom / 100000).toFixed(2)} Lac* (of ৳${(limit / 100000).toFixed(2)}L Limit)`
    : `• Available Fund Headroom: *৳0.00 Lac* (Active ৳${(metrics.totalDisbursedActive / 100000).toFixed(2)}L deployed of ৳${(limit / 100000).toFixed(2)}L Limit — ${((metrics.totalDisbursedActive / limit) * 100).toFixed(1)}% Peak Revolving)`;

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
