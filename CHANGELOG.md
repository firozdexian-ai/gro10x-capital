# Changelog — GRO10X Capital

All notable changes to this project are documented here.

---

## [v0.7.9] — 2026-08-17
**Admin & Director Stakeholder Suite: Telegram MiniApp, Bot Security & Automations Overhaul**

### Upgrades & Fixes
- **Critical Security Upgrades**:
  - Masked all client-side Telegram bot tokens in `BotManagementTab.js` preventing credential leakage to the browser.
  - Added authorization guards on `/api/admin/register-webhook` ensuring only authorized administrative requests can modify Telegram webhook endpoints.
- **Telegram Bot System & Command Matrix**:
  - Implemented strict RBAC role guard on `/broadcast` command, preventing unauthorized members from sending team announcements.
  - Added dedicated `/kyc` and `/applications` (cohorts) commands for Admin/Director in `@gro10xmanbot`.
  - Added `🌐 Promoter Hub` link to Promoter inline bot menu.
  - Fixed N+1 phone number query bottleneck in `handleContactVerification` via targeted matching.
- **Telegram MiniApp (`/team-miniapp`) Enhancements**:
  - Fixed payout status filtering to support both `'Pending'` and `'Pending Verification'` requests.
  - Added real-time notification to promoters via Telegram when Admin clears/approves their payout.
  - Added dedicated **KYC Review & Verification Tab** in the MiniApp for Admin role.
  - Added live notification count badges on navigation tabs (Leads, Payouts, KYC).
  - Fixed CSS rendering bug (`position: 'sticky', top: 0` in header).
- **Platform Inbound Telegram Push Automations**:
  - Connected `/api/apply-cohort` directly to `TELEGRAM_TEAM_BOT_TOKEN`, broadcasting detailed alerts to all Admins when new business applications arrive.

---

## [v0.7.8] — 2026-08-17
**Promoter & Capital Partner Portal (`/promoter`) Comprehensive Overhaul**

### Upgrades & Fixes
- **5 Critical Data & Auth Bugs Fixed**:
  - Fixed column mismatch in `promoter_commissions` by querying `amount_bdt` instead of non-existent `commission_amount_bdt`, resolving the ৳0 commission ledger bug.
  - Added strict `.eq('promoter_id', activePromoter.id)` scoping across all 4 data queries (leads, targets, payouts, commissions) preventing cross-promoter data leakage.
  - Removed erroneous fallback query to non-existent `team` table eliminating console 42P01 errors.
  - Added `authLoading` session guard to prevent transient loading screen flashes.
  - Replaced inline local toast with unified global `useToast()` system.
- **Admin & KAM Multi-Promoter Overseer Mode**: Destructured `role` from `useAuth()`. Added a promoter switcher in the header allowing Admins and KAMs to inspect and manage any promoter's CRM pipeline, targets, earnings, and payouts.
- **Global Multi-Currency Engine**: Added currency dropdown (BDT, USD, GBP, AED) in the header with live recalculation across all statistics, commissions, and withdrawal requests.
- **4-Card Top-Level Executive KPI Strip**: Implemented live calculated summary cards for CRM Prospects Logged (with unlock status), Total Commission Earned (with Base 0.75% and Target 0.25% breakdown), Campaign Target Pledges, and Available Payout Balance.
- **Enhanced 50-Investor Gamified Banner**: Added progress bar with remaining leads countdown, status badge, and copyable deal referral link upon milestone unlock.
- **Elevated 4-Tab Stakeholder Experience**:
  - **Tab 1 (CRM & Prospects)**: Full prospect logging form (Name, Phone, Email, Category, Interest) + Searchable leads queue with inline status management (`New Lead`, `Contacted`, `Meeting Booked`, `Converted`, `Not Interested`).
  - **Tab 2 (Campaign Targets)**: Project pledge form linked to active funding rounds with status tracking (`Active` vs `Target_Hit`).
  - **Tab 3 (Earnings & Commission Ledger)**: Milestone tier cards + granular per-investment commission breakdown table with commission type pills (`Base_0.75` vs `Target_0.25`).
  - **Tab 4 (Payout Requests)**: Withdrawal request form with disbursement channels (`bKash`, `Nagad`, `Bank Wire`), balance limit validation, Telegram push notifications, and detailed payout history ledger.

