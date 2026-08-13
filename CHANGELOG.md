# Changelog — GRO10X Capital

All notable changes to this project are documented here.

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
