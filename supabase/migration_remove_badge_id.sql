-- Migration to remove badge_id column from colleagues table
-- Run this in your Supabase SQL Editor if you're getting errors when creating colleagues

-- Step 1: Drop the unique constraint on badge_id if it exists
alter table public.colleagues drop constraint if exists colleagues_badge_id_key;

-- Step 2: Drop any foreign key constraints that reference badge_id (if any)
-- (Usually there aren't any, but just in case)

-- Step 3: Drop the column (this will also remove the NOT NULL constraint)
alter table public.colleagues drop column if exists badge_id;

-- Verify the column is gone (this should return 0 rows if successful)
select column_name 
from information_schema.columns 
where table_schema = 'public' 
  and table_name = 'colleagues' 
  and column_name = 'badge_id';
