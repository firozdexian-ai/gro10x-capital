-- ==============================================================================
-- GRO10X CAPITAL — PRODUCTION DATABASE HARDENING & SYNCHRONIZATION v1.0.0
-- Safe & Idempotent Migration: Execute in Supabase SQL Editor
-- Addresses: Missing Tables, Missing Columns, Storage Buckets, and Enterprise RLS
-- ==============================================================================

-- ==============================================================================
-- 1. NOTIFICATIONS TABLE ADJUSTMENTS
-- ==============================================================================
ALTER TABLE public.notifications ALTER COLUMN user_id DROP NOT NULL;

-- ==============================================================================
-- 2. CREATE MISSING TABLES
-- ==============================================================================

-- 2.1 Platform Settings & Governance (Admin Tab 14)
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'General',
    updated_by UUID
);

INSERT INTO public.platform_settings (setting_key, setting_value, description, category)
VALUES
  ('deal_spread_pct', '5', 'Standard deal spread percentage captured by platform', 'Fees'),
  ('min_ticket_size_bdt', '100000', 'Platform minimum individual investment ticket size', 'Limits'),
  ('pin_expiry_minutes', '15', 'Lifetime of temporary Web PINs issued via Telegram bots', 'Security'),
  ('secondary_corridor_pct', '10', 'Permitted secondary share price variance from FMV (±%)', 'Secondary'),
  ('alert_telegram_chat_id', '8824027905', 'Telegram Chat ID receiving platform high-priority alerts', 'Alerts')
ON CONFLICT (setting_key) DO NOTHING;

-- 2.2 SPV Legal Entity Registry (Legal & Compliance Tab 11)
CREATE TABLE IF NOT EXISTS public.spv_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    project_id UUID REFERENCES public.funding_projects(id) ON DELETE SET NULL,
    spv_legal_name TEXT NOT NULL,
    spv_entity_type TEXT DEFAULT 'Pvt Ltd',
    registration_number TEXT,
    registration_date DATE,
    tin_number TEXT,
    bin_number TEXT,
    registered_address TEXT,
    authorized_capital_bdt NUMERIC(15,2) DEFAULT 0,
    paid_up_capital_bdt NUMERIC(15,2) DEFAULT 0,
    directors JSONB DEFAULT '[]'::jsonb,
    moa_url TEXT,
    aoa_url TEXT,
    trade_license_url TEXT,
    status TEXT DEFAULT 'Active',
    notes TEXT
);

-- 2.3 Investor Compliance & KYC Queue (Admin Tab 11)
CREATE TABLE IF NOT EXISTS public.investor_compliance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
    kyc_status TEXT DEFAULT 'Pending',
    kyc_verified_at TIMESTAMPTZ,
    aml_status TEXT DEFAULT 'Clear',
    nid_verified BOOLEAN DEFAULT false,
    bank_statement_received BOOLEAN DEFAULT false,
    source_of_funds_declared BOOLEAN DEFAULT false,
    e_signature_obtained BOOLEAN DEFAULT false,
    last_reviewed_at TIMESTAMPTZ,
    notes TEXT
);

-- 2.4 Investor CRM Notes (Admin Tab 5 Drawer)
CREATE TABLE IF NOT EXISTS public.investor_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.team(id) ON DELETE SET NULL,
    note_type TEXT DEFAULT 'General', -- 'Call', 'Meeting', 'OTC', 'General'
    content TEXT NOT NULL
);

-- 2.5 Marketing Campaigns Center (Admin Tab 10)
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    campaign_name TEXT NOT NULL,
    channel TEXT DEFAULT 'Facebook',
    budget_bdt NUMERIC(15,2) DEFAULT 0,
    spent_bdt NUMERIC(15,2) DEFAULT 0,
    leads_count INTEGER DEFAULT 0,
    conversions_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    start_date DATE,
    end_date DATE
);

