-- Migration: 004_seed_data.sql
-- Description: Initial seed data for plans and feature flags
-- Created: 2026-01-09

-- Insert default plans
INSERT INTO plans (name, credits, price, currency, is_active) VALUES
    ('Starter', 100, 9.99, 'USD', true),
    ('Pro', 500, 39.99, 'USD', true),
    ('Business', 2000, 149.99, 'USD', true),
    ('Enterprise', 10000, 599.99, 'USD', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (name, description, is_enabled, rollout_percentage) VALUES
    ('ai_generation', 'Enable AI content generation', true, 100),
    ('vault_versioning', 'Enable content version history', true, 100),
    ('advanced_models', 'Enable access to advanced AI models', false, 0),
    ('batch_generation', 'Enable batch generation feature', false, 0),
    ('api_access', 'Enable API access for programmatic use', false, 0),
    ('priority_queue', 'Enable priority queue for generations', false, 10)
ON CONFLICT (name) DO NOTHING;
