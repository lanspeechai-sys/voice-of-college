/*
  # Create essays table for EssayAI application

  1. New Tables
    - `essays`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `school` (text, target school name)
      - `prompt` (text, essay prompt)
      - `responses` (jsonb, student responses to questions)
      - `generated_essay` (text, AI-generated essay content)
      - `created_at` (timestamptz, creation timestamp)
      - `updated_at` (timestamptz, last update timestamp)
      - `is_shared` (boolean, sharing status)
      - `share_token` (uuid, unique sharing token)

  2. Security
    - Enable RLS on `essays` table
    - Add policies for authenticated users to manage their own essays
    - Add policy for public access to shared essays via share_token

  3. Indexes
    - Index on user_id for fast user essay queries
    - Index on share_token for shared essay access
*/

-- Create essays table
CREATE TABLE IF NOT EXISTS essays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  school text NOT NULL,
  prompt text NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}',
  generated_essay text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_shared boolean DEFAULT false,
  share_token uuid DEFAULT gen_random_uuid()
);

-- Enable Row Level Security
ALTER TABLE essays ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS essays_user_id_idx ON essays(user_id);
CREATE INDEX IF NOT EXISTS essays_share_token_idx ON essays(share_token);
CREATE INDEX IF NOT EXISTS essays_created_at_idx ON essays(created_at DESC);

-- RLS Policies

-- Users can view their own essays
CREATE POLICY "Users can view own essays"
  ON essays
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own essays
CREATE POLICY "Users can insert own essays"
  ON essays
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own essays
CREATE POLICY "Users can update own essays"
  ON essays
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own essays
CREATE POLICY "Users can delete own essays"
  ON essays
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public can view shared essays via share_token
CREATE POLICY "Public can view shared essays"
  ON essays
  FOR SELECT
  TO anon
  USING (is_shared = true AND share_token IS NOT NULL);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_essays_updated_at ON essays;
CREATE TRIGGER update_essays_updated_at
  BEFORE UPDATE ON essays
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();