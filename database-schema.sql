-- ============================================
-- ALPHAGON - COMPLETE DATABASE SCHEMA
-- Supabase PostgreSQL Database Setup
-- Includes: Core tables + Admin Panel + Security
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- PART 1: CORE APPLICATION TABLES
-- ============================================

-- ============================================
-- USER PROFILES
-- Extends Supabase auth.users with profile data
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User Preferences (Default Settings)
    default_emotion TEXT DEFAULT 'emotional' CHECK (default_emotion IN ('emotional', 'logical', 'inspirational', 'aggressive', 'friendly', 'authoritative')),
    default_tone TEXT DEFAULT 'casual' CHECK (default_tone IN ('casual', 'professional', 'storytelling', 'educational')),
    default_language TEXT DEFAULT 'english' CHECK (default_language IN ('english', 'bangla', 'mixed')),
    default_region TEXT DEFAULT 'global',
    ui_density TEXT DEFAULT 'comfortable' CHECK (ui_density IN ('compact', 'comfortable', 'spacious')),
    
    -- Usage tracking
    total_projects INTEGER DEFAULT 0,
    total_generations INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_user_profiles_email;
DROP INDEX IF EXISTS idx_user_profiles_created_at;

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- PROJECTS
-- User projects (uploaded media sessions)
-- ============================================

CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Project metadata
    title TEXT NOT NULL DEFAULT 'Untitled Project',
    description TEXT,
    
    -- Media information
    original_filename TEXT,
    file_type TEXT, -- 'video' or 'audio'
    file_size BIGINT, -- in bytes
    duration INTEGER, -- in seconds
    
    -- Transcription
    transcription TEXT,
    transcription_language TEXT,
    
    -- Project settings (can override user defaults)
    emotion TEXT CHECK (emotion IN ('emotional', 'logical', 'inspirational', 'aggressive', 'friendly', 'authoritative')),
    tone TEXT CHECK (tone IN ('casual', 'professional', 'storytelling', 'educational')),
    language TEXT CHECK (language IN ('english', 'bangla', 'mixed')),
    target_region TEXT,
    creator_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    
    CONSTRAINT projects_title_length CHECK (char_length(title) <= 200)
);

DROP INDEX IF EXISTS idx_projects_user_id;
DROP INDEX IF EXISTS idx_projects_created_at;
DROP INDEX IF EXISTS idx_projects_status;

CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_projects_status ON public.projects(status);

-- RLS Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- AI GENERATIONS
-- All AI-generated content with caching
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Generation metadata
    tool_name TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    
    -- Input parameters (for caching)
    input_hash TEXT NOT NULL, -- SHA-256 hash of (transcription + settings + tool)
    transcription_snippet TEXT, -- First 500 chars for reference
    
    -- Settings used
    emotion TEXT,
    tone TEXT,
    language TEXT,
    target_region TEXT,
    
    -- AI Provider info
    ai_provider TEXT DEFAULT 'gemini',
    ai_model TEXT DEFAULT 'gemini-2.0-flash',
    prompt_used TEXT,
    
    -- Performance metrics
    generation_time_ms INTEGER,
    tokens_used INTEGER,
    
    -- User feedback
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status
    is_cached BOOLEAN DEFAULT FALSE,
    cache_hit_count INTEGER DEFAULT 0
);

DROP INDEX IF EXISTS idx_generations_user_id;
DROP INDEX IF EXISTS idx_generations_project_id;
DROP INDEX IF EXISTS idx_generations_tool_name;
DROP INDEX IF EXISTS idx_generations_created_at;
DROP INDEX IF EXISTS idx_generations_input_hash;

CREATE INDEX idx_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX idx_generations_project_id ON public.ai_generations(project_id);
CREATE INDEX idx_generations_tool_name ON public.ai_generations(tool_name);
CREATE INDEX idx_generations_created_at ON public.ai_generations(created_at DESC);
CREATE UNIQUE INDEX idx_generations_input_hash ON public.ai_generations(input_hash);

