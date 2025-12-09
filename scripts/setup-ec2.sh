#!/bin/bash

# EC2 Deployment Startup Script
# Run this script on your EC2 instance to set up the deployment environment

set -e

echo "🚀 Setting up Gyms24 deployment environment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "⚠️  Please log out and log back in for Docker permissions to take effect"
fi

# Install Docker Compose if not present
if ! command -v docker compose &> /dev/null; then
    echo "🐳 Installing Docker Compose..."
    sudo apt install -y docker-compose-plugin
fi

# Create project directory
PROJECT_DIR="/opt/gyms24"
echo "📁 Creating project directory at $PROJECT_DIR..."
sudo mkdir -p $PROJECT_DIR
sudo chown $USER:$USER $PROJECT_DIR

# Clone repository (update with your actual repo URL)
if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo "📥 Cloning repository..."
    git clone https://github.com/abhayshurma/gyms24.git $PROJECT_DIR
    cd $PROJECT_DIR
else
    echo "📥 Updating repository..."
    cd $PROJECT_DIR
    git pull
fi

# Create Docker network
echo "🌐 Creating Docker network..."
docker network create gyms24-net 2>/dev/null || echo "Network already exists"

# Copy environment files
echo "📄 Setting up environment files..."
if [ ! -f "./bknd/.env" ]; then
    cp "./bknd/.env.example" "./bknd/.env"
    echo "⚠️  Please edit ./bknd/.env with your configuration"
fi

if [ ! -f "./webhook/.env" ]; then
    cp "./webhook/.env.example" "./webhook/.env"
    echo "⚠️  Please edit ./webhook/.env with your configuration"
fi

# Make scripts executable
echo "🔧 Making scripts executable..."
chmod +x scripts/*.sh

# Start infrastructure services
echo "🗄️ Starting infrastructure services..."
docker compose up -d postgres redis

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

echo "✅ Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit environment files:"
echo "   - $PROJECT_DIR/bknd/.env"
echo "   - $PROJECT_DIR/webhook/.env"
echo "2. Deploy services: ./scripts/quick-deploy.sh all"
echo "3. Check status: docker compose ps"
echo ""
echo "🔗 Service URLs:"
echo "   - Backend API: http://localhost:3000/health"
echo "   - Webhook: http://localhost:4000/health"