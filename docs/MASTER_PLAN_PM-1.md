# GRO10X CAPITAL OS v2.0 — MASTER EXECUTION PLAN (PM-1)
**Product Domain:** Capital Desk, Investor Experience & Secondary Liquidity  
**Assigned PM:** PM-1  
**Target Codebase:** `D:\gro10x-capital`  
**Last Updated:** October 2026  
**Status:** In Progress (Planning & Audit Complete — Awaiting Approval)

---

## 1. Domain Scope & Architecture Overview

PM-1 oversees all capital intake, discovery, investor workflows, secondary liquidity, and legal vault operations across GRO10X Capital OS:
1. **Public Discovery Desk & Deal Rooms:**
   - Routes: `/` (Homepage), `/showcase` (Live Deal Catalog), `/projects/[id]` (Deal Room & Dossier), `/funding-rounds` (Round Directory).
   - Core Engines: Dynamic ROI Calculator (Capped 22%, 1.5x Buyout, 35% Net Profit), Referral Attribution Engine (`?ref=CODE`), Allocation Booking Modal.
2. **Investor Experience & Portfolio Operations:**
   - Routes: `/investor` (Portfolio, KYC, Document Vault, AI Concierge, FAQs), `/investor-onboard` (Activation & Telegram linking), `/payouts` (Dividend & Yield Cashouts).
   - Core Workflows: 4-Card Portfolio KPI Telemetry, Recharts Payout Distributions, Proof of Payment Upload Flow, Dividend & Yield Cashout Requests (bKash/Nagad/Bank Wire).
3. **3-Tier KYC Compliance Ladder:**
   - Subsystem: `/investor#kyc` & progressive state machine.
   - Tier 1 (Basic / L1): Primary bookings up to ৳10 Lakh.
   - Tier 2 (Identity & NID / L2): Unlocks Secondary Market trading and orderbook placement.
   - Tier 3 (Accredited HNW / L3): Unlocks Private OTC Cash Concierge & Block Trades (>৳50 Lakh).
4. **Secondary Share Exchange & OTC Cash Desk:**
   - Routes: `/secondary-market`, `/cash-concierge`.
   - Core Guardrails: Strict ±10% Fair Market Value (FMV) corridor validation on sell orders, Level 2 KYC guard on share buyers, Level 3 lockout on Cash Concierge desk.
5. **Legal Vault & Automated Contracts:**
   - Routes: `/legal-contracts`, `/terms`, `/risk-disclosure`.
   - Engines: SPV Share Certificates, Master Growth Agreements, Digital PDF export.

---

## 2. Multi-Stakeholder Touchpoint Audit Matrix

| Stakeholder Persona | Key Touchpoint / URL | Identified Gaps / Gaps in Logic | Operational Risk & Remediation |
| :--- | :--- | :--- | :--- |
| **1. Public Prospect / Capital Partner** | `/`, `/showcase`, `/projects/[id]` | `?ref=CODE` query parameter is captured on `/showcase` but dropped on `/`. Deal room CTA triggers LeadBot drawer but lacks direct authenticated primary booking flow into `investment_bookings`. | Attribution leakage for promoters; inability for hot prospects to directly reserve primary allocation. Add global referral persistence + Deal Room Primary Booking Modal. |
| **2. KYC-Verified HNI Investor** | `/investor`, `/investor#kyc`, `/payouts` | `/payouts` route is hardcoded to promoter commission logic only; investors cannot request dividend cashouts to bKash/Nagad/Bank Wire. KYC tab action buttons lack explicit test IDs expected by QA runner. | Capital ops bottleneck: dividend yields cannot be withdrawn via self-service. Upgrade `/payouts` and `/investor` with dual-persona yield withdrawal modals. |
| **3. SME Founder / Retail Operator** | `/funding-rounds`, `/projects/[id]` | Fixed mock data fallbacks in `/funding-rounds` instead of querying live `businesses` and `funding_projects` tables. Deal rooms show static company metrics if DB row lacks fields. | Misaligned cap table targets. Harmonize `/funding-rounds` with live Supabase query + real-time status sync. |
| **4. Key Account Manager (KAM)** | `/cash-concierge`, `/investor` | Cash Concierge tickets auto-assign `kam_id` from investor profile but lack fallback assignment if `assigned_kam_id` is null. Missing webhook push to `@gro10xmanbot` on urgent OTC requests. | Delayed response to multi-million BDT tickets. Add round-robin KAM assignment and instant Telegram dispatch. |
| **5. Growth Promoter / Syndicate Lead** | `/showcase?ref=CODE`, `/payouts` | Promoter referral cookie expires on session end in some browsers. Commission payout status changes are not reflected in real-time. | Lead dispute and attribution drop. Add resilient `localStorage` and `cookie` fallback + Supabase Realtime subscription on payouts. |
| **6. Corporate Buyer / Vendor** | `/projects/[id]` (Safe Plan Portfolio Co.) | Work-order settlement displays hardcoded 5/5 settled status for Maats Cottage without live link to `work_orders` table. | Lack of dynamic proof for institutional diligence. Connect to live work order cycle API. |
| **7. Fund Director / Super-Admin** | `/secondary-market`, `/legal-contracts` | Secondary order approvals rely on Admin tab polling; missing instant alert when a listing enters `Pending_Clearance`. Legal contracts lack automated digital stamp validation. | Trade clearing latency. Wire instant `@gro10xcapbot` and `@gro10xmanbot` Telegram notification on secondary locks. |

