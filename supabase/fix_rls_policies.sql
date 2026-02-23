-- Fix RLS policies to allow service role inserts
-- Run this in Supabase SQL Editor

-- Allow service role to insert books (bypasses RLS)
-- Note: Service role key should bypass RLS, but this ensures it works

-- First, check if we can disable RLS for service role operations
-- Actually, service role should bypass RLS automatically
-- But let's add a policy just in case

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role can insert books" ON public.books;
DROP POLICY IF EXISTS "Service role can update books" ON public.books;
DROP POLICY IF EXISTS "Service role can delete books" ON public.books;

-- Allow inserts (service role bypasses RLS, but this is a safety net)
-- Actually, let's check if RLS is the issue first
-- Service role should bypass RLS completely

-- Test: Try inserting directly in SQL Editor first
-- INSERT INTO public.books (title, author, domain, status)
-- VALUES ('Test Book', 'Test Author', ARRAY['Other'], 'available');

-- If that works, the issue is with the API connection, not RLS
