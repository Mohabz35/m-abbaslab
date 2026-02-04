-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Articles/Blog posts
CREATE TABLE public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('research', 'technical', 'blog', 'fashion')),
  tags TEXT[] DEFAULT '{}',
  cover_image TEXT,
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP WITH TIME ZONE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Projects
CREATE TABLE public.projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content TEXT,
  category TEXT CHECK (category IN ('research', 'technology', 'analysis', 'fashion', 'economics')),
  tags TEXT[] DEFAULT '{}',
  github_url TEXT,
  live_url TEXT,
  featured_image TEXT,
  gallery TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('planning', 'in_progress', 'completed', 'archived')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Fashion Models (your modeling work)
CREATE TABLE public.fashion_models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('runway', 'editorial', 'commercial', 'portfolio')),
  tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  agency TEXT,
  location TEXT,
  date DATE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fashion_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Profiles: Users can read all, update own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Articles: Public can read published, admins can do everything
CREATE POLICY "Published articles are viewable by everyone" ON public.articles FOR SELECT USING (published = true OR auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create articles" ON public.articles FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update own articles" ON public.articles FOR UPDATE USING (auth.uid() = author_id OR auth.role() = 'authenticated');
CREATE POLICY "Users can delete own articles" ON public.articles FOR DELETE USING (auth.uid() = author_id OR auth.role() = 'authenticated');

-- Projects: Public can read, admins can edit
CREATE POLICY "Projects are viewable by everyone" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage projects" ON public.projects FOR ALL USING (auth.role() = 'authenticated');

-- Fashion Models: Public can read, admins can edit
CREATE POLICY "Fashion models are viewable by everyone" ON public.fashion_models FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage fashion models" ON public.fashion_models FOR ALL USING (auth.role() = 'authenticated');