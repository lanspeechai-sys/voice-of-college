import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    const { record } = await req.json();
    
    if (!record || record.review_status !== 'completed') {
      return new Response('Not a completed review', { status: 200, headers: corsHeaders });
    }

    console.log('Processing review completion notification for:', record.id);

    // Fetch the essay and user details
    const { data: essay, error: essayError } = await supabase
      .from('essays')
      .select(`
        *,
        user_profiles!inner(full_name, user_id)
      `)
      .eq('id', record.essay_id)
      .single();

    if (essayError || !essay) {
      console.error('Error fetching essay:', essayError);
      return new Response('Essay not found', { status: 404, headers: corsHeaders });
    }

    // Get user email from auth.users
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(essay.user_profiles.user_id);
    
    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return new Response('User not found', { status: 404, headers: corsHeaders });
    }

    // Send email notification using Resend
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response('Email service not configured', { status: 500, headers: corsHeaders });
    }

    const emailData = {
      from: 'Splennet <noreply@splennet.com>',
      to: [user.email],
      subject: `Your Essay Review is Complete - ${essay.school}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Your Essay Review is Ready!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Hi ${essay.user_profiles.full_name},
            </p>
            
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Great news! Our professional admissions counselor has completed the review of your essay for <strong>${essay.school}</strong>.
            </p>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h3 style="color: #166534; margin-top: 0; margin-bottom: 15px;">Professional Feedback:</h3>
              <div style="color: #166534; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">
${record.reviewer_feedback}
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SITE_URL') || 'https://splennet.com'}/dashboard" 
                 style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                View Your Essay & Feedback
              </a>
            </div>

            <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>Next Steps:</strong> Use this feedback to refine your essay and make it even stronger. You can request additional reviews if needed.
              </p>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
              Thank you for choosing Splennet for your college application journey. We're here to help you succeed!
            </p>
            
            <p style="font-size: 14px; color: #6b7280;">
              Best regards,<br>
              The Splennet Team
            </p>
          </div>

          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p>© 2024 Splennet. All rights reserved.</p>
            <p>This email was sent because you requested a professional essay review.</p>
          </div>
        </div>
      `,
    };

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
    console.log('Review completion email sent successfully:', emailResult.id);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in notify-user-review-complete function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});