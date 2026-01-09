-- Migration: 002_rls_policies.sql
-- Description: Row Level Security policies for all tables
-- Created: 2026-01-09

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

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
    ON users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id
        AND role = (SELECT role FROM users WHERE id = auth.uid())
        AND credits = (SELECT credits FROM users WHERE id = auth.uid())
    );

-- Admins can update any user
CREATE POLICY "Admins can update users"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- New users can be inserted (handled by trigger)
CREATE POLICY "Enable insert for authenticated users"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- SESSIONS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own sessions"
    ON sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sessions"
    ON sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can insert own sessions"
    ON sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
    ON sessions FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- PLANS TABLE POLICIES
-- ============================================

-- Everyone can view active plans
CREATE POLICY "Anyone can view active plans"
    ON plans FOR SELECT
    USING (is_active = true);

-- Admins can view all plans
CREATE POLICY "Admins can view all plans"
    ON plans FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- Admins can manage plans
CREATE POLICY "Admins can manage plans"
    ON plans FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

-- ============================================
-- CREDIT TRANSACTIONS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own transactions"
    ON credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
    ON credit_transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'support')
        )
    );

CREATE POLICY "System can insert transactions"
    ON credit_transactions FOR INSERT
    WITH CHECK (true);

-- ============================================
-- GENERATIONS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own generations"
    ON generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all generations"
    ON generations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'support')
        )
    );

CREATE POLICY "Users can insert own generations"
    ON generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
    ON generations FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- VAULT VERSIONS TABLE POLICIES
-- ============================================

CREATE POLICY "Users can view own vault versions"
    ON vault_versions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all vault versions"
    ON vault_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "Users can insert own vault versions"
    ON vault_versions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- ============================================
-- AUDIT LOGS TABLE POLICIES (Read-only)
-- ============================================

CREATE POLICY "Admins can view all audit logs"
    ON audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "System can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (true);

-- ============================================
-- AI USAGE TABLE POLICIES
-- ============================================

CREATE POLICY "Admins can view all AI usage"
    ON ai_usage FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "System can insert AI usage"
    ON ai_usage FOR INSERT
    WITH CHECK (true);

-- ============================================
-- RISK FLAGS TABLE POLICIES
-- ============================================

CREATE POLICY "Admins can view all risk flags"
    ON risk_flags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'support')
        )
    );

CREATE POLICY "Admins can manage risk flags"
    ON risk_flags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin', 'support')
        )
    );

-- ============================================
-- FEATURE FLAGS TABLE POLICIES
-- ============================================

CREATE POLICY "Everyone can view enabled feature flags"
    ON feature_flags FOR SELECT
    USING (is_enabled = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage feature flags"
    ON feature_flags FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('admin', 'super_admin')
        )
    );
