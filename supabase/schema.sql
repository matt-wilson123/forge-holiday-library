-- Supabase schema for Books by Forge

-- Enum for book status
create type public.book_status as enum ('available', 'borrowed');

-- Books table
create table public.books (
  id uuid primary key default gen_random_uuid(),
  isbn text,
  title text not null,
  author text not null,
  cover_url text,
  synopsis text,
  year_published integer,
  page_count integer,
  domain text[] not null default '{}',
  status public.book_status not null default 'available',
  owner_id uuid references public.colleagues(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Colleagues table
create table public.colleagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Loans table
create table public.loans (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  colleague_id uuid not null references public.colleagues(id) on delete cascade,
  borrowed_at timestamptz not null default now(),
  returned_at timestamptz,
  created_at timestamptz not null default now()
);

-- Profiles table for Supabase Auth roles
-- Links to auth.users and stores role: 'user' or 'admin'
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.books enable row level security;
alter table public.colleagues enable row level security;
alter table public.loans enable row level security;

-- Basic RLS policies (you can tighten these later)

-- Anyone (including unauthenticated) can read books
create policy "Public read books" on public.books
  for select
  using (true);

-- Anyone can read colleagues (used only to show borrower names)
create policy "Public read colleagues" on public.colleagues
  for select
  using (true);

-- Anyone can read loans (used for borrower info / overdue)
create policy "Public read loans" on public.loans
  for select
  using (true);

-- Only service role / admin API should write for now.
-- (Application will use SUPABASE_SERVICE_ROLE_KEY on the server.)

-- Profiles: logged-in user can read their own profile
create policy "Read own profile" on public.profiles
  for select
  using (auth.uid() = id);

