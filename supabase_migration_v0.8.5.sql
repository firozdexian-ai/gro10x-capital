-- ==============================================================================
-- GRO10X CAPITAL — SUPABASE MIGRATION v0.8.5
-- Safe & Additive Migration: Run in Supabase SQL Editor
-- ==============================================================================

-- 1. COLUMN SYNCHRONIZATIONS (Existing Tables)
ALTER TABLE public.funding_projects 
  ADD COLUMN IF NOT EXISTS show_on_showcase BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS booked_amount_bdt NUMERIC DEFAULT 0;

ALTER TABLE public.investments
  ADD COLUMN IF NOT EXISTS amount_bdt NUMERIC;

ALTER TABLE public.inquiry_leads 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS source_channel TEXT,
  ADD COLUMN IF NOT EXISTS deal_title TEXT,
  ADD COLUMN IF NOT EXISTS ticket_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS yield_option TEXT,
  ADD COLUMN IF NOT EXISTS lead_status TEXT DEFAULT 'New',
  ADD COLUMN IF NOT EXISTS inquiry_type TEXT;

ALTER TABLE public.investors 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
  ADD COLUMN IF NOT EXISTS requires_anonymity BOOLEAN DEFAULT false;

ALTER TABLE public.founders 
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- 2. CREATE TABLE: public.team (Unified Internal Staff: Admin, Manager, KAM, Promoter)
CREATE TABLE IF NOT EXISTS public.team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  alias_name TEXT,
  team_type TEXT NOT NULL CHECK (team_type IN ('admin', 'manager', 'kam', 'promoter')),
  phone TEXT,
  email TEXT,
  telegram_chat_id TEXT,
  referral_code TEXT UNIQUE,
  tier TEXT DEFAULT 'Starter',
  promoter_tier TEXT DEFAULT 'Starter',
  can_promote_deals BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true
);

-- 3. CREATE TABLE: public.telegram_auth_pins (Temporary PINs for Web Login / Onboarding)
CREATE TABLE IF NOT EXISTS public.telegram_auth_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  chat_id TEXT,
  telegram_chat_id TEXT,
  pin TEXT,
  temp_pin TEXT,
  role TEXT,
  user_role TEXT,
  user_identifier TEXT,
  phone_number TEXT,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes'),
  pin_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes'),
  used BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  linked_entity_id UUID
);

ALTER TABLE public.telegram_auth_pins 
  ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT,
  ADD COLUMN IF NOT EXISTS temp_pin TEXT,
  ADD COLUMN IF NOT EXISTS user_role TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS pin_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '15 minutes'),
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS linked_entity_id UUID;

-- 4. CREATE TABLE: public.business_cohort_applications (/apply SME Fundraising Submissions)
CREATE TABLE IF NOT EXISTS public.business_cohort_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ref_code TEXT UNIQUE,
  reference_code TEXT UNIQUE,
  brand_name TEXT NOT NULL,
  company_legal_name TEXT,
  company_type TEXT DEFAULT 'Pvt Ltd',
  legal_entity TEXT,
  industry_sector TEXT,
  founding_year INTEGER,
  year_established INTEGER,
  operational_months INTEGER DEFAULT 0,
  headquarters TEXT,
  headquarters_address TEXT,
  monthly_revenue_bdt NUMERIC,
  monthly_gross_revenue_bdt NUMERIC,
  monthly_net_profit_bdt NUMERIC,
  use_of_funds TEXT,
  use_of_funds_breakdown JSONB,
  funding_amount_requested_bdt NUMERIC,
  requested_funding_bdt NUMERIC,
  preferred_funding_type TEXT,
  pitch_deck_url TEXT,
  financial_doc_url TEXT,
  trade_license_url TEXT,
  financial_audit_url TEXT,
  tin_certificate_url TEXT,
  outlet_photos JSONB DEFAULT '[]'::jsonb,
  founder_phone TEXT,
  lead_founder_name TEXT,
  lead_founder_title TEXT,
  lead_founder_phone TEXT,
  lead_founder_email TEXT,
  lead_founder_linkedin_url TEXT,
  lead_founder_nid_number TEXT,
  status TEXT DEFAULT 'New_Submission',
  application_status TEXT DEFAULT 'New_Submission'
);

ALTER TABLE public.business_cohort_applications
  ADD COLUMN IF NOT EXISTS ref_code TEXT,
  ADD COLUMN IF NOT EXISTS reference_code TEXT,
  ADD COLUMN IF NOT EXISTS lead_founder_name TEXT,
  ADD COLUMN IF NOT EXISTS lead_founder_title TEXT,
  ADD COLUMN IF NOT EXISTS lead_founder_phone TEXT,
  ADD COLUMN IF NOT EXISTS lead_founder_email TEXT,
  ADD COLUMN IF NOT EXISTS lead_founder_linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS lead_founder_nid_number TEXT,
  ADD COLUMN IF NOT EXISTS company_legal_name TEXT,
  ADD COLUMN IF NOT EXISTS monthly_gross_revenue_bdt NUMERIC,
  ADD COLUMN IF NOT EXISTS requested_funding_bdt NUMERIC,
  ADD COLUMN IF NOT EXISTS preferred_funding_type TEXT,
  ADD COLUMN IF NOT EXISTS use_of_funds_breakdown JSONB,
  ADD COLUMN IF NOT EXISTS pitch_text TEXT,
  ADD COLUMN IF NOT EXISTS trade_license_url TEXT,
  ADD COLUMN IF NOT EXISTS financial_audit_url TEXT,
  ADD COLUMN IF NOT EXISTS tin_certificate_url TEXT,
  ADD COLUMN IF NOT EXISTS outlet_photos JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS application_status TEXT;

-- 5. CREATE TABLE: public.business_stakeholders (Founding Team for Cohort Applications)
CREATE TABLE IF NOT EXISTS public.business_stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  application_id UUID REFERENCES public.business_cohort_applications(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT,
  role_title TEXT,
  phone TEXT,
  email TEXT,
  equity_stake_pct NUMERIC,
  equity_ownership_pct NUMERIC,
  linkedin_url TEXT,
  is_primary_contact BOOLEAN DEFAULT false
);

-- 6. CREATE TABLE: public.investor_pre_profiles (Promoter Lead Survey & Invites)
CREATE TABLE IF NOT EXISTS public.investor_pre_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT DEFAULT 'HNI',
  referral_code TEXT,
  invite_sent BOOLEAN DEFAULT false,
  notes TEXT
);

-- 7. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_auth_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_cohort_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_pre_profiles ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access to team') THEN
    CREATE POLICY "Allow public read access to team" ON public.team FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert to business_cohort_applications') THEN
    CREATE POLICY "Allow public insert to business_cohort_applications" ON public.business_cohort_applications FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert to business_stakeholders') THEN
    CREATE POLICY "Allow public insert to business_stakeholders" ON public.business_stakeholders FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read/write to telegram_auth_pins') THEN
    CREATE POLICY "Allow public read/write to telegram_auth_pins" ON public.telegram_auth_pins FOR ALL USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read/write to investor_pre_profiles') THEN
    CREATE POLICY "Allow public read/write to investor_pre_profiles" ON public.investor_pre_profiles FOR ALL USING (true);
  END IF;
END $$;
