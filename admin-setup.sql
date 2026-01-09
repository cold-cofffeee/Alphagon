-- ============================================
-- ALPHAGON ADMIN PANEL SCHEMA
-- Admin configuration and control tables
-- Run this AFTER setup.sql
-- ============================================

-- ============================================
-- ADMIN ROLES & PERMISSIONS
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer')),
    permissions JSONB DEFAULT '{}', -- {"users": "write", "tools": "read", etc.}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id)
);

CREATE INDEX idx_admin_roles_user_id ON public.admin_roles(user_id);
CREATE INDEX idx_admin_roles_role ON public.admin_roles(role);

-- ============================================
-- ADMIN ACTIVITY LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'user_deactivate', 'tool_disable', 'prompt_update', etc.
    target_type TEXT, -- 'user', 'tool', 'prompt', 'setting'
    target_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin_id ON public.admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_action_type ON public.admin_activity_logs(action_type);
CREATE INDEX idx_admin_logs_created_at ON public.admin_activity_logs(created_at DESC);

-- ============================================
-- TOOL CONFIGURATION (Admin Control)
-- ============================================

CREATE TABLE IF NOT EXISTS public.tool_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_name TEXT NOT NULL UNIQUE,
    tool_label TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    
    -- Control flags
    is_enabled BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    
    -- Availability
    available_regions TEXT[] DEFAULT ARRAY['global'], -- ['global', 'us', 'bd', etc.]
    available_languages TEXT[] DEFAULT ARRAY['english', 'bangla', 'mixed'],
    available_tones TEXT[] DEFAULT ARRAY['casual', 'professional', 'storytelling', 'educational'],
    
    -- Limits
    rate_limit_per_hour INTEGER DEFAULT 10,
    rate_limit_per_day INTEGER DEFAULT 100,
    
    -- Metadata
    icon TEXT,
    color TEXT,
    tags TEXT[],
    
    -- Admin control
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.user_profiles(id)
);

CREATE INDEX idx_tool_config_enabled ON public.tool_config(is_enabled);
CREATE INDEX idx_tool_config_order ON public.tool_config(display_order);

-- Insert default tools
INSERT INTO public.tool_config (tool_name, tool_label, description, category, display_order) VALUES
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
-- PROMPT TEMPLATES (Admin Control)
-- ============================================

CREATE TABLE IF NOT EXISTS public.prompt_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_name TEXT NOT NULL REFERENCES public.tool_config(tool_name) ON DELETE CASCADE,
    version INTEGER DEFAULT 1,
    prompt_text TEXT NOT NULL,
    
    -- Activation
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Conditions (optional overrides)
    region TEXT, -- NULL = all regions
    language TEXT, -- NULL = all languages
    tone TEXT, -- NULL = all tones
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id),
    activated_at TIMESTAMP WITH TIME ZONE,
    
    -- Only one active prompt per tool/region/language/tone combination
    UNIQUE(tool_name, region, language, tone, is_active) WHERE is_active = TRUE
);

CREATE INDEX idx_prompts_tool_name ON public.prompt_templates(tool_name);
CREATE INDEX idx_prompts_active ON public.prompt_templates(is_active);
CREATE INDEX idx_prompts_version ON public.prompt_templates(tool_name, version DESC);

-- ============================================
-- SYSTEM SETTINGS (Admin Control)
-- ============================================

CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT NOT NULL UNIQUE,
    setting_value JSONB NOT NULL,
    setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE, -- Can frontend read this?
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.user_profiles(id)
);

CREATE INDEX idx_settings_key ON public.system_settings(setting_key);
CREATE INDEX idx_settings_public ON public.system_settings(is_public);

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
    ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode - frontend becomes read-only', true),
    ('ai_generation_enabled', 'true', 'boolean', 'Enable/disable all AI generation', true),
    ('default_emotion', '"emotional"', 'string', 'Default emotion setting', true),
    ('default_tone', '"casual"', 'string', 'Default tone setting', true),
    ('default_language', '"english"', 'string', 'Default language setting', true),
    ('default_region', '"global"', 'string', 'Default region setting', true),
    ('max_projects_per_user', '50', 'number', 'Maximum projects per user', false),
    ('max_generations_per_day', '100', 'number', 'Maximum generations per user per day', false),
    ('allowed_file_types', '["video/mp4", "audio/mpeg", "audio/wav"]', 'array', 'Allowed upload file types', true),
    ('max_file_size_mb', '100', 'number', 'Maximum file upload size in MB', true)
