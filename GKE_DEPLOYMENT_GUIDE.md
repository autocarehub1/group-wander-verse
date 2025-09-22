# WanderTogether GKE Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying WanderTogether to Google Kubernetes Engine (GKE) with production-ready configuration following 3-tier architecture patterns.

## Prerequisites

- Google Cloud Project: `keen-opus-470223-b7`
- GKE cluster with workload identity enabled
- Docker CLI installed
- kubectl configured for your GKE cluster
- gcloud CLI authenticated

## Image Build and Push Strategy

### 1. Build and Tag Images

Use semantic versioning for production deployments:

```bash
# Set project variables
export PROJECT_ID=keen-opus-470223-b7
export VERSION=v1.0.0

# Build images with versioned tags
docker build -f Dockerfile -t gcr.io/${PROJECT_ID}/wandertogether-backend:${VERSION} .
docker build -f Dockerfile.frontend -t gcr.io/${PROJECT_ID}/wandertogether-frontend:${VERSION} .  
docker build -f Dockerfile.loadgenerator -t gcr.io/${PROJECT_ID}/wandertogether-loadgenerator:${VERSION} .

# Push to Google Container Registry
docker push gcr.io/${PROJECT_ID}/wandertogether-backend:${VERSION}
docker push gcr.io/${PROJECT_ID}/wandertogether-frontend:${VERSION}
docker push gcr.io/${PROJECT_ID}/wandertogether-loadgenerator:${VERSION}
```

### 2. Alternative: Cloud Build (Recommended)

Create a `cloudbuild.yaml` for automated builds:

```yaml
# cloudbuild.yaml
steps:
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build',
      '-f', 'Dockerfile',
      '-t', 'gcr.io/$PROJECT_ID/wandertogether-backend:${TAG_NAME}',
      '.'
    ]
  
  # Build frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build', 
      '-f', 'Dockerfile.frontend',
      '-t', 'gcr.io/$PROJECT_ID/wandertogether-frontend:${TAG_NAME}',
      '.'
    ]
  
  # Build load generator
  - name: 'gcr.io/cloud-builders/docker'
    args: [
      'build',
      '-f', 'Dockerfile.loadgenerator', 
      '-t', 'gcr.io/$PROJECT_ID/wandertogether-loadgenerator:${TAG_NAME}',
      '.'
    ]

images:
  - 'gcr.io/$PROJECT_ID/wandertogether-backend:${TAG_NAME}'
  - 'gcr.io/$PROJECT_ID/wandertogether-frontend:${TAG_NAME}'
  - 'gcr.io/$PROJECT_ID/wandertogether-loadgenerator:${TAG_NAME}'

options:
  machineType: 'E2_HIGHCPU_8'
```

Trigger build:
```bash
gcloud builds submit --config=cloudbuild.yaml --substitutions=TAG_NAME=v1.0.0
```

## Container Registry Authentication

### Option 1: Service Account with imagePullSecrets

```bash
# Create service account for GCR access
gcloud iam service-accounts create gcr-access-sa \
    --description="Service account for GCR access" \
    --display-name="GCR Access SA"

# Grant necessary permissions
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:gcr-access-sa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"

# Create and download key
gcloud iam service-accounts keys create gcr-key.json \
    --iam-account=gcr-access-sa@${PROJECT_ID}.iam.gserviceaccount.com

# Create Kubernetes secret
kubectl create secret docker-registry gcr-secret \
    --docker-server=https://gcr.io \
    --docker-username=_json_key \
    --docker-password="$(cat gcr-key.json)" \
    --docker-email=your-email@domain.com \
    --namespace=wandertogether

# Clean up key file for security
rm gcr-key.json
```

### Option 2: Workload Identity (For Application Authentication)

**Note**: Workload Identity does not authenticate image pulls. For image pull authentication, use Option 1 above or grant the node pool's service account `roles/storage.objectViewer`.

