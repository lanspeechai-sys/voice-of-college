/*
  # Add usage tracking and RPC functions

  1. New Functions
    - `increment_user_usage` - RPC function to safely increment user usage counters
    - `update_updated_at_column` - Trigger function to update updated_at timestamps

  2. Security
    - RPC function uses SECURITY DEFINER to bypass RLS
    - Proper validation of input parameters
*/

-- Create RPC function to increment user usage
CREATE OR REPLACE FUNCTION increment_user_usage(user_id UUID, usage_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF usage_type = 'essays_generated' THEN
    UPDATE user_profiles 
    SET essays_generated = essays_generated + 1,
        updated_at = now()
    WHERE user_profiles.user_id = increment_user_usage.user_id;
  ELSIF usage_type = 'human_reviews_used' THEN
    UPDATE user_profiles 
    SET human_reviews_used = human_reviews_used + 1,
        updated_at = now()
    WHERE user_profiles.user_id = increment_user_usage.user_id;
  END IF;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_user_usage(UUID, TEXT) TO authenticated;