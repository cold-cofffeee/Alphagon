-- Migration: 003_functions_triggers.sql
-- Description: Database functions and triggers for automation
-- Created: 2026-01-09

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, created_at, updated_at)
    VALUES (
        NEW.id,
        NEW.email,
        'user',
        NOW(),
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- AUDIT LOG FUNCTION
-- ============================================

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
    INSERT INTO audit_logs (
        user_id,
        admin_id,
        action,
        entity_type,
        entity_id,
        before_state,
        after_state,
        metadata
    )
    VALUES (
        p_user_id,
        p_admin_id,
        p_action,
        p_entity_type,
        p_entity_id,
        p_before_state,
        p_after_state,
        p_metadata
    )
    RETURNING id INTO v_audit_id;
    
    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CREDIT MANAGEMENT FUNCTIONS
-- ============================================

-- Add credits to user
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
    -- Update user credits
    UPDATE users
    SET credits = credits + p_amount
    WHERE id = p_user_id;
    
    -- Create transaction record
    INSERT INTO credit_transactions (
        user_id,
        amount,
        type,
        description,
        admin_id
    )
    VALUES (
        p_user_id,
        p_amount,
        p_type,
        p_description,
        p_admin_id
    )
    RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deduct credits from user
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
    -- Check if user has enough credits
    SELECT credits INTO v_current_credits
    FROM users
    WHERE id = p_user_id;
    
    IF v_current_credits < p_amount THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;
    
    -- Deduct credits
    UPDATE users
    SET credits = credits - p_amount
    WHERE id = p_user_id;
    
    -- Create transaction record
    INSERT INTO credit_transactions (
        user_id,
        amount,
        type,
        description,
        reference_id
    )
    VALUES (
        p_user_id,
        -p_amount,
        'usage',
        p_description,
        p_generation_id::TEXT
    )
    RETURNING id INTO v_transaction_id;
    
    RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GENERATION AUDIT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION audit_generation_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM create_audit_log(
            NEW.user_id,
            NULL,
            'generation',
            'generation',
            NEW.id::TEXT,
            NULL,
            to_jsonb(NEW),
            jsonb_build_object('operation', 'INSERT')
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM create_audit_log(
            NEW.user_id,
            NULL,
            'generation',
            'generation',
            NEW.id::TEXT,
            to_jsonb(OLD),
            to_jsonb(NEW),
            jsonb_build_object('operation', 'UPDATE')
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_generations
    AFTER INSERT OR UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION audit_generation_changes();

-- ============================================
-- USER BAN/UNBAN AUDIT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION audit_user_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Track ban/unban
        IF OLD.is_banned != NEW.is_banned THEN
            PERFORM create_audit_log(
                NEW.id,
                auth.uid(),
                CASE WHEN NEW.is_banned THEN 'ban' ELSE 'unban' END,
                'user',
                NEW.id::TEXT,
                to_jsonb(OLD),
                to_jsonb(NEW),
                jsonb_build_object('reason', NEW.ban_reason)
            );
        END IF;
        
        -- Track role changes
        IF OLD.role != NEW.role THEN
            PERFORM create_audit_log(
                NEW.id,
                auth.uid(),
                'role_change',
                'user',
                NEW.id::TEXT,
                jsonb_build_object('old_role', OLD.role),
                jsonb_build_object('new_role', NEW.role),
                '{}'::jsonb
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_users
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION audit_user_changes();

-- ============================================
-- INCREMENT GENERATION COUNTER
-- ============================================

CREATE OR REPLACE FUNCTION increment_user_generations()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE users
        SET total_generations = total_generations + 1
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_generations_counter
    AFTER INSERT OR UPDATE ON generations
    FOR EACH ROW
    EXECUTE FUNCTION increment_user_generations();
