# Google Cloud Platform Authentication Setup

## Important Note about Docker Credentials

For Google Kubernetes Engine (GKE) deployment, you need **Google Cloud authentication**, not Docker Hub credentials.

### Docker Hub vs Google Container Registry

- **Docker Hub**: Uses username/password (like elerujaemmy@yahoo.com)
- **Google Container Registry (GCR)**: Uses Google Cloud authentication via `gcloud`

### Required Authentication for GKE

To deploy to your GKE project `keen-opus-470223-b7`, you need:

1. **Google Cloud SDK authentication**:
   ```bash
   # Login to Google Cloud
   gcloud auth login
   
   # Set your project
   gcloud config set project keen-opus-470223-b7
   
   # Configure Docker for GCR
   gcloud auth configure-docker gcr.io
   ```

2. **Verify authentication**:
   ```bash
   # Check current authentication
   gcloud auth list
   
   # Test access to your project
   gcloud projects describe keen-opus-470223-b7
   ```

### Build and Push Process

Once authenticated with Google Cloud:

```bash
# Build and push Docker images
./build-images.sh

# Deploy to Kubernetes
kubectl apply -f kubernetes-manifests.yaml
```

### Alternative: Service Account Authentication

For automated deployments, use a service account:

1. Create service account in Google Cloud Console
2. Download JSON key file
3. Authenticate:
   ```bash
   gcloud auth activate-service-account --key-file=path/to/key.json
   ```

### Troubleshooting

If you get "unauthorized" errors:
- Ensure you're logged into the correct Google account
- Verify the account has access to project `keen-opus-470223-b7`
- Check that Container Registry API is enabled in your project

The Docker Hub credentials you provided are not needed for this GKE deployment.