---

## 3. FinTech Guardrails & Regulatory Logic

1. **3-Tier KYC Compliance Ladder:**
   - **Level 1 (Basic)**: Authenticated via Supabase Auth + Phone/Email. Limited to primary allocations up to ৳10,00,000 BDT.
   - **Level 2 (Identity)**: Government NID or Passport (both front & back) uploaded to Supabase Storage `public-docs/kyc`. Mandatory requirement to list or acquire shares on the Secondary Market (`/secondary-market`).
   - **Level 3 (Accredited HNW)**: Source of Funds declaration submitted and approved by Investment Committee. Mandatory requirement to access `/cash-concierge` for block trades ≥ ৳50,00,000 BDT.
2. **Secondary Market ±10% FMV Corridor:**
   - `min_price = fmv * 0.9` and `max_price = fmv * 1.1`.
   - Prevent price manipulation or predatory dumping.
   - Enforce server-side / client-side blocking if ask price falls outside this range.
   - Atomic concurrency lock: when buyer acquires share, mark listing as `Pending_Clearance` and rollback if race condition occurs.
3. **90/10 SPV Equity & 5% Platform Spread:**
   - Project raises allocate 90% to syndicate investors and 10% retained by GRO10X Management SPV.
   - 5% transaction spread calculated on secondary transfers and origination bookings.
4. **Gross Sales vs. POS Telemetry Reconciliation:**
   - Option 1 (10% gross sales capped at 22% ROI) and Option 2 (12% gross sales with 1.5x buyout) require daily POS telemetry ingestion before monthly yield approval.
5. **Dual-Document Work-Order Settlement:**
   - Wealth Management deployments (e.g. Safe Plan SPV-01) require verified Purchase Order + Delivery Challan / Invoice prior to capital disbursement.

---

## 4. Master Roadmap & Execution Plan

### Phase 1: Critical UI/UX Polishing, Flow Repair & Orphan Wiring
*Objective: Eliminate dead ends, fix broken modals, resolve attribution leakage, and establish complete end-to-end interactive flows.*

- [x] **Phase 1.1: Homepage (`/`) & Deal Showcase (`/showcase`) Referral & CTA Wiring**
  - **Target Stakeholder**: Public Prospect & Growth Promoter
  - **Files**: `src/app/page.js`, `src/app/showcase/page.js`, `src/components/ROICalculator.js`
  - **Tasks**:
    - Add `?ref=CODE` search param capture to `src/app/page.js` syncing to `sessionStorage` and `localStorage`.
    - Ensure ROI Calculator button in `src/components/ROICalculator.js` provides both "Invest in This Structure" (direct link/action to `/showcase`) and "Book Call" to satisfy test suite `suite-1-2`.
    - Fix filter badges and search input focus states in `/showcase`.
  - **FinTech Guardrails**: Sanitize ref codes to alphanumeric characters (prevent SQL/XSS injections).
  - **QA Test Suite**: `suite-1-1`, `suite-1-2`, `suite-1-4`, `suite-1-5`, `suite-1-6`.

