#!/bin/bash

# Deploy changed services script
# This script should be sourced after detect-changes.sh sets the environment variables

set -e

echo "🛠️ Starting deployment of changed services..."

# Function to stop and remove a service
stop_service() {
    local service=$1
    echo "🛑 Stopping and removing $service..."
    
    # Stop the service
    docker compose stop "$service" 2>/dev/null || echo "Service $service was not running"
    
    # Remove the container
    docker compose rm -f "$service" 2>/dev/null || echo "Container $service was already removed"
    
    # Remove the image to force rebuild (try both possible image names)
    docker rmi "gyms24-${service}" 2>/dev/null || true
    docker rmi "gyms-24-${service}" 2>/dev/null || true
    
    echo "✅ Service $service cleaned up"
}

# Function to check service health
check_service_health() {
    local service=$1
    local port=$2
    local endpoint=${3:-"/health"}
    
    echo "🏥 Checking $service health on port $port..."
    
    for i in {1..30}; do
        if curl -f "http://localhost:$port$endpoint" >/dev/null 2>&1; then
            echo "✅ $service is healthy"
            return 0
        fi
        echo "⏳ Waiting for $service... (attempt $i/30)"
        sleep 10
    done
    
    echo "❌ $service failed to become healthy"
    return 1
}

# Create Docker network if it doesn't exist
echo "🌐 Ensuring Docker network exists..."
docker network create gyms24-net 2>/dev/null || echo "Network gyms24-net already exists"

# Ensure environment files exist
echo "📄 Ensuring environment files exist..."
if [ ! -f "./bknd/.env" ]; then
    if [ -f "./bknd/.env.example" ]; then
        cp "./bknd/.env.example" "./bknd/.env"
        echo "✅ Created bknd/.env from example"
    else
        touch "./bknd/.env"
        echo "⚠️  Created empty bknd/.env - please configure it"
    fi
fi

if [ ! -f "./webhook/.env" ]; then
    if [ -f "./webhook/.env.example" ]; then
        cp "./webhook/.env.example" "./webhook/.env"
        echo "✅ Created webhook/.env from example"
    else
        touch "./webhook/.env"
        echo "⚠️  Created empty webhook/.env - please configure it"
    fi
fi

# Stop and remove changed services
SERVICES_TO_BUILD=""

if [[ "$BACKEND_CHANGED" == "true" ]]; then
    stop_service "backend"
    SERVICES_TO_BUILD="$SERVICES_TO_BUILD backend"
fi

if [[ "$WEBHOOK_CHANGED" == "true" ]]; then
    stop_service "webhook"
    SERVICES_TO_BUILD="$SERVICES_TO_BUILD webhook"
fi

# Handle infrastructure changes
if [[ "$DOCKER_COMPOSE_CHANGED" == "true" ]]; then
    echo "🐳 Docker compose changes detected, ensuring infrastructure services..."
    docker compose up -d postgres redis
fi

# Build and start changed services
if [[ ! -z "$SERVICES_TO_BUILD" ]]; then
    echo "🔨 Building services: $SERVICES_TO_BUILD"
    docker compose build $SERVICES_TO_BUILD
    
    echo "🚀 Starting services: $SERVICES_TO_BUILD"
    docker compose up -d $SERVICES_TO_BUILD
    
    echo "⏳ Waiting for services to initialize..."
    sleep 30
    
    # Health checks for each service
    if [[ "$BACKEND_CHANGED" == "true" ]]; then
        check_service_health "backend" "3000" || echo "⚠️  Backend health check failed"
    fi
    
    if [[ "$WEBHOOK_CHANGED" == "true" ]]; then
        check_service_health "webhook" "4000" || echo "⚠️  Webhook health check failed"
    fi
    
else
    echo "ℹ️  No application services need to be rebuilt"
fi

# Show current status
echo ""
echo "📊 Current container status:"
docker compose ps

# Show recent logs
echo ""
echo "📋 Recent logs for deployed services:"
if [[ "$BACKEND_CHANGED" == "true" ]]; then
    echo "=== Backend Logs ==="
    docker compose logs --tail=20 backend
fi

if [[ "$WEBHOOK_CHANGED" == "true" ]]; then
    echo "=== Webhook Logs ==="
    docker compose logs --tail=20 webhook
fi

# Cleanup
echo ""
echo "🧹 Cleaning up unused images..."
docker image prune -f >/dev/null

echo ""
echo "🎉 Deployment completed successfully!"
echo "💾 Disk usage:"
docker system df