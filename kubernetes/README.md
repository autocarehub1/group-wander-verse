# WanderTogether Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the WanderTogether travel application to production-ready Kubernetes clusters, following Google Cloud Platform best practices.

## Architecture Overview

The deployment follows a microservices architecture with:
- **Frontend**: Nginx serving static React assets with reverse proxy to backend
- **Backend**: Node.js Express API server with health checks and auto-scaling  
- **Database**: External PostgreSQL (Neon or Google Cloud SQL)
- **Ingress**: GKE Ingress with SSL termination and CDN
- **Monitoring**: Built-in health checks and HPA scaling

## Quick Start

### Prerequisites
- Kubernetes cluster (GKE recommended)
- kubectl configured
- Docker registry access (GCR/Artifact Registry)

### 1. Build and Push Images
```bash
# Build backend image
docker build -t gcr.io/YOUR_PROJECT_ID/wandertogether-backend:latest .

# Build frontend image  
docker build -f Dockerfile.frontend -t gcr.io/YOUR_PROJECT_ID/wandertogether-frontend:latest .

# Push images
docker push gcr.io/YOUR_PROJECT_ID/wandertogether-backend:latest
docker push gcr.io/YOUR_PROJECT_ID/wandertogether-frontend:latest
```

### 2. Configure Secrets
```bash
# Create namespace
kubectl apply -f namespace.yaml

# Update secrets with base64 encoded values
kubectl apply -f secret.yaml
```

### 3. Deploy Application
```bash
# Deploy all resources
kubectl apply -k .

# Or deploy individually
kubectl apply -f configmap.yaml
kubectl apply -f nginx-config.yaml
kubectl apply -f deployment.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml
kubectl apply -f network-policy.yaml
```

### 4. Verify Deployment
```bash
# Check pods
kubectl get pods -n wandertogether

# Check services
kubectl get svc -n wandertogether

# Check ingress
kubectl get ingress -n wandertogether

# View logs
kubectl logs -f deployment/wandertogether-backend -n wandertogether
```

## Configuration

### Environment Variables
Configure in `configmap.yaml`:
- `NODE_ENV`: Application environment
- `CACHE_TTL`: Cache timeout in seconds
- `MAX_UPLOAD_SIZE`: Maximum file upload size
- `SESSION_TIMEOUT`: Session timeout in seconds

### Secrets
Configure in `secret.yaml` (base64 encoded):
- `DATABASE_URL`: PostgreSQL connection string
- `SENDGRID_API_KEY`: SendGrid API key for email
- `ANTHROPIC_API_KEY`: Anthropic AI API key
- `SESSION_SECRET`: Session encryption secret
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`: Database connection details

### Ingress Configuration
Update `ingress.yaml`:
- Replace `wandertogether.example.com` with your domain
- Update SSL certificate configuration
- Configure static IP reservation

## Scaling

### Horizontal Pod Autoscaler (HPA)
Automatically scales based on:
- **Backend**: CPU (70%) and Memory (80%) utilization, 3-20 replicas
- **Frontend**: CPU (60%) and Memory (70%) utilization, 2-10 replicas

### Manual Scaling
```bash
# Scale backend
kubectl scale deployment wandertogether-backend --replicas=5 -n wandertogether

# Scale frontend  
kubectl scale deployment wandertogether-frontend --replicas=3 -n wandertogether
```

## Security Features

### Pod Security
- Non-root user execution (UID 1000/101)
- Read-only root filesystem
- Dropped capabilities
- Security contexts enforced

### Network Policies
- Frontend can only communicate with backend
- Backend can access external APIs and database
- Ingress controller access controlled

### Resource Limits
- CPU and memory limits defined
- Resource requests for scheduling
- Quality of Service guaranteed

## Monitoring & Health Checks

### Health Endpoints
- Backend: `GET /health` returns `200 OK`
- Frontend: Nginx root path returns `200 OK`

### Probes Configuration
- **Readiness**: Ensures pod ready before traffic
- **Liveness**: Restarts failed pods automatically
- **Startup**: Handles slow application startup

### Observability
```bash
# Check resource usage
kubectl top pods -n wandertogether

# View events
kubectl get events -n wandertogether --sort-by=.metadata.creationTimestamp

# Monitor HPA
kubectl get hpa -n wandertogether -w
```

## Development Workflow

### Using Skaffold
```bash
# Development mode with hot reload
skaffold dev --profile=dev

# Production deployment
skaffold run --profile=production
```

### Local Testing
```bash
# Port forward backend
kubectl port-forward svc/wandertogether-backend 5000:80 -n wandertogether

# Port forward frontend
kubectl port-forward svc/wandertogether-frontend 3000:80 -n wandertogether
```

## Production Checklist

- [ ] Update domain in ingress.yaml
- [ ] Configure SSL certificates
- [ ] Set up monitoring (Prometheus/Grafana)
- [ ] Configure backup strategy
- [ ] Set up log aggregation
- [ ] Configure alerting
- [ ] Update resource limits based on load testing
- [ ] Set up CI/CD pipeline
- [ ] Configure database connection pooling
- [ ] Set up disaster recovery

## Troubleshooting

### Common Issues
```bash
# Pod not starting
kubectl describe pod <pod-name> -n wandertogether

# Service not accessible
kubectl get endpoints -n wandertogether

# Ingress issues
kubectl describe ingress wandertogether-ingress -n wandertogether

# HPA not scaling
kubectl describe hpa -n wandertogether
```

### Debug Commands
```bash
# Execute into backend pod
kubectl exec -it deployment/wandertogether-backend -n wandertogether -- sh

# View application logs
kubectl logs -f deployment/wandertogether-backend -n wandertogether

# Check resource usage
kubectl top pods -n wandertogether
```

## Advanced Configuration

### Custom Metrics Scaling
Add custom metrics for HPA:
```yaml
metrics:
- type: Pods
  pods:
    metric:
      name: http_requests_per_second
    target:
      type: AverageValue
      averageValue: "1000m"
```

### Service Mesh (Istio)
For advanced traffic management:
```bash
# Install Istio
kubectl label namespace wandertogether istio-injection=enabled
```

This Kubernetes configuration provides enterprise-grade deployment with high availability, security, and observability for the WanderTogether travel application.