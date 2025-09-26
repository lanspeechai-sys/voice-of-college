import { supabase } from './supabase';

interface NotificationRequest {
  type: 'trial_ending' | 'subscription_ending' | 'payment_failed' | 'usage_limit_reached' | 'welcome';
  user_id: string;
  user_email: string;
  user_name: string;
  subscription_plan?: string;
  days_until_expiry?: number;
  usage_data?: {
    essays_used: number;
    essays_limit: number;
    reviews_used: number;
    reviews_limit: number;
  };
}

export async function sendPlanReminderNotification(request: NotificationRequest) {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/plan-reminder-notifications`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to send notification');
    }

    const result = await response.json();
    console.log('Notification sent successfully:', result.emailId);
    return { success: true, emailId: result.emailId };
  } catch (error) {
    console.error('Error sending plan reminder notification:', error);
    throw error;
  }
}

// Helper function to check if user needs usage limit notification
export async function checkAndNotifyUsageLimit(userId: string) {
  try {
    // Get user profile and usage data
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !profile) {
      console.error('Error fetching user profile for usage check:', error);
      return;
    }

    // Get user email from auth
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
    if (userError || !user) {
      console.error('Error fetching user for usage notification:', userError);
      return;
    }

    const { essays_generated, human_reviews_used, plan_limits, subscription_plan } = profile;
    
    // Check if user has reached limits (only for free plan)
    if (subscription_plan === 'free') {
      const essayLimitReached = essays_generated >= plan_limits.essays;
      const reviewLimitReached = plan_limits.human_reviews > 0 && human_reviews_used >= plan_limits.human_reviews;
      
      if (essayLimitReached || reviewLimitReached) {
        await sendPlanReminderNotification({
          type: 'usage_limit_reached',
          user_id: userId,
          user_email: user.email!,
          user_name: profile.full_name || user.email!,
          subscription_plan,
          usage_data: {
            essays_used: essays_generated,
            essays_limit: plan_limits.essays,
            reviews_used: human_reviews_used,
            reviews_limit: plan_limits.human_reviews,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error in checkAndNotifyUsageLimit:', error);
  }
}

// Helper function to send welcome email for new users
export async function sendWelcomeNotification(userId: string, userEmail: string, userName: string) {
  try {
    await sendPlanReminderNotification({
      type: 'welcome',
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
    });
  } catch (error) {
    console.error('Error sending welcome notification:', error);
    // Don't throw error as this shouldn't block user registration
  }
}