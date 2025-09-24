# 🔧 WanderVerse Builder - Troubleshooting Guide

Common issues and solutions for the WanderVerse Builder service.

## Quick Diagnosis

### Check Service Health
```bash
# Quick status check
./scripts/travel-deploy.sh status

# Health check
./scripts/travel-deploy.sh health-check

# View recent logs
./scripts/travel-deploy.sh logs --lines 50
```

### Get External IP
```bash
kubectl get service wander-verse-builder-lb -n wander-verse
```

### Check Pod Status
```bash
kubectl get pods -n wander-verse -o wide
kubectl describe pods -l app=wander-verse-builder -n wander-verse
```

## Common Issues

### 🚫 Deployment Issues

#### Issue: Pods Stuck in `Pending` State

**Symptoms:**
- Pods show `Pending` status
- No pod IP assigned
- Deployment not progressing

**Diagnosis:**
```bash
kubectl describe pods -l app=wander-verse-builder -n wander-verse
kubectl get events -n wander-verse --sort-by='.lastTimestamp'
```

**Common Causes & Solutions:**

1. **Insufficient Resources**
   ```bash
   # Check node resources
   kubectl top nodes
   kubectl describe nodes
   
   # Solution: Scale down or add nodes
   gcloud container clusters resize wander-verse-cluster --num-nodes=5 --zone=us-central1-a
   ```

2. **Image Pull Secret Missing**
   ```bash
   # Check if secret exists
   kubectl get secret gcr-secret -n wander-verse
   
   # Recreate if missing
   ./scripts/wanderverse-setup.sh --project-id=your-project
   ```

3. **Pod Security Policy Violations**
   ```bash
   # Check security context in events
   kubectl get events -n wander-verse | grep -i security
   
   # Solution: Verify securityContext in deployment
   ```

#### Issue: `ImagePullBackOff` Error

**Symptoms:**
- Pods show `ImagePullBackOff` or `ErrImagePull`
- Container images cannot be downloaded

**Diagnosis:**
```bash
kubectl describe pod -l app=wander-verse-builder -n wander-verse | grep -A 10 "Events"
```

**Solutions:**

1. **Check Image Exists**
   ```bash
   # List images in registry
   gcloud container images list --repository=gcr.io/your-project-id
   gcloud container images list-tags gcr.io/your-project-id/wander-verse-builder
   ```

2. **Fix Authentication**
   ```bash
   # Recreate image pull secret
   kubectl delete secret gcr-secret -n wander-verse
   
   # Create service account
   gcloud iam service-accounts create gcr-access-sa \
       --display-name="GCR Access SA"
   
   # Grant permissions
   gcloud projects add-iam-policy-binding your-project-id \
       --member="serviceAccount:gcr-access-sa@your-project-id.iam.gserviceaccount.com" \
       --role="roles/storage.objectViewer"
   
   # Create key and secret
   gcloud iam service-accounts keys create gcr-key.json \
       --iam-account=gcr-access-sa@your-project-id.iam.gserviceaccount.com
   
   kubectl create secret docker-registry gcr-secret \
       --docker-server=https://gcr.io \
       --docker-username=_json_key \
       --docker-password="$(cat gcr-key.json)" \
       --docker-email=admin@example.com \
       --namespace=wander-verse
   
   rm gcr-key.json
   ```

3. **Check Image Tag**
   ```bash
   # Verify image tag in deployment
   kubectl get deployment wander-verse-builder -n wander-verse -o yaml | grep image:
   
   # Update if incorrect
   kubectl set image deployment/wander-verse-builder \
       builder=gcr.io/your-project-id/wander-verse-builder:v1.0.0 -n wander-verse
   ```

#### Issue: `CrashLoopBackOff` Error

**Symptoms:**
- Pods repeatedly restart
- Application fails to start properly

**Diagnosis:**
```bash
# Check pod logs
kubectl logs -l app=wander-verse-builder -n wander-verse --previous

# Check current logs
kubectl logs -l app=wander-verse-builder -n wander-verse --tail=100
```

