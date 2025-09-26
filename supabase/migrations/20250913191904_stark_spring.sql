/*
  # Add database trigger for review notifications

  1. Database Trigger
    - Creates a trigger that calls the send-review-notification edge function
    - Triggers on INSERT to human_reviews table
    - Sends email notification to review team

  2. Security
    - Uses service role to call edge function
    - Ensures notifications are sent for all new reviews
*/

-- Create a function to call the edge function
CREATE OR REPLACE FUNCTION notify_review_team()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the edge function asynchronously
  PERFORM
    net.http_post(
      url := (SELECT CONCAT(current_setting('app.supabase_url'), '/functions/v1/send-review-notification')),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', CONCAT('Bearer ', current_setting('app.service_role_key'))
      ),
      body := jsonb_build_object('record', to_jsonb(NEW))
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_human_review_created ON human_reviews;
CREATE TRIGGER on_human_review_created
  AFTER INSERT ON human_reviews
  FOR EACH ROW
  EXECUTE FUNCTION notify_review_team();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;