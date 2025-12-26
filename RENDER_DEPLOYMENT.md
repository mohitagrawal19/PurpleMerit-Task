# Render Deployment Guide

## Fix for Docker Build Error

The error you saw was: `failed to compute cache key: failed to calculate checksum of ref ... "/dist": not found`

**Problem**: The Dockerfile was trying to copy a non-existent `dist` folder.

**Solution**: Updated Dockerfile with **multi-stage build** that:
1. Builds TypeScript code in the first stage
2. Copies only necessary files to production image
3. Reduces image size and ensures compilation happens

## Step-by-Step Deployment on Render

### 1. Create Required External Services

#### MongoDB Atlas
```bash
# Go to https://www.mongodb.com/cloud/atlas
# 1. Create free account
# 2. Create cluster (M0 free tier)
# 3. Create database user
# 4. Get connection string
# Example: mongodb+srv://user:pass@cluster.mongodb.net/workspace_db
```

#### Redis Cloud
```bash
# Go to https://redis.com/try-free/
# 1. Create free account
# 2. Create database (30MB free)
# 3. Get connection string
# Example: redis://default:password@redis-url:6379
```

### 2. Connect Repository to Render

```bash
# In your GitHub repo
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select your repository
5. Fill in settings:
   - Name: collaborative-workspace-backend
   - Environment: Node
   - Build Command: npm install && npm run build
   - Start Command: npm start
   - Plan: Free (for testing)
```

### 3. Set Environment Variables

In Render Dashboard, go to Environment:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate-strong-secret>
JWT_REFRESH_SECRET=<generate-strong-refresh-secret>
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/workspace_db
REDIS_URL=redis://default:password@redis-host:6379
CORS_ORIGIN=https://your-render-domain.onrender.com
LOG_LEVEL=info
```

### 4. Deploy

```bash
# Option A: Automatic
- Push to main branch
- Render auto-detects changes
- Builds and deploys automatically

# Option B: Manual
- Click "Deploy" button in Render dashboard
```

### 5. Verify Deployment

```bash
# Check health endpoint
curl https://your-service.onrender.com/health

# View logs
# Go to Render Dashboard → Logs tab
```

## Troubleshooting

### Build Still Fails?

Check these:

1. **Node version compatibility**:
   ```yaml
   # Render uses Node 20 by default - should be fine
   ```

2. **npm dependencies**:
   ```bash
   # Ensure all packages install successfully
   npm ci  # Clean install
   npm run build  # Test build locally
   ```

3. **Memory issues**:
   ```bash
   # Free tier has limited memory
   # Optimize bundle: Remove unused dependencies
   npm prune --production
   ```

### Connection Issues?

1. **MongoDB Atlas**:
   - Whitelist Render IP addresses in Atlas
   - Go to Atlas → Network Access → Add IP
   - Add: `0.0.0.0/0` (allows all IPs)

2. **Redis Cloud**:
   - Ensure connection string is correct
   - Check AUTH password

### 503 Service Unavailable?

```bash
# Check if app is crashing
# Common causes:
- Missing environment variables
- Database connection timeout
- Insufficient memory

# Solution:
- View logs in Render dashboard
- Check environment variables
- Increase instance size (paid plan)
```

## Scaling Tips

### Current Setup
- **Render Free Tier**: 0.5 CPU, 512MB RAM
- Good for: Testing, development
- Limited: Production traffic

### For Production
```bash
# Upgrade to paid plan:
1. Render Dashboard → Settings
2. Select Instance Type: Starter or higher
3. Benefits:
   - Better performance
   - Automatic backups
   - Custom domains
   - Auto-scaling
```

## CI/CD with Render

The `.github/workflows/ci.yml` already configured for:

1. **On Push**: Tests run, then Render auto-deploys
2. **On PR**: Tests run (no deployment)
3. **Status**: Show passing/failing in GitHub

## Monitoring

### Built-in Health Check
```
GET /health → Returns 200 if service is healthy
```

### Logs
```bash
# Real-time logs
# Render Dashboard → Logs tab

# Check for:
- Database connection errors
- Redis connection errors
- Memory usage
- CPU usage
```

### Set Up Alerts (Paid Plan)
```
Render → Settings → Notifications
- Failed deployment
- Service crashed
- High resource usage
```

## Environment-Specific Config

### Development (.env.example)
```
NODE_ENV=development
LOG_LEVEL=debug
```

### Production (Render)
```
NODE_ENV=production
LOG_LEVEL=info
```

## Database Setup

### MongoDB Atlas Backup
```bash
# Regular backups enabled by default
# Retention: 7 days (free tier)
# Go to Atlas → Backup → Snapshots
```

### Redis Persistence
```bash
# Redis Cloud settings
# Eviction policy: allkeys-lru (recommended)
# Persistence: Enabled
```

## Custom Domain (Paid Plan)

```bash
1. Render Dashboard → Settings
2. Custom Domain → Add custom domain
3. Point DNS to Render CNAME
4. SSL certificate auto-generated
```

## Deploy Multiple Environments

### Staging
```bash
1. Create new GitHub branch: staging
2. Connect new Render service: staging branch
3. Use same env vars (or different DB for isolation)
```

### Production
```bash
1. Use main branch
2. Separate Render service for production
3. Different environment variables
```

## Quick Commands

```bash
# View deployment logs
# Render Dashboard → Logs

# Redeploy
# Render Dashboard → Deployments → Redeploy

# Check status
curl https://your-service.onrender.com/health

# View active connections
# Render Dashboard → Metrics
```

## Support

- **Render Docs**: https://render.com/docs
- **Status**: https://status.render.com
- **Community**: https://community.render.com

---

**Last Updated**: December 2025
**Status**: Production Ready
