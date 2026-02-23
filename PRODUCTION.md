# Production Deployment Guide

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables
Ensure all required environment variables are set in your Vercel project:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Security Notes:**
- `SUPABASE_SERVICE_ROLE_KEY` must **never** be exposed to the client
- Only use it in API routes (`app/api/**`)
- Never commit `.env.local` to git

### 2. Database Setup

#### Apply Schema
Run `supabase/schema.sql` in your Supabase SQL Editor to create:
- `books` table with `owner_id` column
- `colleagues` table
- `loans` table
- `profiles` table for admin auth
- RLS policies

#### Migration for Existing Databases
If you already have a database, run this migration:

```sql
-- Add owner_id column if it doesn't exist
ALTER TABLE public.books 
ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.colleagues(id) ON DELETE SET NULL;
```

### 3. Admin Authentication Setup

#### Create Admin User
1. In Supabase Dashboard → Authentication → Users, create a new user with email/password
2. Note the user's UUID
3. Run this SQL to grant admin role:

```sql
INSERT INTO public.profiles (id, role)
VALUES ('USER_UUID_HERE', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

#### Admin Login Flow (To Be Implemented)
Currently, admin mode is a client-side toggle. For production, you should:
- Create `/app/admin/login/page.tsx` with Supabase Auth
- Protect admin routes with middleware
- Check `profiles.role === 'admin'` before showing admin UI

### 4. Adding Colleagues

**Option A: Via Admin UI**
1. Toggle Admin mode
2. Click "👥 People" button
3. Fill in name and email
4. Click "Add"

**Option B: Direct SQL**
```sql
INSERT INTO public.colleagues (name, email)
VALUES ('John Doe', 'john@example.com');
```

### 6. Deployment to Vercel

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Deploy
vercel

# Or connect your GitHub repo to Vercel for automatic deployments
```

**Vercel Settings:**
- Framework Preset: Next.js
- Root Directory: `.` (or your project root)
- Build Command: `npm run build`
- Output Directory: `.next`

### 7. Post-Deployment

#### Test Core Flows
1. Open the app on a mobile device
2. Try borrowing a book → select colleague → confirm
3. Try returning a book → select colleague → confirm

#### Test Admin Features
1. Toggle Admin mode (or implement real auth)
2. Add a book via Google Books search
3. Edit a book's synopsis/domains
4. Manage colleagues (add/edit/remove)

## 🔒 Security Considerations

### Current State
- ✅ API routes use service role key (server-side only)
- ✅ RLS policies allow public reads, restrict writes
- ⚠️ Admin toggle is client-side (not secure)
- ⚠️ No rate limiting on API endpoints

### Recommended Improvements

1. **Implement Real Admin Auth**
   - Use Supabase Auth with email/password
   - Check `profiles.role === 'admin'` on server-side
   - Protect admin API routes

2. **Add Rate Limiting**
   - Use Vercel Edge Config or Upstash Redis
   - Limit borrow/return actions per user

3. **Input Validation**
   - Sanitize all user inputs
   - Validate badge IDs format
   - Check ISBN format if validating

4. **Error Handling**
   - Don't expose internal errors to users
   - Log errors server-side
   - Use error tracking (Sentry, etc.)

## 👥 User Selection

Users select their name from a list when borrowing or returning books:
- Modal shows all colleagues
- User taps their name
- Confirms the action
- System uses colleague ID for the API call

## 🐛 Troubleshooting

### Camera Not Opening
- Check browser permissions (Settings → Site Settings → Camera)
- Ensure HTTPS (required for camera access)
- Try different browser (Chrome/Safari/Firefox)

### Colleague Not Found
- Verify colleague exists in `colleagues` table
- Ensure colleague is added via Admin → People
- Refresh the page to reload colleague list

### Books Not Saving
- Check Supabase connection (env vars correct?)
- Verify RLS policies allow writes
- Check browser console for errors


## 📊 Monitoring

### Recommended Tools
- **Vercel Analytics**: Built-in performance monitoring
- **Sentry**: Error tracking (add `@sentry/nextjs`)
- **Supabase Dashboard**: Database queries, auth logs

### Key Metrics to Track
- Books borrowed/returned per day
- Most popular books
- Overdue books (>30 days)
- API error rates

## 🔄 Updates & Maintenance

### Adding New Domains
Edit `src/types.ts` and `src/components/BooksApp.tsx`:
1. Add domain to `BookDomain` type
2. Add to `DOMAINS` array
3. Add color to `DOMAIN_COLORS`

### Database Backups
- Supabase automatically backs up daily
- Manual backup: Supabase Dashboard → Database → Backups

### Scaling Considerations
- Current setup handles ~100-1000 books comfortably
- For larger libraries, consider:
  - Pagination on book grid
  - Database indexing on `books.title`, `books.author`
  - Caching book list (SWR/React Query)
