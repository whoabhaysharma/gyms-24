# Frontend Deployment Guide

This guide covers deploying the static frontend components (UI and Website) to Cloudflare Pages.

## 🏗️ Architecture Overview

- **UI** (`ui/`) - Next.js application (static export) → Cloudflare Pages
- **Website** (`website/`) - Static HTML files → Cloudflare Pages  
- **Backend Services** (`bknd/`, `webhook/`) - Docker containers → EC2 instance

## 📦 UI (Next.js) Deployment

### 1. Configure Next.js for Static Export

Update `ui/next.config.ts` to enable static export:

```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Configure your API base URL for production
  env: {
    NEXT_PUBLIC_API_URL: 'https://your-ec2-domain.com',
    NEXT_PUBLIC_WEBHOOK_URL: 'https://your-ec2-domain.com:4000'
  }
};

export default nextConfig;
```

### 2. Update package.json Scripts

```json
{
  "scripts": {
    "build": "next build",
    "export": "next build && next export",
    "deploy": "npm run export"
  }
}
```

### 3. Build and Export

```bash
cd ui
npm install
npm run build
```

This creates an `out/` directory with static files ready for deployment.

### 4. Test Static Export Locally

```bash
# After building, test the static export
cd ui
npx serve out -p 3001

# Or use Python's built-in server
python3 -m http.server 3001 --directory out
```

The static site will be available at http://localhost:3001

## 🌐 Cloudflare Pages Setup

### Option 1: Git Integration (Recommended)

1. **Connect Repository to Cloudflare Pages:**
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project" → "Connect to Git"
   - Select your repository
   - Configure build settings

2. **UI Build Configuration:**
   ```
   Framework preset: Next.js (Static HTML Export)
   Build command: cd ui && npm run build
   Build output directory: ui/out
   Root directory: /
   ```

3. **Website Build Configuration:**
   ```
   Framework preset: None
   Build command: (leave empty)
   Build output directory: website
   Root directory: /
   ```

### Option 2: Direct Upload

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy UI
cd ui
npm run build
wrangler pages deploy out --project-name=gyms24-ui

# Deploy Website  
cd ../website
wrangler pages deploy . --project-name=gyms24-website
```

## 🔄 Automated Deployment Workflow

Create `.github/workflows/frontend-deploy.yml`:

```yaml
name: Deploy Frontend to Cloudflare Pages

on:
  push:
    branches: [master, main]
    paths:
      - 'ui/**'
      - 'website/**'

jobs:
  deploy-ui:
    if: contains(github.event.head_commit.modified, 'ui/')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: ui/package-lock.json
      
      - name: Install dependencies
        run: |
          cd ui
          npm ci
      
      - name: Build UI
        run: |
          cd ui
          npm run build
          
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: gyms24-ui
          directory: ui/out

  deploy-website:
    if: contains(github.event.head_commit.modified, 'website/')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy Website to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: gyms24-website
          directory: website
```

## 🔧 Environment Configuration

### Production API URLs

Update your frontend environment variables for production:

**UI Environment Variables:**
```bash
# In your Cloudflare Pages settings, add these environment variables:
NEXT_PUBLIC_API_URL=https://your-ec2-api.com:3000
NEXT_PUBLIC_WEBHOOK_URL=https://your-ec2-api.com:4000
```

### CORS Configuration

Update your backend CORS settings to allow Cloudflare Pages domains:

```typescript
// In your backend app.ts or cors configuration
const corsOptions = {
  origin: [
    'https://gyms24-ui.pages.dev',
    'https://your-custom-domain.com',
    'http://localhost:3000', // for development
  ],
  credentials: true
};
```

## 🚀 Deployment Commands

### Local Development
```bash
# UI development
cd ui
npm run dev

# Website (serve locally)
cd website  
python -m http.server 3002
# or
npx serve .
```

### Production Build & Test
```bash
# Test UI static export locally
cd ui
npm run build
npx serve out

# Test website
cd website
npx serve .
```

## 🔍 Monitoring

### Cloudflare Analytics
- Monitor page views, performance metrics
- Check for 404s and errors
- Review geographic distribution

### Custom Domain Setup
1. Add your domain to Cloudflare Pages
2. Configure DNS records
3. Enable SSL/TLS

## 🧹 Cache Management

### Cloudflare Cache Purging
```bash
# Purge all cache
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"purge_everything":true}'

# Purge specific files
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"files":["https://your-domain.com/specific-file.js"]}'
```

## 📊 Performance Optimization

### Next.js Static Export Optimization
```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Optimize images
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './image-loader.js'
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
};
```

### Website Optimization
- Minify HTML, CSS, and JavaScript
- Optimize images (WebP format)
- Enable Brotli compression in Cloudflare
- Use Cloudflare's Auto Minify feature

## 🔒 Security

### Content Security Policy
Configure CSP headers in Cloudflare Pages:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://your-api-domain.com;
```

### Additional Security Headers
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```