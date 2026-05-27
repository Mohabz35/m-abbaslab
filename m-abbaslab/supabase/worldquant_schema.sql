-- World Quant Lab - Supabase Schema
-- Run this SQL in your Supabase SQL Editor to create required tables

-- Alphas table: stores every generated alpha expression
CREATE TABLE IF NOT EXISTS alphas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alpha_code TEXT NOT NULL,
    alpha_name TEXT,
    description TEXT,
    data_field TEXT NOT NULL,
    operator TEXT NOT NULL,
    lookback INTEGER NOT NULL,
    transform TEXT,
    universe TEXT DEFAULT 'US_EQUITIES',
    region TEXT DEFAULT 'USA',
    neutralization TEXT DEFAULT 'market',
    decay INTEGER DEFAULT 5,
    sharpe_ratio DECIMAL(10,4),
    annual_return DECIMAL(10,4),
    max_drawdown DECIMAL(10,4),
    turnover DECIMAL(10,4),
    win_rate DECIMAL(10,4),
    alpha_correlation DECIMAL(10,4),
    fitness_score DECIMAL(10,4),
    status TEXT DEFAULT 'simulating' CHECK (status IN ('simulating','passed','failed','submitted','live')),
    is_passed BOOLEAN DEFAULT false,
    passed_at TIMESTAMPTZ,
    backtest_start DATE,
    backtest_end DATE,
    data_points INTEGER,
    pnl_curve JSONB DEFAULT '[]',
    drawdown_curve JSONB DEFAULT '[]',
    submitted_to_wq BOOLEAN DEFAULT false,
    wq_submission_id TEXT,
    wq_status TEXT,
    generation_batch UUID,
    parent_alpha UUID REFERENCES alphas(id),
    generation_method TEXT DEFAULT 'systematic',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Alpha batches: tracks each generation run
CREATE TABLE IF NOT EXISTS alpha_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name TEXT,
    status TEXT DEFAULT 'running' CHECK (status IN ('running','completed','failed','stopped')),
    data_fields TEXT[] DEFAULT '{close,volume,open,high,low}',
    operators TEXT[] DEFAULT '{rank,ts_zscore,ts_mean,ts_std,ts_returns}',
    lookbacks INTEGER[] DEFAULT '{5,10,20,60}',
    total_generated INTEGER DEFAULT 0,
    total_tested INTEGER DEFAULT 0,
    total_passed INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy','warning','critical')),
    last_heartbeat TIMESTAMPTZ DEFAULT now()
);

-- Alpha mutations: evolutionary tracking
CREATE TABLE IF NOT EXISTS alpha_mutations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES alphas(id),
    child_id UUID NOT NULL REFERENCES alphas(id),
    mutation_type TEXT NOT NULL,
    mutation_params JSONB,
    improvement DECIMAL(10,4),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- System health log
CREATE TABLE IF NOT EXISTS wq_health_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('healthy','warning','critical')),
    message TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications queue (for JARVIS WhatsApp)
CREATE TABLE IF NOT EXISTS wq_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alpha_id UUID REFERENCES alphas(id),
    notification_type TEXT DEFAULT 'alpha_passed',
    recipient_phone TEXT DEFAULT '+254712345678',
    message_text TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','read')),
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_alphas_status ON alphas(status);
CREATE INDEX IF NOT EXISTS idx_alphas_sharpe ON alphas(sharpe_ratio DESC);
CREATE INDEX IF NOT EXISTS idx_alphas_fitness ON alphas(fitness_score DESC);
CREATE INDEX IF NOT EXISTS idx_alphas_batch ON alphas(generation_batch);
CREATE INDEX IF NOT EXISTS idx_alphas_passed ON alphas(is_passed) WHERE is_passed = true;
CREATE INDEX IF NOT EXISTS idx_batches_status ON alpha_batches(status);
CREATE INDEX IF NOT EXISTS idx_health_component ON wq_health_log(component, created_at DESC);

-- Enable RLS
ALTER TABLE alphas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alpha_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE wq_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE wq_health_log ENABLE ROW LEVEL SECURITY;

-- Allow public read
DROP POLICY IF EXISTS "Allow public read alphas" ON alphas;
CREATE POLICY "Allow public read alphas" ON alphas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read batches" ON alpha_batches;
CREATE POLICY "Allow public read batches" ON alpha_batches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read health" ON wq_health_log;
CREATE POLICY "Allow public read health" ON wq_health_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read notifications" ON wq_notifications;
CREATE POLICY "Allow public read notifications" ON wq_notifications FOR SELECT USING (true);

-- Allow inserts from API (anon key)
DROP POLICY IF EXISTS "Allow insert alphas" ON alphas;
CREATE POLICY "Allow insert alphas" ON alphas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert batches" ON alpha_batches;
CREATE POLICY "Allow insert batches" ON alpha_batches FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert health" ON wq_health_log;
CREATE POLICY "Allow insert health" ON wq_health_log FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow insert notifications" ON wq_notifications;
CREATE POLICY "Allow insert notifications" ON wq_notifications FOR INSERT WITH CHECK (true);

-- Allow updates from API (anon key)
DROP POLICY IF EXISTS "Allow update alphas" ON alphas;
CREATE POLICY "Allow update alphas" ON alphas FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update batches" ON alpha_batches;
CREATE POLICY "Allow update batches" ON alpha_batches FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update notifications" ON wq_notifications;
CREATE POLICY "Allow update notifications" ON wq_notifications FOR UPDATE USING (true) WITH CHECK (true);
