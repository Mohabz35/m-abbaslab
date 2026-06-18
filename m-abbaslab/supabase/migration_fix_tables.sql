-- Migration: Fix missing tables + schedule queue in Supabase

-- ─── Scheduled Posts (replaces file-based queue) ─────────────────
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    platforms JSONB DEFAULT '[]',
    scheduled_at TIMESTAMPTZ,
    is_draft BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ,
    results JSONB DEFAULT '{}'
);

-- ─── Audit Logs ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- ─── WhatsApp pairing_code column ─────────────────────────────────
DO $$ BEGIN
    ALTER TABLE whatsapp_connection_status ADD COLUMN pairing_code TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ─── Indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);

-- ─── RLS ──────────────────────────────────────────────────────────
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access scheduled_posts" ON scheduled_posts FOR ALL USING (true);
CREATE POLICY "Admin full access audit_logs" ON audit_logs FOR ALL USING (true);

-- ─── Discipline tables (ensure they exist) ────────────────────────
CREATE TABLE IF NOT EXISTS discipline_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL UNIQUE,
    hours JSONB DEFAULT '[]',
    pillars JSONB DEFAULT '{}',
    wins TEXT[] DEFAULT '{}',
    losses TEXT[] DEFAULT '{}',
    gratitude TEXT,
    tomorrow TEXT,
    deep_work_hours FLOAT DEFAULT 0,
    sleep_hours FLOAT DEFAULT 0,
    wasted_hours FLOAT DEFAULT 0,
    overall_score FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discipline_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT NOT NULL,
    category_label TEXT,
    category_color TEXT,
    goal_id TEXT NOT NULL,
    name TEXT NOT NULL,
    status TEXT DEFAULT 'planning',
    metric TEXT,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discipline_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL,
    habit_name TEXT NOT NULL,
    habit_category TEXT DEFAULT 'daily',
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    difficulty TEXT DEFAULT 'simple' CHECK (difficulty IN ('simple', 'medium', 'hard', 'extreme')),
    streak INT DEFAULT 0,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discipline_passive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL UNIQUE,
    checks JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discipline_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT DEFAULT 'daily',
    date TEXT NOT NULL,
    answers JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS discipline_diary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL UNIQUE,
    title TEXT,
    content TEXT,
    mood TEXT,
    tags JSONB DEFAULT '[]',
    ai_suggestion TEXT,
    word_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Diary RLS ────────────────────────────────────────────────────
ALTER TABLE discipline_diary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin full access discipline_diary" ON discipline_diary FOR ALL USING (true);

-- ─── Unique constraint for habit upsert ───────────────────────────
DO $$ BEGIN
    ALTER TABLE discipline_habits ADD CONSTRAINT discipline_habits_date_name_unique UNIQUE (date, habit_name);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
