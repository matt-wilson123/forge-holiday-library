# Keep Supabase active (ping every 5 days)

Supabase pauses projects after about 7 days of inactivity. The workflow in `.github/workflows/ping-site.yml` pings your deployed site every 5 days so the app (and thus Supabase) stays active.

## One-time setup

1. In your **GitHub repo**: **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Name: `SITE_URL`
4. Value: your live site URL, e.g. `https://books-by-forge.vercel.app` (no trailing slash).
5. Save.

The workflow runs on a schedule (every 5 days) and when you trigger it manually from the **Actions** tab.
