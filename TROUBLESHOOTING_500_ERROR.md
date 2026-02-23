# Troubleshooting 500 Error When Adding Books

## Common Causes

### 1. Missing Environment Variables ⚠️ **MOST LIKELY**

**Check in Vercel:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify these are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

**If missing:**
- Go to Supabase Dashboard → Settings → API
- Copy Project URL → set as `NEXT_PUBLIC_SUPABASE_URL`
- Copy service_role key → set as `SUPABASE_SERVICE_ROLE_KEY`
- **Redeploy** after adding variables

### 2. Database Schema Issues

**Check if books table exists:**
Run in Supabase SQL Editor:
```sql
SELECT * FROM books LIMIT 1;
```

**If error, apply schema:**
Run `supabase/schema.sql` in Supabase SQL Editor

### 3. RLS (Row Level Security) Policies

**Check RLS policies:**
```sql
SELECT * FROM pg_policies WHERE tablename = 'books';
```

**If no policies allow inserts:**
The service role key should bypass RLS, but verify:
- Service role key is correct
- Not using anon key by mistake

### 4. Missing Columns

**Check table structure:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'books';
```

**Required columns:**
- `id` (uuid)
- `title` (text)
- `author` (text)
- `cover_url` (text, nullable)
- `synopsis` (text, nullable)
- `domain` (text[], default '{}')
- `status` (book_status enum)
- `owner_id` (uuid, nullable)
- `created_at` (timestamptz)

## How to Debug

### Step 1: Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for errors when clicking "Add Book"
3. Check for "Missing Supabase URL" or "Missing service role key"

### Step 2: Check Browser Console
1. Open Developer Tools (F12)
2. Go to Network tab
3. Click "Add Book"
4. Click on the failed `/api/books` request
5. Check Response tab for error details

### Step 3: Test Database Connection
Run in Supabase SQL Editor:
```sql
-- Test insert
INSERT INTO books (title, author, domain, status)
VALUES ('Test Book', 'Test Author', ARRAY['Other'], 'available')
RETURNING *;
```

If this works, the issue is with the API connection, not the database.

### Step 4: Verify Environment Variables
Add this temporary debug endpoint to check:

Create `app/api/debug/route.ts`:
```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || "missing"
  });
}
```

Visit `/api/debug` to see if env vars are loaded.

## Quick Fixes

### Fix 1: Re-add Environment Variables
1. Vercel Dashboard → Settings → Environment Variables
2. Delete and re-add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy

### Fix 2: Check Service Role Key
- Must be the **service_role** key, not the **anon** key
- Found in Supabase Dashboard → Settings → API → service_role key

### Fix 3: Verify Database Schema
Run this to ensure table exists:
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'books'
);
```

## Still Not Working?

Check the actual error message in:
1. **Vercel Logs** (most detailed)
2. **Browser Network tab** → Response
3. **Supabase Dashboard** → Logs → API Logs

The error message will tell you exactly what's wrong!
