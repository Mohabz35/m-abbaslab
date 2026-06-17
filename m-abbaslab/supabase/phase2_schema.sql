-- Phase 2 & 3 Enhancement Schema

-- ─── Admin Users (Team Management) ──────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    permissions TEXT[] DEFAULT '{}',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    two_factor_enabled BOOLEAN DEFAULT false,
    last_login TIMESTAMPTZ,
    login_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Admin Activity Logs ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    username TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Security Events ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL CHECK (event_type IN ('failed_login', 'successful_login', 'password_change', 'role_change', 'suspicious_activity', 'rate_limit', 'csrf_attempt')),
    user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
    username TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Backups ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    backup_type TEXT DEFAULT 'manual' CHECK (backup_type IN ('manual', 'automatic', 'scheduled')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    tables_included TEXT[] DEFAULT '{}',
    file_size BIGINT,
    file_url TEXT,
    storage_provider TEXT DEFAULT 'local',
    initiated_by TEXT,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- ─── Site Analytics ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL,
    page_title TEXT,
    visitor_id TEXT,
    session_id TEXT,
    referrer TEXT,
    user_agent TEXT,
    device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
    browser TEXT,
    country TEXT,
    city TEXT,
    ip_address TEXT,
    load_time_ms INT,
    scroll_depth INT,
    time_on_page_sec INT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Article SEO Metadata ───────────────────────────────────────
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS seo_keywords TEXT[];
ALTER TABLE articles ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS og_image TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS like_count INT DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS reading_time_min INT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- ─── Project Enhancements ───────────────────────────────────────
ALTER TABLE projects ADD COLUMN IF NOT EXISTS case_study TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS impact_metrics JSONB DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS demo_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_members TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;

-- ─── Fashion Enhancements ───────────────────────────────────────
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS photo_date DATE;
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS photographer TEXT;
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS event_name TEXT;
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0;
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- ─── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_activity_user ON admin_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON admin_activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_created ON admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_created ON security_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_backups_status ON admin_backups(status);
CREATE INDEX IF NOT EXISTS idx_analytics_path ON site_analytics(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON site_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_scheduled ON articles(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_articles_views ON articles(view_count DESC);

-- ─── RLS ─────────────────────────────────────────────────────────
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access users" ON admin_users FOR ALL USING (true);
CREATE POLICY "Admin full access activity" ON admin_activity_logs FOR ALL USING (true);
CREATE POLICY "Admin full access security" ON security_events FOR ALL USING (true);
CREATE POLICY "Admin full access backups" ON admin_backups FOR ALL USING (true);
CREATE POLICY "Admin full access analytics" ON site_analytics FOR ALL USING (true);

-- Allow public insert for analytics tracking
CREATE POLICY "Public insert analytics" ON site_analytics FOR INSERT WITH CHECK (true);
