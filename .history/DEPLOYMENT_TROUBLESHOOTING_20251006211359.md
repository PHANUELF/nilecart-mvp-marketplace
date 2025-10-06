# 🚨 Deployment Troubleshooting Guide

## Authentication Issues in Production

If sign-in doesn't work in production but works locally, follow these steps:

### 1. Check Environment Variables in Vercel

**Required Variables:**
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Steps:**
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Verify both variables are set for Production, Preview, and Development
4. Make sure there are no extra spaces or quotes around the values

### 2. Verify Supabase Configuration

**Check your Supabase project:**
1. Go to your Supabase dashboard
2. Navigate to Settings → API
3. Copy the exact values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Project API Key (anon public)** → `VITE_SUPABASE_ANON_KEY`

### 3. Check Supabase Auth Settings

**In Supabase Dashboard:**
1. Go to Authentication → Settings
2. Check **Site URL** is set to your Vercel domain
3. Add your Vercel domain to **Redirect URLs**:
   - `https://your-app.vercel.app`
   - `https://your-app.vercel.app/auth`
   - `https://your-app.vercel.app/home`

### 4. Common Issues & Solutions

#### Issue: "Invalid login credentials"
**Causes:**
- Wrong environment variables
- Supabase URL/key mismatch
- User doesn't exist in production database

**Solutions:**
1. Verify environment variables in Vercel
2. Check if user exists in Supabase Auth dashboard
3. Try creating a new user in production

#### Issue: "Failed to fetch"
**Causes:**
- CORS issues
- Wrong Supabase URL
- Network connectivity

**Solutions:**
1. Check Supabase URL format (should end with `.supabase.co`)
2. Verify CORS settings in Supabase
3. Check browser console for specific errors

#### Issue: Environment variables not loading
**Causes:**
- Variables not set in Vercel
- Wrong variable names
- Need to redeploy after adding variables

**Solutions:**
1. Double-check variable names match exactly:
   - `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)
2. Redeploy after adding variables
3. Check Vercel build logs for errors

### 5. Debug Steps

**Step 1: Check Environment Variables**
```javascript
// Add this to your Auth page temporarily
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);
```

**Step 2: Test Supabase Connection**
```javascript
// Test basic connection
const { data, error } = await supabase.from('profiles').select('count').limit(1);
console.log('Connection test:', { data, error });
```

**Step 3: Check Browser Console**
- Open browser dev tools
- Look for network errors
- Check for JavaScript errors
- Verify environment variables are loaded

### 6. Quick Fixes

#### Fix 1: Update Supabase Client
Make sure your `src/integrations/supabase/client.ts` uses the correct variable names:

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

#### Fix 2: Update Vercel Environment Variables
1. Go to Vercel project settings
2. Environment Variables section
3. Add/Update:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`

#### Fix 3: Redeploy
After updating environment variables:
1. Go to Vercel dashboard
2. Click "Redeploy" on your latest deployment
3. Or push a new commit to trigger redeploy

### 7. Testing Checklist

- [ ] Environment variables set in Vercel
- [ ] Supabase URL format correct
- [ ] Supabase anon key correct
- [ ] Site URL configured in Supabase
- [ ] Redirect URLs added in Supabase
- [ ] User exists in production database
- [ ] Browser console shows no errors
- [ ] Network requests successful

### 8. Still Having Issues?

**Check these files:**
1. `src/integrations/supabase/client.ts` - Correct variable names
2. `vercel.json` - Build configuration
3. `package.json` - Dependencies
4. Vercel build logs - Error messages

**Common Mistakes:**
- Using `SUPABASE_URL` instead of `VITE_SUPABASE_URL`
- Missing `VITE_` prefix on environment variables
- Wrong Supabase URL format
- Not redeploying after adding variables
- CORS issues with Supabase

---

**Need Help?** Check the browser console for specific error messages and share them for more targeted assistance.
