# Kubernetes Deployment Troubleshooting

## Current Error: PodUnschedulable

This error indicates that Kubernetes cannot schedule pods to run on available nodes.

### Common Causes and Solutions

#### 1. Insufficient Cluster Resources
**Problem**: Not enough CPU/memory on cluster nodes
**Check**:
```bash
kubectl describe nodes
kubectl top nodes
kubectl get pods -n travel-app -o wide
```

**Solution**: Scale up cluster or reduce resource requests

#### 2. No Available Nodes
**Problem**: Cluster has no worker nodes or nodes are not ready
**Check**:
```bash
kubectl get nodes
kubectl describe nodes
```

**Solution**: 
- Ensure cluster has worker nodes
- Check node pool configuration
- Verify nodes are in "Ready" state

#### 3. Resource Requests Too High
**Problem**: Pod resource requests exceed available node capacity
**Check**: Look at resource requests in deployment manifests

**Solution**: Reduce resource requests in kubernetes-manifests.yaml

#### 4. Node Selector/Affinity Issues
**Problem**: Pods can't find nodes matching their requirements
**Check**: Look for nodeSelector or affinity rules

**Solution**: Remove or adjust node selectors

#### 5. Cluster Autoscaler Issues
**Problem**: Cluster autoscaler not creating new nodes
**Check**:
```bash
kubectl get events --sort-by=.metadata.creationTimestamp
```

**Solution**: Enable cluster autoscaler or manually add nodes

## Immediate Fixes

### Fix 1: Check Cluster Status
```bash
# Check if cluster exists and is accessible
kubectl cluster-info

# Check nodes
kubectl get nodes -o wide

# Check if nodes are ready
kubectl describe nodes
```

### Fix 2: Reduce Resource Requirements
Update kubernetes-manifests.yaml to use minimal resources:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 512Mi
```

### Fix 3: Check Cluster Capacity
```bash
# See what resources are available
kubectl describe nodes

# Check current resource usage
kubectl top nodes
kubectl top pods -n travel-app
```

### Fix 4: Enable Cluster Autoscaler (if needed)
```bash
# Check if cluster autoscaler is enabled
gcloud container clusters describe keen-opus-cluster \
  --zone=your-zone \
  --format="value(nodePools[].autoscaling)"
```

## Quick Recovery Commands

```bash
# Delete existing deployment
kubectl delete -f kubernetes-manifests.yaml

# Wait for cleanup
kubectl get pods -n travel-app

# Redeploy with fixed configuration
kubectl apply -f kubernetes-manifests.yaml
```

## Cluster Creation (if needed)
If cluster doesn't exist or has issues:

```bash
# Create new GKE cluster with autoscaling
gcloud container clusters create keen-opus-cluster \
  --zone=us-central1-a \
  --num-nodes=3 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10 \
  --machine-type=e2-standard-2 \
  --enable-autorepair \
  --enable-autoupgrade
```

The PodUnschedulable error is usually resolved by ensuring adequate cluster resources or adjusting pod resource requirements.