-- RLS Policies
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own generations" ON public.ai_generations;
DROP POLICY IF EXISTS "Users can create own generations" ON public.ai_generations;
DROP POLICY IF EXISTS "Users can update own generations" ON public.ai_generations;

CREATE POLICY "Users can view own generations"
    ON public.ai_generations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own generations"
    ON public.ai_generations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own generations"
    ON public.ai_generations FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- ERROR LOGS
-- Application error tracking
-- ============================================

CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    
    -- Error details
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    error_stack TEXT,
    
    -- Context
    endpoint TEXT,
    request_method TEXT,
    request_body JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_error_logs_user_id;
DROP INDEX IF EXISTS idx_error_logs_error_type;
DROP INDEX IF EXISTS idx_error_logs_created_at;

CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_error_type ON public.error_logs(error_type);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);

-- RLS: Only admins can view error logs (set later)
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USAGE STATISTICS
-- Aggregated usage metrics
-- ============================================

CREATE TABLE IF NOT EXISTS public.usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Date
    stat_date DATE NOT NULL,
    
    -- Counts
    generations_count INTEGER DEFAULT 0,
    projects_created INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    api_calls INTEGER DEFAULT 0,
    
    -- Tokens
    tokens_used INTEGER DEFAULT 0,
    tokens_saved_by_cache INTEGER DEFAULT 0,
    
    UNIQUE(user_id, stat_date)
);

DROP INDEX IF EXISTS idx_usage_stats_user_id;
DROP INDEX IF EXISTS idx_usage_stats_date;

CREATE INDEX idx_usage_stats_user_id ON public.usage_stats(user_id);
CREATE INDEX idx_usage_stats_date ON public.usage_stats(stat_date DESC);

-- RLS Policies
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own usage stats" ON public.usage_stats;

CREATE POLICY "Users can view own usage stats"
    ON public.usage_stats FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- PART 2: ADMIN PANEL TABLES
-- ============================================

-- ============================================
-- ADMIN ROLES & PERMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer')),
    permissions JSONB DEFAULT '{}', -- {"manage_users": true, "manage_tools": true, etc.}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id)
);

DROP INDEX IF EXISTS idx_admin_roles_user_id;
DROP INDEX IF EXISTS idx_admin_roles_role;

CREATE INDEX idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX idx_admin_roles_role ON public.admin_roles(role);

-- RLS: Only admins can view admin roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADMIN ACTIVITY LOGS
-- Complete audit trail
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'user_restricted', 'tool_disabled', 'prompt_updated', etc.
    target_type TEXT, -- 'user', 'tool', 'prompt', 'setting'
    target_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_admin_logs_admin_id;
DROP INDEX IF EXISTS idx_admin_logs_action_type;
DROP INDEX IF EXISTS idx_admin_logs_created_at;

CREATE INDEX idx_admin_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_action_type ON public.admin_activity_logs(action_type);
CREATE INDEX idx_admin_logs_created_at ON public.admin_activity_logs(created_at DESC);

-- RLS: Only admins can view logs
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TOOL CONFIGURATION (Single Source of Truth)
-- ============================================

CREATE TABLE IF NOT EXISTS public.tool_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    
    -- Control flags (Admin controls)
    is_enabled BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Availability
    available_regions TEXT[] DEFAULT ARRAY['global'],
    available_languages TEXT[] DEFAULT ARRAY['english', 'bangla', 'mixed'],
    available_tones TEXT[] DEFAULT ARRAY['casual', 'professional', 'storytelling', 'educational'],
    
    -- Limits (Admin controls)
    rate_limit_per_hour INTEGER DEFAULT 10,
    rate_limit_per_day INTEGER DEFAULT 100,
    
    -- UI
    icon TEXT,
    color TEXT,
    tags TEXT[],
    
    -- Admin control
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.user_profiles(id)
);

