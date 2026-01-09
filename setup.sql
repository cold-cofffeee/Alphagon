-- ============================================
-- ALPHAGON DATABASE SCHEMA
-- Supabase PostgreSQL Database Setup
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USERS TABLE
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

-- Add RLS (Row Level Security) policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- PROJECTS TABLE
-- Stores user projects (uploaded media sessions)
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
    
    -- Indexes for search
    CONSTRAINT projects_title_length CHECK (char_length(title) <= 200)
);

-- Create indexes for performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX idx_projects_status ON public.projects(status);

-- RLS Policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

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
-- AI_GENERATIONS TABLE
-- Stores all AI-generated content with caching
-- ============================================

CREATE TABLE IF NOT EXISTS public.ai_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    
    -- Generation metadata
    tool_name TEXT NOT NULL, -- e.g., 'thumbnail', 'seo-title', 'youtube', etc.
    tool_label TEXT NOT NULL, -- Human-readable name
    
    -- Input hash for caching (hash of transcription + settings + tool)
    input_hash TEXT NOT NULL,
    
    -- Generation settings used
    emotion TEXT NOT NULL,
    tone TEXT NOT NULL,
    language TEXT NOT NULL,
    target_region TEXT NOT NULL,
    creator_notes TEXT,
    
    -- AI Response
    generated_content TEXT NOT NULL,
    model_used TEXT DEFAULT 'gemini-2.0-flash-exp',
    
    -- Token usage tracking
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,
    
    -- Performance metrics
    generation_time_ms INTEGER, -- milliseconds
    was_cached BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- User feedback (optional)
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT
);

-- Create indexes for caching and performance
CREATE INDEX idx_generations_project_id ON public.ai_generations(project_id);
CREATE INDEX idx_generations_user_id ON public.ai_generations(user_id);
CREATE INDEX idx_generations_input_hash ON public.ai_generations(input_hash);
CREATE INDEX idx_generations_created_at ON public.ai_generations(created_at DESC);
CREATE INDEX idx_generations_tool_name ON public.ai_generations(tool_name);

-- Unique constraint for caching: same input should return cached result
CREATE UNIQUE INDEX idx_unique_generation_cache 
    ON public.ai_generations(input_hash, tool_name) 
    WHERE was_cached = FALSE;

-- RLS Policies
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

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
-- ERROR_LOGS TABLE
-- Track errors for debugging and monitoring
-- ============================================

CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    
    -- Error details
    error_type TEXT NOT NULL, -- e.g., 'api_error', 'validation_error', 'transcription_error'
    error_message TEXT NOT NULL,
    error_stack TEXT,
    
    -- Context
    endpoint TEXT,
    tool_name TEXT,
    request_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Resolution
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT
);

-- Create indexes
CREATE INDEX idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_error_type ON public.error_logs(error_type);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(resolved);

-- RLS Policies (admins can view all, users can view their own)
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own error logs"
    ON public.error_logs FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- USAGE_STATS TABLE
-- Track usage for analytics and quotas
-- ============================================

CREATE TABLE IF NOT EXISTS public.usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Date tracking (one row per user per day)
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Counters
    projects_created INTEGER DEFAULT 0,
    generations_count INTEGER DEFAULT 0,
    tokens_used INTEGER DEFAULT 0,
    cache_hits INTEGER DEFAULT 0,
    cache_misses INTEGER DEFAULT 0,
    
    -- Per-tool usage
    tool_usage JSONB DEFAULT '{}', -- {"thumbnail": 5, "youtube": 3, etc.}
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, stat_date)
);

-- Create indexes
CREATE INDEX idx_usage_stats_user_id ON public.usage_stats(user_id);
CREATE INDEX idx_usage_stats_date ON public.usage_stats(stat_date DESC);

-- RLS Policies
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage stats"
    ON public.usage_stats FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to increment project count
CREATE OR REPLACE FUNCTION increment_user_project_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_profiles
    SET total_projects = total_projects + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_project_created
    AFTER INSERT ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION increment_user_project_count();

