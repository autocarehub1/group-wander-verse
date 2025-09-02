#!/bin/bash

# WanderTogether Deployment Script for keen-opus-470223-b7
# Quick deployment script with your actual project ID

set -e

PROJECT_ID="keen-opus-470223-b7"
CLUSTER_NAME="wandertogether-cluster"
REGION="us-central1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Set GCP project
echo_info "Setting GCP project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Configure Docker for GCR
echo_info "Configuring Docker for Google Container Registry..."
gcloud auth configure-docker gcr.io --quiet

# Build and push images
echo_info "Building backend image..."
docker build -t gcr.io/$PROJECT_ID/wandertogether-backend:latest .

echo_info "Building frontend image..."
docker build -f Dockerfile.frontend -t gcr.io/$PROJECT_ID/wandertogether-frontend:latest .

echo_info "Building loadgenerator image..."
docker build -f Dockerfile.loadgenerator -t gcr.io/$PROJECT_ID/wandertogether-loadgenerator:latest .

echo_info "Pushing backend image..."
docker push gcr.io/$PROJECT_ID/wandertogether-backend:latest

echo_info "Pushing frontend image..."
docker push gcr.io/$PROJECT_ID/wandertogether-frontend:latest

echo_info "Pushing loadgenerator image..."
docker push gcr.io/$PROJECT_ID/wandertogether-loadgenerator:latest

echo_success "All images pushed to gcr.io/$PROJECT_ID/"

# Deploy to Kubernetes
echo_info "Deploying to Kubernetes..."
kubectl apply -f kubernetes-manifests.yaml

echo_info "Checking deployment status..."
kubectl get pods -n travel-app

echo_success "✅ Deployment completed!"
echo_info "Monitor with: kubectl get pods -n travel-app -w"
echo_info "Access loadgenerator: kubectl port-forward svc/loadgenerator 8089:8089 -n travel-app"