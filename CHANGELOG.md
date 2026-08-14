# Changelog — GRO10X Capital

All notable changes to this project are documented here.

---

## [v0.6.1] — 2026-08-15
**Admin Team & Promoters Tab 7 Comprehensive Overhaul & Role Architecture**

### Upgrades & Fixes
- **Explicit Role Architecture Integration**: Upgraded the Team Onboarding form with a dedicated Role & Responsibility selector covering Director / Principal Partner, Managing Partner (HNI Advisory), Key Account Manager (Operations & Audits), and Operations Support.
- **Distinct Colored Role Badges**: Added role-based visual pills across all team cards (🟣 Purple for Director, 🟡 Gold for Managing Partner, 🔵 Blue for KAM, ⚪ Slate for Support).
- **Elevated Empty States**: Replaced bare text with platform-standard empty states across all 3 sub-tabs (Managing Partners, Promoter Network, Commission Payout Queue).
- **Commission Payout Queue Fixes**: Fixed promoter name resolution in payout table, upgraded status badges, and added gold `Mark Cleared` and danger `Reject` action buttons.
- **Promoter Management**: Wired `handleTogglePromoterActive` on each promoter card, fixed Trainee tier dropdown typo (`No Usual Access`), and maintained gamified milestone progress, CRM leads drilldown, and target progress tracking.
- **Shorthand KPI Formatting**: Applied `formatShorthand()` on Total Commission Earned with `Exact: ৳X` sub-label and standardized all 4 KPI card labels to uppercase with 600 weight.
- **Comprehensive Activity Telemetry**: Integrated `logPlatformActivity` across all 8 Team & Promoter handlers in `page.js`.

---

## [v0.6.0] — 2026-08-15
**Admin Cash Concierge Tab 6 Comprehensive Overhaul**

### Upgrades & Fixes
- **Confidential OTC Pipeline Queue Empty State**: Replaced bare placeholder text with full platform-standard empty state card featuring a gold ShieldCheck badge, informative description, and a `Log First OTC Ticket` CTA button.
- **Filter Reset CTA**: Added an intuitive `Reset Filter to All` fallback action when specific ticket filter statuses return 0 results.
- **Shorthand Currency Formatting**: Implemented `formatShorthand()` on the Active Pipeline Value KPI card with exact value in the sub-label.
- **All-Caps KPI Hierarchy**: Standardized all 4 KPI card headers to uppercase with tracking (`0.04em`) and 600 weight.
- **Enriched Form Placeholders**: Added explicit BDT shorthand notation on the Target Commitment Amount input (`e.g. 10000000 (= ৳1.0 Crore)`).
- **Comprehensive Activity Telemetry**: Integrated `logPlatformActivity` across all 7 Cash Concierge transactional handlers (Ticket Creation, Status Updates, KAM Assignment, Consultation Confirmation, Diligence Notes, Funds Clearance, Telegram Notifications).

---

## [v0.5.9] — 2026-08-15
**Admin Yield Engine & Disbursement Ledger Tab 5 Comprehensive Overhaul**

### Upgrades & Fixes
- **Disbursement Ledger Empty State**: Replaced bare placeholder text with full platform-standard empty state card featuring custom icon, descriptive guidance, and `Declare First Yield Batch` CTA.
- **POS Ingested Sales Register Empty State**: Replaced muted inline text with custom icon and informative guidance.
- **Shorthand Currency Formatting**: Implemented `formatShorthand()` on the All-Time Distributed KPI card and real-time Option Pool calculation cards (10%/12%/35%) with exact subtext.
- **All-Caps KPI Hierarchy**: Standardized all 5 KPI card headers to uppercase with tracking (`0.04em`) and 600 weight.
- **Enriched Form Placeholders**: Added explicit BDT shorthand notation on Gross Sales and Net Profit inputs across both Declare Yield and Manual POS Ingestion forms.
- **Comprehensive Activity Telemetry**: Integrated `logPlatformActivity` across all 5 POS & yield operations (POS Manual Entry, POS CSV Upload, Payment Proof Attachment, Disbursement Finalisation, Telegram Broadcast Push).

---

## [v0.5.8] — 2026-08-15
**Admin Investor Operations Hub Tab 4 Comprehensive Overhaul**

