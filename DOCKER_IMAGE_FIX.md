# Docker Image Naming Fix for GKE Deployment

## Problem
Getting `InvalidImageName` errors in GKE deployment due to uppercase characters in Docker repository names:

```
Failed to apply default image tag "gcr.io/PROJECT_ID/wandertogether-loadgenerator:latest": 
couldn't parse image name "gcr.io/PROJECT_ID/wandertogether-loadgenerator:latest": 
invalid reference format: repository name (PROJECT_ID/wandertogether-loadgenerator) must be lowercase: InvalidImageName
```

## Root Cause
Docker repository names must be lowercase, but many GCP project IDs contain uppercase characters or the placeholder `PROJECT_ID` wasn't properly replaced.

## Solution

### 1. Use the Fix Script (Recommended)
Run the automated fix script that handles all PROJECT_ID references:

```bash
# Make sure PROJECT_ID is set to your actual GCP project ID
export PROJECT_ID="your-actual-project-id"

# Run the fix script
./scripts/fix-project-id.sh
```

### 2. Manual Fix Steps
If you prefer to fix manually:

#### Step 1: Fix Kubernetes Manifests
Replace all `project-id` placeholders with your actual lowercase project ID:

```bash
# Get your project ID and convert to lowercase
PROJECT_ID_LOWER=$(gcloud config get-value project | tr '[:upper:]' '[:lower:]')

# Update kubernetes-manifests.yaml
sed -i "s/project-id/$PROJECT_ID_LOWER/g" kubernetes-manifests.yaml

# Update kustomization.yaml
sed -i "s/project-id/$PROJECT_ID_LOWER/g" kubernetes/kustomization.yaml
```

#### Step 2: Verify the Fix
Check that all image references are now using your actual project ID:

```bash
grep "gcr.io/" kubernetes-manifests.yaml
grep "gcr.io/" kubernetes/kustomization.yaml
```

Should show something like:
```
image: gcr.io/my-actual-project/wandertogether-backend:latest
image: gcr.io/my-actual-project/wandertogether-frontend:latest  
image: gcr.io/my-actual-project/wandertogether-loadgenerator:latest
```

#### Step 3: Rebuild and Deploy
```bash
# Set your actual project ID
export PROJECT_ID="your-actual-project-id"

# Build with correct lowercase project ID
./scripts/deploy-k8s.sh build-images

# Deploy to GKE
./scripts/deploy-k8s.sh deploy
```

## Files Updated
The fix updates the following files:
- `kubernetes-manifests.yaml` - Main deployment manifest
- `kubernetes/kustomization.yaml` - Kustomize configuration
- `kubernetes/loadgenerator.yaml` - Load generator deployment
- `scripts/deploy-k8s.sh` - Deployment script
- Build configuration files

## Prevention
To prevent this issue in the future:

1. **Always use lowercase project IDs** when creating GCP projects
2. **Set the PROJECT_ID environment variable** before running deployment scripts:
   ```bash
   export PROJECT_ID="your-lowercase-project-id"
   ```
3. **Use the deployment script** which now handles lowercase conversion automatically

## Verification
After applying the fix, verify everything is correct:

```bash
# Check deployment status
kubectl get pods -n travel-app

# Check images being used
kubectl describe deployment wandertogether-backend -n travel-app | grep Image
kubectl describe deployment wandertogether-frontend -n travel-app | grep Image  
kubectl describe deployment loadgenerator -n travel-app | grep Image
```

All image references should show your actual lowercase project ID instead of placeholders.

## Common Project ID Formats
Examples of how different project ID formats are handled:

| Original Project ID | Lowercase Result | Docker Image |
|-------------------|-----------------|--------------|
| `MyProject-123` | `myproject-123` | `gcr.io/myproject-123/wandertogether-backend` |
| `COMPANY-DEV` | `company-dev` | `gcr.io/company-dev/wandertogether-frontend` |
| `Project_Test_1` | `project_test_1` | `gcr.io/project_test_1/wandertogether-loadgenerator` |

## Troubleshooting

### Issue: Still getting InvalidImageName errors
**Solution**: Ensure you've updated ALL files and that your PROJECT_ID environment variable is set correctly.

### Issue: Images not found during deployment  
**Solution**: Build and push the images with the correct project ID first:
```bash
# Build and push all images
./scripts/build-and-push.sh

# Or manually:
PROJECT_ID_LOWER=$(gcloud config get-value project | tr '[:upper:]' '[:lower:]')
docker build -t gcr.io/$PROJECT_ID_LOWER/wandertogether-backend:latest .
docker build -f Dockerfile.frontend -t gcr.io/$PROJECT_ID_LOWER/wandertogether-frontend:latest .
docker build -f Dockerfile.loadgenerator -t gcr.io/$PROJECT_ID_LOWER/wandertogether-loadgenerator:latest .
docker push gcr.io/$PROJECT_ID_LOWER/wandertogether-backend:latest
docker push gcr.io/$PROJECT_ID_LOWER/wandertogether-frontend:latest
docker push gcr.io/$PROJECT_ID_LOWER/wandertogether-loadgenerator:latest
```

### Issue: Old images still being referenced
**Solution**: Clear the Kubernetes image cache and redeploy:
```bash
kubectl delete deployment wandertogether-backend wandertogether-frontend loadgenerator -n travel-app
kubectl apply -f kubernetes-manifests.yaml
```

The fix ensures all Docker image references use properly formatted lowercase repository names, resolving the GKE deployment issues.