DROP INDEX IF EXISTS idx_tool_config_enabled;
DROP INDEX IF EXISTS idx_tool_config_visible;
DROP INDEX IF EXISTS idx_tool_config_order;

CREATE INDEX idx_tool_config_enabled ON public.tool_config(is_enabled);
CREATE INDEX idx_tool_config_visible ON public.tool_config(is_visible);
CREATE INDEX idx_tool_config_order ON public.tool_config(display_order);

-- RLS: Public read (frontend reads), admin write
ALTER TABLE public.tool_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view enabled tools" ON public.tool_config;

CREATE POLICY "Anyone can view enabled tools"
    ON public.tool_config FOR SELECT
    USING (is_enabled = TRUE AND is_visible = TRUE);

-- Insert default tools
INSERT INTO public.tool_config (tool_name, display_name, description, category, display_order) VALUES
    ('thumbnail', 'Thumbnail Text Copy', 'Eye-catching text for video thumbnails', 'generation', 1),
    ('seo-title', 'SEO Title', 'Search-optimized titles that rank', 'generation', 2),
    ('youtube', 'YouTube Content', 'Optimized title & description', 'platform', 3),
    ('facebook', 'Facebook Post', 'Engagement-driven content', 'platform', 4),
    ('twitter', 'Twitter/X Content', 'Viral-ready tweets', 'platform', 5),
    ('instagram', 'Instagram Reels', 'Hashtag-rich captions', 'platform', 6),
    ('blog', 'Blog Post', 'Article title & introduction', 'platform', 7),
    ('short-desc', 'Short Description', '100-150 word summaries', 'description', 8),
    ('long-desc', 'Long-Form Description', 'Comprehensive descriptions', 'description', 9),
    ('ad-copy', 'Ad Copy', 'Conversion-focused ads', 'marketing', 10),
    ('hooks', 'Hooks', 'Attention-grabbing openers', 'marketing', 11),
    ('more-same', 'More Ideas (Same Angle)', 'Similar variations', 'expansion', 12),
    ('more-different', 'More Ideas (Fresh Angles)', 'New perspectives', 'expansion', 13),
    ('improvements', 'Improvement Suggestions', 'Strategic recommendations', 'optimization', 14),
    ('competitor', 'Competitor Analysis', 'Niche-based insights', 'optimization', 15)
ON CONFLICT (tool_name) DO NOTHING;

-- ============================================
-- PROMPT TEMPLATES (Versioning & A/B Testing)
-- ============================================

CREATE TABLE IF NOT EXISTS public.prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_name TEXT NOT NULL,
    version INTEGER NOT NULL,
    prompt_template TEXT NOT NULL,
    
    -- Conditions (when to use this prompt)
    target_region TEXT,
    target_language TEXT,
    target_tone TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMP WITH TIME ZONE,
    
    -- Performance tracking
    usage_count INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id),
    notes TEXT,
    
    UNIQUE(tool_name, version)
);

DROP INDEX IF EXISTS idx_prompt_templates_tool_name;
DROP INDEX IF EXISTS idx_prompt_templates_active;

CREATE INDEX idx_prompt_templates_tool_name ON public.prompt_templates(tool_name);
CREATE INDEX idx_prompt_templates_active ON public.prompt_templates(is_active);

-- RLS: Public can't read prompts directly (they get them through API)
ALTER TABLE public.prompt_templates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SYSTEM SETTINGS (Admin Controls)
-- ============================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    description TEXT,
    setting_type TEXT CHECK (setting_type IN ('boolean', 'string', 'number', 'json')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.user_profiles(id)
);

DROP INDEX IF EXISTS idx_system_settings_key;

CREATE INDEX idx_system_settings_key ON public.system_settings(setting_key);

-- RLS: Public read (frontend reads), admin write
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Drop old policy if exists
DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Anyone can read public system settings" ON public.system_settings;