### Upgrades & Fixes
- **All Investors Table Empty State Suite**: Added custom empty state with icon, descriptive copy, `⊕ Onboard First Investor`, and `Copy /investor-onboard Link` CTAs with 1-click clipboard integration.
- **Search on Investment Bookings Sub-tab**: Added live text search (investor alias, deal title, brand name) alongside status filter pills.
- **Total AUM Raised Shorthand Formatting**: Formatted KPI with Bengali currency shorthands (`৳4.50 Crore`, `৳50.0 Lakhs`) and exact sub-label.
- **Polished Bookings Empty State**: Upgraded bare table placeholder to match platform standard with icon, title, and descriptive copy.
- **Onboard Investor Modal Upgrades**: Added `Preferred Contact Channel` (WhatsApp / Telegram / Phone / Email) and `Initial Internal Notes` fields with automatic note logging to `investor_notes`.
- **Complete Activity Telemetry**: Integrated `logPlatformActivity` across all investor actions (Onboard, Assign KAM, Status Update, Privacy Toggle, Booking Update, Note Log).
- **Row-level Quick Actions**: Upgraded table row action button with clear visual styling and direction indicators (`Inspect Profile →`).

---

## [v0.5.7] — 2026-08-15
**Admin Valuation Model Tab 3.5 Comprehensive Overhaul**

### Upgrades & Fixes
- **Eliminated Duplicate Header Block**: Stripped redundant internal purple banner title; now seamlessly aligned with the `AdminHeader` breadcrumb shell.
- **Live Deal Pipeline Project Linkage**: Added target deal selector dropdown pulling live records from `funding_projects` with automatic baseline parameter pre-population.
- **Scenario Presets Engine**: Added 1-click preset scenario buttons (Conservative, Base Case, Aggressive Scale) for instant DCF modeling.
- **Formatted Currency Shorthands**: Replaced raw unformatted integers with live shorthand currency tags (`৳5.00 Crore`, `৳50.0 Lakhs`, etc.) across inputs and summary cards.
- **Preset Quick-Select Chips**: Added 1-click chip buttons for Pre-Money Valuations (৳2.0Cr to ৳12.0Cr) and Target Raises (৳50L to ৳5.0Cr).
- **Save Valuation to Deal Pipeline**: Implemented live Supabase mutation to persist calculated `target_raise_bdt`, `equity_investor_share`, and tiered yield options back to the selected project.
- **Live Telemetry Logging**: Integrated `logPlatformActivity` on valuation scenario save to broadcast DCF parameters to the Command Center activity feed.
- **Division-by-Zero Safety**: Fully guarded all financial math ratios against zero or negative inputs.
- **Clipboard Export Suite**: Added 1-click formatted plain-text valuation summary export for investor memo sharing.

---

## [v0.5.6] — 2026-08-14
**Admin Business Registry Tab 3 Comprehensive Overhaul**

### Upgrades & Fixes
- **Status Filter Full Alignment**: Added missing statuses (`Under_Director_Review`, `Diligence_In_Progress`) to `STATUS_OPTIONS` with corresponding badge colors (`status-badge--warning`, `status-badge--purple`), ensuring all 8 lifecycle statuses are fully filterable.
- **Summary KPI Strip**: Added at-a-glance 4-card metric strip displaying Total Intake count, Active Pending Review count, Average Capital Ask, and Average AI Health Score.
- **Submission Date Column**: Added formatted "Submitted" date column (`MMM D, YYYY`) to the application table for triage prioritization.
- **Empty State Action Suite**: Added actionable 1-click `Copy /apply Link` and `Open Application Form →` shortcuts to the empty state container.
- **Search Extension**: Extended table filter to search across `brand_name`, `ref_code`, `lead_founder_name`, `company_legal_name`, and `industry_sector`.
- **Live Activity Telemetry**: Integrated `logPlatformActivity` calls across all 4 cohort actions (KAM assignment, audit submission with score, rejection with reason, 1-click pipeline deal creation).
- **Inspection Drawer Label Clean**: Shortened `KAM Audit & Onboard` sub-tab label to `Audit & Onboard` for clean responsive layout.

---

## [v0.5.5] — 2026-08-14
**Admin Deal Pipeline Tab 2 Comprehensive Overhaul**

