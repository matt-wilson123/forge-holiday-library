# How to Check the 500 Error Details

## Method 1: Browser Developer Tools (Easiest)

1. **Open Developer Tools**
   - Press `F12` or right-click → Inspect
   - Go to **Network** tab

2. **Clear the network log** (click the 🚫 icon)

3. **Try adding a book**
   - Click "+ Add" button
   - Fill in book details
   - Click "Add Book"

4. **Find the failed request**
   - Look for `/api/books` in red
   - Click on it

5. **Check the Response tab**
   - You'll see the actual error message
   - Look for:
     - `"error": "..."` - The main error message
     - `"details": "..."` - Database error details
     - `"hint": "..."` - Database hints

## Method 2: Vercel Logs (Most Detailed)

1. Go to **Vercel Dashboard** → Your Project
2. Click **Logs** tab
3. Try adding a book again
4. Look for errors in the logs
5. You'll see the full stack trace and error details

## Method 3: Check Environment Variables

The 500 error is most likely due to missing environment variables.

### In Vercel:
1. Go to **Settings** → **Environment Variables**
2. Check if these exist:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### If Missing:
1. Go to **Supabase Dashboard** → **Settings** → **API**
2. Copy:
   - **Project URL** → Paste as `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (NOT anon key) → Paste as `SUPABASE_SERVICE_ROLE_KEY`
3. **Redeploy** your project

## Common Error Messages

### "Missing Supabase URL" or "Missing service role key"
→ **Fix:** Add environment variables in Vercel and redeploy

### "permission denied" or "new row violates row-level security"
→ **Fix:** Check RLS policies or verify you're using service_role key

### "column does not exist"
→ **Fix:** Run `supabase/schema.sql` in Supabase SQL Editor

### "relation does not exist"
→ **Fix:** The `books` table doesn't exist - run the schema

## Quick Test

After fixing environment variables, test the connection:

1. Go to your Vercel deployment
2. Open browser console (F12)
3. Run this in the console:
```javascript
fetch('/api/books', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    title: 'Test Book',
    author: 'Test Author',
    domains: ['Other']
  })
}).then(r => r.json()).then(console.log).catch(console.error);
```

This will show you the exact error message.
