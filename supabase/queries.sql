-- Quick Reference: Supabase SQL Functions
-- Run these in the Supabase SQL Editor for manual operations

-- ============================================
-- USER MANAGEMENT
-- ============================================

-- Create admin user (run after user signs up)
UPDATE users
SET role = 'admin'
WHERE email = 'admin@example.com';

-- Ban user
UPDATE users
SET is_banned = true, ban_reason = 'Terms violation'
WHERE id = 'user-uuid';

-- Unban user
UPDATE users
SET is_banned = false, ban_reason = null
WHERE id = 'user-uuid';

-- Get user summary
SELECT 
  id, 
  email, 
  role, 
  credits, 
  total_generations,
  is_banned,
  created_at
FROM users
WHERE deleted_at IS NULL
ORDER BY created_at DESC;

-- ============================================
-- CREDIT OPERATIONS
-- ============================================

-- Add credits to user (bonus/refund)
SELECT add_credits(
  'user-uuid'::uuid,
  100,
  'bonus',
  'Welcome bonus'
);

-- Check user credits
SELECT email, credits
FROM users
WHERE id = 'user-uuid';

-- View credit transaction history
SELECT 
  ct.*,
  u.email
FROM credit_transactions ct
JOIN users u ON u.id = ct.user_id
ORDER BY ct.created_at DESC
LIMIT 50;

-- ============================================
-- GENERATION STATS
-- ============================================

-- Get generation statistics
SELECT 
  status,
  COUNT(*) as count,
  SUM(credits_used) as total_credits
FROM generations
GROUP BY status;

-- Get user's generations
SELECT 
  id,
  prompt,
  model,
  status,
  credits_used,
  created_at
FROM generations
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;

-- ============================================
-- AUDIT & MONITORING
-- ============================================

-- Recent audit logs
SELECT 
  al.*,
  u.email as user_email,
  a.email as admin_email
FROM audit_logs al
LEFT JOIN users u ON u.id = al.user_id
LEFT JOIN users a ON a.id = al.admin_id
ORDER BY al.created_at DESC
LIMIT 100;

-- User activity in last 30 days
SELECT 
  action,
  COUNT(*) as count
FROM audit_logs
WHERE user_id = 'user-uuid'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY action;

-- ============================================
-- RISK FLAGS
-- ============================================

-- Get unresolved risk flags
SELECT 
  rf.*,
  u.email as user_email
FROM risk_flags rf
JOIN users u ON u.id = rf.user_id
WHERE rf.is_resolved = false
ORDER BY 
  CASE rf.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  rf.created_at DESC;

-- Resolve risk flag
UPDATE risk_flags
SET 
  is_resolved = true,
  resolved_by = 'admin-uuid',
  resolved_at = NOW()
WHERE id = 'flag-uuid';

-- ============================================
-- AI USAGE & COSTS
-- ============================================

-- Total AI costs
SELECT 
  model,
  COUNT(*) as requests,
  SUM(total_tokens) as total_tokens,
  SUM(cost) as total_cost
FROM ai_usage
GROUP BY model;

-- User AI usage
SELECT 
  model,
  COUNT(*) as requests,
  SUM(total_tokens) as tokens,
  SUM(cost) as cost
FROM ai_usage
WHERE user_id = 'user-uuid'
GROUP BY model;

-- ============================================
-- FEATURE FLAGS
-- ============================================

-- Enable feature for everyone
UPDATE feature_flags
SET is_enabled = true, rollout_percentage = 100
WHERE name = 'advanced_models';

-- Enable feature for specific users
UPDATE feature_flags
SET target_users = ARRAY['user-uuid-1', 'user-uuid-2']
WHERE name = 'api_access';

-- Gradual rollout (50%)
UPDATE feature_flags
SET is_enabled = true, rollout_percentage = 50
WHERE name = 'priority_queue';

-- ============================================
-- DATABASE MAINTENANCE
-- ============================================

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check migration status
SELECT * FROM _migrations ORDER BY executed_at DESC;

-- Vacuum and analyze
VACUUM ANALYZE;

-- ============================================
-- BACKUP QUERIES
-- ============================================

-- Export users (copy result)
SELECT json_agg(row_to_json(users)) FROM users WHERE deleted_at IS NULL;

-- Export generations (copy result)
SELECT json_agg(row_to_json(generations)) FROM generations;