### Upgrades & Fixes
- **Canonical Stage Mapping & Resilient Card Matching**: Implemented `STAGE_STATUS_MAP` and `isProjectInStage()` matching engine supporting all legacy status strings (`Active Capital Raise`, `Live & Trading`, etc.), ensuring all active campaigns reliably render in their corresponding Kanban columns and table filters.
- **Stage Advance Workflow & Friendly Titles**: Integrated `STAGE_TRANSITIONS` mapping so advance buttons and confirmation modals display friendly human-readable stage names (e.g. `2. Diligence & Valuation`, `3. Active Capital Raise`, `4. Active National Grid Hub`) rather than raw internal enum IDs.
- **Showcase Published vs. Live Badge Disambiguation**: Differentiated `• Published` (amber badge for showcase projects) from `• Live` (emerald badge reserved strictly for active trading grid hubs).
- **Inline Stage Quick-Add**: Added quick `+` column header trigger to open project onboarding modal pre-configured for the selected kanban stage.
- **Clickable KAM Assignment Shortcut**: Made unassigned KAM warning label directly interactive, opening the project modal for immediate KAM delegation.
- **Icon Modernization**: Replaced emoji buttons with accessible Lucide `<Users />` icon controls.
- **Table View Actions & Progress Suite**: Upgraded Table View with mini gradient progress bars, dynamic `{pct}% (৳Raised)` progress figures, investor drilldown buttons, and stage advance triggers.
- **Header Title Refinement**: Cleaned hardcoded pipeline title in `AdminHeader` to `Deal Pipeline Management`.

---

## [v0.5.4] — 2026-08-14
**Admin Command Center Tab 1 Comprehensive Overhaul**

### Upgrades & Fixes
- **Active Projects KPI Bug Fix**: Fixed filter to accurately recognize all pipeline and active statuses (`Active`, `Trading`, `Funding`, `Active Capital Raise`, `Diligence`, `Origination`), ensuring active projects count correctly displays real count.
- **Activity Stream Live Telemetry**: Built multi-source event synthesizer + `logPlatformActivity` emitter that records and streams live KYC approvals, payment verifications, yield declarations, and SME pitch submissions.
- **Interactive KPI Cards**: Wired all 6 metric cards with direct navigation triggers (`onClick` to Investor Hub, KYC verification, Deal Pipeline, Yield Ledger, Analytics, and Lead Center).
- **Platform Revenue & Spread Clarification**: Disambiguated 5% spread accrued on active AUM from total pipeline deal spread target.
- **Campaign Health Deal Stage Mapping**: Harmonized status badges (Origination, Diligence, Active Capital Raise, Live & Trading), added project tooltips, and added 1-click `Assign KAM →` shortcut for unassigned deals.
- **Header & Sidebar Enhancements**: Added manual `Sync Data` refresh trigger in header, enabled `+ Onboard Project` directly on Command Center tab, updated icons (Wallet for Cash Concierge, Settings for Platform Settings), and synchronized versioning.

---

## [v0.5.3] — 2026-08-14
**Admin Header De-clutter, Floating LeadBot Fix & KPI Palette Harmonization**

### Upgrades
- **Header De-clutter**: Eliminated redundant duplicate search bar and currency selector from `AdminHeader`, keeping search centralized in global `Navigation`.
- **Sidebar Header Clean**: Replaced redundant logo banner in `AdminSidebar` with a clean `Operations Hub v0.5.3` status indicator.
- **LeadBot Visibility**: Restricted floating public "Talk to Advisor" button from appearing on Admin command center pages.
- **KPI Color Harmonization**: Converted clashing pink/purple text to high-contrast amber, sky-blue, and gold tokens in `InquiryLeadsTab`.
- **Empty State UX**: Added icon-driven empty state card with quick manual lead intake CTA.

---

## [v0.5.2] — 2026-08-14
**UI/UX Platform Polish & Responsive Design System**

### Upgrades
- **Design Tokens & Scrollbars**: Custom ultra-thin gold scrollbars (`::-webkit-scrollbar`), accessible brand focus rings (`:focus-visible`), and depth backlighting.
- **Deal Cards (ProjectCard)**: Smooth image hover zoom (`scale(1.05)`), elevation hover depth with gold radiance, SPV secured badges, and 3-tier progress bar refinement.
- **Navigation Fluidity**: Polished 24px backdrop blur mobile drawer, role pill radiance, and smooth drop-in animations.

