# Quick Fix for "Cannot pull image" Error

## Problem
```
Cannot pull image 'gcr.io/project-id-lowercase/wandertogether-loadgenerator:latest' from the registry
```

## Root Cause
The Docker images haven't been built and pushed to Google Container Registry with your actual project ID.

## Quick Solution

### Step 1: Build and Push Images
```bash
# Run the automated build script
./scripts/build-and-push.sh
```

This will:
- Get your actual GCP project ID
- Convert it to lowercase for Docker compatibility
- Build all three Docker images (backend, frontend, loadgenerator)
- Push them to Google Container Registry
- Update Kubernetes manifests with the correct image references

### Step 2: Deploy to Kubernetes
```bash
# Apply the updated manifests
kubectl apply -f kubernetes-manifests.yaml

# Check deployment status
kubectl get pods -n travel-app
```

### Step 3: Verify Images
```bash
# Check that images were pushed successfully
gcloud container images list --repository=gcr.io/$(gcloud config get-value project | tr '[:upper:]' '[:lower:]')

# Should show:
# - wandertogether-backend
# - wandertogether-frontend  
# - wandertogether-loadgenerator
```

## Manual Alternative
If the script doesn't work, run manually:

```bash
# Get your project ID and convert to lowercase
PROJECT_ID=$(gcloud config get-value project)
PROJECT_ID_LOWER=$(echo "$PROJECT_ID" | tr '[:upper:]' '[:lower:]')

# Configure Docker for GCR
gcloud auth configure-docker gcr.io

# Build and push backend
docker build -t gcr.io/$PROJECT_ID_LOWER/wandertogether-backend:latest .
docker push gcr.io/$PROJECT_ID_LOWER/wandertogether-backend:latest

# Build and push frontend
docker build -f Dockerfile.frontend -t gcr.io/$PROJECT_ID_LOWER/wandertogether-frontend:latest .
docker push gcr.io/$PROJECT_ID_LOWER/wandertogether-frontend:latest

# Build and push loadgenerator
docker build -f Dockerfile.loadgenerator -t gcr.io/$PROJECT_ID_LOWER/wandertogether-loadgenerator:latest .
docker push gcr.io/$PROJECT_ID_LOWER/wandertogether-loadgenerator:latest

# Update manifests
sed -i "s|gcr\.io/project-id-lowercase/|gcr.io/$PROJECT_ID_LOWER/|g" kubernetes-manifests.yaml

# Deploy
kubectl apply -f kubernetes-manifests.yaml
```

## Verification
After running the fix, verify everything works:

```bash
# Check pod status
kubectl get pods -n travel-app

# Check events for any pull errors  
kubectl get events -n travel-app --sort-by='.lastTimestamp'

# Check specific deployment
kubectl describe deployment loadgenerator -n travel-app
```

All pods should be in `Running` status without any image pull errors.