-- Admin Enhancement Schema: Contact Submissions, Email Subscribers, Audit Logs

-- ─── Contact Form Submissions ────────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    inquiry_type TEXT DEFAULT 'general',
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'in_progress', 'replied', 'archived', 'spam')),
    internal_notes TEXT,
    assigned_to TEXT,
    response_sent BOOLEAN DEFAULT false,
    response_sent_at TIMESTAMPTZ,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Email Subscribers ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    segments TEXT[] DEFAULT '{}',
    source TEXT DEFAULT 'website',
    engagement_score INT DEFAULT 0,
    subscribed_at TIMESTAMPTZ DEFAULT now(),
    last_opened TIMESTAMPTZ,
    last_clicked TIMESTAMPTZ,
    unsubscribed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Email Campaigns ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT,
    segments TEXT[] DEFAULT '{}',
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    total_sent INT DEFAULT 0,
    open_rate FLOAT DEFAULT 0,
    click_rate FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Audit Logs ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user TEXT NOT NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id TEXT,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_log(admin_user);
CREATE INDEX IF NOT EXISTS idx_audit_action ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON admin_audit_log(created_at DESC);

-- ─── RLS ─────────────────────────────────────────────────────────
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow public insert for contact form and newsletter signup
CREATE POLICY "Public insert contact" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert subscriber" ON email_subscribers FOR INSERT WITH CHECK (true);

-- Admin read/write for all (via service key)
CREATE POLICY "Admin full access contact" ON contact_submissions FOR ALL USING (true);
CREATE POLICY "Admin full access subscribers" ON email_subscribers FOR ALL USING (true);
CREATE POLICY "Admin full access campaigns" ON email_campaigns FOR ALL USING (true);
CREATE POLICY "Admin full access audit" ON admin_audit_log FOR ALL USING (true);
