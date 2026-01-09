-- ============================================
-- ALPHAGON DATABASE SETUP - COMPLETE
-- ============================================
-- Description: Complete database schema for Alphagon AI SaaS Platform
-- Created: 2026-01-09
-- 
-- Instructions:
-- 1. Go to: https://supabase.com/dashboard/project/zrlotbiptnwakwedgovq/editor
-- 2. Copy this entire file
-- 3. Paste into SQL Editor
-- 4. Click "RUN"
-- 5. Wait for success message
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SECTION 1: ENUMS & TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('user', 'support', 'admin', 'super_admin');
CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE transaction_type AS ENUM ('purchase', 'usage', 'refund', 'bonus', 'adjustment');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'generation', 'credit_transaction', 'ban', 'unban', 'role_change');

-- ============================================
-- SECTION 2: TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role user_role DEFAULT 'user' NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    credits INTEGER DEFAULT 0 NOT NULL CHECK (credits >= 0),
    total_generations INTEGER DEFAULT 0 NOT NULL CHECK (total_generations >= 0),
    is_banned BOOLEAN DEFAULT FALSE NOT NULL,
    ban_reason TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Plans table
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    credits INTEGER NOT NULL CHECK (credits > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    currency TEXT DEFAULT 'USD' NOT NULL,
    stripe_price_id TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Credit transactions table
CREATE TABLE credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type transaction_type NOT NULL,
    description TEXT,
    reference_id TEXT,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Generations table
CREATE TABLE generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    model TEXT NOT NULL,
    status generation_status DEFAULT 'pending' NOT NULL,
    result JSONB,
    error_message TEXT,
    credits_used INTEGER DEFAULT 0 NOT NULL CHECK (credits_used >= 0),
    processing_time_ms INTEGER CHECK (processing_time_ms >= 0),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Vault versions table (content history)
CREATE TABLE vault_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generation_id UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL CHECK (version_number > 0),
    content JSONB NOT NULL,
    changes_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(generation_id, version_number)
);

-- Audit logs table (immutable)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    before_state JSONB,
    after_state JSONB,
    ip_address TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AI usage tracking table
CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    prompt_tokens INTEGER NOT NULL CHECK (prompt_tokens >= 0),
    completion_tokens INTEGER NOT NULL CHECK (completion_tokens >= 0),
    total_tokens INTEGER NOT NULL CHECK (total_tokens >= 0),
    cost DECIMAL(10, 6) NOT NULL CHECK (cost >= 0),
    generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Risk flags table
CREATE TABLE risk_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE NOT NULL,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Feature flags table
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    rollout_percentage INTEGER DEFAULT 0 NOT NULL CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_users TEXT[],
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- SECTION 3: INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_banned ON users(is_banned);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

CREATE INDEX idx_generations_user_id ON generations(user_id);
CREATE INDEX idx_generations_status ON generations(status);
CREATE INDEX idx_generations_created_at ON generations(created_at DESC);

CREATE INDEX idx_vault_versions_generation_id ON vault_versions(generation_id);
CREATE INDEX idx_vault_versions_user_id ON vault_versions(user_id);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

CREATE INDEX idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX idx_ai_usage_generation_id ON ai_usage(generation_id);
CREATE INDEX idx_ai_usage_created_at ON ai_usage(created_at DESC);

CREATE INDEX idx_risk_flags_user_id ON risk_flags(user_id);
CREATE INDEX idx_risk_flags_is_resolved ON risk_flags(is_resolved);
CREATE INDEX idx_risk_flags_severity ON risk_flags(severity);

CREATE INDEX idx_feature_flags_name ON feature_flags(name);
CREATE INDEX idx_feature_flags_is_enabled ON feature_flags(is_enabled);

-- ============================================
-- SECTION 4: ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM users WHERE id = auth.uid()) AND credits = (SELECT credits FROM users WHERE id = auth.uid()));
CREATE POLICY "Admins can update users" ON users FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Enable insert for authenticated users" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Sessions table policies
CREATE POLICY "Users can view own sessions" ON sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON sessions FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users can insert own sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON sessions FOR DELETE USING (auth.uid() = user_id);

-- Plans table policies
CREATE POLICY "Anyone can view active plans" ON plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all plans" ON plans FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Admins can manage plans" ON plans FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- Credit transactions policies
CREATE POLICY "Users can view own transactions" ON credit_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all transactions" ON credit_transactions FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'support')));
CREATE POLICY "System can insert transactions" ON credit_transactions FOR INSERT WITH CHECK (true);

-- Generations policies
CREATE POLICY "Users can view own generations" ON generations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all generations" ON generations FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'support')));
CREATE POLICY "Users can insert own generations" ON generations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own generations" ON generations FOR UPDATE USING (auth.uid() = user_id);

