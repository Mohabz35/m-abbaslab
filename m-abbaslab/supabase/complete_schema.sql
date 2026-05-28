-- =============================================
-- M-AbbasLab Complete Database Schema
-- Run this ONCE in Supabase SQL Editor
-- =============================================

-- ============================
-- CORE BUSINESS TABLES
-- ============================

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status TEXT DEFAULT 'active',
    tech_stack TEXT[] DEFAULT '{}',
    image_url TEXT,
    project_url TEXT,
    github_url TEXT,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns if table already exists without them
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tech_stack TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS github_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Remove the CHECK constraint if it exists from previous runs, re-add safely
DO $$ BEGIN
  ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('active','shipped','archived'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Articles
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    author TEXT,
    read_time INTEGER DEFAULT 5,
    status TEXT DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns if table already exists without them
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 5;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DO $$ BEGIN
  ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE articles ADD CONSTRAINT articles_status_check CHECK (status IN ('draft','published','archived'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Fashion items
CREATE TABLE IF NOT EXISTS fashion_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    collection TEXT,
    category TEXT,
    status TEXT DEFAULT 'design' CHECK (status IN ('design','production','shipped','archived')),
    size TEXT,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'design';
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS collection TEXT;
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE fashion_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DO $$ BEGIN
  ALTER TABLE fashion_items DROP CONSTRAINT IF EXISTS fashion_items_status_check;
EXCEPTION WHEN undefined_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE fashion_items ADD CONSTRAINT fashion_items_status_check CHECK (status IN ('design','production','shipped','archived'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Finance entries
CREATE TABLE IF NOT EXISTS finance_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income','expense')),
    category TEXT,
    date DATE DEFAULT CURRENT_DATE,
    recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE finance_entries ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE finance_entries ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT false;

-- Finance goals
CREATE TABLE IF NOT EXISTS finance_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL,
    current_amount DECIMAL(12,2) DEFAULT 0,
    deadline DATE,
    category TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active','completed','cancelled')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- SYSTEM TABLES
-- ============================

-- Site configuration
CREATE TABLE IF NOT EXISTS site_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Market data cache
CREATE TABLE IF NOT EXISTS market_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    data_type TEXT NOT NULL,
    data JSONB NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

-- ============================
-- WHATSAPP BROADCAST TABLES
-- ============================

-- WhatsApp subscribers
CREATE TABLE IF NOT EXISTS whatsapp_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    name TEXT,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    tags TEXT[] DEFAULT '{}'
);

-- WhatsApp broadcasts
CREATE TABLE IF NOT EXISTS whatsapp_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message_text TEXT NOT NULL,
    audience_filter JSONB DEFAULT '{}',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft','sending','sent','cancelled')),
    sent_count INTEGER DEFAULT 0,
    total_count INTEGER DEFAULT 0,
    scheduled_for TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- WhatsApp broadcast logs
CREATE TABLE IF NOT EXISTS whatsapp_broadcast_logs (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    broadcast_id UUID REFERENCES whatsapp_broadcasts(id) ON DELETE CASCADE,
    subscriber_id UUID REFERENCES whatsapp_subscribers(id) ON DELETE SET NULL,
    phone_number TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','delivered','read')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================
-- INDEXES
-- ============================
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_created ON articles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fashion_status ON fashion_items(status);
CREATE INDEX IF NOT EXISTS idx_finance_date ON finance_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_finance_type ON finance_entries(type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_site_config_key ON site_config(key);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data_cache(symbol, data_type);
CREATE INDEX IF NOT EXISTS idx_whatsapp_subscribers_phone ON whatsapp_subscribers(phone_number);
CREATE INDEX IF NOT EXISTS idx_broadcast_logs_broadcast ON whatsapp_broadcast_logs(broadcast_id);
CREATE INDEX IF NOT EXISTS idx_broadcast_logs_status ON whatsapp_broadcast_logs(status);

-- ============================
-- RLS POLICIES
-- ============================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fashion_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_broadcast_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read
DO $$ BEGIN
  CREATE POLICY "Allow public read projects" ON projects FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read articles" ON articles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read fashion_items" ON fashion_items FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read finance_entries" ON finance_entries FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read finance_goals" ON finance_goals FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read site_config" ON site_config FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read audit_logs" ON audit_logs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read market_data_cache" ON market_data_cache FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read whatsapp_subscribers" ON whatsapp_subscribers FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read whatsapp_broadcasts" ON whatsapp_broadcasts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow public read whatsapp_broadcast_logs" ON whatsapp_broadcast_logs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow insert from API (anon key)
DO $$ BEGIN
  CREATE POLICY "Allow insert projects" ON projects FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert articles" ON articles FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert fashion_items" ON fashion_items FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert finance_entries" ON finance_entries FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert finance_goals" ON finance_goals FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert site_config" ON site_config FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert market_data_cache" ON market_data_cache FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert whatsapp_subscribers" ON whatsapp_subscribers FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert whatsapp_broadcasts" ON whatsapp_broadcasts FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow insert whatsapp_broadcast_logs" ON whatsapp_broadcast_logs FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow update from API (anon key)
DO $$ BEGIN
  CREATE POLICY "Allow update projects" ON projects FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow update articles" ON articles FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow update fashion_items" ON fashion_items FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow update finance_entries" ON finance_entries FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow update finance_goals" ON finance_goals FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow update site_config" ON site_config FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow update whatsapp_subscribers" ON whatsapp_subscribers FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow update whatsapp_broadcasts" ON whatsapp_broadcasts FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow update whatsapp_broadcast_logs" ON whatsapp_broadcast_logs FOR UPDATE USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow delete from API (anon key)
DO $$ BEGIN
  CREATE POLICY "Allow delete projects" ON projects FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow delete articles" ON articles FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow delete fashion_items" ON fashion_items FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow delete finance_entries" ON finance_entries FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow delete finance_goals" ON finance_goals FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow delete whatsapp_subscribers" ON whatsapp_subscribers FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Allow delete whatsapp_broadcasts" ON whatsapp_broadcasts FOR DELETE USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Realtime for broadcasts
ALTER TABLE whatsapp_broadcasts REPLICA IDENTITY FULL;
ALTER TABLE whatsapp_broadcast_logs REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_broadcasts;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_broadcast_logs;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;