---

## [v0.5.1] — 2026-08-14
**Platform Hardening & Performance Optimizations**

### Upgrades
- **Currency Suite**: Safe number parsing, negative amount formatting (`-৳5.0 Lakhs`), Indian numbering comma system (`৳15,00,000`), and international conversion helpers.
- **Auth Guard**: Lifecycle synchronization in `AuthProvider`, unmount cleanup safety, and manual `refreshRole()` utility.
- **ROI Calculator**: Interactive quick-select ticket chips (৳5L–৳1Cr), dynamic multi-currency display, and accurate yield metrics.
- **SEO & Structured Data**: Enhanced `RootLayout` metadata with OpenGraph, Twitter card tags, and `FinancialProduct` JSON-LD schema.

---

## [v0.5.0] — 2026-08-10
**Production Baseline Lock** — Full platform committed, tagged, and deployed.

### Summary
Complete multi-portal private equity investment platform built on Next.js 16, Supabase, and React 19. Covers the full investment lifecycle from capital raise to yield distribution, with compliance, secondary market, promoter gamification, and admin operations.

### Portals Delivered
- **`/`** — Public marketing homepage with animated hero and deal teasers
- **`/showcase`** — Public deal showcase with referral code capture
- **`/auth`** — Supabase Auth login/signup
- **`/investor`** — Full portfolio, KYC vault, document vault, secondary market listing, AI concierge
- **`/admin`** — Master command center (1,452 lines, 52 DB queries) — KYC queue, payment clearance, dividend engine, SPV config, cash pipeline, legal compliance, treasury payouts
- **`/promoter`** — CRM leads, gamified project targets, referral engine
- **`/payouts`** — Commission withdrawal and ledger
- **`/secondary-market`** — P2P orderbook with ±10% valuation corridor and KYC gate
- **`/business`** — Founder cap table, POS sync, campaign tracker
- **`/cash-concierge`** — OTC advisory request (KYC Level 3 gated)
- **`/kam-dashboard`** — KAM monthly audits + cash advisory pipeline

### Database (25 Tables)
`founders` · `businesses` · `funding_projects` · `investors` · `promoters` · `kams` · `user_roles` · `investments` · `secondary_orders` · `promoter_leads` · `payout_requests` · `business_audits` · `investment_bookings` · `payment_submissions` · `yield_disbursements` · `investor_yields` · `promoter_commissions` · `kyc_submissions` · `notifications` · `pos_daily_sales` · `cash_tickets` · `legal_documents` · `promoter_targets`

### Shared Components
- `AuthProvider.js` — Supabase Auth + RBAC context (admin/investor/promoter/kam/founder)
- `Navigation.js` — Responsive global navbar with role-driven links + hamburger menu
- `NotificationBell.js` — Real-time Supabase Realtime notification bell
- `Skeleton.js` — Shimmer skeleton loaders
- `Toast.js` — Global slide-in toast notifications

### Key Features by Sprint
| Sprint | Feature |
|---|---|
| 0.4.3 | Payout engine, portfolio analytics, Toast/Skeleton UI polish |
| 0.4.4 | 3-Tier progressive KYC vault, global real-time notification engine |
| 0.4.5 | P2P secondary market with ±10% valuation guardrail and automated ownership transfer |
| 0.4.6 | Founder dashboard, POS sync, POS-driven dividend automation |
| 0.4.7 | Cash Concierge OTC pipeline, KAM advisory queue |
| 0.4.8 | SPV legal document vault, treasury payout clearance |
| 0.4.9 | Gamified promoter targets + retroactive 1% commission engine |

### Tech Stack
- **Framework**: Next.js 16.3 (App Router)
- **UI**: React 19, Vanilla CSS, Lucide React, Recharts
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Realtime)
- **Deployment**: Vercel (Hobby)

---

## [v0.2.x] — 2026-08 (Prior)
Initial Supabase infrastructure, Telegram mini-app simulator, multi-tier funding rounds, promoter 50-lead gateway, fraud engine scaffold, AI financial model (DCF/valuation).

---

*Maintained by GRO10X Capital engineering.*