**Common Causes & Solutions:**

1. **Application Configuration Error**
   ```bash
   # Check environment variables
   kubectl get configmap wander-verse-config -n wander-verse -o yaml
   kubectl get secret wander-verse-secrets -n wander-verse -o yaml
   
   # Fix configuration
   kubectl edit configmap wander-verse-config -n wander-verse
   ```

2. **Port Already in Use**
   ```bash
   # Check if PORT environment variable conflicts
   kubectl get deployment wander-verse-builder -n wander-verse -o yaml | grep -A 5 env:
   ```

3. **Health Check Failures**
   ```bash
   # Check health check configuration
   kubectl get deployment wander-verse-builder -n wander-verse -o yaml | grep -A 10 livenessProbe
   
   # Temporarily disable health checks
   kubectl patch deployment wander-verse-builder -n wander-verse \
       -p '{"spec":{"template":{"spec":{"containers":[{"name":"builder","livenessProbe":null,"readinessProbe":null}]}}}}'
   ```

### 🌐 Network Issues

#### Issue: Service Not Accessible Externally

**Symptoms:**
- LoadBalancer service has no external IP
- Cannot access service from outside cluster

**Diagnosis:**
```bash
kubectl get service wander-verse-builder-lb -n wander-verse -o wide
kubectl describe service wander-verse-builder-lb -n wander-verse
```

**Solutions:**

1. **Wait for IP Assignment**
   ```bash
   # Check external IP (may take 5-10 minutes)
   kubectl get service wander-verse-builder-lb -n wander-verse --watch
   ```

2. **Check GCP Quotas**
   ```bash
   # Check external IP quotas
   gcloud compute project-info describe --format="table(quotas.metric,quotas.usage,quotas.limit)"
   ```

3. **Use NodePort as Fallback**
   ```bash
   # Change service type temporarily
   kubectl patch service wander-verse-builder-lb -n wander-verse \
       -p '{"spec":{"type":"NodePort"}}'
   
   # Get node IP and port
   kubectl get nodes -o wide
   kubectl get service wander-verse-builder-lb -n wander-verse
   ```

#### Issue: Internal Service Communication Fails

**Symptoms:**
- Pods cannot communicate with each other
- Network policy blocking connections

**Diagnosis:**
```bash
# Check network policies
kubectl get networkpolicy -n wander-verse
kubectl describe networkpolicy wander-verse-network-policy -n wander-verse

# Test internal connectivity
kubectl run test-pod --rm -i --tty --image=curlimages/curl --restart=Never -- \
    curl -v http://wander-verse-builder-service.wander-verse.svc.cluster.local
```

**Solutions:**

1. **Adjust Network Policy**
   ```bash
   # Temporarily remove network policy for testing
   kubectl delete networkpolicy wander-verse-network-policy -n wander-verse
   
   # Test connectivity, then recreate with proper rules
   ```

2. **Check DNS Resolution**
   ```bash
   # Test DNS from within cluster
   kubectl run dns-test --rm -i --tty --image=busybox --restart=Never -- \
       nslookup wander-verse-builder-service.wander-verse.svc.cluster.local
   ```

### 📊 Performance Issues

#### Issue: High CPU/Memory Usage

**Symptoms:**
- Pods consuming excessive resources
- Slow response times
- HPA scaling up frequently

**Diagnosis:**
```bash
# Check resource usage
kubectl top pods -n wander-verse
kubectl top nodes

# Check HPA status
kubectl get hpa -n wander-verse
kubectl describe hpa wander-verse-builder-hpa -n wander-verse

# Check detailed pod metrics
kubectl describe pod -l app=wander-verse-builder -n wander-verse | grep -A 5 "Requests\|Limits"
```

**Solutions:**

1. **Scale Horizontally**
   ```bash
   # Increase replica count
   kubectl scale deployment wander-verse-builder --replicas=5 -n wander-verse
   
   # Adjust HPA limits
   kubectl patch hpa wander-verse-builder-hpa -n wander-verse \
       --type='merge' -p='{"spec":{"maxReplicas":15}}'
   ```

