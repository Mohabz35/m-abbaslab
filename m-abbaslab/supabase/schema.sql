-- MOHAMMED ABBAS DIGITAL ECOSYSTEM - DATABASE SCHEMA

-- 1. MESSAGES TABLE (Contact Form)
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'unread' -- unread, read, archived
);

-- 2. MEDIA TABLE (Virtual Gallery)
CREATE TABLE IF NOT EXISTS media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    type TEXT NOT NULL, -- 'image' or 'video'
    caption TEXT,
    category TEXT, -- 'runway', 'editorial', 'commercial', 'lifestyle'
    featured BOOLEAN DEFAULT false
);

-- 3. PROJECTS TABLE (Dynamic Content)
CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    long_description TEXT,
    technologies TEXT[],
    github_url TEXT,
    live_url TEXT,
    category TEXT,
    featured BOOLEAN DEFAULT false,
    status TEXT,
    year TEXT
);

-- 4. ARTICLES TABLE (Dynamic CMS)
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    category TEXT,
    read_time INTEGER,
    published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    featured BOOLEAN DEFAULT false
);

-- RLS (Row Level Security) - BASIC CONFIG
-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow anonymous form submissions
CREATE POLICY "Allow anonymous message submission" ON messages
    FOR INSERT WITH CHECK (true);

-- Allow public read access to content
CREATE POLICY "Allow public read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow public read articles" ON articles FOR SELECT USING (true);
CREATE POLICY "Allow public read media" ON media FOR SELECT USING (true);
