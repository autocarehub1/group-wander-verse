# WanderTogether GKE Deployment Steps

## Current Issue
Kubernetes pods can't pull container images because they don't exist in Google Container Registry yet.

## Solution Steps

### Step 1: Build and Push Docker Images
The Docker images need to be built and pushed to your project's container registry first.

```bash
# Run the image build script
./build-images.sh
```

This will:
- Build all three Docker images (backend, frontend, loadgenerator)
- Push them to `gcr.io/keen-opus-470223-b7/`
- Make them available for Kubernetes to pull

### Step 2: Deploy to Kubernetes
Once images are available, deploy to GKE:

```bash
# Deploy all resources
kubectl apply -f kubernetes-manifests.yaml

# Check deployment status
kubectl get pods -n travel-app

# Monitor pod startup
kubectl get pods -n travel-app -w
```

### Step 3: Verify Deployment
Check that all pods are running:

```bash
# Check pod status
kubectl get pods -n travel-app

# Check services
kubectl get svc -n travel-app

# Check for any issues
kubectl describe pods -n travel-app
```

## Expected Results

After successful deployment, you should see:
- 3 backend pods running
- 2 frontend pods running  
- 1 loadgenerator pod running

All pods should show status `Running` without image pull errors.

## Access Applications

### Frontend Application
```bash
# Get external IP
kubectl get svc wandertogether-frontend-external -n travel-app
```

### Load Generator UI
```bash
# Port forward to access locally
kubectl port-forward svc/loadgenerator 8089:8089 -n travel-app

# Then open: http://localhost:8089
```

## Troubleshooting

If pods still fail to start:

1. **Check image availability:**
   ```bash
   gcloud container images list --repository=gcr.io/keen-opus-470223-b7
   ```

2. **Check pod events:**
   ```bash
   kubectl describe pod <pod-name> -n travel-app
   ```

3. **Check deployment logs:**
   ```bash
   kubectl logs deployment/wandertogether-backend -n travel-app
   ```

The key is ensuring Docker images exist in your registry before Kubernetes tries to pull them.