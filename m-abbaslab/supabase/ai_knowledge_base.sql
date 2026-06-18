-- AI Knowledge Base table for M-Abbas AI
-- Stores knowledge that the AI can reference when answering questions

CREATE TABLE IF NOT EXISTS ai_knowledge_base (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- 'project', 'article', 'fashion', 'profile', 'custom'
  topic TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT, -- 'auto_sync', 'manual', 'article', 'project'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast category-based lookup
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_category ON ai_knowledge_base(category);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_topic ON ai_knowledge_base USING gin(to_tsvector('english', topic || ' ' || content));

-- Chat sessions table for conversation logging
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  context TEXT, -- detected conversation context
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_visitor ON chat_sessions(visitor_id);

-- RLS policies
ALTER TABLE ai_knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Admin can manage knowledge base
CREATE POLICY "Admin manage knowledge base" ON ai_knowledge_base
  FOR ALL USING (true);

-- Anyone can read knowledge base
CREATE POLICY "Public read knowledge base" ON ai_knowledge_base
  FOR SELECT USING (true);

-- Admin can manage chat sessions
CREATE POLICY "Admin manage chat sessions" ON chat_sessions
  FOR ALL USING (true);
