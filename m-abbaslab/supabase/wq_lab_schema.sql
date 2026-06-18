-- WorldQuant Lab Tables: alpha_batches + wq_health_log

-- ─── Alpha Batches ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alpha_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    total_generated INT DEFAULT 0,
    total_tested INT DEFAULT 0,
    total_passed INT DEFAULT 0,
    error_count INT DEFAULT 0,
    health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'warning', 'critical')),
    last_heartbeat TIMESTAMPTZ,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── WQ Health Log ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wq_health_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component TEXT NOT NULL,
    status TEXT DEFAULT 'healthy' CHECK (status IN ('healthy', 'warning', 'critical')),
    message TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_alpha_batches_status ON alpha_batches(status);
CREATE INDEX IF NOT EXISTS idx_alpha_batches_started ON alpha_batches(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_wq_health_created ON wq_health_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wq_health_component ON wq_health_log(component);

-- ─── RLS ─────────────────────────────────────────────────────────
ALTER TABLE alpha_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE wq_health_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access batches" ON alpha_batches FOR ALL USING (true);
CREATE POLICY "Admin full access health" ON wq_health_log FOR ALL USING (true);
