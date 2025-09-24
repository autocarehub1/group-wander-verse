#!/bin/bash

# WanderVerse Builder - Main Setup Script
# This script sets up the complete WanderVerse Builder environment on GKE

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID=${PROJECT_ID:-"keen-opus-470223-b7"}
CLUSTER_NAME=${CLUSTER_NAME:-"wander-verse-cluster"}
ZONE=${ZONE:-"us-central1-a"}
NAMESPACE="wander-verse"
IMAGE_TAG=${IMAGE_TAG:-"v1.0.0"}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if gcloud is installed
    if ! command -v gcloud &> /dev/null; then
        log_error "gcloud CLI is not installed. Please install Google Cloud SDK."
        exit 1
    fi
    
    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed. Please install kubectl."
        exit 1
    fi
    
    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker."
        exit 1
    fi
    
    log_success "All prerequisites are installed"
}

authenticate_gcp() {
    log_info "Authenticating with Google Cloud..."
    
    # Set project
    gcloud config set project $PROJECT_ID
    
    # Authenticate Docker with GCR
    gcloud auth configure-docker --quiet
    
    # Get cluster credentials
    if gcloud container clusters describe $CLUSTER_NAME --zone=$ZONE &> /dev/null; then
        gcloud container clusters get-credentials $CLUSTER_NAME --zone $ZONE
        log_success "Connected to existing cluster: $CLUSTER_NAME"
    else
        log_warning "Cluster $CLUSTER_NAME not found. Creating new cluster..."
        create_gke_cluster
    fi
}

create_gke_cluster() {
    log_info "Creating GKE cluster: $CLUSTER_NAME"
    
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
        --enable-ip-alias \
        --disk-size 50GB \
        --disk-type pd-ssd \
        --preemptible
    
    # Get credentials
    gcloud container clusters get-credentials $CLUSTER_NAME --zone $ZONE
    
    log_success "GKE cluster created successfully"
}

build_and_push_images() {
    log_info "Building and pushing Docker images..."
    
    # Navigate to project root
    cd "$(dirname "$0")/.."
    
    # Build image
    docker build -t gcr.io/$PROJECT_ID/wander-verse-builder:$IMAGE_TAG .
    
    # Push image
    docker push gcr.io/$PROJECT_ID/wander-verse-builder:$IMAGE_TAG
    
    log_success "Docker image built and pushed successfully"
}

setup_kubernetes_secrets() {
    log_info "Setting up Kubernetes secrets..."
    
    # Create namespace if it doesn't exist
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Check if secrets exist, if not, create placeholders
    if ! kubectl get secret wander-verse-secrets -n $NAMESPACE &> /dev/null; then
        kubectl create secret generic wander-verse-secrets \
            --from-literal=api-key="wander-verse-dev-key-$(openssl rand -hex 16)" \
            --from-literal=gcs-service-account="{}" \
            --from-literal=webhook-secret="$(openssl rand -hex 32)" \
            --namespace=$NAMESPACE
        
        log_warning "Created placeholder secrets. Please update with real values:"
        log_warning "  kubectl patch secret wander-verse-secrets -n $NAMESPACE -p '{\"data\":{\"api-key\":\"<base64-encoded-key>\"}}'"
        log_warning "  kubectl patch secret wander-verse-secrets -n $NAMESPACE -p '{\"data\":{\"gcs-service-account\":\"<base64-encoded-json>\"}}'"
    fi
    
    # Create image pull secret if using private registry
    if ! kubectl get secret gcr-secret -n $NAMESPACE &> /dev/null; then
        # Create service account for GCR access
        SERVICE_ACCOUNT_NAME="gcr-access-sa"
        
        if ! gcloud iam service-accounts describe $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com &> /dev/null; then
            gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
                --description="Service account for GCR access" \
                --display-name="GCR Access SA"
            
            gcloud projects add-iam-policy-binding $PROJECT_ID \
                --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
                --role="roles/storage.objectViewer"
        fi
        
        # Create and download key (temporarily)
        KEY_FILE="/tmp/gcr-key.json"
        gcloud iam service-accounts keys create $KEY_FILE \
            --iam-account=$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com
        
        # Create Kubernetes secret
        kubectl create secret docker-registry gcr-secret \
            --docker-server=https://gcr.io \
            --docker-username=_json_key \
            --docker-password="$(cat $KEY_FILE)" \
            --docker-email=admin@$PROJECT_ID.iam.gserviceaccount.com \
            --namespace=$NAMESPACE
        
        # Clean up key file
        rm $KEY_FILE
        
        log_success "Created GCR image pull secret"
    fi
}