```bash
# Enable workload identity on cluster if not already enabled
gcloud container clusters update CLUSTER_NAME \
    --workload-pool=${PROJECT_ID}.svc.id.goog

# Create Kubernetes service account
kubectl create serviceaccount wandertogether-ksa \
    --namespace wandertogether

# Create Google service account
gcloud iam service-accounts create wandertogether-gsa

# Grant GCR access
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:wandertogether-gsa@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"

# Bind accounts
gcloud iam service-accounts add-iam-policy-binding \
    wandertogether-gsa@${PROJECT_ID}.iam.gserviceaccount.com \
    --role roles/iam.workloadIdentityUser \
    --member "serviceAccount:${PROJECT_ID}.svc.id.goog[wandertogether/wandertogether-ksa]"

# Annotate Kubernetes service account
kubectl annotate serviceaccount wandertogether-ksa \
    --namespace wandertogether \
    iam.gke.io/gcp-service-account=wandertogether-gsa@${PROJECT_ID}.iam.gserviceaccount.com
```

## Configuration Secrets

### Set up application secrets:

```bash
# Create namespace first
kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: wandertogether
  labels:
    name: wandertogether
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
EOF

# Create secrets (replace with actual values)
kubectl create secret generic wandertogether-secrets \
    --from-literal=database-url="postgresql://user:pass@host:5432/db" \
    --from-literal=sendgrid-api-key="SG.your-key-here" \
    --from-literal=anthropic-api-key="sk-ant-your-key-here" \
    --from-literal=session-secret="your-secure-session-secret" \
    --namespace=wandertogether
```

## Deployment Steps

### 1. Update image tags in manifests

Replace `v1.0.0` with your actual version in `production-kubernetes-manifests.yaml`:

```bash
# Update image tags to match your build version
sed -i "s|:v1.0.0|:${VERSION}|g" production-kubernetes-manifests.yaml
```

### 2. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f production-kubernetes-manifests.yaml

# Check deployment status
kubectl get pods -n wandertogether
kubectl get services -n wandertogether

# Check logs if needed
kubectl logs -n wandertogether -l app=backend
kubectl logs -n wandertogether -l app=frontend
kubectl logs -n wandertogether -l app=loadgenerator
```

### 3. Verify Health Checks

```bash
# Check if probes are passing
kubectl describe pods -n wandertogether

# Test external access
kubectl get service frontend-service -n wandertogether -o wide
kubectl get service loadgenerator-service -n wandertogether -o wide
```

## Monitoring and Scaling

### Monitor HPA scaling:

```bash
kubectl get hpa -n wandertogether
kubectl describe hpa backend-hpa -n wandertogether
kubectl describe hpa frontend-hpa -n wandertogether
```

### View resource utilization:

```bash
kubectl top pods -n wandertogether
kubectl top nodes
```

## Troubleshooting

### Common Issues:

1. **ImagePullBackOff**: Check that gcr-secret exists and has correct permissions
2. **CrashLoopBackOff**: Check volume mounts are working correctly
3. **Failed Health Checks**: Verify applications are exposing correct endpoints

### Debug commands:

```bash
# Check events
kubectl get events -n wandertogether --sort-by='.lastTimestamp'

# Exec into containers for debugging
kubectl exec -it -n wandertogether deployment/backend -- /bin/sh
kubectl exec -it -n wandertogether deployment/frontend -- /bin/sh

# Port forward for local testing
kubectl port-forward -n wandertogether service/frontend-service 8080:8080
kubectl port-forward -n wandertogether service/loadgenerator-service 8089:8089
```

## Production Checklist

- [ ] Images built and pushed with semantic version tags
- [ ] Secrets configured with real values (not base64 placeholders)
- [ ] imagePullSecrets or Workload Identity configured
- [ ] Health checks passing
- [ ] HPA configured and scaling properly  
- [ ] Resource limits appropriate for workload
- [ ] Monitoring and logging configured
- [ ] Backup strategy in place for persistent data
- [ ] SSL/TLS termination configured at ingress level