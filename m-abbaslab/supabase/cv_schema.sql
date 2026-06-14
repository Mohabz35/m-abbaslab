-- =============================================
-- CV Generator Pro Module Schema
-- =============================================

-- CV Users (for public visitors creating CVs)
CREATE TABLE IF NOT EXISTS cv_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    free_credits_used BOOLEAN DEFAULT FALSE,
    total_cvs_generated INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    last_signed_in TIMESTAMPTZ DEFAULT now()
);

-- CV Form Data
CREATE TABLE IF NOT EXISTS cv_form_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cv_users(id) ON DELETE CASCADE,
    personal_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    work_experience JSONB NOT NULL DEFAULT '[]'::jsonb,
    education JSONB NOT NULL DEFAULT '[]'::jsonb,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    target_platform TEXT,
    custom_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id)
);

-- CV Generations
CREATE TABLE IF NOT EXISTS cv_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cv_users(id) ON DELETE CASCADE,
    form_data_id UUID REFERENCES cv_form_data(id) ON DELETE SET NULL,
    target_platform TEXT NOT NULL,
    custom_instructions TEXT,
    generated_cv TEXT NOT NULL,
    generated_cover_letter TEXT,
    ats_score INTEGER,
    ats_checks JSONB,
    suggested_improvements JSONB,
    is_humanized BOOLEAN DEFAULT FALSE,
    pdf_storage_key TEXT,
    status TEXT DEFAULT 'draft',
    payment_id TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    payment_status TEXT DEFAULT 'pending',
    payment_reference TEXT,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Paystack Transactions
CREATE TABLE IF NOT EXISTS paystack_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cv_users(id) ON DELETE CASCADE,
    cv_generation_id UUID REFERENCES cv_generations(id) ON DELETE CASCADE,
    reference TEXT UNIQUE NOT NULL,
    amount INTEGER NOT NULL, -- Amount in Kobo/Cents
    currency TEXT DEFAULT 'NGN',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'abandoned')),
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cv_users_email ON cv_users(email);
CREATE INDEX IF NOT EXISTS idx_cv_generations_user ON cv_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_paystack_tx_ref ON paystack_transactions(reference);

-- RLS Policies
ALTER TABLE cv_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_form_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE paystack_transactions ENABLE ROW LEVEL SECURITY;

-- Assuming this is accessed via API routes using the service role or anon key.
-- We'll allow public operations with anon key for this integration or we can enforce auth via our custom cv_users table logic.
DO $$ BEGIN
  CREATE POLICY "Allow public all cv_users" ON cv_users FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public all cv_form_data" ON cv_form_data FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public all cv_generations" ON cv_generations FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public all paystack_transactions" ON paystack_transactions FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Job Tracker
CREATE TABLE IF NOT EXISTS cv_tracked_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES cv_users(id) ON DELETE CASCADE,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    platform TEXT,
    job_url TEXT,
    job_description TEXT,
    status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'offered', 'rejected')),
    notes TEXT,
    applied_at TIMESTAMPTZ,
    cv_generation_id UUID REFERENCES cv_generations(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cv_tracked_jobs_user ON cv_tracked_jobs(user_id);
ALTER TABLE cv_tracked_jobs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public all cv_tracked_jobs" ON cv_tracked_jobs FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
