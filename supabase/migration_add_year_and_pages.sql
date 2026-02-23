-- Add year published and page count to books
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste and Run

alter table public.books
  add column if not exists year_published integer,
  add column if not exists page_count integer;
