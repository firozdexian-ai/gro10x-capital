-- ==============================================================================
-- GRO10X CAPITAL — SAFE PLAN WEALTH MANAGEMENT FUND INFRASTRUCTURE
-- Table: public.fund_monthly_performance
-- Purpose: Track monthly deployment results, gross yields, and management incentives
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.fund_monthly_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    project_id UUID REFERENCES public.funding_projects(id) ON DELETE CASCADE,
    performance_month TEXT NOT NULL, -- Format: 'YYYY-MM', e.g. '2026-08'
    deployed_capital_bdt NUMERIC(15,2) NOT NULL DEFAULT 0,
    settled_capital_bdt NUMERIC(15,2) NOT NULL DEFAULT 0,
    gross_profit_bdt NUMERIC(15,2) NOT NULL DEFAULT 0,
    annualized_gross_yield_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
    management_incentive_pct NUMERIC(5,2) DEFAULT 20.00,
    incentive_collected_bdt NUMERIC(15,2) DEFAULT 0,
    net_investor_annualized_yield_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
    revolving_cycles_completed INTEGER DEFAULT 0,
    audit_notes TEXT,
    audited_by UUID REFERENCES public.team(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'Audited' CHECK (status IN ('Draft', 'Audited', 'Distributed')),
    CONSTRAINT unique_project_performance_month UNIQUE (project_id, performance_month)
);

ALTER TABLE public.fund_monthly_performance ENABLE ROW LEVEL SECURITY;

-- Allow public read access to audited monthly performance for the transparency terminal
CREATE POLICY "Allow public read of audited fund performance" ON public.fund_monthly_performance
FOR SELECT USING (status IN ('Audited', 'Distributed'));

-- Allow staff to manage monthly performance records
CREATE POLICY "Allow staff to manage fund performance" ON public.fund_monthly_performance
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'kam')
    )
);

-- ==============================================================================
-- Seed Baseline Audited Performance for Safe Plan Wealth Management Fund
-- Project ID: c3a2b3c4-d5e6-7890-abcd-ef1234567890
-- ==============================================================================

INSERT INTO public.fund_monthly_performance (
    project_id,
    performance_month,
    deployed_capital_bdt,
    settled_capital_bdt,
    gross_profit_bdt,
    annualized_gross_yield_pct,
    management_incentive_pct,
    incentive_collected_bdt,
    net_investor_annualized_yield_pct,
    revolving_cycles_completed,
    audit_notes,
    status
) VALUES 
(
    'c3a2b3c4-d5e6-7890-abcd-ef1234567890',
    '2026-07',
    25000000, -- ৳2.50 Cr deployed
    25000000,
    625000,   -- ৳6.25L gross profit
    24.50,
    20.00,
    125000,
    19.20,
    3,
    'Audited PO settlements: Delta Ltd, Greenfield Jutex. 100% on-time repayment.',
    'Distributed'
),
(
    'c3a2b3c4-d5e6-7890-abcd-ef1234567890',
    '2026-08',
    35000000, -- ৳3.50 Cr deployed
    35000000,
    910000,   -- ৳9.10L gross profit
    26.00,
    20.00,
    182000,
    20.50,
    4,
    'Audited PO settlements: Delta Ltd (MSP-001), Corporate Procurement. Zero default.',
    'Distributed'
),
(
    'c3a2b3c4-d5e6-7890-abcd-ef1234567890',
    '2026-09',
    52500000, -- ৳5.25 Cr deployed
    48000000,
    1350000,  -- ৳13.50L gross profit
    25.20,
    20.00,
    270000,
    19.80,
    5,
    'Current active revolving cycle: MSP-002 settled, Q3 distributions scheduled.',
    'Audited'
)
ON CONFLICT (project_id, performance_month) DO UPDATE SET
    deployed_capital_bdt = EXCLUDED.deployed_capital_bdt,
    settled_capital_bdt = EXCLUDED.settled_capital_bdt,
    gross_profit_bdt = EXCLUDED.gross_profit_bdt,
    annualized_gross_yield_pct = EXCLUDED.annualized_gross_yield_pct,
    net_investor_annualized_yield_pct = EXCLUDED.net_investor_annualized_yield_pct,
    revolving_cycles_completed = EXCLUDED.revolving_cycles_completed,
    audit_notes = EXCLUDED.audit_notes,
    status = EXCLUDED.status;
