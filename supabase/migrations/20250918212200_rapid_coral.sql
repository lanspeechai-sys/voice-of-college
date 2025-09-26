/*
  # Fix User Profiles RLS Policies

  1. Security Updates
    - Drop existing restrictive policies on `user_profiles` table
    - Create proper RLS policies for authenticated users to:
      - SELECT their own profile data
      - INSERT their own profile (for signup)
      - UPDATE their own profile data
    - Ensure service_role can still insert profiles for new users

  2. Changes
    - Enable RLS on user_profiles table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to create their own profile
    - Add policy for authenticated users to update their own profile
    - Keep service_role insert policy for automated profile creation
*/

-- Enable Row Level Security for the user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;

-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view their own profile" ON user_profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to create their own profile
CREATE POLICY "Users can create their own profile" ON user_profiles
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile" ON user_profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow service role to insert profiles (for automated profile creation)
CREATE POLICY "Service role can insert profiles" ON user_profiles
FOR INSERT 
TO service_role
WITH CHECK (true);