ON CONFLICT (setting_key) DO NOTHING;

-- ============================================
-- WEBSITE CONTENT (Admin Control)
-- ============================================

CREATE TABLE IF NOT EXISTS public.website_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page TEXT NOT NULL, -- 'homepage', 'about', 'footer'
    section TEXT NOT NULL, -- 'hero', 'features', 'philosophy'
    content_key TEXT NOT NULL,
    content_value TEXT NOT NULL,
    content_type TEXT DEFAULT 'text', -- 'text', 'html', 'markdown'
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES public.user_profiles(id),
    UNIQUE(page, section, content_key)
);

CREATE INDEX idx_website_content_page ON public.website_content(page);
CREATE INDEX idx_website_content_active ON public.website_content(is_active);

-- Insert default website content
INSERT INTO public.website_content (page, section, content_key, content_value) VALUES
    ('homepage', 'hero', 'title', 'Alphagon'),
    ('homepage', 'hero', 'tagline', 'Intelligence over volume.'),
    ('homepage', 'hero', 'subtitle', 'Turn one video into platform-ready content — intelligently.'),
    ('about', 'philosophy', 'mission', 'Alphagon exists to give creators precision control over AI-powered content generation.'),
    ('footer', 'legal', 'copyright', '© 2026 Alphagon. Built for creators who value quality.')
ON CONFLICT (page, section, content_key) DO NOTHING;

-- ============================================
-- CONTENT MODERATION FLAGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.content_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generation_id UUID REFERENCES public.ai_generations(id) ON DELETE CASCADE,
    flagged_by UUID REFERENCES public.user_profiles(id),
    flag_type TEXT CHECK (flag_type IN ('inappropriate', 'spam', 'abuse', 'quality', 'other')),
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES public.user_profiles(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_flags_generation_id ON public.content_flags(generation_id);
CREATE INDEX idx_flags_status ON public.content_flags(status);
CREATE INDEX idx_flags_flagged_by ON public.content_flags(flagged_by);

-- ============================================
-- USER RESTRICTIONS (Admin Control)
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_restrictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    restriction_type TEXT CHECK (restriction_type IN ('suspended', 'rate_limited', 'read_only', 'banned')),
    reason TEXT NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE, -- NULL = permanent
    applied_by UUID REFERENCES public.user_profiles(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_restrictions_user_id ON public.user_restrictions(user_id);
CREATE INDEX idx_restrictions_active ON public.user_restrictions(is_active);

-- ============================================
-- RLS POLICIES FOR ADMIN TABLES
-- ============================================

-- Admin roles - only admins can view
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view roles"
    ON public.admin_roles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_roles ar
            WHERE ar.user_id = auth.uid() AND ar.is_active = TRUE
        )
    );

-- Tool config - public read, admin write
ALTER TABLE public.tool_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tool config"
    ON public.tool_config FOR SELECT
    USING (TRUE);

CREATE POLICY "Only admins can modify tool config"
    ON public.tool_config FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_roles ar
            WHERE ar.user_id = auth.uid() 
            AND ar.is_active = TRUE 
            AND ar.role IN ('super_admin', 'admin')
        )
    );

-- System settings - public read for public settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public settings"
    ON public.system_settings FOR SELECT
    USING (is_public = TRUE);

CREATE POLICY "Only admins can view all settings"
    ON public.system_settings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_roles ar
            WHERE ar.user_id = auth.uid() AND ar.is_active = TRUE
        )
    );

-- Website content - public read
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view website content"
    ON public.website_content FOR SELECT
    USING (is_active = TRUE);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_roles
        WHERE admin_roles.user_id = user_id
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active prompt for tool
CREATE OR REPLACE FUNCTION get_active_prompt(
    p_tool_name TEXT,
    p_region TEXT DEFAULT NULL,
    p_language TEXT DEFAULT NULL,
    p_tone TEXT DEFAULT NULL
)
RETURNS TEXT AS $$
DECLARE
    prompt TEXT;
