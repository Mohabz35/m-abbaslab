-- Discipline OS + Analytics Tracking Schema

-- ─── Discipline Day Data ────────────────────────────────────────
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

-- ─── Discipline Goals ───────────────────────────────────────────
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

-- ─── Discipline Habits (Daily Tracker) ──────────────────────────
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

-- ─── Discipline Passive Checks ──────────────────────────────────
CREATE TABLE IF NOT EXISTS discipline_passive (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL UNIQUE,
    checks JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Discipline Reviews ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS discipline_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT DEFAULT 'daily',
    date TEXT NOT NULL,
    answers JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Finance Daily Targets ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_daily_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date TEXT NOT NULL UNIQUE,
    target_amount FLOAT DEFAULT 25,
    earned_amount FLOAT DEFAULT 0,
    source TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'met', 'exceeded', 'missed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Site Analytics Events ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    page_path TEXT,
    page_title TEXT,
    visitor_id TEXT,
    session_id TEXT,
    referrer TEXT,
    user_agent TEXT,
    device_type TEXT,
    browser TEXT,
    country TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_discipline_days_date ON discipline_days(date);
CREATE INDEX IF NOT EXISTS idx_discipline_habits_date ON discipline_habits(date);
CREATE INDEX IF NOT EXISTS idx_discipline_habits_name ON discipline_habits(habit_name);
CREATE INDEX IF NOT EXISTS idx_discipline_goals_cat ON discipline_goals(category_id);
CREATE INDEX IF NOT EXISTS idx_finance_targets_date ON finance_daily_targets(date);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON analytics_events(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────────
ALTER TABLE discipline_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipline_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipline_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipline_passive ENABLE ROW LEVEL SECURITY;
ALTER TABLE discipline_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_daily_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access discipline_days" ON discipline_days FOR ALL USING (true);
CREATE POLICY "Admin full access discipline_goals" ON discipline_goals FOR ALL USING (true);
CREATE POLICY "Admin full access discipline_habits" ON discipline_habits FOR ALL USING (true);
CREATE POLICY "Admin full access discipline_passive" ON discipline_passive FOR ALL USING (true);
CREATE POLICY "Admin full access discipline_reviews" ON discipline_reviews FOR ALL USING (true);
CREATE POLICY "Admin full access finance_targets" ON finance_daily_targets FOR ALL USING (true);
CREATE POLICY "Admin full access analytics_events" ON analytics_events FOR ALL USING (true);
CREATE POLICY "Public insert analytics" ON analytics_events FOR INSERT WITH CHECK (true);
