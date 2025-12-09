#!/bin/bash

# Detect changed services script
# Usage: ./scripts/detect-changes.sh [base-commit] [target-commit]

set -e

# Default to comparing with previous commit
BASE_COMMIT=${1:-"HEAD~1"}
TARGET_COMMIT=${2:-"HEAD"}

echo "🔍 Detecting changes between $BASE_COMMIT and $TARGET_COMMIT"

# Get the list of changed files
CHANGED_FILES=$(git diff --name-only "$BASE_COMMIT" "$TARGET_COMMIT")

echo "📁 Changed files:"
echo "$CHANGED_FILES" | sed 's/^/  /'

# Initialize change flags
BACKEND_CHANGED=false
WEBHOOK_CHANGED=false
DOCKER_COMPOSE_CHANGED=false

# Check for changes in each service
if echo "$CHANGED_FILES" | grep -q "^bknd/"; then
    BACKEND_CHANGED=true
    echo "✅ Backend changes detected"
fi

if echo "$CHANGED_FILES" | grep -q "^webhook/"; then
    WEBHOOK_CHANGED=true
    echo "✅ Webhook changes detected"
fi

if echo "$CHANGED_FILES" | grep -q -E "(docker-compose\.yml|\.env)"; then
    DOCKER_COMPOSE_CHANGED=true
    echo "✅ Docker compose or environment changes detected"
fi

# Export results
export BACKEND_CHANGED
export WEBHOOK_CHANGED  
export DOCKER_COMPOSE_CHANGED

# Create summary
echo ""
echo "📋 Summary:"
echo "  Backend changed: $BACKEND_CHANGED"
echo "  Webhook changed: $WEBHOOK_CHANGED"
echo "  Docker/Env changed: $DOCKER_COMPOSE_CHANGED"

# If run with --deploy flag, actually deploy the changes
if [[ "$3" == "--deploy" ]]; then
    echo ""
    echo "🚀 Starting deployment of changed services..."
    
    # Source the deployment script
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    source "$SCRIPT_DIR/deploy-changes.sh"
fi