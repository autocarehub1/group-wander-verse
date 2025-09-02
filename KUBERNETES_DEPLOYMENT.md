# WanderTogether Kubernetes Deployment Guide

## Quick Start - GKE Deployment

Deploy the complete WanderTogether travel application to Google Kubernetes Engine with a single command:

```bash
kubectl apply -f kubernetes-manifests.yaml
```

## Prerequisites

1. **GKE Cluster**: Create a GKE cluster
```bash
export PROJECT_ID=your-gcp-project-id
export REGION=us-central1

gcloud container clusters create-auto wandertogether-cluster \
    --project=$PROJECT_ID \
    --region=$REGION
```

2. **Docker Images**: Build and push your application images
```bash
# Build and push backend
docker build -t gcr.io/$PROJECT_ID/wandertogether-backend:latest .
docker push gcr.io/$PROJECT_ID/wandertogether-backend:latest

# Build and push frontend  
docker build -f Dockerfile.frontend -t gcr.io/$PROJECT_ID/wandertogether-frontend:latest .
docker push gcr.io/$PROJECT_ID/wandertogether-frontend:latest
```

3. **Update Image References**: Replace `PROJECT_ID` in kubernetes-manifests.yaml
```bash
sed -i "s/PROJECT_ID/$PROJECT_ID/g" kubernetes-manifests.yaml
```

## Configuration Setup

### 1. Configure Secrets

Update the base64 encoded secrets in kubernetes-manifests.yaml:

```bash
# Database URL
echo -n "your-database-url" | base64

# SendGrid API Key
echo -n "your-sendgrid-key" | base64

# Anthropic API Key  
echo -n "your-anthropic-key" | base64

# Session Secret
echo -n "your-session-secret" | base64
```

### 2. Configure Domain

Replace `wandertogether.example.com` with your actual domain in the Ingress section.

### 3. Reserve Static IP (Optional)

```bash
gcloud compute addresses create wandertogether-ip --global
```

## Deployment

Deploy the complete stack:

```bash
kubectl apply -f kubernetes-manifests.yaml
```

## Verification

Check deployment status:

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

## Architecture Overview

The deployment includes:

- **Namespace**: `wandertogether` for resource isolation
- **Backend**: Node.js Express API (3-20 replicas with HPA)
- **Frontend**: Nginx reverse proxy (2-10 replicas with HPA)
- **Ingress**: GKE Ingress with SSL and CDN
- **Secrets**: Secure handling of API keys and database credentials
- **Network Policies**: Pod-to-pod communication security
- **Health Checks**: Readiness and liveness probes
- **Auto-scaling**: CPU and memory-based horizontal scaling

## Security Features

- Non-root user execution
- Read-only root filesystems
- Network policies for traffic control
- Security headers (XSS, CSRF protection)
- TLS termination with managed certificates
- Resource limits and requests

## Monitoring

Access application metrics:

```bash
# Pod resource usage
kubectl top pods -n wandertogether

# HPA status
kubectl get hpa -n wandertogether

# Events
kubectl get events -n wandertogether
```

## Scaling

Manual scaling:

```bash
# Scale backend
kubectl scale deployment wandertogether-backend --replicas=5 -n wandertogether

# Scale frontend
kubectl scale deployment wandertogether-frontend --replicas=3 -n wandertogether
```

Automatic scaling is configured via HPA based on CPU and memory utilization.

## Troubleshooting

Common debugging commands:

```bash
# Describe pod issues
kubectl describe pod <pod-name> -n wandertogether

# Check service endpoints
kubectl get endpoints -n wandertogether

# View detailed logs
kubectl logs -f deployment/wandertogether-backend -n wandertogether --previous

# Execute into pod
kubectl exec -it deployment/wandertogether-backend -n wandertogether -- sh
```

## Production Checklist

- [ ] Configure actual domain name in Ingress
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up backup strategy for database
- [ ] Configure CI/CD pipeline
- [ ] Load testing and capacity planning
- [ ] Disaster recovery planning

This deployment follows Google Cloud Platform microservices-demo best practices for production-ready Kubernetes applications.