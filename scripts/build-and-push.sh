#!/bin/bash

# Build and Push Docker Images for WanderTogether
# This script builds all images with the correct project ID and pushes them to GCR

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get project ID
if [ -z "$PROJECT_ID" ]; then
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        echo_error "No GCP project configured. Please run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
fi

# Convert to lowercase for Docker compatibility
PROJECT_ID_LOWER=$(echo "$PROJECT_ID" | tr '[:upper:]' '[:lower:]')

echo_info "Building images for project: $PROJECT_ID"
echo_info "Using lowercase project ID: $PROJECT_ID_LOWER"

# Configure Docker for GCR
echo_info "Configuring Docker for Google Container Registry..."
gcloud auth configure-docker gcr.io --quiet

# Build backend image
echo_info "Building backend image..."
docker build \
    --tag "gcr.io/$PROJECT_ID_LOWER/wandertogether-backend:latest" \
    --tag "gcr.io/$PROJECT_ID_LOWER/wandertogether-backend:$(date +%Y%m%d-%H%M%S)" \
    .

# Build frontend image
echo_info "Building frontend image..."
docker build \
    --file Dockerfile.frontend \
    --tag "gcr.io/$PROJECT_ID_LOWER/wandertogether-frontend:latest" \
    --tag "gcr.io/$PROJECT_ID_LOWER/wandertogether-frontend:$(date +%Y%m%d-%H%M%S)" \
    .

# Build loadgenerator image
echo_info "Building loadgenerator image..."
docker build \
    --file Dockerfile.loadgenerator \
    --tag "gcr.io/$PROJECT_ID_LOWER/wandertogether-loadgenerator:latest" \
    --tag "gcr.io/$PROJECT_ID_LOWER/wandertogether-loadgenerator:$(date +%Y%m%d-%H%M%S)" \
    .

# Push all images
echo_info "Pushing backend image..."
docker push "gcr.io/$PROJECT_ID_LOWER/wandertogether-backend:latest"

echo_info "Pushing frontend image..."
docker push "gcr.io/$PROJECT_ID_LOWER/wandertogether-frontend:latest"

echo_info "Pushing loadgenerator image..."
docker push "gcr.io/$PROJECT_ID_LOWER/wandertogether-loadgenerator:latest"

echo_success "✅ All images built and pushed successfully!"
echo_info "Images available at:"
echo "  - gcr.io/$PROJECT_ID_LOWER/wandertogether-backend:latest"
echo "  - gcr.io/$PROJECT_ID_LOWER/wandertogether-frontend:latest"
echo "  - gcr.io/$PROJECT_ID_LOWER/wandertogether-loadgenerator:latest"

# Update Kubernetes manifests with actual project ID
echo_info "Updating Kubernetes manifests..."
cp kubernetes-manifests.yaml kubernetes-manifests.yaml.backup

sed -i "s|gcr\.io/project-id-lowercase/|gcr.io/$PROJECT_ID_LOWER/|g" kubernetes-manifests.yaml
sed -i "s|gcr\.io/project-id/|gcr.io/$PROJECT_ID_LOWER/|g" kubernetes-manifests.yaml

echo_success "✅ Kubernetes manifests updated with correct project ID"
echo_info "You can now deploy with: kubectl apply -f kubernetes-manifests.yaml"