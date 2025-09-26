/*
  # Fix user_profiles INSERT policy for new user signup

  1. Security Changes
    - Update RLS policy to allow authenticated users to insert their own profile
    - Ensure users can create profiles during signup process
    - Fix the policy target role from 'public' to 'authenticated'

  2. Policy Updates
    - Modify existing INSERT policy to use proper authentication check
    - Ensure policy allows profile creation during user registration
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create a new INSERT policy that allows authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Also ensure we have a policy for unauthenticated users during the signup process
-- This is needed because the profile is created immediately after user creation
CREATE POLICY "Allow profile creation during signup"
  ON user_profiles
  FOR INSERT
  TO anon
  WITH CHECK (true);