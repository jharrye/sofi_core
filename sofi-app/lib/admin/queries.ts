import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Dashboard Stats
export async function getDashboardStats() {
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    if (error) {
        console.error('Error fetching dashboard stats:', error);
        return null;
    }
    return data;
}

// Get all users with filters
export interface AdminUserFilter {
    status?: 'trial' | 'active' | 'canceled';
    avatarChoice?: 'sofi' | 'sam' | 'neutral';
    searchEmail?: string;
}

export async function getUsers(filters: AdminUserFilter = {}, limit = 50, offset = 0) {
    let query = supabase
        .from('profiles')
        .select(`
      id,
      name,
      avatar_choice,
      language,
      communication_style,
      created_at,
      subscriptions (
        status,
        plan,
        trial_ends_at,
        created_at
      )
    `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

    // Apply filters
    if (filters.avatarChoice) {
        query = query.eq('avatar_choice', filters.avatarChoice);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching users:', error);
        return [];
    }

    // Filter by subscription status (post-fetch since it's a relation)
    if (filters.status) {
        return data.filter(user => {
            const sub = user.subscriptions?.[0];
            if (!sub) return false;

            if (filters.status === 'trial') {
                return sub.status === 'trialing' && new Date(sub.trial_ends_at) > new Date();
            }
            return sub.status === filters.status;
        });
    }

    return data;
}

// Get user details
export async function getUserDetails(userId: string) {
    const { data, error } = await supabase.rpc('get_user_stats', { p_user_id: userId });
    if (error) {
        console.error('Error fetching user stats:', error);
        return null;
    }
    return data;
}

// Get recent events
export async function getRecentEvents(limit = 50) {
    const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching events:', error);
        return [];
    }
    return data;
}

// Get usage analytics
export async function getUsageAnalytics() {
    // Messages per day (last 30 days)
    const { data: messagesData } = await supabase
        .from('messages')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    // Group by date
    const messagesByDate = messagesData?.reduce((acc: any, msg) => {
        const date = new Date(msg.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    // Average messages per user
    const { data: avgMessages } = await supabase
        .from('messages')
        .select('conversation_id');

    const uniqueConversations = new Set(avgMessages?.map(m => m.conversation_id));
    const avgMessagesPerConversation = avgMessages ? avgMessages.length / uniqueConversations.size : 0;

    return {
        messagesByDate,
        avgMessagesPerConversation,
    };
}

// Feature Flags
export async function getFeatureFlags() {
    const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('flag_name');

    if (error) {
        console.error('Error fetching feature flags:', error);
        return [];
    }
    return data;
}

export async function updateFeatureFlag(flagName: string, enabled: boolean, adminId: string) {
    const { error } = await supabase
        .from('feature_flags')
        .update({ enabled, updated_at: new Date().toISOString(), updated_by: adminId })
        .eq('flag_name', flagName);

    if (error) {
        console.error('Error updating feature flag:', error);
        return false;
    }
    return true;
}

// System Settings
export async function getSystemSettings() {
    const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('setting_key');

    if (error) {
        console.error('Error fetching settings:', error);
        return [];
    }
    return data;
}

export async function updateSystemSetting(
    settingKey: string,
    settingValue: any,
    adminId: string
) {
    const { error } = await supabase
        .from('system_settings')
        .update({
            setting_value: settingValue,
            updated_at: new Date().toISOString(),
            updated_by: adminId
        })
        .eq('setting_key', settingKey);

    if (error) {
        console.error('Error updating setting:', error);
        return false;
    }
    return true;
}

// Check if user is admin
export async function isUserAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_admin', { check_user_id: userId });
    if (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
    return data || false;
}

// Log analytics event
export async function logAnalyticsEvent(
    eventType: string,
    userId?: string,
    metadata?: any
) {
    const { error } = await supabase.rpc('log_event', {
        p_event_type: eventType,
        p_user_id: userId || null,
        p_metadata: metadata || {}
    });

    if (error) {
        console.error('Error logging event:', error);
    }
}
