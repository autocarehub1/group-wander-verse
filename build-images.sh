#!/bin/bash

# Build and Push Docker Images for GKE Deployment
# Project: keen-opus-470223-b7

set -e

PROJECT_ID="keen-opus-470223-b7"

echo "Building and pushing Docker images for $PROJECT_ID..."

# Configure Docker authentication
echo "Configuring Docker for Google Container Registry..."
gcloud auth configure-docker gcr.io --quiet

# Build backend image
echo "Building backend image..."
docker build -t gcr.io/$PROJECT_ID/wandertogether-backend:latest .

# Build frontend image  
echo "Building frontend image..."
docker build -f Dockerfile.frontend -t gcr.io/$PROJECT_ID/wandertogether-frontend:latest .

# Build loadgenerator image
echo "Building loadgenerator image..."
docker build -f Dockerfile.loadgenerator -t gcr.io/$PROJECT_ID/wandertogether-loadgenerator:latest .

# Push all images
echo "Pushing backend image..."
docker push gcr.io/$PROJECT_ID/wandertogether-backend:latest

echo "Pushing frontend image..."
docker push gcr.io/$PROJECT_ID/wandertogether-frontend:latest

echo "Pushing loadgenerator image..."
docker push gcr.io/$PROJECT_ID/wandertogether-loadgenerator:latest

echo "All images pushed successfully!"
echo "Images available:"
echo "- gcr.io/$PROJECT_ID/wandertogether-backend:latest"
echo "- gcr.io/$PROJECT_ID/wandertogether-frontend:latest"
echo "- gcr.io/$PROJECT_ID/wandertogether-loadgenerator:latest"