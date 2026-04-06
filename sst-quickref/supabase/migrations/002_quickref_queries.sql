-- Migration 002: quickref_queries — Logs anonymisés des requêtes
-- Feature: SST-QuickRef 001-sst-quickref-assistant

CREATE TABLE quickref_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  sources_used TEXT[],
  response_ms INTEGER,
  user_type TEXT NOT NULL DEFAULT 'anonymous',
  similarity_score FLOAT,
  was_refused BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quickref_queries_created ON quickref_queries (created_at);
CREATE INDEX idx_quickref_queries_user_type ON quickref_queries (user_type);

-- RLS
ALTER TABLE quickref_queries ENABLE ROW LEVEL SECURITY;

-- Insert via service role uniquement (Edge Functions)
CREATE POLICY "quickref_queries_insert_service" ON quickref_queries
  FOR INSERT WITH CHECK (current_setting('role', true) = 'service_role');

-- Select réservé aux admins
CREATE POLICY "quickref_queries_select_admin" ON quickref_queries
  FOR SELECT USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
