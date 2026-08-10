-- GRO10X Capital v0.2.0: Core Relational Schema

-- 1. Founders Table
CREATE TABLE public.founders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID UNIQUE, -- Link to Supabase Auth User
    full_name TEXT NOT NULL,
    linkedin_url TEXT,
    track_record_score INTEGER DEFAULT 0,
    background_notes TEXT
);

-- 2. Businesses Table
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    founder_id UUID REFERENCES public.founders(id) ON DELETE CASCADE,
    brand_name TEXT NOT NULL,
    ai_health_score INTEGER DEFAULT 0,
    is_enlisted BOOLEAN DEFAULT false,
    industry_sector TEXT,
    operational_months INTEGER DEFAULT 0
);

-- 3. Funding Projects (Rounds) Table
CREATE TABLE public.funding_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    project_title TEXT NOT NULL,
    funding_type TEXT NOT NULL CHECK (funding_type IN ('Franchise', 'Distribution', 'Equity', 'Short-Term Debt')),
    target_raise_bdt NUMERIC NOT NULL,
    amount_raised_bdt NUMERIC DEFAULT 0,
    spv_name TEXT,
    yield_model TEXT,
    min_otc_investment_bdt NUMERIC DEFAULT 5000000,
    status TEXT DEFAULT 'Origination'
);

-- 4. Investors Table
CREATE TABLE public.investors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID UNIQUE, -- Link to Supabase Auth User if they login
    alias_name TEXT NOT NULL,
    category TEXT DEFAULT 'High Net Worth Individual (HNI)',
    kyc_verified BOOLEAN DEFAULT false
);

-- 5. Promoters Table
CREATE TABLE public.promoters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID UNIQUE, -- Link to Supabase Auth User
    full_name TEXT NOT NULL,
    referral_code TEXT UNIQUE NOT NULL,
    silent_survey_leads INTEGER DEFAULT 0,
    can_promote_deals BOOLEAN DEFAULT false
);

-- 6. Key Account Managers (KAMs) Table
CREATE TABLE public.kams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID UNIQUE, -- Link to Supabase Auth User
    full_name TEXT NOT NULL,
    region TEXT
);

-- 7. User Roles Table (RBAC)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'kam', 'promoter', 'investor', 'founder')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Investments Table (Holdings Ledger)
CREATE TABLE public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
    funding_project_id UUID REFERENCES public.funding_projects(id) ON DELETE CASCADE NOT NULL,
    amount_invested_bdt NUMERIC NOT NULL,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Pending', 'Active', 'Exited', 'Defaulted'))
);

-- 9. Secondary Orders Table (Marketplace)
CREATE TABLE public.secondary_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    seller_investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
    investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
    original_investment_bdt NUMERIC NOT NULL,
    seller_price_bdt NUMERIC NOT NULL,
    fmv_at_listing_bdt NUMERIC NOT NULL,
    buyer_booking_id UUID, -- To link the pending acquisition booking
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Matched', 'Cancelled', 'Pending_Clearance', 'Transferred'))
);

-- 10. Promoter Leads Table
CREATE TABLE public.promoter_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    promoter_id UUID REFERENCES public.promoters(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    category TEXT,
    interest TEXT,
    status TEXT DEFAULT 'New Lead'
);

-- 11. Payout Requests Table
CREATE TABLE public.payout_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    promoter_id UUID REFERENCES public.promoters(id) ON DELETE CASCADE NOT NULL,
    amount_bdt NUMERIC NOT NULL,
    disbursement_channel TEXT NOT NULL,
    account_details TEXT NOT NULL,
    status TEXT DEFAULT 'Pending Verification' CHECK (status IN ('Pending Verification', 'Disbursed', 'Cleared', 'Rejected')),
    cleared_at TIMESTAMP WITH TIME ZONE
);

-- 12. Business Audits Table
CREATE TABLE public.business_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    kam_id UUID REFERENCES public.kams(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    audit_month TEXT NOT NULL,
    cash_in_hand_bdt NUMERIC NOT NULL,
    stock_valuation_bdt NUMERIC NOT NULL,
    receivables_market_bdt NUMERIC NOT NULL,
    receivables_company_bdt NUMERIC NOT NULL,
    payables_bdt NUMERIC NOT NULL,
    payroll_expense_bdt NUMERIC NOT NULL,
    calculated_health_score INTEGER NOT NULL
);