---

## [v0.7.7] — 2026-08-16
**Founder & Business Owner Portal (`/business`) Comprehensive Overhaul**

### Upgrades & Fixes
- **Auth Role & Admin/KAM Overseer Support**: Destructured `role` and `authLoading` from `useAuth()`. Added an outlet switcher dropdown allowing Admins and KAMs to seamlessly view and manage any registered brand without hitting Access Denied.
- **Global Multi-Currency Switcher**: Added header currency dropdown (BDT, USD, GBP, AED) with real-time recalculation of funding amounts, cap table allocations, and POS telemetry.
- **4-Card Top-Level Executive KPI Strip**: Implemented live calculated summary cards for Total Capital Raised (with Target and % Progress), Syndicate Investors (with Total Active Equity), 30-Day POS Revenue (with Net Profit & Margin), and Active Campaigns / SPVs.
- **Funding Campaigns Elevation (Tab 1)**: Enhanced project cards with status badges, SPV legal entities, yield models, minimum OTC ticket sizes, raised vs target progress bars, and direct `View Public Deal Room ↗` links.
- **Cap Table Search & Share Allocations (Tab 2)**: Added real-time search filtering, aggregate syndicate totals, investor tier classifications (Retail vs Accredited HNI), and exact calculated percentage share of syndicate capital.
- **POS Telemetry & Solvency Engine (Tab 3)**: Added live computed solvency margin preview in the manual entry form, net profit <= gross sales validation, and a searchable 30-day sync ledger with margin pills and transaction counts.

---

## [v0.7.6] — 2026-08-15
**Investor Portal Tabs 4 & 5: AI Concierge & Due Diligence Knowledge Base Elevation**

### Upgrades & Fixes
- **AI Concierge Tab 4 Upgrade**: Added standard header with intelligence badge, an enterprise AI Desk upgrade banner routing to `/ai-assistant`, clickable quick-question prompt chips that auto-populate the input, and styled chat bubbles.
- **Due Diligence FAQ Tab 5 Expansion (3 → 10)**: Expanded due diligence knowledge base from 3 to 10 comprehensive structural, legal, and financial Q&As covering minimum ticket sizes, monthly yield timing, P2P secondary liquidity, default liquidation seniority, Bangladesh tax obligations, and Option 1 vs Option 2 mechanics.
- **Interactive FAQ Accordion Controls**: Implemented dynamic open/collapse accordion cards with numerical index identifiers, active gold borders, and illuminated answer panels.

---

## [v0.7.5] — 2026-08-15
**Investor Portal Tab 3: Legal & Regulatory Document Vault Elevation**

### Upgrades & Fixes
- **Tab Header & Secured Document Pill**: Added standard GRO10X header with live secured document counter (`● X Documents Secured`).
- **Type-Coloured Document Cards**: Enhanced document rows with distinct left border indicators, colored icons, and category badges for SPV Share Certificates (Gold), Subscription Agreements (Blue), and Tax/Compliance Statements (Emerald).
- **Gold Action Triggers**: Upgraded PDF download triggers to prominent gold gradient action buttons with shadow elevation.
- **Rich Contextual Empty State**: Replaced basic text with a structured illustration, explanatory copy regarding SPV minting, and an `Explore Live Rounds →` deal room CTA.

---

## [v0.7.4] — 2026-08-15
**Investor Portal Tab 2: Progressive KYC Verification Elevation & Stepper**

