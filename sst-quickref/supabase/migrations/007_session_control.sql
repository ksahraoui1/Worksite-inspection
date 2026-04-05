-- Migration 007: Contrôle de session unique par abonné
-- Un seul appareil connecté à la fois

ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS active_session_id TEXT;