-- 2.6 Documents Repository (Admin Tab 11)
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    project_id UUID REFERENCES public.funding_projects(id) ON DELETE SET NULL,
    document_title TEXT NOT NULL,
    document_type TEXT DEFAULT 'Agreement',
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    access_level TEXT DEFAULT 'Public', -- 'Public', 'Investor_Only', 'Admin_Only'
    uploaded_by UUID
);

-- 2.7 Project Media Gallery (Project Form Modal)
CREATE TABLE IF NOT EXISTS public.project_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    project_id UUID REFERENCES public.funding_projects(id) ON DELETE CASCADE NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT DEFAULT 'Image', -- 'Image', 'Video', 'Blueprint'
    caption TEXT,
    display_order INTEGER DEFAULT 0
);

-- ==============================================================================
-- 3. ADD MISSING COLUMNS TO EXISTING TABLES (Idempotent)
-- ==============================================================================

-- 3.1 payment_submissions: Add status column
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_submissions' AND column_name = 'status') THEN
        ALTER TABLE public.payment_submissions ADD COLUMN status TEXT DEFAULT 'Pending';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_submissions' AND column_name = 'amount_bdt') THEN
        ALTER TABLE public.payment_submissions ADD COLUMN amount_bdt NUMERIC(15,2);
    END IF;
END $$;

-- 3.2 promoters: Add phone and email columns
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoters' AND column_name = 'phone') THEN
        ALTER TABLE public.promoters ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'promoters' AND column_name = 'email') THEN
        ALTER TABLE public.promoters ADD COLUMN email TEXT;
    END IF;
END $$;

-- 3.3 business_cohort_applications: Add ai_health_score
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'business_cohort_applications' AND column_name = 'ai_health_score') THEN
        ALTER TABLE public.business_cohort_applications ADD COLUMN ai_health_score INTEGER DEFAULT 75;
    END IF;
END $$;

-- 3.4 investors: Add investor_category and kyc_tier
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'investor_category') THEN
        ALTER TABLE public.investors ADD COLUMN investor_category TEXT DEFAULT 'HNI';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investors' AND column_name = 'kyc_tier') THEN
        ALTER TABLE public.investors ADD COLUMN kyc_tier INTEGER DEFAULT 1;
    END IF;
END $$;

-- 3.5 funding_projects: Add dcf_valuation_bdt
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'funding_projects' AND column_name = 'dcf_valuation_bdt') THEN
        ALTER TABLE public.funding_projects ADD COLUMN dcf_valuation_bdt NUMERIC(15,2) DEFAULT 0;
    END IF;
END $$;

-- ==============================================================================
-- 4. STORAGE BUCKET CREATION (Supabase Storage)
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('public-docs', 'public-docs', true),
  ('kyc-documents', 'kyc-documents', false),
  ('audit-assets', 'audit-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Docs are readable by all" ON storage.objects
FOR SELECT USING (bucket_id = 'public-docs' OR bucket_id = 'audit-assets');

CREATE POLICY "Authenticated users can upload to public docs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id IN ('public-docs', 'audit-assets'));

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spv_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_notes ENABLE ROW LEVEL SECURITY;

-- Allow public read for general platform settings
CREATE POLICY "Public read platform settings" ON public.platform_settings
FOR SELECT USING (true);

-- Restrict bot configurations to authenticated admin users
CREATE POLICY "Admin manage bot configs" ON public.bot_configurations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- Inquiry Leads: Anyone can insert a public lead, only staff can read
CREATE POLICY "Public insert inquiry leads" ON public.inquiry_leads
FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff read inquiry leads" ON public.inquiry_leads
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'kam', 'promoter')
  )
);

-- Business Cohort Applications: Anyone can submit an application
CREATE POLICY "Public submit cohort app" ON public.business_cohort_applications
FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff read cohort apps" ON public.business_cohort_applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_roles.user_id = auth.uid() AND user_roles.role IN ('admin', 'kam')
  )
);