BEGIN
    -- Try exact match first
    SELECT prompt_text INTO prompt
    FROM public.prompt_templates
    WHERE tool_name = p_tool_name
    AND is_active = TRUE
    AND (region = p_region OR region IS NULL)
    AND (language = p_language OR language IS NULL)
    AND (tone = p_tone OR tone IS NULL)
    ORDER BY 
        (CASE WHEN region = p_region THEN 3 ELSE 0 END) +
        (CASE WHEN language = p_language THEN 2 ELSE 0 END) +
        (CASE WHEN tone = p_tone THEN 1 ELSE 0 END) DESC
    LIMIT 1;
    
    -- If no match, get default prompt (all NULL conditions)
    IF prompt IS NULL THEN
        SELECT prompt_text INTO prompt
        FROM public.prompt_templates
        WHERE tool_name = p_tool_name
        AND is_active = TRUE
        AND region IS NULL
        AND language IS NULL
        AND tone IS NULL
        LIMIT 1;
    END IF;
    
    RETURN prompt;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has restriction
CREATE OR REPLACE FUNCTION has_active_restriction(
    p_user_id UUID,
    p_restriction_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_restrictions
        WHERE user_id = p_user_id
        AND is_active = TRUE
        AND (ends_at IS NULL OR ends_at > NOW())
        AND (p_restriction_type IS NULL OR restriction_type = p_restriction_type)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log admin activity
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_id UUID,
    p_action_type TEXT,
    p_target_type TEXT DEFAULT NULL,
    p_target_id TEXT DEFAULT NULL,
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.admin_activity_logs (
        admin_id,
        action_type,
        target_type,
        target_id,
        details
    ) VALUES (
        p_admin_id,
        p_action_type,
        p_target_type,
        p_target_id,
        p_details
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VIEWS FOR ADMIN DASHBOARD
-- ============================================

-- Admin dashboard overview
CREATE OR REPLACE VIEW admin_dashboard_overview AS
SELECT 
    (SELECT COUNT(*) FROM public.user_profiles) as total_users,
    (SELECT COUNT(*) FROM public.user_profiles WHERE created_at > NOW() - INTERVAL '7 days') as new_users_week,
    (SELECT COUNT(*) FROM public.projects WHERE status = 'active') as active_projects,
    (SELECT COUNT(*) FROM public.ai_generations) as total_generations,
    (SELECT COUNT(*) FROM public.ai_generations WHERE created_at > NOW() - INTERVAL '24 hours') as generations_today,
    (SELECT COALESCE(SUM(total_tokens), 0) FROM public.ai_generations) as total_tokens_used,
    (SELECT COUNT(*) FROM public.error_logs WHERE resolved = FALSE) as unresolved_errors,
    (SELECT COUNT(*) FROM public.content_flags WHERE status = 'pending') as pending_flags;

-- Tool usage statistics
CREATE OR REPLACE VIEW admin_tool_usage_stats AS
SELECT 
    tc.tool_name,
    tc.tool_label,
    tc.is_enabled,
    COUNT(ag.id) as total_uses,
    COUNT(DISTINCT ag.user_id) as unique_users,
    COALESCE(AVG(ag.total_tokens), 0)::INTEGER as avg_tokens,
    COUNT(CASE WHEN ag.was_cached THEN 1 END) as cache_hits,
    MAX(ag.created_at) as last_used
FROM public.tool_config tc
LEFT JOIN public.ai_generations ag ON tc.tool_name = ag.tool_name
GROUP BY tc.tool_name, tc.tool_label, tc.is_enabled
ORDER BY total_uses DESC;

-- ============================================
-- GRANTS
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.tool_config TO anon, authenticated;
GRANT SELECT ON public.system_settings TO anon, authenticated;
GRANT SELECT ON public.website_content TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- ============================================
-- END OF ADMIN SCHEMA
-- ============================================
