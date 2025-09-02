#!/bin/bash

set -e

# WanderTogether Kubernetes Deployment Script
# Based on Google Cloud Platform microservices-demo patterns

# Configuration
PROJECT_ID=${PROJECT_ID:-"your-gcp-project-id"}
CLUSTER_NAME=${CLUSTER_NAME:-"wandertogether-cluster"}
REGION=${REGION:-"us-central1"}
NAMESPACE="travel-app"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

echo_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    echo_info "Checking prerequisites..."
    
    # Check gcloud
    if ! command -v gcloud &> /dev/null; then
        echo_error "gcloud CLI not found. Please install Google Cloud SDK."
        exit 1
    fi
    
    # Check kubectl
    if ! command -v kubectl &> /dev/null; then
        echo_error "kubectl not found. Please install kubectl."
        exit 1
    fi
    
    # Check docker
    if ! command -v docker &> /dev/null; then
        echo_error "docker not found. Please install Docker."
        exit 1
    fi
    
    # Check kustomize
    if ! command -v kustomize &> /dev/null; then
        echo_warning "kustomize not found. Installing via kubectl..."
        kubectl kustomize --help > /dev/null || {
            echo_error "kubectl kustomize not available. Please install kustomize."
            exit 1
        }
    fi
    
    echo_success "All prerequisites met"
}

# Setup GCP project and enable APIs
setup_gcp() {
    echo_info "Setting up GCP project: $PROJECT_ID"
    
    gcloud config set project $PROJECT_ID
    
    echo_info "Enabling required APIs..."
    gcloud services enable container.googleapis.com \
        cloudbuild.googleapis.com \
        artifactregistry.googleapis.com \
        --project=$PROJECT_ID
    
    echo_success "GCP project setup complete"
}

# Create GKE cluster if it doesn't exist
create_cluster() {
    echo_info "Checking for existing cluster: $CLUSTER_NAME"
    
    if gcloud container clusters describe $CLUSTER_NAME --region=$REGION --project=$PROJECT_ID &> /dev/null; then
        echo_info "Cluster $CLUSTER_NAME already exists"
    else
        echo_info "Creating GKE cluster: $CLUSTER_NAME"
        gcloud container clusters create-auto $CLUSTER_NAME \
            --project=$PROJECT_ID \
            --region=$REGION \
            --enable-network-policy \
            --enable-ip-alias \
            --enable-autoscaling \
            --min-nodes=1 \
            --max-nodes=10
        
        echo_success "Cluster created successfully"
    fi
    
    # Get cluster credentials
    echo_info "Getting cluster credentials..."
    gcloud container clusters get-credentials $CLUSTER_NAME \
        --region=$REGION \
        --project=$PROJECT_ID
    
    echo_success "Cluster credentials configured"
}

# Build and push Docker images
build_images() {
    echo_info "Building and pushing Docker images..."
    
    # Configure Docker for GCR
    gcloud auth configure-docker gcr.io
    
    # Convert PROJECT_ID to lowercase for Docker compatibility
    PROJECT_ID_LOWER=$(echo "$PROJECT_ID" | tr '[:upper:]' '[:lower:]')
    echo_info "Using lowercase PROJECT_ID: $PROJECT_ID_LOWER"

    # Build backend image
    echo_info "Building backend image..."
    docker build -t gcr.io/$PROJECT_ID_LOWER/wandertogether-backend:latest .
    
    # Build frontend image
    echo_info "Building frontend image..."
    docker build -f Dockerfile.frontend -t gcr.io/$PROJECT_ID_LOWER/wandertogether-frontend:latest .
    
    # Build loadgenerator image
    echo_info "Building loadgenerator image..."
    docker build -f Dockerfile.loadgenerator -t gcr.io/$PROJECT_ID_LOWER/wandertogether-loadgenerator:latest .
    
    # Push images
    echo_info "Pushing images to registry..."
    docker push gcr.io/$PROJECT_ID_LOWER/wandertogether-backend:latest
    docker push gcr.io/$PROJECT_ID_LOWER/wandertogether-frontend:latest
    docker push gcr.io/$PROJECT_ID_LOWER/wandertogether-loadgenerator:latest
    
    echo_success "Images built and pushed successfully"
}

# Deploy to Kubernetes
deploy_k8s() {
    echo_info "Deploying to Kubernetes..."
    
    # Create namespace
    kubectl apply -f kubernetes/namespace.yaml
    
    # Apply secrets (user must configure these)
    echo_warning "Please ensure secrets are configured in kubernetes/secret.yaml"
    kubectl apply -f kubernetes/secret.yaml
    
    # Apply all other manifests using kustomization
    echo_info "Applying Kubernetes manifests..."
    
    # Update PROJECT_ID in kustomization
    sed -i.bak "s/PROJECT_ID/$PROJECT_ID/g" kubernetes/kustomization.yaml
    
    # Deploy using kustomize
    kubectl apply -k kubernetes/
    
    # Restore original kustomization.yaml
    mv kubernetes/kustomization.yaml.bak kubernetes/kustomization.yaml
    
    echo_success "Kubernetes deployment complete"
}

# Wait for deployments to be ready
wait_for_deployment() {
    echo_info "Waiting for deployments to be ready..."
    
    kubectl rollout status deployment/wandertogether-backend -n $NAMESPACE --timeout=300s
    kubectl rollout status deployment/wandertogether-frontend -n $NAMESPACE --timeout=300s
    
    echo_success "All deployments are ready"
}

# Show deployment status
show_status() {
    echo_info "Deployment Status:"
    echo
    
    echo "Pods:"
    kubectl get pods -n $NAMESPACE
    echo
    
    echo "Services:"
    kubectl get svc -n $NAMESPACE
    echo
    
    echo "Ingress:"
    kubectl get ingress -n $NAMESPACE
    echo
    
    echo "HPA Status:"
    kubectl get hpa -n $NAMESPACE
    echo
    
    # Get external IP
    EXTERNAL_IP=$(kubectl get ingress wandertogether-ingress -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending...")
    echo_info "External IP: $EXTERNAL_IP"
    
    if [ "$EXTERNAL_IP" != "Pending..." ]; then
        echo_success "Application should be available at: http://$EXTERNAL_IP"
        echo_info "Note: Configure DNS to point your domain to this IP"
    fi
}

# Cleanup function
cleanup() {
    echo_warning "Cleaning up temporary files..."
    rm -f kubernetes/kustomization.yaml.bak
}

# Main execution
main() {
    trap cleanup EXIT
    
    echo_info "Starting WanderTogether Kubernetes deployment..."
    echo_info "Project ID: $PROJECT_ID"
    echo_info "Cluster: $CLUSTER_NAME"
    echo_info "Region: $REGION"
    echo
    
    check_prerequisites
    setup_gcp
    create_cluster
    build_images
    deploy_k8s
    wait_for_deployment
    show_status
    
    echo
    echo_success "🎉 WanderTogether deployment completed successfully!"
    echo_info "Monitor your deployment with: kubectl get pods -n $NAMESPACE -w"
    echo_info "View logs with: kubectl logs -f deployment/wandertogether-backend -n $NAMESPACE"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "status")
        show_status
        ;;
    "cleanup")
        kubectl delete namespace $NAMESPACE --ignore-not-found=true
        echo_success "Namespace $NAMESPACE deleted"
        ;;
    *)
        echo "Usage: $0 [deploy|status|cleanup]"
        echo "  deploy  - Full deployment (default)"
        echo "  status  - Show current deployment status"
        echo "  cleanup - Delete the namespace and all resources"
        exit 1
        ;;
esac