# Quick Database Test

## Test 1: Can you insert a book directly?

Run this in **Supabase SQL Editor**:

```sql
INSERT INTO public.books (title, author, domain, status)
VALUES ('Test Book', 'Test Author', ARRAY['Other'], 'available')
RETURNING *;
```

**If this works:** The database is fine, the issue is with the API connection or environment variables.

**If this fails:** You'll see the exact error message - share it with me.

## Test 2: Check if owner_id exists

Run this (replace with your actual owner_id):

```sql
SELECT id, name, email 
FROM public.colleagues 
WHERE id = '3d07b26e-c6be-4f80-94fc-464a4207a595';
```

**If no rows returned:** The owner_id doesn't exist - that's the problem!

**If row returned:** Owner exists, so that's not the issue.

## Test 3: Check environment variables

After deploying the updated code, check **Vercel Logs**:

1. Vercel Dashboard → Your Project → **Logs**
2. Try adding a book
3. Look for logs starting with:
   - "Received book data:"
   - "Connection test successful"
   - "=== SUPABASE ERROR ==="

These will show you exactly what's happening.

## Most Likely Issue

Based on your error, it's probably one of these:

1. **Owner ID doesn't exist** - The UUID `3d07b26e-c6be-4f80-94fc-464a4207a595` might not be in the colleagues table
2. **RLS blocking insert** - Even with service role (unlikely but possible)
3. **Environment variables wrong** - Service role key might be incorrect

## Quick Fix: Try without owner

Try adding a book **without** selecting an owner (leave "Gifted By" as "Office Library"). If that works, the issue is the owner_id foreign key constraint.