-- NOTE: cash_tickets and notifications tables are defined later in the schema
-- with full FK references and correct RLS. See sections 23 and 21 respectively.

-- Enable Row Level Security
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secondary_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoter_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_audits ENABLE ROW LEVEL SECURITY;
-- cash_tickets and notifications RLS policies are defined in sections 23 and 21 respectively.

-- Create basic read policies (allow anyone to read public data for now during dev)
CREATE POLICY "Allow public read access to founders" ON public.founders FOR SELECT USING (true);
CREATE POLICY "Allow public read access to businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Allow public read access to funding_projects" ON public.funding_projects FOR SELECT USING (true);
CREATE POLICY "Allow users to read their own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow public read access to secondary_orders" ON public.secondary_orders FOR SELECT USING (status = 'Active');

-- Investors can read their own investments
CREATE POLICY "Allow investors to read their own investments" ON public.investments 
FOR SELECT USING (
    investor_id IN (
        SELECT id FROM public.investors WHERE user_id = auth.uid()
    )
);

-- 15. Investment Bookings Table (Intent & Yield Selection)
CREATE TABLE public.investment_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.funding_projects(id) ON DELETE CASCADE NOT NULL,
    amount_bdt NUMERIC NOT NULL,
    yield_option INTEGER CHECK (yield_option IN (1, 2, 3)),
    booking_type TEXT DEFAULT 'Primary' CHECK (booking_type IN ('Primary', 'Secondary')),
    status TEXT DEFAULT 'Pending_Proof' CHECK (status IN ('Pending_Proof', 'Proof_Submitted', 'Approved', 'Rejected'))
);

-- 16. Payment Submissions Table (Proof upload and verification)
CREATE TABLE public.payment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    booking_id UUID REFERENCES public.investment_bookings(id) ON DELETE CASCADE UNIQUE NOT NULL,
    transaction_id TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    screenshot_url TEXT NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.investment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investors can view their own bookings" ON public.investment_bookings
