-- =============================================================================
-- DeepTrust-Edu — Database Schema
-- Run this in Supabase SQL Editor to create the table
-- =============================================================================

CREATE TABLE IF NOT EXISTS students_evaluation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name TEXT NOT NULL,
  story_mode TEXT NOT NULL DEFAULT 'Story D',
  score_verification INTEGER NOT NULL DEFAULT 0,
  score_deepfake INTEGER NOT NULL DEFAULT 0,
  score_financial INTEGER NOT NULL DEFAULT 0,
  evaluation_note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (allow all for demo)
ALTER TABLE students_evaluation ENABLE ROW LEVEL SECURITY;

-- Policy: allow anonymous read/insert (for demo purposes)
CREATE POLICY "Allow anonymous read" ON students_evaluation
  FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert" ON students_evaluation
  FOR INSERT WITH CHECK (true);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE students_evaluation;
