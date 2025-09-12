/*
  # Complete EssayAI Database Schema

  1. New Tables
    - `user_profiles` - Extended user information with subscription details
    - `essays` - Essay storage with review functionality
    - `human_reviews` - Professional review tracking
    - `usage_tracking` - Track user plan usage

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for data access
    - Secure user data isolation

  3. Features
    - Subscription plan management
    - Usage tracking and limits
    - Human review workflow
    - Essay sharing capabilities
*/

-- Create user profiles table for extended user data
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name text NOT NULL,
  subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free', 'monthly', 'yearly')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
  subscription_expires_at timestamptz,
  essays_generated integer DEFAULT 0,
  human_reviews_used integer DEFAULT 0,
  plan_limits jsonb DEFAULT '{"essays": 1, "human_reviews": 0}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create essays table
CREATE TABLE IF NOT EXISTS essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  school text NOT NULL,
  prompt text NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_essay text NOT NULL,
  review_status text CHECK (review_status IN ('pending', 'in_review', 'completed')),
  human_review text,
  review_requested_at timestamptz,
  is_shared boolean DEFAULT false,
  share_token uuid DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create human reviews table
CREATE TABLE IF NOT EXISTS human_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  essay_id uuid REFERENCES essays(id) ON DELETE CASCADE,
  reviewer_id uuid, -- For future reviewer assignment
  review_content text,
  feedback_areas jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  submitted_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL CHECK (action_type IN ('essay_generated', 'human_review_requested')),
  essay_id uuid REFERENCES essays(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS essays_user_id_idx ON essays(user_id);
CREATE INDEX IF NOT EXISTS essays_created_at_idx ON essays(created_at DESC);
CREATE INDEX IF NOT EXISTS essays_share_token_idx ON essays(share_token);
CREATE INDEX IF NOT EXISTS human_reviews_essay_id_idx ON human_reviews(essay_id);
CREATE INDEX IF NOT EXISTS usage_tracking_user_id_idx ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS usage_tracking_created_at_idx ON usage_tracking(created_at DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;
ALTER TABLE human_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Essays Policies
CREATE POLICY "Users can view own essays" ON essays
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Public can view shared essays" ON essays
  FOR SELECT USING (is_shared = true AND share_token IS NOT NULL);

CREATE POLICY "Users can insert own essays" ON essays
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own essays" ON essays
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own essays" ON essays
  FOR DELETE USING (auth.uid() = user_id);

-- Human Reviews Policies
CREATE POLICY "Users can view reviews for own essays" ON human_reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM essays 
      WHERE essays.id = human_reviews.essay_id 
      AND essays.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reviews for own essays" ON human_reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM essays 
      WHERE essays.id = human_reviews.essay_id 
      AND essays.user_id = auth.uid()
    )
  );

-- Usage Tracking Policies
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_essays_updated_at 
  BEFORE UPDATE ON essays 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, subscription_plan, plan_limits)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'subscription_plan', 'free'),
    CASE 
      WHEN COALESCE(new.raw_user_meta_data->>'subscription_plan', 'free') = 'monthly' 
      THEN '{"essays": -1, "human_reviews": 5}'::jsonb
      WHEN COALESCE(new.raw_user_meta_data->>'subscription_plan', 'free') = 'yearly' 
      THEN '{"essays": -1, "human_reviews": 20}'::jsonb
      ELSE '{"essays": 1, "human_reviews": 0}'::jsonb
    END
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();