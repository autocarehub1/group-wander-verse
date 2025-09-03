# Container Image Build Solution for GKE

## Current Issue
GKE can't pull images from `gcr.io/keen-opus-470223-b7/wandertogether-*` because they don't exist yet.

**Error**: `Can't pull container images when starting the Pods`

## Root Cause
The Docker images haven't been built and pushed to Google Container Registry. The Replit environment doesn't have Docker or gcloud installed for building images.

## Solution Options

### Option 1: Google Cloud Shell (Recommended)
Use Google Cloud Shell which has all tools pre-installed:

1. **Open Google Cloud Shell** at https://shell.cloud.google.com
2. **Clone your repository**:
   ```bash
   git clone YOUR_REPOSITORY_URL
   cd wandertogether
   ```
3. **Set project and build images**:
   ```bash
   gcloud config set project keen-opus-470223-b7
   gcloud auth configure-docker gcr.io
   
   # Build backend
   docker build -t gcr.io/keen-opus-470223-b7/wandertogether-backend:latest .
   
   # Build frontend
   docker build -f Dockerfile.frontend -t gcr.io/keen-opus-470223-b7/wandertogether-frontend:latest .
   
   # Build loadgenerator
   docker build -f Dockerfile.loadgenerator -t gcr.io/keen-opus-470223-b7/wandertogether-loadgenerator:latest .
   
   # Push all images
   docker push gcr.io/keen-opus-470223-b7/wandertogether-backend:latest
   docker push gcr.io/keen-opus-470223-b7/wandertogether-frontend:latest
   docker push gcr.io/keen-opus-470223-b7/wandertogether-loadgenerator:latest
   ```

### Option 2: Google Cloud Build (Automated)
Use Cloud Build for automated image building:

1. **Create cloudbuild.yaml**:
   ```yaml
   steps:
   # Build backend
   - name: 'gcr.io/cloud-builders/docker'
     args: ['build', '-t', 'gcr.io/keen-opus-470223-b7/wandertogether-backend:latest', '.']
   
   # Build frontend
   - name: 'gcr.io/cloud-builders/docker'
     args: ['build', '-f', 'Dockerfile.frontend', '-t', 'gcr.io/keen-opus-470223-b7/wandertogether-frontend:latest', '.']
   
   # Build loadgenerator
   - name: 'gcr.io/cloud-builders/docker'
     args: ['build', '-f', 'Dockerfile.loadgenerator', '-t', 'gcr.io/keen-opus-470223-b7/wandertogether-loadgenerator:latest', '.']
   
   images:
   - 'gcr.io/keen-opus-470223-b7/wandertogether-backend:latest'
   - 'gcr.io/keen-opus-470223-b7/wandertogether-frontend:latest'
   - 'gcr.io/keen-opus-470223-b7/wandertogether-loadgenerator:latest'
   ```

2. **Trigger build**:
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

### Option 3: Local Development Machine
If you have Docker and gcloud installed locally:

1. **Authenticate and configure**:
   ```bash
   gcloud auth login
   gcloud config set project keen-opus-470223-b7
   gcloud auth configure-docker gcr.io
   ```

2. **Download project files** and run build commands from Option 1

## After Images Are Built

Once images exist in your registry, deploy to GKE:

```bash
# Deploy to Kubernetes
kubectl apply -f kubernetes-manifests.yaml

# Check deployment status
kubectl get pods -n travel-app

# Monitor pod startup
kubectl get pods -n travel-app -w
```

## Verification

Check that images were successfully created:

```bash
# List images in your registry
gcloud container images list --repository=gcr.io/keen-opus-470223-b7

# Should show:
# - wandertogether-backend
# - wandertogether-frontend
# - wandertogether-loadgenerator
```

## Expected Result

After building and pushing the images:
- All pods will start successfully
- No more "image pull" errors
- WanderTogether application runs on GKE

The key is building the Docker images in an environment with Docker and gcloud tools, then deploying to your existing GKE cluster.