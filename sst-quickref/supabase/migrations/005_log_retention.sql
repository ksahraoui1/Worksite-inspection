-- Migration 005: Log retention cleanup function
-- Feature: SST-QuickRef — T049 Log retention
--
-- Deletes quickref_queries (and cascaded quickref_feedback) older than 90 days.
--
-- SCHEDULING NOTE:
-- This function must be called periodically. Options:
-- 1. pg_cron (recommended if available on your Supabase plan):
--      SELECT cron.schedule('cleanup-old-queries', '0 3 * * 0', 'SELECT cleanup_old_queries()');
--    This runs every Sunday at 03:00 UTC.
-- 2. Application-level scheduling: call via a Supabase Edge Function or external cron
--    that executes: SELECT cleanup_old_queries();

CREATE OR REPLACE FUNCTION cleanup_old_queries()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM quickref_queries
  WHERE created_at < now() - INTERVAL '90 days';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RAISE LOG 'cleanup_old_queries: deleted % rows older than 90 days', deleted_count;

  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_old_queries() IS
  'Deletes quickref_queries older than 90 days. Feedback is cascade-deleted. Schedule via pg_cron or application-level cron.';
