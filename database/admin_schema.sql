-- Admin Panel Database Extensions

-- =====================================================
-- 1. ADMIN USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin list" ON admin_users
    FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users));

-- =====================================================
-- 2. ANALYTICS EVENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL, -- 'paywall_shown', 'subscription_created', 'trial_expired', etc.
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_type_time ON analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user ON analytics_events(user_id, created_at DESC);

-- No RLS - admin only access via service role

-- =====================================================
-- 3. FEATURE FLAGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name TEXT UNIQUE NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES admin_users(id)
);

-- Example flags
INSERT INTO feature_flags (flag_name, enabled, description)
VALUES 
    ('ejercicios_enabled', TRUE, 'Enable exercises feature'),
    ('biblioteca_enabled', TRUE, 'Enable library feature'),
    ('maintenance_mode', FALSE, 'Put app in maintenance mode')
ON CONFLICT (flag_name) DO NOTHING;

-- =====================================================
-- 4. SYSTEM SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES admin_users(id)
);

-- Example settings
INSERT INTO system_settings (setting_key, setting_value, description)
VALUES 
    ('max_messages_per_conversation', '1000', 'Maximum messages in a conversation'),
    ('max_memory_facts', '30', 'Maximum memory facts per user'),
    ('trial_duration_days', '15', 'Trial duration in days')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- 5. HELPER FUNCTIONS FOR ADMIN
-- =====================================================

-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM admin_users WHERE id = check_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM profiles),
        'active_users_7d', (SELECT COUNT(DISTINCT user_id) FROM messages WHERE created_at > NOW() - INTERVAL '7 days'),
        'active_users_30d', (SELECT COUNT(DISTINCT user_id) FROM messages WHERE created_at > NOW() - INTERVAL '30 days'),
        'active_trials', (SELECT COUNT(*) FROM subscriptions WHERE status = 'trialing' AND trial_ends_at > NOW()),
        'active_subscriptions', (SELECT COUNT(*) FROM subscriptions WHERE status = 'active'),
        'trial_to_paid_conversion', (
            SELECT ROUND(
                COUNT(CASE WHEN status = 'active' THEN 1 END)::NUMERIC / 
                NULLIF(COUNT(*), 0) * 100, 
                2
            )
            FROM subscriptions
        ),
        'total_messages', (SELECT COUNT(*) FROM messages),
        'total_conversations', (SELECT COUNT(*) FROM conversations)
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user activity stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_messages', (SELECT COUNT(*) FROM messages m 
            JOIN conversations c ON c.id = m.conversation_id 
            WHERE c.user_id = p_user_id),
        'total_conversations', (SELECT COUNT(*) FROM conversations WHERE user_id = p_user_id),
        'memory_facts_count', (SELECT COUNT(*) FROM memory_facts WHERE user_id = p_user_id),
        'last_active', (SELECT MAX(created_at) FROM messages m 
            JOIN conversations c ON c.id = m.conversation_id 
            WHERE c.user_id = p_user_id),
        'account_created', (SELECT created_at FROM profiles WHERE id = p_user_id)
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log analytics event
CREATE OR REPLACE FUNCTION log_event(
    p_event_type TEXT,
    p_user_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO analytics_events (event_type, user_id, metadata)
    VALUES (p_event_type, p_user_id, p_metadata)
    RETURNING id INTO event_id;
    
    RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. INDEXES FOR ADMIN QUERIES
-- =====================================================

-- User lookup by email
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Subscription status lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_created ON subscriptions(status, created_at DESC);

-- Profile activity
CREATE INDEX IF NOT EXISTS idx_profiles_created ON profiles(created_at DESC);