- [x] **Phase 1.2: Project Deal Room (`/projects/[id]`) Primary Allocation Booking Modal**
  - **Target Stakeholder**: KYC-Verified HNI Investor & Public Prospect
  - **Files**: `src/app/projects/[id]/page.js`, `src/components/ProjectCard.js`
  - **Tasks**:
    - Build an embedded Primary Booking Modal inside `src/app/projects/[id]/page.js` alongside the existing LeadBot drawer.
    - When authenticated, allow investor to commit an allocation amount (with min ticket check, e.g. ৳5L / ৳10L), select yield structure (Option 1/2/3), and create an `investment_bookings` record with `status: 'Pending_Proof'`.
    - Automatically redirect or notify investor to complete payment proof upload in `/investor#portfolio`.
  - **FinTech Guardrails**: Validate ticket size ≥ `min_otc_investment_bdt`. Check total booked + raised does not exceed overbooking limits.
  - **QA Test Suite**: `suite-1-7`, `suite-1-8`.

- [ ] **Phase 1.3: Investor Portal (`/investor`) KYC & Portfolio Flow Repair**
  - **Target Stakeholder**: HNI Investor & Syndicate Backer
  - **Files**: `src/app/investor/page.js`, `src/app/investor/tabs/PortfolioTab.js`, `src/app/investor/tabs/KycVerificationTab.js`
  - **Tasks**:
    - Add explicit `data-testid="l2-upgrade-btn"` and `data-testid="l3-upgrade-btn"` to KYC Upgrade buttons in `KycVerificationTab.js`.
    - Ensure buttons include text matching `suite-2-6` ("Upgrade to Level 2", "Identity Verification") and `suite-2-7` ("Upgrade to Level 3", "Accredited").
    - Ensure URL hash navigation `#kyc`, `#portfolio`, `#vault`, `#ai-concierge`, `#faq` activates the corresponding tab without page reload flicker.
  - **FinTech Guardrails**: L1 basic max booking cap (৳10L), L2 required for secondary exits, L3 required for OTC desk.
  - **QA Test Suite**: `suite-2-1`, `suite-2-2`, `suite-2-5`, `suite-2-6`, `suite-2-7`.

- [ ] **Phase 1.4: Cash Concierge (`/cash-concierge`) Lockout & Form Polish**
  - **Target Stakeholder**: HNW Investor & Fund Director
  - **Files**: `src/app/cash-concierge/page.js`
  - **Tasks**:
    - Wrap restricted/lockout state in `<main className="concierge-card" data-testid="cash-concierge-root">` to satisfy `suite-1-14`.
    - Include explicit "Cash Concierge" and "KYC" text in the restriction banner.
    - Enhance ticket submission form with minimum OTC ticket verification and real-time currency formatting.
  - **FinTech Guardrails**: Strict Level 3 lockout. Minimum ticket validation against `min_otc_investment_bdt` (min ৳50 Lakh).
  - **QA Test Suite**: `suite-1-14`, `suite-1-15`.

- [ ] **Phase 1.5: Secondary Market (`/secondary-market`) Corridor Guard & Acquisition Modal**
  - **Target Stakeholder**: KYC L2 Investor
  - **Files**: `src/app/secondary-market/page.js`, `src/app/investor/modals/SecondarySellModal.js`
  - **Tasks**:
    - Hard-block sell listing submission if ask price is outside `minCorridorPrice` (0.9x FMV) or `maxCorridorPrice` (1.1x FMV).
    - Ensure Acquisition Confirmation modal properly checks KYC Level 2 and prevents self-purchase.
  - **FinTech Guardrails**: ±10% FMV corridor check; Level 2 KYC verification before acquisition lock.
  - **QA Test Suite**: `suite-1-9`, `suite-1-10`, `suite-1-11`, `suite-2-4`.

---

### Phase 2: Database Persistence, Supabase RLS & Serverless API Hardening
*Objective: Eliminate mock fallbacks, validate UUID syntax to eliminate Postgres 22P02 errors, and provide dedicated serverless endpoints for capital operations.*

