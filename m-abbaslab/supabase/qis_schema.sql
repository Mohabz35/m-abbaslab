-- QIS Schema: Quantum Impact Syndicate portal tables

-- ─── QIS Members ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qis_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'associate' CHECK (role IN ('associate', 'core', 'leadership', 'admin')),
    discipline TEXT,
    institution TEXT,
    nda_signed BOOLEAN DEFAULT false,
    nda_signed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
    applied_at TIMESTAMPTZ DEFAULT now(),
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    profile_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── QIS Projects ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qis_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    charter TEXT,
    status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'active', 'paused', 'complete')),
    division TEXT CHECK (division IN ('quantitative', 'ai', 'venture', 'impact')),
    lead_id UUID REFERENCES qis_members(id),
    budget NUMERIC(12,2) DEFAULT 0,
    github_repo TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Project Memberships ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qis_project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES qis_projects(id) ON DELETE CASCADE,
    member_id UUID REFERENCES qis_members(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'contributor' CHECK (role IN ('contributor', 'lead', 'advisor')),
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, member_id)
);

-- ─── QIS Documents (Charters, Decks, NDAs, Legal) ──────────────
CREATE TABLE IF NOT EXISTS qis_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('charter', 'deck', 'nda', 'legal', 'research', 'template')),
    file_url TEXT,
    content TEXT,
    project_id UUID REFERENCES qis_projects(id) ON DELETE SET NULL,
    access_level TEXT DEFAULT 'core' CHECK (access_level IN ('public', 'associate', 'core', 'leadership', 'admin')),
    is_downloadable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── QIS Membership Applications ────────────────────────────────
CREATE TABLE IF NOT EXISTS qis_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    discipline TEXT,
    institution TEXT,
    motivation TEXT,
    accredited BOOLEAN DEFAULT false,
    nda_agreed BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES qis_members(id),
    reviewed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── QIS Audit Log ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS qis_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES qis_members(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_qis_members_role ON qis_members(role);
CREATE INDEX IF NOT EXISTS idx_qis_members_status ON qis_members(status);
CREATE INDEX IF NOT EXISTS idx_qis_members_email ON qis_members(email);
CREATE INDEX IF NOT EXISTS idx_qis_projects_status ON qis_projects(status);
CREATE INDEX IF NOT EXISTS idx_qis_projects_division ON qis_projects(division);
CREATE INDEX IF NOT EXISTS idx_qis_project_members_project ON qis_project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_qis_project_members_member ON qis_project_members(member_id);
CREATE INDEX IF NOT EXISTS idx_qis_documents_type ON qis_documents(type);
CREATE INDEX IF NOT EXISTS idx_qis_documents_access ON qis_documents(access_level);
CREATE INDEX IF NOT EXISTS idx_qis_audit_log_member ON qis_audit_log(member_id);
CREATE INDEX IF NOT EXISTS idx_qis_audit_log_action ON qis_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_qis_audit_log_created ON qis_audit_log(created_at DESC);

-- ─── Enable RLS ─────────────────────────────────────────────────
ALTER TABLE qis_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE qis_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE qis_project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE qis_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE qis_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE qis_audit_log ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies (Supabase-compatible) ─────────────────────────
-- These policies use auth.uid() which works via Supabase client
CREATE POLICY "Public read approved members" ON qis_members
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Members read own profile" ON qis_members
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Members update own profile" ON qis_members
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Projects visible to approved members" ON qis_projects
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM qis_members WHERE id = auth.uid() AND status = 'approved')
    );

CREATE POLICY "Project memberships visible" ON qis_project_members
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM qis_members WHERE id = auth.uid() AND status = 'approved')
    );

CREATE POLICY "Documents by access level" ON qis_documents
    FOR SELECT USING (access_level = 'public');

CREATE POLICY "Applications insert" ON qis_applications
    FOR INSERT WITH CHECK (true);
