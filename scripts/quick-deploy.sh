#!/bin/bash

# Quick deployment script for development
# Usage: ./scripts/quick-deploy.sh [service-name]

set -e

SERVICE_NAME=${1:-"all"}

echo "🚀 Quick Deploy for Gyms24"
echo "Service: $SERVICE_NAME"
echo ""

# Ensure we're in the project root
cd "$(dirname "$0")/.."

case $SERVICE_NAME in
    "backend"|"bknd")
        echo "📦 Deploying Backend..."
        docker compose build backend
        docker compose up -d backend
        echo "✅ Backend deployed"
        ;;
    "webhook")
        echo "📦 Deploying Webhook..."
        docker compose build webhook
        docker compose up -d webhook  
        echo "✅ Webhook deployed"
        ;;
    "all")
        echo "📦 Deploying all services..."
        
        # Start infrastructure first
        docker compose up -d postgres redis
        
        # Build and start application services
        docker compose build
        docker compose up -d
        
        echo "✅ All services deployed"
        ;;
    "infrastructure"|"infra")
        echo "📦 Deploying Infrastructure..."
        docker compose up -d postgres redis
        echo "✅ Infrastructure deployed"
        ;;
    *)
        echo "❌ Unknown service: $SERVICE_NAME"
        echo "Available options: backend, webhook, all, infrastructure"
        exit 1
        ;;
esac

echo ""
echo "📊 Current Status:"
docker compose ps

echo ""
echo "🎉 Deployment completed!"