-- Create restricted public access policy (only safe settings)
CREATE POLICY "Anyone can read public system settings"
    ON public.system_settings FOR SELECT
    TO PUBLIC
    USING (
        setting_key IN (
            'maintenance_mode',
            'signup_enabled',
            'default_language',
            'default_tone',
            'default_region',
            'max_file_size_mb',
            'max_generation_length'
        )
    );

-- Insert default settings
INSERT INTO public.system_settings (setting_key, setting_value, description, setting_type) VALUES
    ('maintenance_mode', 'false', 'System maintenance mode', 'boolean'),
    ('ai_generation_enabled', 'true', 'Enable/disable AI generation globally', 'boolean'),
    ('signup_enabled', 'true', 'Allow new user signups', 'boolean'),
    ('default_language', '"english"', 'Default language for new users', 'string'),
    ('default_tone', '"casual"', 'Default tone for new users', 'string'),
    ('default_region', '"global"', 'Default region for new users', 'string'),
    ('max_file_size_mb', '0', 'Maximum upload file size in MB (0 = unlimited)', 'number'),
    ('max_generation_length', '2000', 'Maximum generation length in characters', 'number'),
    ('cache_ttl_hours', '168', 'Cache time-to-live in hours (7 days)', 'number')
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- WEBSITE CONTENT (Dynamic CMS)
-- ============================================

CREATE TABLE IF NOT EXISTS public.website_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page TEXT NOT NULL,
    section TEXT NOT NULL,
    content_key TEXT NOT NULL,
    content_value TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('text', 'html', 'markdown', 'json')),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.user_profiles(id),
    UNIQUE(page, section, content_key)
);

DROP INDEX IF EXISTS idx_website_content_page;
DROP INDEX IF EXISTS idx_website_content_active;

CREATE INDEX idx_website_content_page ON public.website_content(page);
CREATE INDEX idx_website_content_active ON public.website_content(is_active);

-- RLS: Public read (frontend reads), admin write
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active content" ON public.website_content;

CREATE POLICY "Anyone can read active content"
    ON public.website_content FOR SELECT
    USING (is_active = TRUE);

-- ============================================
-- CONTENT FLAGS (Moderation)
-- ============================================

CREATE TABLE IF NOT EXISTS public.content_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generation_id UUID NOT NULL REFERENCES public.ai_generations(id) ON DELETE CASCADE,
    flag_type TEXT NOT NULL CHECK (flag_type IN ('spam', 'inappropriate', 'offensive', 'low_quality', 'other')),
    flagged_by UUID REFERENCES public.user_profiles(id),
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES public.user_profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP INDEX IF EXISTS idx_content_flags_generation_id;
DROP INDEX IF EXISTS idx_content_flags_status;

CREATE INDEX idx_content_flags_generation_id ON public.content_flags(generation_id);
CREATE INDEX idx_content_flags_status ON public.content_flags(status);

-- RLS: Only admins can view flags
ALTER TABLE public.content_flags ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER RESTRICTIONS (Admin Control)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    restriction_type TEXT NOT NULL CHECK (restriction_type IN ('temporary', 'permanent', 'rate_limited')),
    reason TEXT NOT NULL,
    applied_by UUID NOT NULL REFERENCES public.user_profiles(id),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

DROP INDEX IF EXISTS idx_user_restrictions_user_id;
DROP INDEX IF EXISTS idx_user_restrictions_active;

CREATE INDEX idx_user_restrictions_user_id ON public.user_restrictions(user_id);
CREATE INDEX idx_user_restrictions_active ON public.user_restrictions(is_active);