-- Vault versions policies
CREATE POLICY "Users can view own vault versions" ON vault_versions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all vault versions" ON vault_versions FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "Users can insert own vault versions" ON vault_versions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Audit logs policies
CREATE POLICY "Admins can view all audit logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "System can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- AI usage policies
CREATE POLICY "Admins can view all AI usage" ON ai_usage FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));
CREATE POLICY "System can insert AI usage" ON ai_usage FOR INSERT WITH CHECK (true);

-- Risk flags policies
CREATE POLICY "Admins can view all risk flags" ON risk_flags FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'support')));
CREATE POLICY "Admins can manage risk flags" ON risk_flags FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'support')));

-- Feature flags policies
CREATE POLICY "Everyone can view enabled feature flags" ON feature_flags FOR SELECT USING (is_enabled = true OR auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage feature flags" ON feature_flags FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'super_admin')));

-- ============================================
-- SECTION 5: FUNCTIONS & TRIGGERS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generations_updated_at BEFORE UPDATE ON generations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, created_at, updated_at)
    VALUES (NEW.id, NEW.email, 'user', NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Audit log function
CREATE OR REPLACE FUNCTION create_audit_log(
    p_user_id UUID,
    p_admin_id UUID,
    p_action audit_action,
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_before_state JSONB,
    p_after_state JSONB,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO audit_logs (user_id, admin_id, action, entity_type, entity_id, before_state, after_state, metadata)
    VALUES (p_user_id, p_admin_id, p_action, p_entity_type, p_entity_id, p_before_state, p_after_state, p_metadata)
    RETURNING id INTO v_audit_id;
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add credits function
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_type transaction_type,
    p_description TEXT DEFAULT NULL,
    p_admin_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
BEGIN
    UPDATE users SET credits = credits + p_amount WHERE id = p_user_id;
    INSERT INTO credit_transactions (user_id, amount, type, description, admin_id)
    VALUES (p_user_id, p_amount, p_type, p_description, p_admin_id)
    RETURNING id INTO v_transaction_id;
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deduct credits function
CREATE OR REPLACE FUNCTION deduct_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_description TEXT DEFAULT NULL,
    p_generation_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_transaction_id UUID;
    v_current_credits INTEGER;
BEGIN
    SELECT credits INTO v_current_credits FROM users WHERE id = p_user_id;
    IF v_current_credits < p_amount THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;
    UPDATE users SET credits = credits - p_amount WHERE id = p_user_id;
    INSERT INTO credit_transactions (user_id, amount, type, description, reference_id)
    VALUES (p_user_id, -p_amount, 'usage', p_description, p_generation_id::TEXT)
    RETURNING id INTO v_transaction_id;
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generation audit trigger
CREATE OR REPLACE FUNCTION audit_generation_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM create_audit_log(NEW.user_id, NULL, 'generation', 'generation', NEW.id::TEXT, NULL, to_jsonb(NEW), jsonb_build_object('operation', 'INSERT'));
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM create_audit_log(NEW.user_id, NULL, 'generation', 'generation', NEW.id::TEXT, to_jsonb(OLD), to_jsonb(NEW), jsonb_build_object('operation', 'UPDATE'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_generations AFTER INSERT OR UPDATE ON generations FOR EACH ROW EXECUTE FUNCTION audit_generation_changes();

-- User changes audit trigger
CREATE OR REPLACE FUNCTION audit_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.is_banned != NEW.is_banned THEN
            PERFORM create_audit_log(NEW.id, auth.uid(), CASE WHEN NEW.is_banned THEN 'ban' ELSE 'unban' END, 'user', NEW.id::TEXT, to_jsonb(OLD), to_jsonb(NEW), jsonb_build_object('reason', NEW.ban_reason));
        END IF;
        IF OLD.role != NEW.role THEN
            PERFORM create_audit_log(NEW.id, auth.uid(), 'role_change', 'user', NEW.id::TEXT, jsonb_build_object('old_role', OLD.role), jsonb_build_object('new_role', NEW.role), '{}'::jsonb);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_users AFTER UPDATE ON users FOR EACH ROW EXECUTE FUNCTION audit_user_changes();

-- Increment generation counter
CREATE OR REPLACE FUNCTION increment_user_generations()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE users SET total_generations = total_generations + 1 WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_generations_counter AFTER INSERT OR UPDATE ON generations FOR EACH ROW EXECUTE FUNCTION increment_user_generations();

-- ============================================
-- SECTION 6: SEED DATA
-- ============================================

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

-- ============================================
-- SETUP COMPLETE! 🎉
-- ============================================
-- Next steps:
-- 1. Run: npm run verify (to verify setup)
-- 2. Run: npm run dev (to start the app)
-- 3. Sign up for an account
-- 4. Promote yourself to admin with:
--    UPDATE users SET role = 'super_admin' WHERE email = 'your-email@example.com';
-- ============================================
