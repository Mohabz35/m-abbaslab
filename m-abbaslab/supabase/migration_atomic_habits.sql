-- Migration: Add Atomic Habits columns to discipline_habits
-- Run this in Supabase SQL Editor

ALTER TABLE discipline_habits
ADD COLUMN IF NOT EXISTS scorecard INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS cue TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS stack_after TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS two_minute_rule BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS time_spent INTEGER DEFAULT 0;

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'discipline_habits'
AND column_name IN ('scorecard', 'cue', 'stack_after', 'two_minute_rule', 'time_spent')
ORDER BY column_name;
