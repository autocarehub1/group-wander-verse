# Quick Deploy Commands for Google Cloud Shell

## Copy-Paste Commands for Immediate Deployment

### Step 1: Open Google Cloud Shell
Go to: https://shell.cloud.google.com

### Step 2: Setup Project and Files
```bash
# Set project
gcloud config set project keen-opus-470223-b7

# Clone/download your project files to Cloud Shell
# (Upload the project files or clone from repository)

# Navigate to project directory
cd wandertogether
```

### Step 3: Build and Push Images (Copy-Paste This Block)
```bash
# Configure Docker for GCR
gcloud auth configure-docker gcr.io --quiet

# Build backend image
docker build -t gcr.io/keen-opus-470223-b7/wandertogether-backend:latest .

# Build frontend image  
docker build -f Dockerfile.frontend -t gcr.io/keen-opus-470223-b7/wandertogether-frontend:latest .

# Build loadgenerator image
docker build -f Dockerfile.loadgenerator -t gcr.io/keen-opus-470223-b7/wandertogether-loadgenerator:latest .

# Push all images
docker push gcr.io/keen-opus-470223-b7/wandertogether-backend:latest
docker push gcr.io/keen-opus-470223-b7/wandertogether-frontend:latest  
docker push gcr.io/keen-opus-470223-b7/wandertogether-loadgenerator:latest

echo "✅ All images built and pushed successfully!"
```

### Step 4: Deploy to GKE
```bash
# Deploy to Kubernetes
kubectl apply -f kubernetes-manifests.yaml

# Check deployment status
kubectl get pods -n travel-app

# Monitor deployment (press Ctrl+C to exit)
kubectl get pods -n travel-app -w
```

### Step 5: Verify Images Were Created
```bash
# List images in registry
gcloud container images list --repository=gcr.io/keen-opus-470223-b7

# Should show all three images:
# - wandertogether-backend
# - wandertogether-frontend  
# - wandertogether-loadgenerator
```

## Alternative: Use Cloud Build
Instead of manual docker commands, use Cloud Build:

```bash
# Trigger automated build
gcloud builds submit --config cloudbuild.yaml

# Then deploy
kubectl apply -f kubernetes-manifests.yaml
```

## Expected Results
After running these commands:
- All Docker images will exist in your Google Container Registry
- Kubernetes pods will start successfully without image pull errors
- WanderTogether application will be running on GKE

The key is running these commands in Google Cloud Shell where Docker and gcloud are pre-installed and authenticated.