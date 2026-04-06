-- Migration 001: documents_sst — Stockage des chunks réglementaires avec embeddings vectoriels
-- Feature: SST-QuickRef 001-sst-quickref-assistant

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents_sst (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding vector(1536) NOT NULL,
  source TEXT NOT NULL,
  article TEXT,
  version_date DATE NOT NULL,
  source_url TEXT,
  is_superseded BOOLEAN DEFAULT false,
  sha256_hash TEXT NOT NULL,
  language TEXT DEFAULT 'fr',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index HNSW pour recherche vectorielle performante (cosine similarity)
CREATE INDEX idx_documents_sst_embedding ON documents_sst
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Index pour filtrage rapide par source et supersession
CREATE INDEX idx_documents_sst_source ON documents_sst (source);
CREATE INDEX idx_documents_sst_active ON documents_sst (is_superseded) WHERE NOT is_superseded;

-- Contrainte d'unicité pour éviter les doublons
ALTER TABLE documents_sst
  ADD CONSTRAINT uq_documents_sst_chunk UNIQUE (sha256_hash, source, article, version_date);

-- RLS
ALTER TABLE documents_sst ENABLE ROW LEVEL SECURITY;

CREATE POLICY "documents_sst_select_all" ON documents_sst
  FOR SELECT USING (true);

CREATE POLICY "documents_sst_insert_admin" ON documents_sst
  FOR INSERT WITH CHECK (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
    OR current_setting('role', true) = 'service_role'
  );

CREATE POLICY "documents_sst_update_admin" ON documents_sst
  FOR UPDATE USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
    OR current_setting('role', true) = 'service_role'
  );

CREATE POLICY "documents_sst_delete_admin" ON documents_sst
  FOR DELETE USING (
    (SELECT role FROM auth.users WHERE id = auth.uid()) = 'admin'
    OR current_setting('role', true) = 'service_role'
  );