2. **Optimize Resource Limits**
   ```bash
   # Increase resource limits
   kubectl patch deployment wander-verse-builder -n wander-verse \
       -p '{"spec":{"template":{"spec":{"containers":[{"name":"builder","resources":{"limits":{"memory":"4Gi","cpu":"2000m"}}}]}}}}'
   ```

3. **Optimize Application Configuration**
   ```bash
   # Reduce concurrent builds
   kubectl patch configmap wander-verse-config -n wander-verse \
       -p '{"data":{"MAX_CONCURRENT_BUILDS":"3"}}'
   
   # Restart deployment to pick up changes
   kubectl rollout restart deployment/wander-verse-builder -n wander-verse
   ```

#### Issue: Slow Build Times

**Symptoms:**
- Builds taking longer than expected
- Build queue backing up
- Timeout errors

**Diagnosis:**
```bash
# Check build logs for bottlenecks
kubectl logs -l app=wander-verse-builder -n wander-verse | grep -i "step\|build\|timeout"

# Check persistent volume performance
kubectl get pvc -n wander-verse
kubectl describe pvc build-cache-pvc -n wander-verse
```

**Solutions:**

1. **Optimize Storage**
   ```bash
   # Use SSD storage class
   kubectl patch pvc build-cache-pvc -n wander-verse \
       -p '{"spec":{"storageClassName":"ssd"}}'
   ```

2. **Increase Build Timeout**
   ```bash
   kubectl patch configmap wander-verse-config -n wander-verse \
       -p '{"data":{"BUILD_TIMEOUT":"3600"}}'
   ```

3. **Scale Resources**
   ```bash
   # Add more CPU for parallel builds
   kubectl patch deployment wander-verse-builder -n wander-verse \
       -p '{"spec":{"template":{"spec":{"containers":[{"name":"builder","resources":{"requests":{"cpu":"500m"},"limits":{"cpu":"2000m"}}}]}}}}'
   ```

### 🗂️ Storage Issues

#### Issue: Persistent Volume Claims Pending

**Symptoms:**
- PVCs stuck in `Pending` state
- Pods cannot start due to volume mounting failures

**Diagnosis:**
```bash
kubectl get pvc -n wander-verse
kubectl describe pvc build-cache-pvc -n wander-verse
kubectl get events -n wander-verse | grep -i volume
```

**Solutions:**

1. **Check Storage Class**
   ```bash
   # List available storage classes
   kubectl get storageclass
   
   # Use default storage class if needed
   kubectl patch pvc build-cache-pvc -n wander-verse \
       -p '{"spec":{"storageClassName":""}}'
   ```

2. **Check Node Capacity**
   ```bash
   # Check available storage on nodes
   kubectl get nodes -o custom-columns=NAME:.metadata.name,STORAGE:.status.capacity.storage
   ```

3. **Recreate PVC with Different Size**
   ```bash
   # Delete and recreate with smaller size
   kubectl delete pvc build-cache-pvc -n wander-verse
   
   # Edit manifest and reduce size if needed
   sed -i 's/20Gi/10Gi/g' k8s/travel-app-all-in-one.yaml
   kubectl apply -f k8s/travel-app-all-in-one.yaml
   ```

### 🔐 Authentication Issues

#### Issue: API Calls Return 401 Unauthorized

**Symptoms:**
- API requests fail with 401 status
- "Invalid API key" errors in logs

**Diagnosis:**
```bash
# Check if secret exists and has correct data
kubectl get secret wander-verse-secrets -n wander-verse -o yaml

# Decode secret to verify
kubectl get secret wander-verse-secrets -n wander-verse -o jsonpath='{.data.api-key}' | base64 -d
```

**Solutions:**