### Upgrades & Fixes
- **Visual 3-Step Progress Stepper**: Added an interactive 3-step horizontal progression bar showing investor verification status across L1 (Basic), L2 (Identity & NID), and L3 (Accredited HNI Tier).
- **Tab Header & Verification Badge**: Added standard GRO10X header with live active verification level pill (`Level X / 3 Active`).
- **Tier Benefit Pills**: Added granular benefit tags for each tier detailing platform privileges (e.g., Live Deals, P2P Secondary Trading, Cash Concierge, BDT 50L+ rounds).
- **Glass-Card Form Panels**: Replaced raw form containers with polished glassmorphism upload forms with dual NID inputs (Front & Back) and Source of Funds declarations with gradient CTA buttons.

---

## [v0.7.3] — 2026-08-15
**Investor Portal Tab 1: My Portfolio & Secondary Market Critical Fixes & Overhaul**

### Upgrades & Fixes
- **Critical Bug Fix #1 (Secondary Market)**: Added `id`, `yield_option`, and `created_at` to the `investments` query `.select()` statement, resolving a silent failure on secondary market listings caused by undefined `investment_id` violating foreign key constraints.
- **Critical Bug Fix #2 (Auth Safety)**: Destructured `authLoading` directly from `useAuth()` hook to prevent potential unhandled `ReferenceError` during initial portal load.
- **Live 4-Card Portfolio KPI Strip**: Replaced hardcoded formula multiplier (`totalInvested * 0.016`) and static target yield (`20.00%`) with live data: **Total Capital Invested**, **Total Yield Earned**, **Latest Dividend** (from `yieldHistory`), and **Portfolio Distribution** (asset-backed holdings count).
- **Tab Header & Live Positions Counter**: Added standard GRO10X tab-level header with live count pill displaying active portfolio allocations.
- **Redesigned Premium Asset Holdings Cards**: Enriched investment cards with brand name, project title, yield option badges, status-matched left border styling, allocation inception dates, and direct secondary market action triggers.
- **Enhanced Payout History Chart Header**: Added logged month counter and improved empty state with informative auditing reconciliation copy.

---

## [v0.7.2] — 2026-08-15
**Staff Sub-Portal: `/pos-sync` (Live POS Telemetry & Daily Sales Reconciliation Terminal) Rebuild**

### Upgrades & Fixes
- **Auth Guard & Role Protection**: Added authentication barrier and role check restricting access to authorized `staff`, `kam`, and `admin` users (redirects unauthorized users to `/auth` or `/`).
- **Live Database Connection**: Connected portal directly to Supabase, replacing hardcoded outlet mock data with dynamic business loading from the `businesses` table.
- **Real Daily Sales Telemetry Terminal**: Replaced fake CSV upload simulation with a validated daily sales submission terminal that calculates gross sales (Dine-in + Delivery) and net profit (Gross − Expenses) and writes directly to `pos_daily_sales` (`sync_source: 'Staff_Submit'`).
- **Live 4-Card KPI Telemetry Strip**: Replaced static cards with live metrics computing Total Gross Revenue, Net Solvency Profit, Average Net Margin %, and Logged Entry Counts directly from database records for the selected outlet.
- **Historical POS Ingested Submissions Register**: Added an interactive data table with live date search/filters, net margin badges, sync source tags, and formatted currency conversions.

---

## [v0.7.1] — 2026-08-15
**KAM Dashboard Tabs 4 & 5 (Yield History & Cash Pipeline) Comprehensive Overhaul**

