# Quick Fix for PodUnschedulable Error

## Immediate Solution

The PodUnschedulable error typically means your GKE cluster either:
1. Doesn't have enough resources
2. Doesn't exist or isn't properly configured
3. Has nodes that aren't ready

## Step 1: Check Cluster Status
```bash
# Check if cluster exists
gcloud container clusters list --filter="name:keen-opus"

# If no cluster exists, create one:
gcloud container clusters create keen-opus-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --machine-type=e2-standard-2 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10
```

## Step 2: Get Cluster Credentials
```bash
gcloud container clusters get-credentials keen-opus-cluster --zone=us-central1-a
```

## Step 3: Check Node Status
```bash
kubectl get nodes
kubectl describe nodes
```

## Step 4: Deploy with Reduced Resources
The deployment might be requesting too many resources. Try deploying with minimal requirements:

```bash
# Delete existing deployment
kubectl delete -f kubernetes-manifests.yaml

# Redeploy
kubectl apply -f kubernetes-manifests.yaml
```

## Step 5: Monitor Deployment
```bash
# Watch pod status
kubectl get pods -n travel-app -w

# Check events for more details
kubectl get events --sort-by=.metadata.creationTimestamp -n travel-app
```

## Common Fixes

### If cluster doesn't exist:
Create a new GKE cluster with appropriate sizing

### If nodes aren't ready:
Wait for nodes to initialize or check node pool configuration

### If resource requests too high:
The manifests are configured with reasonable defaults, but if still failing, manually reduce CPU/memory requests

### If region/zone issues:
Ensure you're deploying to the correct zone where your cluster exists

The key is ensuring you have a properly configured GKE cluster with sufficient resources before deploying the application.