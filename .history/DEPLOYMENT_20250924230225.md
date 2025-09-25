# Netlify Deployment Guide

## ⚠️ Important Limitation

**Netlify doesn't support WebSocket connections (Socket.IO)**, so your real-time polling features won't work on Netlify. For full functionality, consider **Option 2: Railway Deployment** below.

## Option 1: Netlify Deployment (Frontend Only)

### Step 1: Prepare Your Repository

1. **Ensure your code is in a Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub:**
   - Create a new repository on GitHub
   - Add remote and push:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Netlify

#### Method A: Using Netlify Dashboard (Recommended)

1. **Go to [netlify.com](https://netlify.com)** and sign up/login
2. **Click "Add new site" → "Import an existing project"**
3. **Connect your Git provider** (GitHub/GitLab/Bitbucket)
4. **Select your repository**
5. **Configure build settings:**
   - **Build command:** `pnpm install && pnpm build`
   - **Publish directory:** `dist/spa`
   - **Functions directory:** `netlify/functions`

6. **Advanced settings:**
   - **Environment variables:** Add if needed
   - **Node version:** 18

7. **Click "Deploy site"**

#### Method B: Using Netlify CLI

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   # Build first
   pnpm build
   
   # Deploy
   netlify deploy
   
   # For production deployment
   netlify deploy --prod
   ```

### Step 3: Configure Custom Domain (Optional)

1. **In Netlify dashboard:** Go to Site settings → Domain management
2. **Add custom domain** or use the provided netlify.app subdomain

---

## Option 2: Railway Deployment (Recommended for Full Functionality)

Since your app needs Socket.IO for real-time features, Railway is a better choice:

### Step 1: Deploy to Railway

1. **Go to [railway.app](https://railway.app)** and sign up
2. **Click "New Project" → "Deploy from GitHub repo"**
3. **Select your repository**
4. **Railway will automatically detect and deploy your Node.js app**

### Step 2: Configure Environment Variables

1. **In Railway dashboard:** Go to your project
2. **Add environment variables:**
   ```
   NODE_ENV=production
   PORT=$PORT
   ```

### Step 3: Custom Domain (Optional)

1. **In Railway:** Go to Settings → Domains
2. **Add your custom domain**

---

## Option 3: Render Deployment (Alternative)

Another good option for full-stack apps:

1. **Go to [render.com](https://render.com)**
2. **Create new Web Service**
3. **Connect GitHub repository**
4. **Configure:**
   - **Build Command:** `pnpm install && pnpm build`
   - **Start Command:** `pnpm start`
   - **Environment:** Node

---

## Verification Steps

After deployment:

1. **Test the deployment:**
   - Visit your deployed URL
   - Check if the frontend loads
   - Test navigation between pages

2. **Check real-time features:**
   - If deployed on Netlify: Real-time features won't work
   - If deployed on Railway/Render: Test Socket.IO functionality

3. **Monitor logs:**
   - Check deployment logs for any errors
   - Monitor runtime logs for issues

---

## Troubleshooting

### Common Issues:

1. **Build fails:** Check Node.js version compatibility
2. **Socket.IO doesn't work:** Use Railway/Render instead of Netlify
3. **404 errors:** Ensure SPA redirects are configured
4. **Environment variables:** Set them in your deployment platform

### Need Help?

- Check the main README.md troubleshooting section
- Review deployment platform documentation
- Check the deployment logs for specific errors