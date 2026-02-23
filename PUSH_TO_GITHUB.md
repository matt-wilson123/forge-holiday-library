# Push this project to your GitHub

Your project is now a git repo with one commit. Follow these steps to put it on GitHub.

## 1. Create the repository on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** `forge-holidays-library` (or `books-by-forge` if you prefer)
3. **Description:** optional, e.g. "Forge Holidays office library app"
4. Choose **Private** or **Public**
5. **Do not** tick "Add a README" or "Add .gitignore" (you already have them)
6. Click **Create repository**

## 2. Connect and push from your project

In Terminal, from the project folder (`Books by Forge`), run:

```bash
# Use the repo name you chose in step 1 (e.g. forge-holidays-library)
git remote add origin https://github.com/matt-wilson123/forge-holidays-library.git

# Push your code
git push -u origin main
```

If you used a different repo name, replace `forge-holidays-library` in the URL with your repo name.

GitHub may ask you to sign in (browser or token). After a successful push, your code will be at:

**https://github.com/matt-wilson123/forge-holidays-library**

## 3. Optional: ping workflow (keep Supabase active)

After the repo is on GitHub, add the site URL secret so the "ping every 5 days" workflow can run:

- Repo **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
- Name: `SITE_URL`
- Value: your live app URL (e.g. `https://your-app.vercel.app`)

See `.github/PING_SETUP.md` for details.
