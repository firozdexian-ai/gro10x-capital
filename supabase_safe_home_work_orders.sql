-- ==============================================================================
-- GRO10X CAPITAL — SAFE HOME WEALTH MANAGEMENT & WORK-ORDER FINANCING MIGRATION
-- ==============================================================================

-- 1. Create public.work_orders table
CREATE TABLE IF NOT EXISTS public.work_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    order_code TEXT UNIQUE NOT NULL,
    project_id UUID REFERENCES public.funding_projects(id) ON DELETE SET NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
    corporate_client TEXT NOT NULL,
    item_description TEXT NOT NULL,
    investment_amount_bdt NUMERIC(15,2) NOT NULL,
    return_amount_bdt NUMERIC(15,2) NOT NULL,
    profit_bdt NUMERIC(15,2) DEFAULT 0,
    duration_days INTEGER DEFAULT 10,
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    settled_date DATE,
    status TEXT DEFAULT 'Disbursed_Active' CHECK (status IN ('Disbursed_Active', 'Pending_Approval', 'Settled_Repaid', 'Cancelled')),
    disbursement_receipt_url TEXT,
    repayment_receipt_url TEXT,
    payment_mode TEXT DEFAULT 'EFT/NPSB',
    bank_account_info TEXT DEFAULT 'To Account Name: AYSHA SIDDIKA (A/C: 2621519538001)',
    notes TEXT
);

ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Allow public read of work orders for the shared terminal
CREATE POLICY "Public read work orders" ON public.work_orders
FOR SELECT USING (true);

-- Allow authenticated staff/partners to insert and update work orders
CREATE POLICY "Staff manage work orders" ON public.work_orders
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'kam')
  )
);

-- 2. Seed / Upsert Managing Partner Faiz Bhai
INSERT INTO public.team (id, full_name, email, phone, team_type)
VALUES (
  'e2a2b3c4-d5e6-7890-abcd-ef1234567891',
  'Faiz Ahmed',
  'faiz@chillox.com',
  '01784397960',
  'admin'
)
ON CONFLICT (phone) DO UPDATE 
SET team_type = 'admin', full_name = 'Faiz Ahmed';

-- 3. Seed / Upsert Maats Cottage Ltd & Aysha Siddika
INSERT INTO public.founders (id, full_name, phone, email, background_notes)
VALUES (
  'f2a2b3c4-d5e6-7890-abcd-ef1234567892',
  'Aysha Siddika',
  '+8801770417459',
  'aysha@maatscottage.com',
  'Managing Director & Founder of Maats Cottage Ltd — Specialist manufacturer and corporate supplier of corporate gifting, jute shopping bags, premium leather goods, and institutional merchandise.'
)
ON CONFLICT (id) DO UPDATE 
SET full_name = 'Aysha Siddika', phone = '+8801770417459';

INSERT INTO public.businesses (id, founder_id, brand_name, company_legal_name, industry_sector, operational_months, is_enlisted, ai_health_score)
VALUES (
  'b4a2b3c4-d5e6-7890-abcd-ef1234567893',
  'f2a2b3c4-d5e6-7890-abcd-ef1234567892',
  'Maats Cottage Ltd',
  'Maats Cottage Limited',
  'Corporate Supply & Merchandise',
  24,
  true,
  92
)
ON CONFLICT (id) DO UPDATE
SET brand_name = 'Maats Cottage Ltd', company_legal_name = 'Maats Cottage Limited';

-- 4. Transform Deal 3 to Safe Plan Wealth Management Fund (৳20 Cr)
UPDATE public.funding_projects
SET 
  project_title = 'Safe Plan Wealth Management Fund — ৳20 Cr Facility',
  project_description = 'GRO10X Safe Plan Wealth Management Fund: A ৳20 Crore institutional credit facility actively deployed into verified, high-turnover corporate purchase orders and SME work orders (7–10 day turnaround, 12%–18% per-cycle gross margins). ৳5+ Crore AUM currently managed across 50+ private wealth investors. Delivers a steady 18%–22% annual fixed return with quarterly liquidity cycles.',
  funding_type = 'Wealth Management',
  target_raise_bdt = 200000000,
  amount_raised_bdt = 52500000,
  spv_name = 'Safe Plan Wealth Management SPV-01',
  yield_model = '18% – 22% Annual Fixed Return (Backed by Revolving Work-Order Financing). Quarterly Distributions.',
  min_otc_investment_bdt = 1000000,
  status = 'Active Capital Raise',
  show_on_showcase = true
WHERE id = 'p3a2b3c4-d5e6-7890-abcd-ef1234567890';
