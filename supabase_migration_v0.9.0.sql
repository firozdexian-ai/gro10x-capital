-- ==============================================================================
-- GRO10X CAPITAL — SUPABASE MIGRATION v0.9.0
-- Database Harmonization, Missing Tables & Column Synchronization
-- Safe & Idempotent Migration: Run in Supabase SQL Editor
-- ==============================================================================

-- ==============================================================================
-- 1. NOTIFICATIONS NOT-NULL RELAXATION
-- Allows system alerts, broadcast notices, and automated logs without failing
-- ==============================================================================
ALTER TABLE public.notifications ALTER COLUMN user_id DROP NOT NULL;

-- ==============================================================================
-- 2. CREATE MISSING TABLES
-- ==============================================================================

-- 2.1 Bot Configurations Table (Admin Command Center Tab 11)
CREATE TABLE IF NOT EXISTS public.bot_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    bot_key TEXT UNIQUE NOT NULL, -- 'team_bot', 'investor_bot', 'client_bot'
    bot_name TEXT NOT NULL,
    bot_username TEXT,
    bot_token TEXT,
    webhook_url TEXT,
    mini_app_url TEXT,
    welcome_message TEXT,
    is_active BOOLEAN DEFAULT true,
    last_ping_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}'::jsonb
);

-- Seed default bot configurations if empty
INSERT INTO public.bot_configurations (bot_key, bot_name, bot_username, webhook_url, mini_app_url, welcome_message, is_active)
VALUES
  ('team_bot', 'GRO10X Team & Management Bot', '@gro10xmanbot', 'https://gro10x.com/api/telegram-webhook?bot=team', 'https://t.me/gro10xmanbot/app', 'Welcome to GRO10X Management Bot. Access your web panel PIN, lead alerts, and team notifications here.', true),
  ('investor_bot', 'GRO10X Capital Investor Bot', '@gro10xcapbot', 'https://gro10x.com/api/telegram-webhook?bot=investor', 'https://t.me/gro10xcapbot/app', 'Welcome to GRO10X Capital! Check your portfolio, yield statements, or request a temporary web login PIN.', true),
  ('client_bot', 'GRO10X Business & Client Bot', '@gro10xbizbot', 'https://gro10x.com/api/telegram-webhook?bot=client', 'https://t.me/gro10xbizbot/app', 'Welcome Business Founder! Log daily POS sales, upload audit documents, and request your web panel access PIN.', true)
ON CONFLICT (bot_key) DO NOTHING;

-- 2.2 SPV Registry Table (Legal & Compliance Tab 9)
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

-- 2.3 Investor Compliance Table (KYC/AML Queue in Tab 9)
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

-- 2.4 Investor Notes Table (Admin & KAM Notes in Admin Hub)
CREATE TABLE IF NOT EXISTS public.investor_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    investor_id UUID REFERENCES public.investors(id) ON DELETE CASCADE NOT NULL,
    created_by_kam_id UUID REFERENCES public.kams(id) ON DELETE SET NULL,
    author_name TEXT,
    note_type TEXT DEFAULT 'General',
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false
);

-- 2.5 Marketing Campaigns Table (Admin Tab 5 Inquiry Leads)
CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    campaign_name TEXT NOT NULL,
    campaign_type TEXT DEFAULT 'Event',
    start_date DATE,
    end_date DATE,
    budget_bdt NUMERIC(12,2) DEFAULT 0,
    spent_amount_bdt NUMERIC(12,2) DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active',
    notes TEXT
);

-- ==============================================================================
-- 3. ADD MISSING COLUMNS TO EXISTING TABLES (SAFE & ADDITIVE)
-- ==============================================================================

-- 3.1 business_cohort_applications
ALTER TABLE public.business_cohort_applications
  ADD COLUMN IF NOT EXISTS ai_health_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS assigned_kam_id UUID,
  ADD COLUMN IF NOT EXISTS converted_business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS converted_project_id UUID REFERENCES public.funding_projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS kam_equipment_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS kam_financial_verification BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS kam_legal_doc_status TEXT,
  ADD COLUMN IF NOT EXISTS kam_location_score NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS kam_notes TEXT,
  ADD COLUMN IF NOT EXISTS kam_site_visit_date DATE;

