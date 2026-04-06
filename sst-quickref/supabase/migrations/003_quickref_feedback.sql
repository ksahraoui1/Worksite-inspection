-- Migration 003: quickref_feedback — Feedback utilisateur (pouce haut/bas)
-- Feature: SST-QuickRef 001-sst-quickref-assistant

CREATE TABLE quickref_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID NOT NULL REFERENCES quickref_queries(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_quickref_feedback_query UNIQUE (query_id)
);

CREATE INDEX idx_quickref_feedback_query ON quickref_feedback (query_id);

-- RLS
ALTER TABLE quickref_feedback ENABLE ROW LEVEL SECURITY;

-- Insert pour tous les utilisateurs authentifiés
CREATE POLICY "quickref_feedback_insert_auth" ON quickref_feedback
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Select réservé aux admins
CREATE POLICY "quickref_feedback_select_admin" ON quickref_feedback
  FOR SELECT USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