1. **Update API Key**
   ```bash
   # Generate new API key
   NEW_KEY=$(openssl rand -hex 32)
   
   # Update secret
   kubectl patch secret wander-verse-secrets -n wander-verse \
       -p "{\"data\":{\"api-key\":\"$(echo -n $NEW_KEY | base64)\"}}"
   
   # Restart deployment
   kubectl rollout restart deployment/wander-verse-builder -n wander-verse
   ```

2. **Test API Key**
   ```bash
   # Get external IP
   EXTERNAL_IP=$(kubectl get service wander-verse-builder-lb -n wander-verse -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
   
   # Get API key
   API_KEY=$(kubectl get secret wander-verse-secrets -n wander-verse -o jsonpath='{.data.api-key}' | base64 -d)
   
   # Test API call
   curl -H "X-API-Key: $API_KEY" http://$EXTERNAL_IP/health
   ```

### 🔄 Auto-scaling Issues

#### Issue: HPA Not Scaling

**Symptoms:**
- Horizontal Pod Autoscaler not creating/removing pods
- CPU/memory thresholds reached but no scaling

**Diagnosis:**
```bash
# Check HPA status
kubectl get hpa -n wander-verse
kubectl describe hpa wander-verse-builder-hpa -n wander-verse

# Check metrics server
kubectl get pods -n kube-system | grep metrics-server
```

**Solutions:**

1. **Install/Fix Metrics Server**
   ```bash
   # Install metrics server if not present
   kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
   
   # Wait for metrics server to be ready
   kubectl wait --for=condition=ready pod -l k8s-app=metrics-server -n kube-system --timeout=120s
   ```

2. **Adjust HPA Configuration**
   ```bash
   # Lower CPU threshold for more aggressive scaling
   kubectl patch hpa wander-verse-builder-hpa -n wander-verse \
       --type='merge' -p='{"spec":{"metrics":[{"type":"Resource","resource":{"name":"cpu","target":{"type":"Utilization","averageUtilization":50}}}]}}'
   ```

3. **Check Pod Resources**
   ```bash
   # Ensure pods have resource requests defined
   kubectl get deployment wander-verse-builder -n wander-verse -o yaml | grep -A 5 resources:
   ```

## Diagnostic Commands

### Comprehensive Health Check
```bash
#!/bin/bash
echo "=== WanderVerse Builder Health Check ==="
echo ""

echo "1. Namespace Status:"
kubectl get namespace wander-verse

echo ""
echo "2. Pod Status:"
kubectl get pods -n wander-verse -o wide

echo ""
echo "3. Service Status:"
kubectl get services -n wander-verse

echo ""
echo "4. HPA Status:"
kubectl get hpa -n wander-verse

echo ""
echo "5. PVC Status:"
kubectl get pvc -n wander-verse

echo ""
echo "6. Recent Events:"
kubectl get events -n wander-verse --sort-by='.lastTimestamp' | tail -10

echo ""
echo "7. Resource Usage:"
kubectl top pods -n wander-verse 2>/dev/null || echo "Metrics server not available"

echo ""
echo "8. External Access:"
EXTERNAL_IP=$(kubectl get service wander-verse-builder-lb -n wander-verse -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
if [[ -n "$EXTERNAL_IP" && "$EXTERNAL_IP" != "null" ]]; then
    echo "External IP: $EXTERNAL_IP"
    curl -s -o /dev/null -w "Health check status: %{http_code}\n" http://$EXTERNAL_IP/health
else
    echo "External IP not assigned yet"
fi
```

### Log Analysis
```bash
# Check for errors in logs
kubectl logs -l app=wander-verse-builder -n wander-verse --tail=100 | grep -i error

# Check for build failures
kubectl logs -l app=wander-verse-builder -n wander-verse --tail=200 | grep -i "build.*fail"

# Check for memory/CPU issues
kubectl logs -l app=wander-verse-builder -n wander-verse --tail=100 | grep -i "memory\|cpu\|oom"
```

