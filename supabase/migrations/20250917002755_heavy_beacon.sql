/*
  # Create notification triggers for plan reminders

  1. New Functions
    - `check_subscription_expiry()` - Function to check for expiring subscriptions
    - `notify_payment_failure()` - Function to handle payment failure notifications
  
  2. Triggers
    - Trigger on stripe_subscriptions updates for payment failures
    - Scheduled function calls for subscription expiry checks
  
  3. Security
    - Functions use service role permissions
    - Proper error handling and logging
*/

-- Function to check for expiring subscriptions (to be called by a cron job)
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_record RECORD;
  user_record RECORD;
  days_until_expiry INTEGER;
BEGIN
  -- Check for subscriptions expiring in 7 days, 3 days, and 1 day
  FOR subscription_record IN 
    SELECT s.*, c.user_id
    FROM stripe_subscriptions s
    JOIN stripe_customers c ON s.customer_id = c.customer_id
    WHERE s.status = 'active'
    AND s.current_period_end IS NOT NULL
    AND s.current_period_end BETWEEN 
      EXTRACT(EPOCH FROM NOW())::bigint 
      AND EXTRACT(EPOCH FROM NOW() + INTERVAL '7 days')::bigint
  LOOP
    -- Calculate days until expiry
    days_until_expiry := CEIL((subscription_record.current_period_end - EXTRACT(EPOCH FROM NOW())) / 86400);
    
    -- Only send notifications for 7, 3, and 1 day warnings
    IF days_until_expiry IN (7, 3, 1) THEN
      -- Get user details
      SELECT up.full_name, au.email INTO user_record
      FROM user_profiles up
      JOIN auth.users au ON up.user_id = au.id
      WHERE up.user_id = subscription_record.user_id;
      
      IF FOUND THEN
        -- Call the edge function to send notification
        PERFORM net.http_post(
          url := current_setting('app.supabase_url') || '/functions/v1/plan-reminder-notifications',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key')
          ),
          body := jsonb_build_object(
            'type', 'subscription_ending',
            'user_id', subscription_record.user_id,
            'user_email', user_record.email,
            'user_name', COALESCE(user_record.full_name, user_record.email),
            'subscription_plan', CASE 
              WHEN subscription_record.price_id LIKE '%yearly%' THEN 'Yearly Pro'
              WHEN subscription_record.price_id LIKE '%monthly%' THEN 'Monthly Pro'
              ELSE 'Pro Plan'
            END,
            'days_until_expiry', days_until_expiry
          )
        );
        
        RAISE LOG 'Sent subscription expiry notification for user % (% days)', subscription_record.user_id, days_until_expiry;
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- Function to handle payment failure notifications
CREATE OR REPLACE FUNCTION notify_payment_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Only trigger on status change to past_due or incomplete
  IF OLD.status != NEW.status AND NEW.status IN ('past_due', 'incomplete') THEN
    -- Get user details
    SELECT up.full_name, au.email, c.user_id INTO user_record
    FROM stripe_customers c
    JOIN user_profiles up ON c.user_id = up.user_id
    JOIN auth.users au ON up.user_id = au.id
    WHERE c.customer_id = NEW.customer_id;
    
    IF FOUND THEN
      -- Call the edge function to send notification
      PERFORM net.http_post(
        url := current_setting('app.supabase_url') || '/functions/v1/plan-reminder-notifications',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.service_role_key')
        ),
        body := jsonb_build_object(
          'type', 'payment_failed',
          'user_id', user_record.user_id,
          'user_email', user_record.email,
          'user_name', COALESCE(user_record.full_name, user_record.email),
          'subscription_plan', CASE 
            WHEN NEW.price_id LIKE '%yearly%' THEN 'Yearly Pro'
            WHEN NEW.price_id LIKE '%monthly%' THEN 'Monthly Pro'
            ELSE 'Pro Plan'
          END
        )
      );
      
      RAISE LOG 'Sent payment failure notification for user %', user_record.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for payment failure notifications
DROP TRIGGER IF EXISTS trigger_payment_failure_notification ON stripe_subscriptions;
CREATE TRIGGER trigger_payment_failure_notification
  AFTER UPDATE ON stripe_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION notify_payment_failure();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_subscription_expiry() TO service_role;
GRANT EXECUTE ON FUNCTION notify_payment_failure() TO service_role;

-- Note: To set up the cron job for subscription expiry checks, you would need to:
-- 1. Use pg_cron extension (if available in your Supabase project)
-- 2. Or set up an external cron job that calls the check_subscription_expiry function
-- 3. Or use Supabase's scheduled functions feature

-- Example cron job setup (if pg_cron is available):
-- SELECT cron.schedule('check-subscription-expiry', '0 9 * * *', 'SELECT check_subscription_expiry();');