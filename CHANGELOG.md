# Changelog — GRO10X Capital

All notable changes to this project are documented here.

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
