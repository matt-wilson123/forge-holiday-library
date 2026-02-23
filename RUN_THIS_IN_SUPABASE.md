# Fix: "Could not find the 'page_count' column" error

Your database is missing the `year_published` and `page_count` columns on the `books` table.

## What to do

1. Open your **Supabase** project.
2. Go to **SQL Editor** (left sidebar).
3. Click **New query**.
4. Paste this SQL and click **Run**:

```sql
alter table public.books
  add column if not exists year_published integer,
  add column if not exists page_count integer;
```

5. You should see “Success. No rows returned.”  
6. Try **Add Book** again in the app; the error should be gone.