### Upgrades & Fixes
- **Critical Table Name Bug Fix (Tab 4)**: Fixed query targeting non-existent `disbursement_runs` table, re-routing it to the actual production `yield_disbursements` table with joined `funding_projects` and child `investor_yields`.
- **Tab 4 3-Card Yield KPI Strip**: Added top-level metrics row displaying Total Yield Distributed, Verified Batches count, and Average Payout per Batch.
- **Tab 4 Financial Reconciliation Cards**: Upgraded yield cards to display Gross Outlet Sales, Net Solvency Profit, Total Syndicate Distribution, and processed investor payee counts with status badges (`Draft`, `Finalised`, `Paid Out`).
- **Tab 5 Full Schema Query Upgrade**: Upgraded `cash_tickets` query to select preferred meeting time, meeting format, confirmed schedule date, funds transfer reference, client KYC accreditation tier, and anonymity flags.
- **Tab 5 3-Card Cash KPI Strip**: Added dedicated OTC Concierge metrics displaying Active Pipeline Value, Pending Consultations, and Cleared Capital.
- **Tab 5 Lifecycle Status Filter Bar**: Added interactive filter pills (`All Tickets`, `Pending Review`, `Meeting Scheduled`, `Funds Cleared`, `Closed / Final`) with live count badges.
- **Tab 5 Comprehensive OTC Ticket Cards**: Redesigned tickets with color-coded status borders, appointment scheduling context, escrow clearance references, and instant contact action buttons (`Direct Call`, `WhatsApp`, `Email`).

---

## [v0.7.0] — 2026-08-15
**KAM Dashboard Tab 3 (CapEx Projects & Deal Room) Major Milestone Overhaul**

### Upgrades & Fixes
- **Triple Field-Name Bug Fix**: Fixed `target_amount_bdt` → `target_raise_bdt`, `raised_amount_bdt` → `amount_raised_bdt`, and `kanban_stage` → `status`. This resolves the persistent 0% progress bar and ৳0 raise metrics across all CapEx project cards.
- **Joined Investments & Real-time Metrics**: Upgraded Supabase `funding_projects` query to join active `investments`, surfacing live committed investor partner counts and accurate syndicated capital metrics.
- **Tab-Level 3-Card CapEx KPI Strip**: Added dedicated deal-room metrics row displaying Total CapEx Pipeline target volume, Total Capital Committed with funding percentage, and Active Target counts.
- **Status Stage & Funding Type Color Coding**: Added standardized badges for project stages (`Origination`, `Structuring`, `Active Raise`, `Live Trading`, `Completed`, `Paused`) and funding structures (`Franchise`, `Distribution`, `Equity`, `Short-Term Debt`).
- **Comprehensive Project Deal Cards**: Redesigned project cards with brand headers, descriptions, SPV legal entity indicators, yield models, dynamic gradient progress bars, and minimum OTC ticket threshold breakdowns.

---

## [v0.6.9] — 2026-08-15
**KAM Dashboard Tab 2 (Investor Portfolio) Comprehensive Overhaul**

### Upgrades & Fixes
- **Critical Allocation Bug Fix**: Fixed field mapping from `amount_bdt` to `amount_invested_bdt`, resolving the silent ৳0 total allocation calculation across all investor cards and portfolio metrics.
- **Explicit Schema Query**: Upgraded Supabase `investors` select query to include `category`, `kyc_level`, `kyc_verified`, `onboarding_status`, `preferred_channel`, `requires_anonymity`, and nested investments with project titles and stages.
- **Tab-Level 3-Card Portfolio KPI Strip**: Added dedicated metrics row above investor cards displaying Total Portfolio AUM, KYC Verified Accounts (`X / Y`), and Average Accreditation Tier (`Tier Z / 3`).
- **Lifecycle Status Filter Bar**: Added interactive filter pills (`All Accounts`, `Active`, `VIP / Family Office`, `KYC Pending`, `Invited`) with real-time count badges.
- **Expanded Relationship Cards**: Redesigned investor cards with color-coded status borders, KYC accreditation badges, direct contact links (Phone/Email/Telegram status), active project holding breakdowns, and instant action buttons (`Direct Call`, `WhatsApp`, `Email`).

---

## [v0.6.8] — 2026-08-15
**KAM Dashboard Tab 1 (Monthly Audits) Comprehensive Overhaul**

