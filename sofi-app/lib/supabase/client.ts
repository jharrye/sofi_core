import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Profile {
    id: string;
    name: string | null;
    avatar_choice: 'sofi' | 'sam' | 'neutral';
    communication_style: 'suave' | 'directa' | 'reflexiva';
    language: 'es' | 'en';
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface Subscription {
    id: string;
    user_id: string;
    status: 'trialing' | 'active' | 'canceled' | 'past_due';
    plan: 'monthly' | 'annual' | null;
    trial_ends_at: string | null;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface Conversation {
    id: string;
    user_id: string;
    title: string;
    status: 'active' | 'archived';
    created_at: string;
    updated_at: string;
}

export interface Message {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    created_at: string;
}

export interface MemoryFact {
    id: string;
    user_id: string;
    fact_text: string;
    priority: number;
    source_conversation_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface SessionSummary {
    id: string;
    user_id: string;
    conversation_id: string;
    summary_text: string;
    message_count: number;
    created_at: string;
}

// Helper functions
export async function checkUserAccess(userId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('has_active_access', { p_user_id: userId });
    if (error) {
        console.error('Error checking access:', error);
        return false;
    }
    return data;
}

export async function getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error getting profile:', error);
        return null;
    }
    return data;
}

export async function getConversationMessages(conversationId: string, limit = 12) {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error getting messages:', error);
        return [];
    }
    return data.reverse(); // Return in chronological order
}

export async function getMemoryFacts(userId: string, limit = 5) {
    const { data, error } = await supabase
        .from('memory_facts')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error getting memory facts:', error);
        return [];
    }
    return data;
}

export async function getLatestSessionSummary(conversationId: string) {
    const { data, error } = await supabase
        .from('session_summaries')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error getting session summary:', error);
    }
    return data || null;
}
