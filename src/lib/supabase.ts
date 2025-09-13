import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Essay {
  id: string;
  user_id: string;
  school: string;
  prompt: string;
  responses: Record<string, string>;
  generated_essay: string;
  created_at: string;
  updated_at: string;
  is_shared: boolean;
  share_token?: string;
  review_status?: 'pending' | 'in_review' | 'completed';
  human_review?: string;
  review_requested_at?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  subscription_plan: 'free' | 'monthly' | 'yearly';
  subscription_status: 'active' | 'cancelled' | 'expired';
  essays_generated: number;
  human_reviews_used: number;
  subscription_expires_at?: string;
  plan_limits: {
    essays: number;
    human_reviews: number;
  };
}

// Usage tracking functions
export const trackUsage = async (userId: string, actionType: 'essay_generated' | 'human_review_requested', essayId?: string) => {
  const { error } = await supabase
    .from('usage_tracking')
    .insert({
      user_id: userId,
      action_type: actionType,
      essay_id: essayId
    });
  
  if (error) {
    console.error('Error tracking usage:', error);
  }
  
  return { error };
};

export const getUserUsage = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('essays_generated, human_reviews_used, subscription_plan, plan_limits')
    .eq('user_id', userId)
    .single();
    
  if (profileError) {
    return { data: null, error: profileError };
  }
  
  return { data: profile, error: null };
};

export const incrementUserUsage = async (userId: string, type: 'essays_generated' | 'human_reviews_used') => {
  const { data, error } = await supabase.rpc('increment_user_usage', {
    user_id: userId,
    usage_type: type
  });
  
  return { data, error };
};

export const checkUsageLimit = async (userId: string, actionType: 'essay' | 'human_review') => {
  const { data: usage, error } = await getUserUsage(userId);
  
  if (error || !usage) {
    return { canProceed: false, error };
  }
  
  const limits = usage.plan_limits;
  
  if (actionType === 'essay') {
    const canProceed = limits.essays === -1 || usage.essays_generated < limits.essays;
    return { 
      canProceed, 
      remaining: limits.essays === -1 ? -1 : Math.max(0, limits.essays - usage.essays_generated),
      used: usage.essays_generated,
      limit: limits.essays,
      error: null 
    };
  } else {
    const canProceed = limits.human_reviews === -1 || usage.human_reviews_used < limits.human_reviews;
    return { 
      canProceed, 
      remaining: limits.human_reviews === -1 ? -1 : Math.max(0, limits.human_reviews - usage.human_reviews_used),
      used: usage.human_reviews_used,
      limit: limits.human_reviews,
      error: null 
    };
  }
};

// Auth functions
export const signUp = async (email: string, password: string, fullName: string) => {
  // First, create the user with minimal data
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  // Fetch user profile data
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Merge auth user data with profile data
  return {
    ...user,
    ...profile,
    email: user.email,
    id: user.id
  };
};

// Essay functions
export const saveEssay = async (essay: Omit<Essay, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('essays')
    .insert([essay])
    .select()
    .single();
  return { data, error };
};

export const updateEssay = async (id: string, updates: Partial<Essay>) => {
  const { data, error } = await supabase
    .from('essays')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const getUserEssays = async (userId: string) => {
  const { data, error } = await supabase
    .from('essays')
    .select(`
      *,
      human_reviews(
        id,
        review_status,
        reviewer_feedback,
        reviewed_at,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getEssayByShareToken = async (shareToken: string) => {
  const { data, error } = await supabase
    .from('essays')
    .select('*')
    .eq('share_token', shareToken)
    .eq('is_shared', true)
    .single();
  return { data, error };
};