-- Function to increment generation count
CREATE OR REPLACE FUNCTION increment_user_generation_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_profiles
    SET total_generations = total_generations + 1
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_generation_created
    AFTER INSERT ON public.ai_generations
    FOR EACH ROW
    EXECUTE FUNCTION increment_user_generation_count();

-- Function to update usage stats
CREATE OR REPLACE FUNCTION update_usage_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usage_stats (
        user_id,
        stat_date,
        generations_count,
        tokens_used,
        cache_hits,
        cache_misses,
        tool_usage
    ) VALUES (
        NEW.user_id,
        CURRENT_DATE,
        1,
        COALESCE(NEW.total_tokens, 0),
        CASE WHEN NEW.was_cached THEN 1 ELSE 0 END,
        CASE WHEN NOT NEW.was_cached THEN 1 ELSE 0 END,
        jsonb_build_object(NEW.tool_name, 1)
    )
    ON CONFLICT (user_id, stat_date)
    DO UPDATE SET
        generations_count = usage_stats.generations_count + 1,
        tokens_used = usage_stats.tokens_used + COALESCE(NEW.total_tokens, 0),
        cache_hits = usage_stats.cache_hits + CASE WHEN NEW.was_cached THEN 1 ELSE 0 END,
        cache_misses = usage_stats.cache_misses + CASE WHEN NOT NEW.was_cached THEN 1 ELSE 0 END,
        tool_usage = usage_stats.tool_usage || 
            jsonb_build_object(
                NEW.tool_name, 
                COALESCE((usage_stats.tool_usage->>NEW.tool_name)::integer, 0) + 1
            ),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_generation_stats
    AFTER INSERT ON public.ai_generations
    FOR EACH ROW
    EXECUTE FUNCTION update_usage_stats();

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for user dashboard stats
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    up.id as user_id,
    up.full_name,
    up.email,
    up.total_projects,
    up.total_generations,
    COUNT(DISTINCT p.id) as active_projects,
    COALESCE(SUM(us.tokens_used), 0) as total_tokens_used,
    COALESCE(SUM(us.generations_count), 0) as this_month_generations
FROM public.user_profiles up
LEFT JOIN public.projects p ON p.user_id = up.id AND p.status = 'active'
LEFT JOIN public.usage_stats us ON us.user_id = up.id 
    AND us.stat_date >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY up.id, up.full_name, up.email, up.total_projects, up.total_generations;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- This section can be commented out in production
-- Uncomment to insert test data

/*
-- Insert test user profile (requires an existing auth.users entry)
-- You'll need to sign up through the app first, then this trigger will auto-create the profile

-- Insert sample project (replace user_id with actual UUID)
INSERT INTO public.projects (
    user_id,
    title,
    description,
    transcription,
    file_type,
    emotion,
    tone,
    language,
    target_region
) VALUES (
    'your-user-uuid-here',
    'Sample Marketing Video',
    'A test project for AI content generation',
    'This is a sample transcription of a marketing video about productivity tools and how they help creators save time.',
    'video',
    'inspirational',
    'professional',
    'english',
    'global'
);
*/

-- ============================================
-- SECURITY NOTES
-- ============================================

-- 1. RLS is enabled on all tables
-- 2. Users can only access their own data
-- 3. Service role key should only be used server-side
-- 4. Anon key is safe for client-side use with RLS
-- 5. All sensitive operations should go through your backend API

-- ============================================
-- MAINTENANCE QUERIES
-- ============================================

-- Clean up old error logs (run periodically)
-- DELETE FROM public.error_logs WHERE created_at < NOW() - INTERVAL '30 days' AND resolved = TRUE;

-- Archive old projects
-- UPDATE public.projects SET status = 'archived' WHERE last_accessed_at < NOW() - INTERVAL '90 days' AND status = 'active';

-- Get cache hit rate
-- SELECT 
--     user_id,
--     SUM(cache_hits)::float / NULLIF(SUM(cache_hits + cache_misses), 0) * 100 as cache_hit_rate_percent
-- FROM public.usage_stats
-- GROUP BY user_id;

-- ============================================
-- END OF SCHEMA
-- ============================================

-- Grant necessary permissions (Supabase typically handles this)
-- But including for completeness

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
