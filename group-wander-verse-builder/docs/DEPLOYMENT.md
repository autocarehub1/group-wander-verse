# 🚀 WanderVerse Builder - Deployment Guide

Complete deployment guide for the WanderVerse Builder service on Google Kubernetes Engine (GKE).

## Quick Start

The fastest way to deploy WanderVerse Builder:

```bash
# Clone and navigate
git clone <repository-url>
cd group-wander-verse-builder

# Run setup script
chmod +x scripts/wanderverse-setup.sh
./scripts/wanderverse-setup.sh
```

This will:
- ✅ Create GKE cluster (if needed)
- ✅ Build and push Docker images
- ✅ Set up Kubernetes resources
- ✅ Configure secrets and permissions
- ✅ Deploy the application with monitoring

## Prerequisites

### Required Tools
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) (`gcloud`)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [Docker](https://docs.docker.com/get-docker/)

### GCP Setup
1. **Create GCP Project** (if you don't have one):
   ```bash
   gcloud projects create your-project-id
   gcloud config set project your-project-id
   ```

2. **Enable required APIs**:
   ```bash
   gcloud services enable container.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable storage-api.googleapis.com
   ```

3. **Set up billing** (required for GKE):
   - Go to [GCP Console](https://console.cloud.google.com)
   - Enable billing for your project

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                 Internet                        │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              Load Balancer                      │
│         (External IP: Auto-assigned)            │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│               GKE Cluster                       │
│  ┌─────────────────────────────────────────────┐│
│  │         wander-verse namespace              ││
│  │                                             ││
│  │  ┌───────────────┐  ┌─────────────────────┐││
│  │  │   Builder     │  │    Auto-scaling     │││
│  │  │   Pods        │  │     (2-10 pods)     │││  
│  │  │   (2+ replicas)│  │                     │││
│  │  └───────────────┘  └─────────────────────┘││
│  │                                             ││
│  │  ┌─────────────┐    ┌─────────────────────┐││
│  │  │ Config Maps │    │   Persistent        │││
│  │  │ & Secrets   │    │   Volumes           │││
│  │  └─────────────┘    └─────────────────────┘││
│  └─────────────────────────────────────────────┘│
└─────────────────────────────────────────────────┘
```

## Step-by-Step Deployment

### 1. Environment Configuration

Set your project configuration:

```bash
export PROJECT_ID="your-gcp-project-id"
export CLUSTER_NAME="wander-verse-cluster"
export ZONE="us-central1-a"
export NAMESPACE="wander-verse"
```

### 2. GKE Cluster Setup

**Option A: Use Setup Script (Recommended)**
```bash
./scripts/wanderverse-setup.sh --project-id=$PROJECT_ID
```

**Option B: Manual Setup**
```bash
# Create cluster
gcloud container clusters create $CLUSTER_NAME \
    --zone $ZONE \
    --machine-type e2-standard-4 \
    --num-nodes 3 \
    --enable-autorepair \
    --enable-autoupgrade \
    --enable-autoscaling \
    --min-nodes 1 \
    --max-nodes 10 \
    --enable-network-policy \
    --workload-pool=$PROJECT_ID.svc.id.goog \
    --enable-ip-alias

# Get credentials
gcloud container clusters get-credentials $CLUSTER_NAME --zone $ZONE
```

### 3. Build and Push Images

**Using Cloud Build (Recommended)**:
```bash
# Submit build with automatic tagging
gcloud builds submit --config=cloudbuild.yaml --substitutions=TAG_NAME=v1.0.0
```

**Local Build**:
```bash
# Build image
docker build -t gcr.io/$PROJECT_ID/wander-verse-builder:v1.0.0 .

# Push to registry
docker push gcr.io/$PROJECT_ID/wander-verse-builder:v1.0.0
```

### 4. Configure Secrets

**Create API Secrets**:
```bash
# Create namespace
kubectl create namespace $NAMESPACE

# Create application secrets
kubectl create secret generic wander-verse-secrets \
    --from-literal=api-key="$(openssl rand -hex 32)" \
    --from-literal=webhook-secret="$(openssl rand -hex 32)" \
    --namespace=$NAMESPACE

# For Google Cloud Storage (optional)
# First create service account key, then:
kubectl create secret generic wander-verse-secrets \
    --from-file=gcs-service-account=path/to/service-account.json \
    --namespace=$NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
```

**Create Image Pull Secrets** (for private registry):
```bash
# Create service account
gcloud iam service-accounts create gcr-access-sa \
    --description="GCR access for WanderVerse" \
    --display-name="GCR Access SA"

# Grant permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:gcr-access-sa@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectViewer"

# Create key and k8s secret
gcloud iam service-accounts keys create gcr-key.json \
    --iam-account=gcr-access-sa@$PROJECT_ID.iam.gserviceaccount.com

kubectl create secret docker-registry gcr-secret \
    --docker-server=https://gcr.io \
    --docker-username=_json_key \
    --docker-password="$(cat gcr-key.json)" \
    --docker-email=admin@example.com \
    --namespace=$NAMESPACE

# Clean up key file
rm gcr-key.json
```

### 5. Deploy Application

```bash
# Update image tags in manifests
sed -i "s|:v1.0.0|:v1.0.0|g" k8s/travel-app-all-in-one.yaml

# Deploy all resources
kubectl apply -f k8s/travel-app-all-in-one.yaml

# Wait for deployment
kubectl wait --for=condition=available --timeout=300s \
    deployment/wander-verse-builder -n $NAMESPACE
```

### 6. Verify Deployment

```bash
# Check deployment status
./scripts/travel-deploy.sh status

# Or manually:
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get hpa -n $NAMESPACE
```

## Configuration Options

### Environment Variables

Configure the application through ConfigMaps:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: wander-verse-config
  namespace: wander-verse
data:
  NODE_ENV: "production"
  LOG_LEVEL: "info"
  BUILD_TIMEOUT: "1800"
  MAX_CONCURRENT_BUILDS: "5"
  STORAGE_PROVIDER: "gcs"
```

### Resource Limits

Adjust resource allocation based on your needs:

```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "250m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

### Auto-scaling Configuration

The HPA automatically scales based on CPU/memory:

```yaml
spec:
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## Storage Configuration

### Persistent Volumes

The application uses persistent storage for:

1. **Build Cache** (20GB) - Speeds up subsequent builds
2. **Build Artifacts** (50GB) - Stores completed builds

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: build-cache-pvc
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 20Gi
  storageClassName: ssd
```

### Google Cloud Storage Integration

For large-scale storage, configure GCS:

```bash
# Create GCS bucket
gsutil mb gs://$PROJECT_ID-wander-verse-builds

# Create service account with storage permissions
gcloud iam service-accounts create wander-verse-storage \
    --display-name="WanderVerse Storage SA"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:wander-verse-storage@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/storage.objectAdmin"
```

## Security Configuration

### Pod Security Standards

The deployment uses restricted pod security:

```yaml
metadata:
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/audit: restricted
    pod-security.kubernetes.io/warn: restricted
```

### Network Policies

Restrict network access between pods:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: wander-verse-network-policy
spec:
  podSelector:
    matchLabels:
      app: wander-verse-builder
  policyTypes: [Ingress, Egress]
  ingress:
  - from: [] # Define allowed sources
  egress:
  - {} # Allow all outbound (for API calls)
```

## Monitoring and Logging

### Health Checks

The application includes comprehensive health checks:

- **Startup Probe**: 30s delay, checks every 10s
- **Liveness Probe**: 60s delay, checks every 30s  
- **Readiness Probe**: 10s delay, checks every 10s

### Prometheus Integration

Metrics are exposed at `/metrics`:

```yaml
annotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "3000"
  prometheus.io/path: "/metrics"
```

### Log Management

Logs are written to multiple files:
- `/app/logs/app.log` - General application logs
- `/app/logs/error.log` - Error logs only
- `/app/logs/builds.log` - Build-specific logs

Access logs:
```bash
# Follow logs
kubectl logs -f deployment/wander-verse-builder -n $NAMESPACE

# Or use management script
./scripts/travel-deploy.sh logs --follow
```

## Backup and Disaster Recovery

### Automated Backups

```bash
# Create backup
./scripts/travel-deploy.sh backup

# Backups include:
# - Kubernetes resources (YAML)
# - Secrets and ConfigMaps
# - PVC configurations
```

### Restore Procedures

```bash
# Restore from backup
kubectl apply -f backups/20240115-143022/all-resources.yaml
```

## Performance Tuning

### Build Optimization

1. **Increase concurrent builds**:
   ```bash
   kubectl patch configmap wander-verse-config -n $NAMESPACE \
       -p '{"data":{"MAX_CONCURRENT_BUILDS":"8"}}'
   ```

2. **Scale up replicas**:
   ```bash
   kubectl scale deployment wander-verse-builder --replicas=5 -n $NAMESPACE
   ```

3. **Adjust HPA thresholds**:
   ```bash
   kubectl patch hpa wander-verse-builder-hpa -n $NAMESPACE \
       --type='merge' -p='{"spec":{"metrics":[{"type":"Resource","resource":{"name":"cpu","target":{"type":"Utilization","averageUtilization":50}}}]}}'
   ```

### Resource Optimization

Monitor resource usage:
```bash
# Check current usage
kubectl top pods -n $NAMESPACE
kubectl top nodes

# Adjust limits if needed
kubectl patch deployment wander-verse-builder -n $NAMESPACE \
    -p '{"spec":{"template":{"spec":{"containers":[{"name":"builder","resources":{"limits":{"memory":"4Gi","cpu":"2000m"}}}]}}}}'
```

## Multi-Region Deployment

For high availability across regions:

```bash
# Create clusters in multiple zones
ZONES=("us-central1-a" "us-central1-b" "us-east1-a")

for zone in "${ZONES[@]}"; do
    gcloud container clusters create wander-verse-$zone \
        --zone $zone \
        --num-nodes 2 \
        # ... other options
done

# Deploy to each cluster
for zone in "${ZONES[@]}"; do
    gcloud container clusters get-credentials wander-verse-$zone --zone $zone
    kubectl apply -f k8s/travel-app-all-in-one.yaml
done
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to GKE
on:
  push:
    tags: ['v*']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Google Cloud
      uses: google-github-actions/setup-gcloud@v0
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        
    - name: Build and Deploy
      run: |
        gcloud builds submit --config=cloudbuild.yaml \
          --substitutions=TAG_NAME=${GITHUB_REF#refs/tags/}
        
        # Update and deploy manifests
        sed -i "s|:v1.0.0|:${GITHUB_REF#refs/tags/}|g" k8s/travel-app-all-in-one.yaml
        kubectl apply -f k8s/travel-app-all-in-one.yaml
```

### GitLab CI

```yaml
# .gitlab-ci.yml
stages:
  - build
  - deploy

build:
  stage: build
  script:
    - gcloud builds submit --config=cloudbuild.yaml --substitutions=TAG_NAME=$CI_COMMIT_TAG

deploy:
  stage: deploy
  script:
    - sed -i "s|:v1.0.0|:$CI_COMMIT_TAG|g" k8s/travel-app-all-in-one.yaml
    - kubectl apply -f k8s/travel-app-all-in-one.yaml
  only:
    - tags
```

## Troubleshooting

Common deployment issues and solutions:

### Image Pull Errors
```bash
# Check image pull secret
kubectl get secret gcr-secret -n $NAMESPACE -o yaml

# Recreate if needed
kubectl delete secret gcr-secret -n $NAMESPACE
# ... recreate secret
```

### Pod Startup Issues
```bash
# Check pod events
kubectl describe pod -l app=wander-verse-builder -n $NAMESPACE

# Check logs
kubectl logs -l app=wander-verse-builder -n $NAMESPACE
```

### Resource Constraints
```bash
# Check resource usage
kubectl top pods -n $NAMESPACE

# Check node capacity
kubectl describe nodes
```

For more troubleshooting help, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Management Commands

Use the management script for common operations:

```bash
# Check status
./scripts/travel-deploy.sh status

# Scale deployment
./scripts/travel-deploy.sh scale 5

# Update image
./scripts/travel-deploy.sh update v1.1.0

# Restart deployment  
./scripts/travel-deploy.sh restart

# View logs
./scripts/travel-deploy.sh logs --follow

# Port forward for local access
./scripts/travel-deploy.sh port-forward 8080

# Run health checks
./scripts/travel-deploy.sh health-check

# Create backup
./scripts/travel-deploy.sh backup

# Run tests
./scripts/travel-deploy.sh test
```

## Cleanup

To remove all resources:

```bash
# Remove application only
./scripts/cleanup.sh kubernetes

# Remove everything except cluster
./scripts/cleanup.sh all

# Remove cluster as well (DANGEROUS!)
./scripts/cleanup.sh cluster
```

## Support

For deployment support:
- Review [troubleshooting guide](./TROUBLESHOOTING.md)
- Check [API documentation](./TRAVEL_API.md) 
- Contact: support@wanderverse.com