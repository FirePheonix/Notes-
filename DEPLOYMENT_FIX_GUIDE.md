# 🚀 Vercel Deployment Fix Guide

## 🧠 The Problem You Had
- **Error**: `Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html"`
- **Cause**: Frontend trying to load JavaScript modules from backend URL instead of frontend URL

## ✅ Correct Architecture

| Component | URL Example | Purpose |
|-----------|-------------|---------|
| **Backend** | `https://notes-k2uf.vercel.app` | API routes only (`/api/chats`, `/health`, etc.) |
| **Frontend** | `https://notes-16q6.vercel.app` | Static files (`index.html`, `/assets/main.js`, etc.) |

## 🔧 Fixes Applied

### 1. Updated Server CORS Configuration
```typescript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'https://notes-16q6.vercel.app', // Your actual frontend URL
    'https://noteslo-frontend.vercel.app' // Alternative frontend URL
  ],
  credentials: true
}));
```

### 2. Improved Client Vercel Configuration
- Added proper static file routing for `/assets/` files
- Ensured `dist` directory is properly served
- Added favicon routing

### 3. Environment Variables Setup

**Backend (`notes-k2uf.vercel.app`):**
```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
FRONTEND_URL=https://notes-16q6.vercel.app
```

**Frontend (`notes-16q6.vercel.app`):**
```
VITE_API_URL=https://notes-k2uf.vercel.app
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

## 🚀 Deployment Steps

### Step 1: Deploy Backend
```bash
cd Server
vercel --prod
```
- Note the URL (e.g., `https://notes-k2uf.vercel.app`)
- Set environment variables in Vercel dashboard

### Step 2: Update Frontend Environment
Update `Client/.env`:
```properties
VITE_API_URL=https://notes-k2uf.vercel.app
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Step 3: Deploy Frontend
```bash
cd ../Client
vercel --prod
```
- Note the URL (e.g., `https://notes-16q6.vercel.app`)
- Set environment variables in Vercel dashboard

### Step 4: Update Backend CORS
Go back to your backend Vercel project and add your frontend URL to the `FRONTEND_URL` environment variable.

## 🔍 Troubleshooting

### Issue: Still getting MIME type errors
**Solution**: Make sure you're visiting the **frontend URL**, not the backend URL

### Issue: API calls failing
**Check**:
1. `VITE_API_URL` in frontend points to backend URL
2. Backend CORS includes frontend URL
3. Both projects have correct environment variables

### Issue: Build failures
**Check**:
1. All TypeScript errors are resolved ✅
2. Environment variables are set in Vercel dashboard
3. Build commands are correct in `vercel.json`

## 🧪 Testing Your Deployment

1. **Visit frontend URL** (not backend URL!)
2. **Test authentication** - should work with Clerk
3. **Test drawing features** - should save/load from backend
4. **Check browser console** - no CORS or 404 errors

## 📋 Quick Commands

```bash
# Check if backend is working
curl https://notes-k2uf.vercel.app/health

# Redeploy backend
cd Server && vercel --prod

# Redeploy frontend  
cd Client && vercel --prod

# View deployment logs
vercel logs [deployment-url]
```

## 🎯 Key Points to Remember

1. **Never load frontend assets from backend URL**
2. **Frontend serves static files, backend serves API**
3. **Always visit frontend URL for your app**
4. **Set environment variables in both projects**
5. **Update CORS when deploying to new URLs**

Your deployment should now work correctly! 🎉
