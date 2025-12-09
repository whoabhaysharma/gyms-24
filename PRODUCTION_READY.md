# 🎯 Final Deployment Checklist

## ✅ What's Been Optimized:

### **1. Fixed Health Endpoints**
- ✅ Added `/health` endpoint to backend service
- ✅ Webhook already has `/health` endpoint
- ✅ Health checks in deployment scripts work correctly

### **2. Fixed Port Configurations**
- ✅ Webhook Dockerfile now exposes port 4000 (matches .env)
- ✅ Docker compose port mapping corrected (4000:4000)
- ✅ Updated environment files for production

### **3. Enhanced Security & Performance**
- ✅ Added CORS configuration for production domains
- ✅ Created `.dockerignore` files for faster builds
- ✅ Updated environment files with production-ready values

### **4. Added Production Scripts**
- ✅ `scripts/setup-ec2.sh` - One-click EC2 setup
- ✅ `scripts/gyms24.service` - Systemd service for auto-restart
- ✅ Deployment detection and automation scripts

## 🚀 **Deployment Steps:**

### **On Your EC2 Instance:**

1. **Run the setup script:**
   ```bash
   wget https://raw.githubusercontent.com/abhayshurma/gyms24/master/scripts/setup-ec2.sh
   chmod +x setup-ec2.sh
   ./setup-ec2.sh
   ```

2. **Configure environment files:**
   ```bash
   cd /opt/gyms24
   
   # Edit backend environment
   nano bknd/.env
   
   # Edit webhook environment  
   nano webhook/.env
   ```

3. **Deploy services:**
   ```bash
   ./scripts/quick-deploy.sh all
   ```

4. **Set up auto-start (optional):**
   ```bash
   sudo cp scripts/gyms24.service /etc/systemd/system/
   sudo systemctl enable gyms24.service
   sudo systemctl start gyms24.service
   ```

### **Configure Your Domain/SSL:**

1. **Point your domain to EC2:**
   ```
   api.yourdomain.com → EC2_IP:3000
   webhook.yourdomain.com → EC2_IP:4000
   ```

2. **Set up reverse proxy (Nginx):**
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   
   # Create nginx config
   sudo nano /etc/nginx/sites-available/gyms24
   ```

3. **Sample Nginx configuration:**
   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   
   server {
       listen 80;
       server_name webhook.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:4000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. **Enable SSL:**
   ```bash
   sudo certbot --nginx -d api.yourdomain.com -d webhook.yourdomain.com
   ```

## 📋 **Environment Variables to Configure:**

### **Backend (.env):**
```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/gyms24"
REDIS_URL="redis://redis:6379"
JWT_SECRET="your-production-jwt-secret-change-this"
FRONTEND_URL="https://your-ui-domain.pages.dev"
WHATSAPP_BACKEND_SECRET="your-webhook-secret"
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
```

### **Webhook (.env):**
```env
VERIFY_TOKEN="your-whatsapp-verify-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-number-id"
API_KEY="your-whatsapp-api-key"
BACKEND_URL="http://backend:3000"
INTERNAL_SECRET="your-webhook-secret"
REDIS_URL="redis://redis:6379"
```

## 🔄 **GitHub Secrets Setup:**

1. Go to **GitHub Repository → Settings → Secrets**
2. Add these secrets:
   ```
   CLOUDFLARE_API_TOKEN=your_token
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   ```
3. Add variables (optional):
   ```
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   NEXT_PUBLIC_WEBHOOK_URL=https://webhook.yourdomain.com
   ```

## ✅ **Verification Commands:**

```bash
# Check service health
curl http://localhost:3000/health
curl http://localhost:4000/health

# Check container status
docker compose ps

# View logs
docker compose logs backend
docker compose logs webhook

# Monitor resources
docker stats

# Check disk usage
docker system df
```

## 🚨 **Troubleshooting:**

### **Common Issues:**
1. **Port conflicts:** Check with `sudo lsof -i :3000`
2. **Docker permissions:** Add user to docker group
3. **Database not ready:** Wait 30s after starting postgres
4. **Environment variables:** Ensure all required vars are set

### **Health Check URLs:**
- Backend: `http://your-ec2-ip:3000/health`
- Webhook: `http://your-ec2-ip:4000/health`

## 🎉 **You're All Set!**

Your deployment is now:
- ✅ **Production-ready** with health checks
- ✅ **Auto-scaling** with GitHub Actions
- ✅ **Secure** with proper CORS and environment handling
- ✅ **Monitored** with logging and health endpoints
- ✅ **Optimized** for fast builds and deployments