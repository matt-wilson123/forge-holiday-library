# Production Readiness Checklist

## ✅ Pre-Deployment Steps

### 1. Database Setup ✓
- [x] Schema applied (`supabase/schema.sql`)
- [x] Migration run to remove `badge_id` column (`supabase/migration_remove_badge_id.sql`)
- [ ] Seed data added (optional, via Admin UI or `supabase/seed.sql`)

### 2. Environment Variables
Set these in **Vercel Dashboard → Settings → Environment Variables**:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Where to find these:**
- Supabase Dashboard → Settings → API
- Copy the Project URL and anon/public key
- Copy the service_role key (keep this secret!)

### 3. Admin Authentication ⚠️ **CRITICAL**

**Current State:** Admin mode is a client-side toggle (NOT SECURE for production)

**Options:**

**Option A: Keep Simple (Quick Launch)**
- Accept that anyone can toggle admin mode
- Only use in trusted office environment
- Document that admin features are not secured

**Option B: Implement Real Auth (Recommended)**
- Create admin login page
- Use Supabase Auth
- Protect admin API routes
- See "Admin Auth Implementation" section below

### 4. Build & Test Locally

```bash
# Install dependencies
npm install

# Test build
npm run build

# Test production build locally
npm start
```

Verify:
- [ ] App builds without errors
- [ ] Books load correctly
- [ ] Borrow/return flows work
- [ ] Admin features work (if using toggle)

### 5. Deploy to Vercel

**Option A: Via GitHub (Recommended)**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel auto-detects Next.js
5. Add environment variables (step 2 above)
6. Deploy!

**Option B: Via CLI**
```bash
npm i -g vercel
vercel
# Follow prompts, add env vars when asked
```

**Vercel Settings:**
- Framework: Next.js (auto-detected)
- Build Command: `npm run build` (default)
- Output Directory: `.next` (default)
- Install Command: `npm install` (default)

### 6. Post-Deployment Testing

After deployment, test:

- [ ] App loads at your Vercel URL
- [ ] Books display correctly
- [ ] Can borrow a book (select colleague → confirm)
- [ ] Can return a book (select colleague → confirm)
- [ ] Admin toggle works (if using)
- [ ] Can add a book via Admin → Add
- [ ] Can edit a book via Admin → Edit
- [ ] Can manage colleagues via Admin → People

### 7. Domain Setup (Optional)

If you want a custom domain:
1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS instructions

---

## 🔒 Admin Authentication Implementation

If you want to secure admin features, implement this:

### Step 1: Create Admin Login Page

Create `app/admin/login/page.tsx` with Supabase Auth login form.

### Step 2: Create Middleware

Create `middleware.ts` to protect admin routes.

### Step 3: Update BooksApp

Check auth state instead of client-side toggle.

**Note:** This requires additional development time. For a quick launch, you can deploy with the toggle and add auth later.

---

## 📋 Quick Launch Checklist

**Minimum for production:**

1. ✅ Database schema applied
2. ✅ Migration run (remove badge_id)
3. ⚠️ Environment variables set in Vercel
4. ⚠️ Build succeeds (`npm run build`)
5. ⚠️ Deploy to Vercel
6. ⚠️ Test core flows (borrow/return)
7. ⚠️ Document admin toggle limitation (if not implementing auth)

**Recommended additions:**

8. ⚠️ Implement admin authentication
9. ⚠️ Add error tracking (Sentry)
10. ⚠️ Set up monitoring (Vercel Analytics)
11. ⚠️ Add rate limiting to API routes
12. ⚠️ Custom domain setup

---

## 🚨 Known Limitations

1. **Admin Toggle is Client-Side**
   - Anyone can enable admin mode
   - OK for trusted office environment
   - Not secure for public-facing app

2. **No Rate Limiting**
   - API endpoints can be spammed
   - Consider adding Vercel Edge Config or Upstash Redis

3. **No Error Tracking**
   - Errors logged to console only
   - Consider adding Sentry for production

---

## 📝 Post-Launch Tasks

1. Monitor error logs (Vercel Dashboard → Logs)
2. Check Supabase Dashboard for database issues
3. Gather user feedback
4. Plan admin auth implementation if needed
5. Consider adding analytics (Vercel Analytics or Google Analytics)

---

## 🆘 Troubleshooting

### Build Fails
- Check environment variables are set
- Check `npm install` completed successfully
- Review build logs in Vercel

### Database Errors
- Verify schema is applied correctly
- Check migration was run
- Verify environment variables are correct

### API Errors
- Check Supabase service role key is correct
- Verify RLS policies allow reads
- Check API route logs in Vercel

### Admin Features Don't Work
- Verify admin toggle is enabled
- Check browser console for errors
- Verify API routes are accessible