FOR SELECT USING (
    investor_id IN (
        SELECT id FROM public.investors WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Investors can insert their own bookings" ON public.investment_bookings
FOR INSERT WITH CHECK (
    investor_id IN (
        SELECT id FROM public.investors WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Investors can update their own bookings" ON public.investment_bookings
FOR UPDATE USING (
    investor_id IN (
        SELECT id FROM public.investors WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Investors can insert their own payment submissions" ON public.payment_submissions
FOR INSERT WITH CHECK (
    booking_id IN (
        SELECT id FROM public.investment_bookings WHERE investor_id IN (
            SELECT id FROM public.investors WHERE user_id = auth.uid()
        )
    )
);

-- =========================================================================
-- SUPABASE STORAGE BUCKET SCRIPT
-- Run this in your Supabase SQL Editor if storage bucket is not created
-- =========================================================================
-- insert into storage.buckets (id, name, public) 
-- values ('payment-proofs', 'payment-proofs', false);
--
-- create policy "Investors can upload payment proofs"
-- on storage.objects for insert with check (
--   bucket_id = 'payment-proofs' and auth.role() = 'authenticated'
-- );
--
-- create policy "Admins can view payment proofs"
-- on storage.objects for select using (
--   bucket_id = 'payment-proofs' 
-- );

-- 17. Yield Disbursements Table (Admin logs monthly performance)
CREATE TABLE public.yield_disbursements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    project_id UUID REFERENCES public.funding_projects(id) ON DELETE CASCADE NOT NULL,
    month TEXT NOT NULL, -- e.g., 'August'
    year INTEGER NOT NULL, -- e.g., 2026
    gross_sales_bdt NUMERIC NOT NULL,
    net_profit_bdt NUMERIC NOT NULL,
    total_disbursed_bdt NUMERIC DEFAULT 0
);

-- 18. Investor Yields Table (Individual payouts calculated from disbursements)
CREATE TABLE public.investor_yields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.funding_projects(id) ON DELETE CASCADE NOT NULL,
    disbursement_id UUID REFERENCES public.yield_disbursements(id) ON DELETE CASCADE NOT NULL,
    amount_bdt NUMERIC NOT NULL
);

-- 19. Promoter Commissions Table
CREATE TABLE public.promoter_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    promoter_id UUID REFERENCES public.promoters(id) ON DELETE CASCADE NOT NULL,
    investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE NOT NULL,
    amount_bdt NUMERIC NOT NULL,
    commission_type TEXT DEFAULT 'Base_0.75' CHECK (commission_type IN ('Base_0.75', 'Target_0.25'))
);

ALTER TABLE public.yield_disbursements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_yields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoter_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investors can view their own yields" ON public.investor_yields
FOR SELECT USING (
    investor_id IN (
        SELECT id FROM public.investors WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Promoters can view their own commissions" ON public.promoter_commissions
FOR SELECT USING (
    promoter_id IN (
        SELECT id FROM public.promoters WHERE user_id = auth.uid()
    )
);

-- 20. KYC Submissions Table
CREATE TABLE public.kyc_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
    target_level INTEGER NOT NULL CHECK (target_level IN (2, 3)),
    nid_front_url TEXT,
    nid_back_url TEXT,
    source_of_funds TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID -- Admin User ID
);

-- 21. Notifications Table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID NOT NULL, -- Target user
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'System'
);

ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investors can view their own KYC" ON public.kyc_submissions
FOR SELECT USING (
    investor_id IN (
        SELECT id FROM public.investors WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (
    user_id = auth.uid()
);

-- 22. POS Daily Sales Sync Table
CREATE TABLE public.pos_daily_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    gross_sales_bdt NUMERIC NOT NULL,
    net_profit_bdt NUMERIC NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    sync_source TEXT DEFAULT 'Manual_Entry'
);

ALTER TABLE public.pos_daily_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Businesses can view their own POS data" ON public.pos_daily_sales
FOR SELECT USING (
    business_id IN (
        SELECT b.id FROM public.businesses b
        JOIN public.founders f ON b.founder_id = f.id
        WHERE f.user_id = auth.uid()
    )
);

-- Alter Investors to add KAM Assignment
ALTER TABLE public.investors ADD COLUMN assigned_kam_id UUID REFERENCES public.kams(id);

-- 23. Cash Concierge Tickets
CREATE TABLE public.cash_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
    kam_id UUID REFERENCES public.kams(id), -- Auto-assigned from investors.assigned_kam_id or manually overridden
    target_project_id UUID REFERENCES public.funding_projects(id) ON DELETE CASCADE NOT NULL,
    ticket_amount_bdt NUMERIC NOT NULL,
    preferred_meeting_time TEXT,
    status TEXT DEFAULT 'Pending_Review' CHECK (status IN ('Pending_Review', 'Meeting_Scheduled', 'Funds_Cleared', 'Closed', 'Rejected'))
);

ALTER TABLE public.cash_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors view their own tickets" ON public.cash_tickets
FOR SELECT USING (
    investor_id IN (
        SELECT id FROM public.investors WHERE user_id = auth.uid()
    )
);
CREATE POLICY "KAMs view assigned tickets" ON public.cash_tickets
FOR SELECT USING (
    kam_id IN (
        SELECT id FROM public.kams WHERE user_id = auth.uid()
    )
);

-- 24. Legal Documents (SPV Agreements & Share Certificates)
CREATE TABLE public.legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
    investment_id UUID REFERENCES public.investments(id) ON DELETE CASCADE,
    doc_url TEXT NOT NULL,
    doc_type TEXT DEFAULT 'Share_Certificate' CHECK (doc_type IN ('Share_Certificate', 'Subscription_Agreement', 'Tax_Document'))
);

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors can view their own legal docs" ON public.legal_documents
FOR SELECT USING (
    investor_id IN (
        SELECT id FROM public.investors WHERE user_id = auth.uid()
    )
);

-- 25. Promoter Targets (For Bonus 0.25% Commission Tier)
CREATE TABLE public.promoter_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    promoter_id UUID REFERENCES public.promoters(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.funding_projects(id) ON DELETE CASCADE NOT NULL,
    target_raise_bdt NUMERIC NOT NULL,
    amount_raised_bdt NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Target_Hit')),
    UNIQUE (promoter_id, project_id)
);

ALTER TABLE public.promoter_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Promoters can view their own targets" ON public.promoter_targets
FOR SELECT USING (
    promoter_id IN (
        SELECT id FROM public.promoters WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Promoters can insert their own targets" ON public.promoter_targets
FOR INSERT WITH CHECK (
    promoter_id IN (
        SELECT id FROM public.promoters WHERE user_id = auth.uid()
    )
);
