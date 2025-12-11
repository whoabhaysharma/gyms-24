# Gyms24 Deployment Setup

This repository contains a complete CI/CD setup for the Gyms24 application with intelligent service detection and deployment.

## 🏗️ Architecture

The application uses a hybrid deployment strategy:

**EC2 Instance (Docker):**
- **Backend** (`bknd/`) - Node.js/Express API server with Prisma ORM
- **Webhook** (`webhook/`) - WhatsApp webhook service  
- **Infrastructure** - PostgreSQL database and Redis cache

**Cloudflare Pages (Static):**
- **UI** (`ui/`) - Next.js static export
- **Website** (`website/`) - Static HTML files

> 📋 **Note:** This deployment guide covers only the EC2 backend services. For frontend deployment, see [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md).

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Git for change detection
- Node.js 18+ (for local development)

### Initial Setup

1. **Clone and setup environment files:**
   ```bash
   git clone <your-repo-url>
   cd gyms-24
   
   # Copy environment files
   cp bknd/.env.example bknd/.env
   cp webhook/.env.example webhook/.env
   
   # Edit the .env files with your configuration
   ```

2. **Create Docker network:**
   ```bash
   docker network create gyms24-net
   ```

3. **Deploy all services:**
   ```bash
   ./scripts/quick-deploy.sh all
   ```

## 📦 Service Ports

**Backend Services (EC2):**
- **Backend API:** http://localhost:3000
- **Webhook Service:** http://localhost:4000  
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379

**Frontend Services (Cloudflare Pages):**
- **UI Application:** https://your-ui-domain.pages.dev
- **Static Website:** https://your-website-domain.pages.dev

## 🛠️ Development Deployment

### Local Development

For backend services development:
```bash
# Deploy all backend services
./scripts/quick-deploy.sh all

# Deploy specific backend service
./scripts/quick-deploy.sh backend
./scripts/quick-deploy.sh webhook
```

For UI development (run separately, not containerized):
```bash
cd ui
npm install
npm run dev  # Runs on http://localhost:3001
```

### Detect and Deploy Changes

```bash
# Detect what changed since last commit
./scripts/detect-changes.sh

# Detect and deploy changes automatically
./scripts/detect-changes.sh HEAD~1 HEAD --deploy

# Compare against specific commits
./scripts/detect-changes.sh abc123 def456 --deploy
```

## 🔄 GitHub Actions CI/CD

The GitHub Actions workflow (`.github/workflows/deploy.yml`) automatically:

1. **Detects changes** by comparing git diffs between commits
2. **Builds only changed services** to save time and resources
3. **Stops and removes old containers** of changed services
4. **Starts new containers** with the updated code
5. **Performs health checks** to ensure services are running
6. **Cleans up unused images** to save disk space

### Triggers

The workflow runs on:
- Push to `master` or `main` branch
- Merged pull requests to `master` or `main`

### Change Detection

The system detects changes in:
- `bknd/` → Rebuilds backend service
- `webhook/` → Rebuilds webhook service  
- `docker-compose.yml` or `.env` files → Restarts infrastructure

> 📋 **Frontend Changes:** Changes to `ui/` and `website/` directories are handled by a separate Cloudflare Pages deployment. See [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md).

## 📁 Project Structure

```
gyms-24/
├── docker-compose.yml          # Docker services configuration
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD workflow
├── scripts/
│   ├── detect-changes.sh      # Detect changed services
│   ├── deploy-changes.sh      # Deploy changed services
│   └── quick-deploy.sh        # Quick deployment script
├── bknd/                      # Backend API service
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
├── webhook/                   # Webhook service
│   ├── Dockerfile
│   ├── .env.example
│   └── src/
├── ui/                        # Frontend UI service
│   ├── Dockerfile
│   └── app/
└── website/                   # Static website (not containerized)
```

## 🔧 Configuration

### Environment Variables

**Backend Service (`bknd/.env`)**:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string  
- `JWT_SECRET` - Secret for JWT tokens
- `WHATSAPP_BACKEND_SECRET` - WhatsApp integration secret
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - Payment gateway
- `FRONTEND_URL` - Your Cloudflare Pages UI URL

**Webhook Service (`webhook/.env`)**:
- `WHATSAPP_PHONE_NUMBER_ID` - WhatsApp Phone Number ID
- `VERIFY_TOKEN` - WhatsApp webhook verification token
- `API_KEY` - WhatsApp API access token
- `BACKEND_URL` - Backend service URL
- `INTERNAL_SECRET` - Internal communication secret

### Docker Compose Override

Create a `docker-compose.override.yml` file for local development overrides:

```yaml
version: "3.9"
services:
  backend:
    volumes:
      - ./bknd:/app
    environment:

      - FRONTEND_URL=http://localhost:3001  # For local UI development
  
  webhook:
    volumes:
      - ./webhook:/app
    environment:
      - LOG_LEVEL=debug
```

## 🔍 Monitoring and Debugging

### View Service Logs

```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs backend
docker compose logs webhook

# Follow logs in real-time
docker compose logs -f backend
```

### Check Service Status

```bash
# View running containers
docker compose ps

# Check resource usage
docker stats

# View system information
docker system df
```

### Health Checks

- **Backend:** `GET http://localhost:3000/health`
- **Webhook:** `GET http://localhost:4000/health`
- **Frontend:** See [FRONTEND_DEPLOYMENT.md](./FRONTEND_DEPLOYMENT.md) for Cloudflare Pages monitoring

## 🧹 Cleanup

```bash
# Stop all services
docker compose down

# Remove all containers and volumes
docker compose down -v

# Clean up all unused Docker resources
docker system prune -a

# Reset everything (nuclear option)
docker compose down -v
docker system prune -a -f
```

## 🚨 Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the port
   lsof -i :3000
   
   # Kill the process using the port
   sudo kill -9 $(lsof -t -i:3000)
   ```

2. **Database connection issues:**
   ```bash
   # Restart PostgreSQL
   docker compose restart postgres
   
   # Check PostgreSQL logs
   docker compose logs postgres
   ```

3. **Out of disk space:**
   ```bash
   # Clean up Docker resources
   docker system prune -a -f
   
   # Remove unused volumes
   docker volume prune -f
   ```

4. **Build failures:**
   ```bash
   # Clear build cache
   docker builder prune -a -f
   
   # Rebuild without cache
   docker compose build --no-cache
   ```

### Service-Specific Debugging

**Backend Issues:**
- Check database connection string in `.env`
- Verify Prisma migrations are applied
- Check Redis connection

**Webhook Issues:**  
- Verify WhatsApp API credentials
- Check webhook URL configuration
- Ensure backend communication is working

**Infrastructure Issues:**
- Check database connection and migrations
- Verify Redis connectivity
- Monitor disk space and memory usage

**CORS Issues:**
- Update backend CORS settings to include your Cloudflare Pages domains
- Verify API URLs in frontend environment variables

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)