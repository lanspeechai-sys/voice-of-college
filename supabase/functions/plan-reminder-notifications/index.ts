import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const SITE_URL = Deno.env.get('SITE_URL') || 'https://splennet.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationData {
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

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const notificationData: NotificationData = await req.json();
    
    if (!notificationData.type || !notificationData.user_email) {
      return new Response('Missing required notification data', { status: 400, headers: corsHeaders });
    }

    console.log('Processing plan reminder notification:', notificationData.type, 'for user:', notificationData.user_email);

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response('Email service not configured', { status: 500, headers: corsHeaders });
    }

    const emailData = generateEmailContent(notificationData);
    
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Failed to send email:', errorText);
      return new Response('Failed to send email notification', { status: 500, headers: corsHeaders });
    }

    const emailResult = await emailResponse.json();
    console.log('Plan reminder email sent successfully:', emailResult.id);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in plan-reminder-notifications function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateEmailContent(data: NotificationData) {
  const baseEmailData = {
    from: 'Splennet <noreply@splennet.com>',
    to: [data.user_email],
  };

  switch (data.type) {
    case 'welcome':
      return {
        ...baseEmailData,
        subject: 'Welcome to Splennet - Your AI Essay Assistant is Ready!',
        html: generateWelcomeEmail(data),
      };

    case 'trial_ending':
      return {
        ...baseEmailData,
        subject: `Your Free Essay is Almost Used - Upgrade to Continue`,
        html: generateTrialEndingEmail(data),
      };

    case 'subscription_ending':
      return {
        ...baseEmailData,
        subject: `Your Splennet Subscription Expires in ${data.days_until_expiry} Days`,
        html: generateSubscriptionEndingEmail(data),
      };

    case 'payment_failed':
      return {
        ...baseEmailData,
        subject: 'Payment Failed - Action Required for Your Splennet Account',
        html: generatePaymentFailedEmail(data),
      };

    case 'usage_limit_reached':
      return {
        ...baseEmailData,
        subject: 'You\'ve Reached Your Plan Limit - Upgrade to Continue',
        html: generateUsageLimitEmail(data),
      };

    default:
      throw new Error(`Unknown notification type: ${data.type}`);
  }
}

function generateWelcomeEmail(data: NotificationData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Splennet!</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Hi ${data.user_name},
        </p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Welcome to Splennet! We're excited to help you craft compelling college application essays that showcase your unique voice and story.
        </p>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0; margin-bottom: 15px;">🎉 You're all set with 1 free essay!</h3>
          <ul style="color: #166534; margin: 0; padding-left: 20px;">
            <li>AI-powered essay generation</li>
            <li>Voice input support</li>
            <li>Download and copy functionality</li>
            <li>Community support</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/essay-builder" 
             style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Create Your First Essay
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          Need help getting started? Check out our features or contact our support team.
        </p>
      </div>
    </div>
  `;
}

function generateTrialEndingEmail(data: NotificationData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Don't Miss Out!</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Hi ${data.user_name},
        </p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          You've used your free essay! To continue creating compelling college application essays, upgrade to one of our Pro plans.
        </p>

        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0; margin-bottom: 15px;">⚡ Upgrade Benefits:</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            <li><strong>Unlimited essays</strong> - Create as many as you need</li>
            <li><strong>Human reviews</strong> - Professional feedback from admissions counselors</li>
            <li><strong>Priority support</strong> - Get help when you need it</li>
            <li><strong>Advanced features</strong> - Voice input, sharing, and more</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/pricing" 
             style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 10px;">
            Upgrade to Pro
          </a>
          <a href="${SITE_URL}/dashboard" 
             style="background: transparent; color: #3b82f6; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; border: 2px solid #3b82f6;">
            View Dashboard
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          Questions? Reply to this email or contact our support team.
        </p>
      </div>
    </div>
  `;
}