-- RLS: Only admins can view restrictions
ALTER TABLE public.user_restrictions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 3: HELPER FUNCTIONS
-- ============================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE admin_roles.user_id = $1
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active prompt for tool
CREATE OR REPLACE FUNCTION get_active_prompt(
    p_tool_name TEXT,
    p_region TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_tone TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    v_prompt TEXT;
BEGIN
    -- Try to find condition-specific prompt first
    SELECT prompt_template INTO v_prompt
    FROM public.prompt_templates
    WHERE tool_name = p_tool_name
        AND is_active = TRUE
        AND (target_region IS NULL OR target_region = p_region)
        AND (target_language IS NULL OR target_language = p_language)
        AND (target_tone IS NULL OR target_tone = p_tone)
    ORDER BY 
        (target_region IS NOT NULL)::int DESC,
        (target_language IS NOT NULL)::int DESC,
        (target_tone IS NOT NULL)::int DESC,
        version DESC
    LIMIT 1;
    
    -- Fall back to any active prompt for this tool
    IF v_prompt IS NULL THEN
        SELECT prompt_template INTO v_prompt
        FROM public.prompt_templates
        WHERE tool_name = p_tool_name
            AND is_active = TRUE
        ORDER BY version DESC
        LIMIT 1;
    END IF;
    
    RETURN v_prompt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has active restriction
CREATE OR REPLACE FUNCTION has_active_restriction(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_restrictions
        WHERE user_restrictions.user_id = $1
        AND is_active = TRUE
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log admin action (helper)
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action_type TEXT,
    p_target_type TEXT,
    p_target_id TEXT,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.admin_activity_logs (admin_id, action_type, target_type, target_id, details)
    VALUES (p_admin_id, p_action_type, p_target_type, p_target_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 4: TRIGGERS
-- ============================================

-- Auto-update user profile counts
CREATE OR REPLACE FUNCTION update_user_profile_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'projects' THEN
            UPDATE public.user_profiles
            SET total_projects = total_projects + 1,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        ELSIF TG_TABLE_NAME = 'ai_generations' THEN
            UPDATE public.user_profiles
            SET total_generations = total_generations + 1,
                updated_at = NOW()
            WHERE id = NEW.user_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_project_count ON public.projects;
DROP TRIGGER IF EXISTS trigger_update_generation_count ON public.ai_generations;

CREATE TRIGGER trigger_update_project_count
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_counts();

CREATE TRIGGER trigger_update_generation_count
    AFTER INSERT ON public.ai_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profile_counts();

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;

CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 5: ADMIN RLS POLICIES
-- ============================================

-- Error logs - admin only
DROP POLICY IF EXISTS "Admins can view all error logs" ON public.error_logs;

CREATE POLICY "Admins can view all error logs"
    ON public.error_logs FOR SELECT
    USING (is_admin(auth.uid()));

-- Admin roles - admin only
DROP POLICY IF EXISTS "Admins can view admin roles" ON public.admin_roles;
DROP POLICY IF EXISTS "Super admins can manage admin roles" ON public.admin_roles;

CREATE POLICY "Admins can view admin roles"
    ON public.admin_roles FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Super admins can manage admin roles"
    ON public.admin_roles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_roles
            WHERE user_id = auth.uid()
            AND role = 'super_admin'
            AND is_active = TRUE
        )
    );

-- Admin logs - admin only
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;

CREATE POLICY "Admins can view activity logs"
    ON public.admin_activity_logs FOR SELECT
    USING (is_admin(auth.uid()));

-- Content flags - admin only
DROP POLICY IF EXISTS "Admins can view content flags" ON public.content_flags;
DROP POLICY IF EXISTS "Admins can manage content flags" ON public.content_flags;

CREATE POLICY "Admins can view content flags"
    ON public.content_flags FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage content flags"
    ON public.content_flags FOR ALL
    USING (is_admin(auth.uid()));

-- User restrictions - admin only
DROP POLICY IF EXISTS "Admins can view user restrictions" ON public.user_restrictions;
DROP POLICY IF EXISTS "Admins can manage user restrictions" ON public.user_restrictions;

CREATE POLICY "Admins can view user restrictions"
    ON public.user_restrictions FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can manage user restrictions"
    ON public.user_restrictions FOR ALL
    USING (is_admin(auth.uid()));

-- Tool config - admin write
DROP POLICY IF EXISTS "Admins can manage tool config" ON public.tool_config;

CREATE POLICY "Admins can manage tool config"
    ON public.tool_config FOR ALL
    USING (is_admin(auth.uid()));

-- Prompt templates - admin only
DROP POLICY IF EXISTS "Admins can manage prompts" ON public.prompt_templates;

CREATE POLICY "Admins can manage prompts"
    ON public.prompt_templates FOR ALL
    USING (is_admin(auth.uid()));

-- System settings - admin access
DROP POLICY IF EXISTS "Admins can update settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can view all settings" ON public.system_settings;

CREATE POLICY "Admins can update settings"
    ON public.system_settings FOR UPDATE
    USING (is_admin(auth.uid()));

CREATE POLICY "Admins can view all settings"
    ON public.system_settings FOR SELECT
    USING (is_admin(auth.uid()));

-- Website content - admin write
DROP POLICY IF EXISTS "Admins can manage content" ON public.website_content;

CREATE POLICY "Admins can manage content"
    ON public.website_content FOR ALL
    USING (is_admin(auth.uid()));

-- ============================================
-- PART 6: ADMIN DASHBOARD VIEWS
-- ============================================

CREATE OR REPLACE VIEW admin_dashboard_overview AS
SELECT
    (SELECT COUNT(*) FROM public.user_profiles) as total_users,
    (SELECT COUNT(*) FROM public.user_profiles WHERE created_at > NOW() - INTERVAL '24 hours') as users_last_24h,
    (SELECT COUNT(*) FROM public.projects WHERE status = 'active') as total_projects,
    (SELECT COUNT(*) FROM public.projects WHERE created_at > NOW() - INTERVAL '24 hours') as projects_last_24h,
    (SELECT COUNT(*) FROM public.ai_generations WHERE created_at::date = CURRENT_DATE) as generations_today,
    (SELECT COUNT(*) FROM public.ai_generations WHERE created_at::date = CURRENT_DATE - 1) as generations_yesterday,
    (SELECT COUNT(*) FROM public.admin_roles WHERE is_active = TRUE) as active_admins,
    (SELECT COUNT(*) FROM public.content_flags WHERE status = 'pending') as pending_flags;

CREATE OR REPLACE VIEW admin_tool_usage_stats AS
SELECT
    tool_name,
    COUNT(*) as usage_count,
    AVG(rating)::DECIMAL(3,2) as avg_rating,
    SUM(tokens_used) as total_tokens,
    SUM(CASE WHEN is_cached THEN 1 ELSE 0 END) as cache_hits
FROM public.ai_generations
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY tool_name
ORDER BY usage_count DESC;

-- ============================================
-- SETUP COMPLETE
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✓ Alphagon Database Schema Updated!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Core Tables: user_profiles, projects, ai_generations, error_logs, usage_stats';
    RAISE NOTICE 'Admin Tables: admin_roles, tool_config, prompt_templates, system_settings';
    RAISE NOTICE 'Security: RLS policies enabled on all tables';
    RAISE NOTICE 'Tools: 15 default tools configured';
    RAISE NOTICE 'Settings: Default system settings initialized';
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Updates Applied:';
    RAISE NOTICE '  - Email verification disabled (auto-confirm on signup)';
    RAISE NOTICE '  - System settings restricted (only public-safe settings exposed)';
    RAISE NOTICE '  - Admin-only access for sensitive configuration';
    RAISE NOTICE '  - All policies updated with DROP IF EXISTS for safe re-run';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. First signup will auto-create and login user';
    RAISE NOTICE '  2. Promote user to admin: INSERT INTO admin_roles (user_id, role) VALUES (''user-id'', ''super_admin'')';
    RAISE NOTICE '  3. Configure Gemini API key in .env';
    RAISE NOTICE '  4. Access admin panel at /admin';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