### Upgrades & Fixes
- **Audit History Panel**: Connected live query to `business_audits` to fetch and render the last 5 audit runs for the selected business, displaying month, date, solvency metrics, and color-coded score pills.
- **Dynamic Solvency & Health Score Bands**: Added dynamic color bands (Awaiting Entry `#94a3b8`, Critical `#ef4444`, Moderate `#f59e0b`, Good `#3b82f6`, Optimal `#10b981`), score progress bar, and contextual solvency analysis.
- **Grouped Balance Sheet with Live Subtotals**: Divided form into `CURRENT ASSETS` and `CURRENT LIABILITIES` with live subtotal badges and dynamic `NET WORKING CAPITAL` indicator.
- **Per-Asset Photo Upload Tracking**: Added isolated upload status tracking (`uploading`, `verified`, `error`) per inspection item with inline spinners and green verified badges.
- **Empty State & Reset Flow**: Added elevated empty state for zero-business scenarios and "Submit Another Audit →" button to seamlessly log multiple audits.
- **Global Suppression of Floating Bot**: Suppressed LeadBot "Talk to Advisor" floating trigger on internal staff routes (`/kam-dashboard`, `/pos-sync`, `/fraud-detection`, `/buildout-tracker`, `/team-miniapp`).

---

## [v0.6.7] — 2026-08-15
**KAM & Managing Partner Portal Foundation & Security Overhaul**

### Upgrades & Fixes
- **Role Guard Security**: Added client-side role authorization to `/kam-dashboard` ensuring non-KAM/non-Admin authenticated users are safely redirected.
- **Data Scoping Bug Fix**: Scoped `investors` query by `.eq('assigned_kam_id', kamProfile.id)` and `cash_tickets` query by assigned investor IDs, preventing platform-wide data leakage.
- **Platform Toast Integration**: Removed isolated local toast state and wired standard platform `useToast()` hook.
- **KAM Profile & Identity Card**: Added styled header card featuring KAM identity, verified partner badge, direct contact info, and global currency selector.
- **4-Card KPI Summary Strip**: Added top-level metrics strip covering Assigned Investors, Active Cash Tickets, Managed Outlets, and Average Portfolio Health score.
- **Standardized Tab Navigation**: Standardized all 5 sub-tab buttons with active glow indicators, Lucide icons, and live entity counts.

---

## [v0.6.6] — 2026-08-15
**Admin Settings & Platform Governance Tab 12 Comprehensive Overhaul**

### Upgrades & Fixes
- **4-Section Governance Architecture**: Completely restructured Settings into 4 clear governance sections: Platform & Founder Identity, Telegram Alert Dispatchers, Financial & Spread Rules, and Security & Access Control.
- **8 Dynamic Platform Settings**: Added live database sync for `founder_phone`, `platform_legal_name`, `owner_telegram_chat_id`, `investment_alert_chat_id`, `yield_alert_chat_id`, `deal_spread_pct`, `min_ticket_size_bdt`, `default_promoter_commission_pct`, and `pin_expiry_minutes`.
- **Dynamic Deal Spread Widget**: Connected `deal_spread_pct` from `platform_settings` directly to the sidebar bottom widget, replacing previous hardcoded 5% formula and label.
- **Dynamic PIN Expiry Window**: Connected `pin_expiry_minutes` setting directly to the Telegram bot PIN issuance engine.
- **Activity Telemetry**: Instrumented Settings save handler with `safeLogActivity` and wired prop through `page.js`.

---

## [v0.6.5] — 2026-08-15
**Admin Bots & Access Control Tab 11 Comprehensive Overhaul**

### Upgrades & Fixes
- **KPI Card Hierarchy**: Standardized all 4 KPI card headers with uppercase styling, `letterSpacing: 0.04em`, and `fontWeight: 800`.
- **Sub-Tab Navigation**: Standardized all 4 sub-tab buttons with platform `tab-toggle-btn` styling and dedicated Lucide icons (`Bot`, `Users`, `ShieldCheck`, `LayoutGrid`).
- **Filter Pill Fix**: Fixed 'Alls' typo in User Access Directory role filter pills by adopting explicit `{ key, label }` structure.
- **Activity Telemetry**: Instrumented all 3 transactional handlers (`handleRegisterWebhook`, `handleSaveBotConfig`, `handleGeneratePin`) with `safeLogActivity` and wired `logPlatformActivity` prop from `page.js`.
- **Table Empty States**: Added elevated empty state rows with Lucide icons (`Users`, `ShieldCheck`) to both the Telegram User Access Directory table and the PIN Security Audit Logs table.

