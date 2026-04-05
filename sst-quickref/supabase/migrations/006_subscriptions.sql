-- Migration 006: subscriptions — Abonnements Stripe
-- Stocke le statut d'abonnement par email

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'canceled', 'past_due')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_subscriptions_email ON subscriptions (email);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions (stripe_customer_id);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Service role uniquement (Edge Functions)
CREATE POLICY "subscriptions_insert_service" ON subscriptions
  FOR INSERT WITH CHECK (current_setting('role', true) = 'service_role');

CREATE POLICY "subscriptions_update_service" ON subscriptions
  FOR UPDATE USING (current_setting('role', true) = 'service_role');

CREATE POLICY "subscriptions_select_service" ON subscriptions
  FOR SELECT USING (current_setting('role', true) = 'service_role');