### Network Connectivity Test
```bash
# Test internal connectivity
kubectl run network-test --rm -i --tty --image=curlimages/curl --restart=Never -- /bin/sh -c "
echo 'Testing internal service...'
curl -f http://wander-verse-builder-service.wander-verse.svc.cluster.local/health

echo 'Testing external service...'
EXTERNAL_IP=\$(nslookup wander-verse-builder-lb.wander-verse.svc.cluster.local | grep Address | tail -1 | awk '{print \$2}')
curl -f http://\$EXTERNAL_IP/health
"
```

## Recovery Procedures

### Quick Recovery
```bash
# 1. Restart all pods
kubectl rollout restart deployment/wander-verse-builder -n wander-verse

# 2. Wait for rollout
kubectl rollout status deployment/wander-verse-builder -n wander-verse

# 3. Verify health
./scripts/travel-deploy.sh health-check
```

### Full Recovery
```bash
# 1. Scale down to zero
kubectl scale deployment wander-verse-builder --replicas=0 -n wander-verse

# 2. Wait for pods to terminate
kubectl wait --for=delete pod -l app=wander-verse-builder -n wander-verse --timeout=120s

# 3. Clear any pending PVCs if needed
kubectl delete pvc --all -n wander-verse

# 4. Redeploy
kubectl apply -f k8s/travel-app-all-in-one.yaml

# 5. Scale back up
kubectl scale deployment wander-verse-builder --replicas=2 -n wander-verse
```

### Rollback Deployment
```bash
# Check rollout history
kubectl rollout history deployment/wander-verse-builder -n wander-verse

# Rollback to previous version
kubectl rollout undo deployment/wander-verse-builder -n wander-verse

# Rollback to specific revision
kubectl rollout undo deployment/wander-verse-builder --to-revision=2 -n wander-verse
```

## Monitoring and Alerts

### Set up Monitoring
```bash
# Port forward to access metrics
kubectl port-forward service/wander-verse-builder-service 8080:80 -n wander-verse &

# Check metrics endpoint
curl http://localhost:8080/metrics
```

### Custom Health Checks
```bash
# Create monitoring script
cat > health-monitor.sh << 'EOF'
#!/bin/bash
EXTERNAL_IP=$(kubectl get service wander-verse-builder-lb -n wander-verse -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://$EXTERNAL_IP/health)

if [[ "$RESPONSE" != "200" ]]; then
    echo "Health check failed: $RESPONSE"
    # Send alert or take recovery action
    kubectl rollout restart deployment/wander-verse-builder -n wander-verse
fi
EOF

chmod +x health-monitor.sh

# Run every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /path/to/health-monitor.sh") | crontab -
```

## Getting Help

### Debug Information to Collect

When requesting support, please provide:

1. **Cluster Information:**
   ```bash
   kubectl version
   kubectl cluster-info
   kubectl get nodes -o wide
   ```

2. **Application Status:**
   ```bash
   kubectl get all -n wander-verse
   kubectl describe deployment wander-verse-builder -n wander-verse
   ```

3. **Logs:**
   ```bash
   kubectl logs -l app=wander-verse-builder -n wander-verse --tail=200 > wander-verse-logs.txt
   ```

4. **Events:**
   ```bash
   kubectl get events -n wander-verse --sort-by='.lastTimestamp' > wander-verse-events.txt
   ```

5. **Configuration:**
   ```bash
   kubectl get configmap wander-verse-config -n wander-verse -o yaml > config.yaml
   # Remove any sensitive data before sharing
   ```

### Support Channels

- 📧 Email: support@wanderverse.com
- 📖 Documentation: [DEPLOYMENT.md](./DEPLOYMENT.md) | [TRAVEL_API.md](./TRAVEL_API.md)
- 🐛 Issues: GitHub Issues (if applicable)

### Emergency Contacts

For critical production issues:
- 🚨 Emergency: emergency@wanderverse.com
- 📞 Phone: +1-XXX-XXX-XXXX (24/7 support)

---

**Last Updated:** January 2024  
**Version:** 1.0.0