---

## [v0.6.4] — 2026-08-15
**Admin Analytics Tab 10 Comprehensive Overhaul**

### Upgrades & Fixes
- **Sub-Tab Icon Navigation**: Added dedicated Lucide icons (`BarChart3`, `Users`, `TrendingUp`, `Award`) to all 4 Analytics sub-tab buttons.
- **Elevated Panel Empty States**: Added `emptyPanel()` helper with compact icon + descriptive copy for all 7 analytically-contextual empty states: Yield Paid Out (`BarChart2`), POS Revenue (`Store`), Investor Category Mix (`PieChart`), Deal Pipeline Stage (`TrendingUp`), Fundraising Progress (`Target`), Promoter Commission Leaderboard (`Trophy`), and Lead Acquisition Channels (`Radio`).
- **Table Empty-State Rows**: Added `<tbody>` empty-state rows with inline Lucide icons for the Investor Activity Snapshot table and All Promoters Performance table.
- **Component Header**: Updated docstring from Tab 9 to Tab 10.

---

## [v0.6.3] — 2026-08-15
**Admin Legal & Compliance Tab 9 Comprehensive Overhaul**

### Upgrades & Fixes
- **Elevated Empty States for All 4 Sub-Tabs**: Added platform-standard elevated empty states with rich context, Lucide icons, and CTA triggers for Contract Issuance Engine (`FileText`), SPV Registry (`Building2`), KYC/AML Compliance Queue (`ShieldCheck`), and Document Audit Trail (`BookOpen`).
- **Sub-Tab Button Navigation**: Attached dedicated Lucide icons (`FileText`, `Building2`, `ShieldCheck`, `BookOpen`) to all 4 sub-tab buttons.
- **KPI Hierarchy & Label Typography**: Upgraded all 4 KPI card headers with uppercase styling, `letterSpacing: '0.04em'`, `fontWeight: '600'`, and fixed "Awaiting E-Signature" label.
- **End-to-End Activity Telemetry**: Passed `logPlatformActivity` from `page.js` to `LegalComplianceTab.js` and instrumented all 8 legal & compliance transactional handlers (`handleIssueDocument`, `handleBulkIssueToProject`, `handleMarkSigned`, `handleRevokeDoc`, `handleSaveSpv`, `handleToggleComplianceField`, `handleVerifyKyc`, `handleFlagAml`).

---

## [v0.6.2] — 2026-08-15
**Admin Leads & Marketing Tab 8 Comprehensive Overhaul**

### Upgrades & Fixes
- **Elevated Empty States**: Replaced bare text with platform-standard glass empty states for both Sub-Tab 2 (Promoter Survey Vault with `FileSpreadsheet` icon) and Sub-Tab 3 (Marketing Campaigns Tracker with `Megaphone` icon and `+ Create First Campaign` CTA).
- **All-Caps KPI Hierarchy**: Standardized all 5 KPI card headers with uppercase styling, `letterSpacing: '0.04em'`, and `fontWeight: '600'`.
- **End-to-End Activity Telemetry**: Passed `logPlatformActivity` from `page.js` to `InquiryLeadsTab.js` and instrumented all 8 CRM & Marketing transactional handlers (`handleUpdateLeadStatus`, `handleAssignPromoter`, `handleAssignKam`, `handleSaveLeadDetails`, `handleAddManualLead`, `handleSendTelegramInvite`, `handleConvertPreProfileToInvestor`, `handleAddCampaign`, `handleCloseCampaign`).

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
