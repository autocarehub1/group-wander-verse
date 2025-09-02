#!/bin/bash

# Fix PROJECT_ID Docker image naming issues for Kubernetes deployment
# This script ensures all Docker image references use lowercase project IDs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the current project ID
if [ -z "$PROJECT_ID" ]; then
    if command -v gcloud &> /dev/null; then
        PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
        if [ -z "$PROJECT_ID" ]; then
            echo_error "PROJECT_ID environment variable not set and gcloud project not configured"
            echo "Please set PROJECT_ID or run: gcloud config set project YOUR_PROJECT_ID"
            exit 1
        fi
    else
        echo_error "PROJECT_ID environment variable not set and gcloud not available"
        echo "Please set PROJECT_ID environment variable"
        exit 1
    fi
fi

# Convert to lowercase for Docker compatibility
PROJECT_ID_LOWER=$(echo "$PROJECT_ID" | tr '[:upper:]' '[:lower:]')

echo_info "Using PROJECT_ID: $PROJECT_ID"
echo_info "Lowercase PROJECT_ID: $PROJECT_ID_LOWER"

# Function to replace PROJECT_ID placeholders in files
fix_file() {
    local file=$1
    if [ -f "$file" ]; then
        echo_info "Fixing $file..."
        
        # Create backup
        cp "$file" "$file.backup"
        
        # Replace placeholders with actual lowercase project ID
        sed -i "s/gcr\.io\/PROJECT_ID\//gcr.io\/$PROJECT_ID_LOWER\//g" "$file"
        sed -i "s/gcr\.io\/project-id\//gcr.io\/$PROJECT_ID_LOWER\//g" "$file"
        
        echo_info "Fixed $file (backup created as $file.backup)"
    else
        echo_warn "File $file not found, skipping..."
    fi
}

# Fix Kubernetes manifests
echo_info "Fixing Kubernetes manifests..."
fix_file "kubernetes-manifests.yaml"
fix_file "kubernetes/kustomization.yaml"
fix_file "kubernetes/loadgenerator.yaml"
fix_file "kubernetes/deployment.yaml" 
fix_file "kubernetes/frontend-deployment.yaml"

# Fix build scripts (keep environment variables)
echo_info "Fixing build scripts..."
if [ -f "scripts/deploy-k8s.sh" ]; then
    cp "scripts/deploy-k8s.sh" "scripts/deploy-k8s.sh.backup"
    # Keep $PROJECT_ID as environment variable but ensure lowercase in actual references
    sed -i "s/gcr\.io\/\$PROJECT_ID\//gcr.io\/\$\{PROJECT_ID_LOWER\}\//g" "scripts/deploy-k8s.sh"
    echo_info "Updated scripts/deploy-k8s.sh to use PROJECT_ID_LOWER"
fi

# Add PROJECT_ID_LOWER to deploy script
if [ -f "scripts/deploy-k8s.sh" ]; then
    if ! grep -q "PROJECT_ID_LOWER" "scripts/deploy-k8s.sh"; then
        sed -i '/^PROJECT_ID=/a PROJECT_ID_LOWER=$(echo "$PROJECT_ID" | tr "[:upper:]" "[:lower:]")' "scripts/deploy-k8s.sh"
        echo_info "Added PROJECT_ID_LOWER variable to deploy script"
    fi
fi

# Verify no placeholder PROJECT_ID remains in critical files
echo_info "Verifying fix..."
failed=false

if grep -q "PROJECT_ID/" kubernetes-manifests.yaml 2>/dev/null; then
    echo_error "Still found PROJECT_ID placeholder in kubernetes-manifests.yaml"
    failed=true
fi

if grep -q "PROJECT_ID/" kubernetes/kustomization.yaml 2>/dev/null; then
    echo_error "Still found PROJECT_ID placeholder in kubernetes/kustomization.yaml"
    failed=true
fi

if [ "$failed" = true ]; then
    echo_error "Fix failed! Some PROJECT_ID placeholders remain."
    exit 1
else
    echo_info "✅ All PROJECT_ID placeholders have been replaced successfully!"
    echo_info "Docker images will now use: gcr.io/$PROJECT_ID_LOWER/wandertogether-*"
fi

# Show what was changed
echo_info "Summary of changes:"
echo "  - Kubernetes manifests now use: gcr.io/$PROJECT_ID_LOWER/"
echo "  - Build scripts use environment variable: \${PROJECT_ID_LOWER}"
echo "  - Backup files created with .backup extension"

echo_info "✅ PROJECT_ID fix completed successfully!"