function generateSubscriptionEndingEmail(data: NotificationData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f59e0b, #3b82f6); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Subscription Reminder</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Hi ${data.user_name},
        </p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Your ${data.subscription_plan} subscription will expire in ${data.days_until_expiry} days. Don't lose access to unlimited essays and human reviews!
        </p>

        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0; margin-bottom: 15px;">📅 Renewal Reminder:</h3>
          <p style="color: #92400e; margin: 0;">
            Your subscription will automatically renew unless you cancel before the expiration date. 
            You can manage your subscription anytime in your account settings.
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/subscription-management" 
             style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 10px;">
            Manage Subscription
          </a>
          <a href="${SITE_URL}/essay-builder" 
             style="background: transparent; color: #3b82f6; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; border: 2px solid #3b82f6;">
            Create New Essay
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          Thank you for being a valued Splennet user!
        </p>
      </div>
    </div>
  `;
}

function generatePaymentFailedEmail(data: NotificationData): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Payment Issue</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Hi ${data.user_name},
        </p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          We were unable to process your payment for your Splennet subscription. To avoid any interruption in service, please update your payment method.
        </p>

        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #dc2626; margin-top: 0; margin-bottom: 15px;">⚠️ Action Required:</h3>
          <ul style="color: #dc2626; margin: 0; padding-left: 20px;">
            <li>Update your payment method to continue service</li>
            <li>Your account will be downgraded to free if payment isn't resolved</li>
            <li>You'll lose access to unlimited essays and human reviews</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/subscription-management" 
             style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 10px;">
            Update Payment Method
          </a>
          <a href="${SITE_URL}/pricing" 
             style="background: transparent; color: #dc2626; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; border: 2px solid #dc2626;">
            View Plans
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          Need help? Contact our support team at support@splennet.com
        </p>
      </div>
    </div>
  `;
}

function generateUsageLimitEmail(data: NotificationData): string {
  const { usage_data } = data;
  const isEssayLimit = usage_data && usage_data.essays_used >= usage_data.essays_limit;
  const isReviewLimit = usage_data && usage_data.reviews_used >= usage_data.reviews_limit;

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #f59e0b, #3b82f6); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Usage Limit Reached</h1>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          Hi ${data.user_name},
        </p>
        
        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
          You've reached your ${isEssayLimit ? 'essay generation' : 'human review'} limit on your current plan. 
          Upgrade to Pro to continue creating unlimited essays and getting professional feedback.
        </p>

        ${usage_data ? `
        <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0; margin-bottom: 15px;">📊 Your Usage:</h3>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #6b7280;">Essays Generated:</span>
            <span style="color: #374151; font-weight: 600;">${usage_data.essays_used} / ${usage_data.essays_limit === -1 ? '∞' : usage_data.essays_limit}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #6b7280;">Human Reviews:</span>
            <span style="color: #374151; font-weight: 600;">${usage_data.reviews_used} / ${usage_data.reviews_limit === -1 ? '∞' : usage_data.reviews_limit}</span>
          </div>
        </div>
        ` : ''}

        <div style="background: #dbeafe; border: 1px solid #93c5fd; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1e40af; margin-top: 0; margin-bottom: 15px;">🚀 Upgrade Benefits:</h3>
          <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
            <li><strong>Unlimited essays</strong> - Create as many as you need</li>
            <li><strong>Human reviews</strong> - Professional feedback from counselors</li>
            <li><strong>Priority support</strong> - Get help when you need it</li>
            <li><strong>Advanced features</strong> - Voice input, sharing, and more</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${SITE_URL}/pricing" 
             style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; margin-right: 10px;">
            Upgrade Now
          </a>
          <a href="${SITE_URL}/dashboard" 
             style="background: transparent; color: #3b82f6; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; border: 2px solid #3b82f6;">
            View Dashboard
          </a>
        </div>

        <p style="font-size: 14px; color: #6b7280;">
          Questions about upgrading? Contact us at support@splennet.com
        </p>
      </div>
    </div>
  `;
}