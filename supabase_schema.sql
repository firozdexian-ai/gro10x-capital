-- GRO10X Capital v0.2.0: Core Relational Schema

-- 1. Founders Table
CREATE TABLE public.founders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
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

-- Enable Row Level Security
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funding_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kams ENABLE ROW LEVEL SECURITY;

-- Create basic read policies (allow anyone to read public data for now during dev)
CREATE POLICY "Allow public read access to founders" ON public.founders FOR SELECT USING (true);
CREATE POLICY "Allow public read access to businesses" ON public.businesses FOR SELECT USING (true);
CREATE POLICY "Allow public read access to funding_projects" ON public.funding_projects FOR SELECT USING (true);
