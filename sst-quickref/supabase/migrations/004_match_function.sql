-- Migration 004: Fonction RPC pour recherche vectorielle par similarité cosinus
-- Utilisée par l'Edge Function quickref-query

CREATE OR REPLACE FUNCTION match_documents_sst(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  source text,
  article text,
  version_date date,
  source_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.content,
    d.source,
    d.article,
    d.version_date,
    d.source_url,
    1 - (d.embedding <=> query_embedding) AS similarity
  FROM documents_sst d
  WHERE NOT d.is_superseded
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