- [ ] **Phase 2.1: Investor Yield Cashout Pipeline (`/payouts` & `/investor`)**
  - **Target Stakeholder**: HNI Investor & Fund Director
  - **Files**: `src/app/payouts/page.js`, `src/app/investor/tabs/PortfolioTab.js`, `src/app/api/investor-cashout/route.js` (new)
  - **Tasks**:
    - Refactor `/payouts` to support both Investor Dividend Cashout and Promoter Commission withdrawal.
    - If user is an Investor, display their accumulated yield balance from `investor_yields` minus past cleared/pending payouts.
    - Add payout submission form supporting bKash, Nagad, and Bank Wire.
    - Ensure records are persisted in database and dispatched to super-admin for clearance.
  - **FinTech Guardrails**: Payout amount cannot exceed available verified yield balance. Minimum withdrawal threshold (৳1,000 BDT).
  - **QA Test Suite**: `suite-2-13`, `suite-2-14`.

- [ ] **Phase 2.2: Live Funding Rounds Persistence (`/funding-rounds`)**
  - **Target Stakeholder**: SME Founder & Investor
  - **Files**: `src/app/funding-rounds/page.js`
  - **Tasks**:
    - Replace hardcoded fallback rounds array with dynamic query to `funding_projects` joined with `businesses`.
    - Provide dynamic sector filters (Franchise, Debt, Distribution, Wealth Management) driven by live data.
    - Wire "Invest in Round" buttons directly to `/projects/[id]` or the booking workflow.
  - **FinTech Guardrails**: Only display approved campaigns with status in `['Active Capital Raise', 'Origination', 'Trading', 'Active']`.
  - **QA Test Suite**: `suite-2-15`.

- [ ] **Phase 2.3: Legal Contracts Engine & Digital PDF Export (`/legal-contracts`)**
  - **Target Stakeholder**: HNI Investor & Legal Super-Admin
  - **Files**: `src/app/legal-contracts/page.js`
  - **Tasks**:
    - Connect contract generator to user's real `investments` and `funding_projects` data.
    - Generate automated SPV Share Certificates and Master Growth Agreements with dynamic contract hash and timestamp.
    - Enable clean browser print styles (`@media print`) and PDF download previews.
  - **FinTech Guardrails**: Contract terms must strictly reflect 90/10 SPV structure, exit covenants, and KYC Level on record.
  - **QA Test Suite**: `suite-2-16`, `suite-2-17`.

- [ ] **Phase 2.4: Postgres 22P02 Error Defense & Auth UUID Normalization**
  - **Target Stakeholder**: All users
  - **Files**: `src/lib/supabase.js`, `src/app/investor/page.js`, `src/app/cash-concierge/page.js`
  - **Tasks**:
    - Verify all queries passing `authUserId` or `investorId` perform regex validation (`^[0-9a-fA-F-]{36}$`) before executing database queries.
    - Guard against non-UUID inputs from local testing states.
  - **FinTech Guardrails**: Absolute zero Postgres 22P02 runtime errors.
  - **QA Test Suite**: Platform 1 & Platform 2 suite-wide.

---

### Phase 3: Telegram Bot Mesh, Realtime Telemetry & Notification Integration
*Objective: Enable live multi-channel synchronization for orderbooks, bookings, and VIP concierge tickets.*

- [ ] **Phase 3.1: Supabase Realtime Channels for Orderbook & Investor Telemetry**
  - **Target Stakeholder**: Secondary Trader & Active Investor
  - **Files**: `src/app/secondary-market/page.js`, `src/app/investor/page.js`, `src/hooks/useRealtimeOrderbook.js`
  - **Tasks**:
    - Subscribe to `secondary_orders` table events (`INSERT`, `UPDATE`, `DELETE`) with smooth UI updates (no page reload).
    - Subscribe to `investment_bookings` and `investor_yields` to immediately reflect proof approvals and newly disbursed dividends in the 4-card telemetry strip.
  - **FinTech Guardrails**: Zero layout shift on charts and tables during live streaming updates.
  - **QA Test Suite**: `suite-1-9`, `suite-2-3`.

