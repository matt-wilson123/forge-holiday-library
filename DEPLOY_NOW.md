# 🚀 Deploy to Production - Quick Guide

## Step-by-Step Instructions

### 1. Database Migration (5 minutes)

Run this in Supabase SQL Editor to remove the old `badge_id` column:

```sql
-- Remove badge_id column
alter table public.colleagues drop constraint if exists colleagues_badge_id_key;
alter table public.colleagues drop column if exists badge_id;
```

### 2. Set Environment Variables in Vercel (5 minutes)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Create a new project (or use existing)
3. Go to **Settings → Environment Variables**
4. Add these three variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find these:**
- Supabase Dashboard → Settings → API
- Copy Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Copy anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy service_role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3. Deploy (5 minutes)

**Option A: GitHub (Recommended)**
1. Push your code to GitHub
2. In Vercel, click "Import Project"
3. Select your GitHub repo
4. Vercel auto-detects Next.js
5. Click "Deploy"
6. Wait 2-3 minutes

**Option B: CLI**
```bash
npm i -g vercel
vercel
# Follow prompts
```

### 4. Test (5 minutes)

After deployment:
1. Visit your Vercel URL
2. Test borrowing a book
3. Test returning a book
4. Toggle admin mode and test adding a book
5. Test managing colleagues

---

## ⚠️ Important Notes

### Admin Mode
- Currently a client-side toggle (anyone can enable it)
- **OK for trusted office environment**
- **NOT secure for public apps**
- You can implement real auth later if needed

### What Works Now
✅ Borrow/return books  
✅ Add/edit books  
✅ Manage colleagues  
✅ Search and filter  
✅ Mobile-responsive UI  

### What's Missing (Optional)
- Admin authentication (can add later)
- Rate limiting (can add later)
- Error tracking (can add later)

---

## 🎯 You're Ready!

If you've completed steps 1-4, your app is live and ready to use. The admin toggle limitation is fine for an internal office tool.

For full production hardening, see `PRODUCTION_CHECKLIST.md`.
