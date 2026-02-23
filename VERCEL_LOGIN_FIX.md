# Fix Vercel Login Prompt

If you're seeing a Vercel login prompt when opening your app, this is likely due to **Vercel Password Protection** being enabled on preview deployments.

## Quick Fix

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings → Deployment Protection**
4. Look for **"Password Protection"** or **"Vercel Authentication"**
5. **Disable** it for production deployments

## Alternative: Disable for All Environments

If you want to disable it completely:

1. **Settings → Deployment Protection**
2. Find **"Password Protection"**
3. Toggle it **OFF**
4. Save changes

## Why This Happens

Vercel automatically enables password protection on:
- Preview deployments (non-production)
- Sometimes on new projects

This is a security feature, but for your office library app, you probably don't need it since you're handling authentication within the app itself.

## After Disabling

Your app should be accessible without the Vercel login prompt. Users will only see your admin login modal when they click the "Admin" button.