-- 3.2 business_stakeholders
ALTER TABLE public.business_stakeholders
  ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS role_title TEXT,
  ADD COLUMN IF NOT EXISTS equity_ownership_pct NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS is_primary_contact BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

-- 3.3 cash_tickets
ALTER TABLE public.cash_tickets
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS confirmed_meeting_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS funds_cleared_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS funds_transfer_ref TEXT,
  ADD COLUMN IF NOT EXISTS meeting_format TEXT DEFAULT 'in_person',
  ADD COLUMN IF NOT EXISTS assigned_kam_id UUID;

-- 3.4 funding_projects
ALTER TABLE public.funding_projects
  ADD COLUMN IF NOT EXISTS equity_investor_share NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS yield_option_1_rate NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS yield_option_2_rate NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS yield_option_3_rate NUMERIC(5,2);

-- 3.5 inquiry_leads
ALTER TABLE public.inquiry_leads
  ADD COLUMN IF NOT EXISTS assigned_kam_id UUID,
  ADD COLUMN IF NOT EXISTS converted_investor_id UUID,
  ADD COLUMN IF NOT EXISTS follow_up_date DATE;

-- 3.6 investments
ALTER TABLE public.investments
  ADD COLUMN IF NOT EXISTS yield_option TEXT;

-- 3.7 investor_pre_profiles
ALTER TABLE public.investor_pre_profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES public.funding_projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.inquiry_leads(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS converted_investor_id UUID REFERENCES public.investors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS submitted_by_promoter_id UUID,
  ADD COLUMN IF NOT EXISTS survey_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT,
  ADD COLUMN IF NOT EXISTS telegram_invite_sent_at TIMESTAMPTZ;

-- 3.8 investors
ALTER TABLE public.investors
  ADD COLUMN IF NOT EXISTS kyc_level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS preferred_channel TEXT DEFAULT 'web';

-- 3.9 kyc_submissions
ALTER TABLE public.kyc_submissions
  ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 3.10 legal_documents
ALTER TABLE public.legal_documents
  ADD COLUMN IF NOT EXISTS spv_id UUID,
  ADD COLUMN IF NOT EXISTS document_title TEXT,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS is_signed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS signed_at TIMESTAMPTZ;

-- 3.11 payment_submissions
ALTER TABLE public.payment_submissions
  ADD COLUMN IF NOT EXISTS amount_bdt NUMERIC;

-- 3.12 team
ALTER TABLE public.team
  ADD COLUMN IF NOT EXISTS designation TEXT;

-- 3.13 telegram_auth_pins
ALTER TABLE public.telegram_auth_pins
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'investor',
  ADD COLUMN IF NOT EXISTS linked_name TEXT;

-- 3.14 yield_disbursements
ALTER TABLE public.yield_disbursements
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled',
  ADD COLUMN IF NOT EXISTS disbursement_month TEXT,
  ADD COLUMN IF NOT EXISTS payment_date DATE,
  ADD COLUMN IF NOT EXISTS payment_txn_ref TEXT,
  ADD COLUMN IF NOT EXISTS payment_attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ==============================================================================
-- 4. FOREIGN KEY HARMONIZATION (TEAM vs PROMOTERS / KAMS)
-- Drops rigid legacy constraints that prevent team members from logging records
-- ==============================================================================
ALTER TABLE public.promoter_leads DROP CONSTRAINT IF EXISTS promoter_leads_promoter_id_fkey;
ALTER TABLE public.promoter_targets DROP CONSTRAINT IF EXISTS promoter_targets_promoter_id_fkey;
ALTER TABLE public.payout_requests DROP CONSTRAINT IF EXISTS payout_requests_promoter_id_fkey;
ALTER TABLE public.promoter_commissions DROP CONSTRAINT IF EXISTS promoter_commissions_promoter_id_fkey;
ALTER TABLE public.business_audits DROP CONSTRAINT IF EXISTS business_audits_kam_id_fkey;
ALTER TABLE public.cash_tickets DROP CONSTRAINT IF EXISTS cash_tickets_kam_id_fkey;

-- Backfill legacy tables from team to ensure foreign keys match across both models
INSERT INTO public.promoters (id, user_id, full_name, referral_code, commission_tier, active)
SELECT 
    t.id, 
    t.user_id, 
    t.full_name, 
    COALESCE(t.referral_code, 'REF_' || substr(t.id::text, 1, 8)), 
    COALESCE(t.promoter_tier, 'Starter'), 
    COALESCE(t.is_active, true)
FROM public.team t
WHERE t.team_type = 'promoter'
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    referral_code = EXCLUDED.referral_code,
    commission_tier = EXCLUDED.commission_tier,
    active = EXCLUDED.active;

INSERT INTO public.kams (id, user_id, full_name, active)
SELECT 
    t.id, 
    t.user_id, 
    t.full_name, 
    COALESCE(t.is_active, true)
FROM public.team t
WHERE t.team_type IN ('kam', 'manager', 'admin')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    active = EXCLUDED.active;

-- Trigger to automatically synchronize team inserts/updates to promoters & kams
CREATE OR REPLACE FUNCTION public.sync_team_to_promoters_kams()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.team_type = 'promoter' THEN
    INSERT INTO public.promoters (id, user_id, full_name, referral_code, commission_tier, active)
    VALUES (
      NEW.id, 
      NEW.user_id, 
      NEW.full_name, 
      COALESCE(NEW.referral_code, 'REF_' || substr(NEW.id::text, 1, 8)), 
      COALESCE(NEW.promoter_tier, 'Starter'), 
      COALESCE(NEW.is_active, true)
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      referral_code = EXCLUDED.referral_code,
      commission_tier = EXCLUDED.commission_tier,
      active = EXCLUDED.active;
  ELSIF NEW.team_type IN ('kam', 'manager', 'admin') THEN
    INSERT INTO public.kams (id, user_id, full_name, active)
    VALUES (
      NEW.id, 
      NEW.user_id, 
      NEW.full_name, 
      COALESCE(NEW.is_active, true)
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      active = EXCLUDED.active;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_sync_team_members ON public.team;
CREATE TRIGGER trg_sync_team_members
AFTER INSERT OR UPDATE ON public.team
FOR EACH ROW
EXECUTE FUNCTION public.sync_team_to_promoters_kams();

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.bot_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spv_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users to SPV and bot info
CREATE POLICY "Allow public read access to bot_configurations" ON public.bot_configurations FOR SELECT USING (true);
CREATE POLICY "Allow authenticated manage bot_configurations" ON public.bot_configurations FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to spv_registry" ON public.spv_registry FOR SELECT USING (true);
CREATE POLICY "Allow authenticated manage spv_registry" ON public.spv_registry FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow team read investor_compliance" ON public.investor_compliance FOR SELECT USING (true);
CREATE POLICY "Allow team manage investor_compliance" ON public.investor_compliance FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow team read investor_notes" ON public.investor_notes FOR SELECT USING (true);
CREATE POLICY "Allow team insert investor_notes" ON public.investor_notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow team read marketing_campaigns" ON public.marketing_campaigns FOR SELECT USING (true);
CREATE POLICY "Allow team manage marketing_campaigns" ON public.marketing_campaigns FOR ALL USING (auth.role() = 'authenticated');

-- ==============================================================================
-- 6. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_bot_config_key ON public.bot_configurations(bot_key);
CREATE INDEX IF NOT EXISTS idx_spv_project_id ON public.spv_registry(project_id);
CREATE INDEX IF NOT EXISTS idx_investor_compliance_inv ON public.investor_compliance(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_notes_inv ON public.investor_notes(investor_id);
CREATE INDEX IF NOT EXISTS idx_cash_tickets_proj ON public.cash_tickets(target_project_id);

-- ==============================================================================
-- 7. PLATFORM SETTINGS TABLE & SEED DEFAULTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read platform_settings" ON public.platform_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated manage platform_settings" ON public.platform_settings FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO public.platform_settings (setting_key, setting_value)
VALUES
  ('platform_legal_name', 'GRO10X Capital Limited'),
  ('founder_phone', '01708459008'),
  ('deal_spread_pct', '5'),
  ('min_ticket_size_bdt', '100000'),
  ('default_promoter_commission_pct', '2.0'),
  ('pin_expiry_minutes', '15')
ON CONFLICT (setting_key) DO NOTHING;