deploy_application() {
    log_info "Deploying WanderVerse Builder to Kubernetes..."
    
    # Update image tag in manifests
    cd "$(dirname "$0")/.."
    sed -i "s|:v1.0.0|:$IMAGE_TAG|g" k8s/travel-app-all-in-one.yaml
    
    # Apply Kubernetes manifests
    kubectl apply -f k8s/travel-app-all-in-one.yaml
    
    log_success "Application deployed successfully"
}

wait_for_deployment() {
    log_info "Waiting for deployment to be ready..."
    
    kubectl wait --for=condition=available --timeout=300s deployment/wander-verse-builder -n $NAMESPACE
    
    # Wait for external IP
    log_info "Waiting for LoadBalancer to get external IP..."
    
    for i in {1..30}; do
        EXTERNAL_IP=$(kubectl get service wander-verse-builder-lb -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
        if [[ -n "$EXTERNAL_IP" && "$EXTERNAL_IP" != "null" ]]; then
            log_success "External IP assigned: $EXTERNAL_IP"
            break
        fi
        echo "Waiting for external IP... (attempt $i/30)"
        sleep 10
    done
    
    if [[ -z "$EXTERNAL_IP" || "$EXTERNAL_IP" == "null" ]]; then
        log_warning "External IP not assigned yet. You can check later with:"
        log_warning "  kubectl get service wander-verse-builder-lb -n $NAMESPACE"
    fi
}

verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check pod status
    kubectl get pods -n $NAMESPACE -l app=wander-verse-builder
    
    # Check service status
    kubectl get services -n $NAMESPACE
    
    # Check HPA status
    kubectl get hpa -n $NAMESPACE
    
    # Test health endpoint
    CLUSTER_IP=$(kubectl get service wander-verse-builder-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    if kubectl run test-pod --rm -i --tty --image=curlimages/curl --restart=Never -- curl -f http://$CLUSTER_IP/health; then
        log_success "Health check passed"
    else
        log_warning "Health check failed - application may still be starting up"
    fi
    
    log_success "Deployment verification completed"
}

print_access_info() {
    log_info "Deployment completed! Here's how to access your service:"
    
    # Get external IP
    EXTERNAL_IP=$(kubectl get service wander-verse-builder-lb -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    
    echo ""
    echo "🌍 External Access:"
    if [[ "$EXTERNAL_IP" != "pending" && -n "$EXTERNAL_IP" ]]; then
        echo "  Health Check: http://$EXTERNAL_IP/health"
        echo "  API Base URL: http://$EXTERNAL_IP/api"
        echo "  Features API: http://$EXTERNAL_IP/api/travel/features"
    else
        echo "  External IP is still being assigned..."
        echo "  Check with: kubectl get service wander-verse-builder-lb -n $NAMESPACE"
    fi
    
    echo ""
    echo "🔧 Management Commands:"
    echo "  Check status: kubectl get pods -n $NAMESPACE"
    echo "  View logs: kubectl logs -f deployment/wander-verse-builder -n $NAMESPACE"
    echo "  Scale up: kubectl scale deployment wander-verse-builder --replicas=5 -n $NAMESPACE"
    echo "  Port forward: kubectl port-forward service/wander-verse-builder-service 8080:80 -n $NAMESPACE"
    
    echo ""
    echo "📊 Monitoring:"
    echo "  HPA status: kubectl get hpa -n $NAMESPACE"
    echo "  Resource usage: kubectl top pods -n $NAMESPACE"
    
    echo ""
    echo "🔑 API Usage:"
    echo "  API Key: Check secret 'wander-verse-secrets' in namespace '$NAMESPACE'"
    echo "  Documentation: See docs/TRAVEL_API.md for endpoint details"
    
    log_success "Setup completed successfully! 🎉"
}

cleanup_on_error() {
    log_error "Setup failed. Cleaning up..."
    kubectl delete namespace $NAMESPACE --ignore-not-found=true
    exit 1
}

# Main execution
main() {
    log_info "Starting WanderVerse Builder setup..."
    
    # Set up error handling
    trap cleanup_on_error ERR
    
    check_prerequisites
    authenticate_gcp
    build_and_push_images
    setup_kubernetes_secrets
    deploy_application
    wait_for_deployment
    verify_deployment
    print_access_info
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --project-id)
            PROJECT_ID="$2"
            shift 2
            ;;
        --cluster-name)
            CLUSTER_NAME="$2"
            shift 2
            ;;
        --zone)
            ZONE="$2"
            shift 2
            ;;
        --image-tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --project-id     GCP Project ID (default: keen-opus-470223-b7)"
            echo "  --cluster-name   GKE Cluster name (default: wander-verse-cluster)"
            echo "  --zone           GCP Zone (default: us-central1-a)"
            echo "  --image-tag      Docker image tag (default: v1.0.0)"
            echo "  --help           Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run main function
main