- [ ] **Phase 3.2: Telegram Notification Mesh Dispatch (@gro10xcapbot & @gro10xmanbot)**
  - **Target Stakeholder**: KAM, Super-Admin & HNI Investor
  - **Files**: `src/app/api/telegram-notify-admin/route.js`, `src/app/api/telegram-notify-kam/route.js`, `src/app/api/telegram-notify-investor/route.js`
  - **Tasks**:
    - Trigger instant alert to `@gro10xcapbot` on new Primary Allocation Bookings and Payment Proof Uploads.
    - Trigger high-priority alert to `@gro10xmanbot` when an Accredited Investor books a Cash Concierge ticket (>৳50L).
    - Send confirmation notifications to investors when proof of payment is verified or secondary shares are sold.
  - **FinTech Guardrails**: Redact sensitive PII (NID numbers, full bank account numbers) in Telegram markdown payloads.
  - **QA Test Suite**: `suite-1-15`, `suite-2-2`.

---

### Phase 4: Chrome Extension QA Suite Calibration & 100% Regression-Free Verification
*Objective: Guarantee 100% passing test execution across Platform 1 and Platform 2 test suites in `extension/suites/registry.js`.*

- [ ] **Phase 4.1: Platform 1 Test Suite Alignment (`suite-1-1` to `suite-1-17`)**
  - **Target Stakeholder**: QA & Public/Prospect UX
  - **Files**: `extension/suites/registry.js`
  - **Tasks**:
    - Verify all selectors across `suite-1-1` to `suite-1-17` exist and render reliably in production builds.
    - Ensure `data-testid` attributes exist on crucial DOM targets (`hero-section`, `roi-calculator`, `deal-grid`, `booking-modal`, `cash-concierge-root`).
  - **QA Verification**: Run QA test runner against Platform 1 suites.

- [ ] **Phase 4.2: Platform 2 Test Suite Alignment (`suite-2-1` to `suite-2-17`)**
  - **Target Stakeholder**: QA & Investor Experience
  - **Files**: `extension/suites/registry.js`
  - **Tasks**:
    - Align `suite-2-1` through `suite-2-17` with rendered DOM elements.
    - Ensure `#portfolio`, `#kyc`, `#vault`, `#ai-concierge`, and `#faq` hash routes trigger deterministic tab transitions.
    - Validate Recharts container classes so `.recharts-responsive-container` is present in DOM before screenshot capture.
  - **QA Verification**: Run QA test runner against Platform 2 suites.

- [ ] **Phase 4.3: End-to-End Build & Lint Verification**
  - **Target Stakeholder**: Fund Director & Release Engineering
  - **Files**: Full domain bundle
  - **Tasks**:
    - Run `npm.cmd run build` to confirm zero Next.js compilation errors, broken imports, or missing dependencies.
    - Validate zero unhandled promise rejections on all asynchronous flows.
  - **QA Verification**: 100% passing suites across Platform 1 and Platform 2.

---

## 5. Verification & Acceptance Criteria

1. **Discovery & Deal Rooms**:
   - Prospective investors can calculate returns across all 3 structures with instant multi-currency conversion.
   - Referral codes (`?ref=CODE`) are flawlessly captured from any landing page and credited to the promoter.
   - Primary bookings create real database rows in `investment_bookings` awaiting payment proof.
2. **Investor Experience**:
   - 4-Card telemetry strip reflects live database data without layout shifts.
   - Proof of transfer upload flow functions smoothly with image preview and storage fallback.
   - Investors can submit dividend withdrawal requests for bKash/Nagad/Bank wire directly from the platform.
3. **KYC & Regulatory Compliance**:
   - 3-tier stepper accurately reflects database status (`L1`, `L2`, `L3`).
   - Secondary market enforces strict ±10% FMV corridor on listings and Level 2 KYC on purchases.
   - Cash Concierge restricts unaccredited users with clear pathway to upgrade.
4. **Automated Legal Vault**:
   - Digital contracts dynamically bind investor alias, SPV entity, amount, and yield terms with print/PDF export support.
5. **Quality Assurance**:
   - 100% pass rate on Platform 1 (`suite-1-1` to `suite-1-17`) and Platform 2 (`suite-2-1` to `suite-2-17`) in `extension/suites/registry.js`.
