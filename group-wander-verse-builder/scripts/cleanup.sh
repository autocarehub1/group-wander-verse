#!/bin/bash

# WanderVerse Builder - Cleanup Script
# Safely removes WanderVerse Builder resources from Kubernetes and GCP

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="wander-verse"
PROJECT_ID=${PROJECT_ID:-"keen-opus-470223-b7"}
CLUSTER_NAME=${CLUSTER_NAME:-"wander-verse-cluster"}
ZONE=${ZONE:-"us-central1-a"}

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

confirm_action() {
    local message="$1"
    local default="${2:-n}"
    
    if [[ "$default" == "y" ]]; then
        read -p "$message [Y/n]: " response
        response=${response:-y}
    else
        read -p "$message [y/N]: " response
        response=${response:-n}
    fi
    
    [[ "$response" =~ ^[Yy]$ ]]
}

cleanup_kubernetes() {
    log_info "Cleaning up Kubernetes resources..."
    
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log_warning "Namespace $NAMESPACE not found - skipping Kubernetes cleanup"
        return 0
    fi
    
    # Show what will be deleted
    echo ""
    log_info "The following resources will be deleted:"
    echo "========================================"
    kubectl get all -n $NAMESPACE 2>/dev/null || echo "No resources found"
    echo ""
    kubectl get pvc -n $NAMESPACE 2>/dev/null || echo "No PVCs found"
    echo ""
    kubectl get secrets -n $NAMESPACE 2>/dev/null || echo "No secrets found"
    echo ""
    
    if confirm_action "Delete all resources in namespace '$NAMESPACE'?"; then
        # Delete all resources in namespace
        log_info "Deleting all resources in namespace $NAMESPACE..."
        kubectl delete all --all -n $NAMESPACE --wait=true --timeout=300s
        
        # Delete PVCs (not included in 'all')
        log_info "Deleting Persistent Volume Claims..."
        kubectl delete pvc --all -n $NAMESPACE --wait=true --timeout=60s
        
        # Delete secrets
        log_info "Deleting secrets..."
        kubectl delete secrets --all -n $NAMESPACE --wait=true
        
        # Delete namespace
        log_info "Deleting namespace..."
        kubectl delete namespace $NAMESPACE --wait=true --timeout=60s
        
        log_success "Kubernetes resources cleaned up successfully"
    else
        log_info "Kubernetes cleanup skipped"
    fi
}

cleanup_docker_images() {
    log_info "Cleaning up Docker images..."
    
    if confirm_action "Remove local Docker images for WanderVerse Builder?"; then
        # Remove local images
        docker images --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}" | grep wander-verse-builder || log_info "No local images found"
        
        # Remove all tags
        docker images gcr.io/$PROJECT_ID/wander-verse-builder --format "{{.Repository}}:{{.Tag}}" | while read image; do
            if [[ -n "$image" ]]; then
                log_info "Removing local image: $image"
                docker rmi "$image" 2>/dev/null || log_warning "Failed to remove $image"
            fi
        done
        
        log_success "Local Docker images cleaned up"
    else
        log_info "Docker image cleanup skipped"
    fi
}

cleanup_gcp_resources() {
    log_info "Cleaning up GCP resources..."
    
    # List GCR images
    if gcloud container images list --repository=gcr.io/$PROJECT_ID --filter="name ~ wander-verse-builder" --format="value(name)" | grep -q wander-verse-builder; then
        echo ""
        log_info "GCR images found:"
        gcloud container images list-tags gcr.io/$PROJECT_ID/wander-verse-builder --format="table(tags,digest,timestamp)"
        echo ""
        
        if confirm_action "Delete all GCR images for WanderVerse Builder?"; then
            # Delete all image tags
            gcloud container images list-tags gcr.io/$PROJECT_ID/wander-verse-builder --format="value(digest)" | while read digest; do
                if [[ -n "$digest" ]]; then
                    log_info "Deleting image: gcr.io/$PROJECT_ID/wander-verse-builder@$digest"
                    gcloud container images delete "gcr.io/$PROJECT_ID/wander-verse-builder@$digest" --quiet
                fi
            done
            
            log_success "GCR images cleaned up"
        else
            log_info "GCR image cleanup skipped"
        fi
    else
        log_info "No GCR images found for wander-verse-builder"
    fi
    
    # Service accounts
    if gcloud iam service-accounts describe gcr-access-sa@$PROJECT_ID.iam.gserviceaccount.com &> /dev/null; then
        echo ""
        if confirm_action "Delete service account 'gcr-access-sa'?"; then
            log_info "Deleting service account..."
            
            # Remove IAM policy bindings first
            gcloud projects remove-iam-policy-binding $PROJECT_ID \
                --member="serviceAccount:gcr-access-sa@$PROJECT_ID.iam.gserviceaccount.com" \
                --role="roles/storage.objectViewer" --quiet || log_warning "Failed to remove IAM binding"
            
            # Delete service account
            gcloud iam service-accounts delete gcr-access-sa@$PROJECT_ID.iam.gserviceaccount.com --quiet
            
            log_success "Service account deleted"
        else
            log_info "Service account cleanup skipped"
        fi
    else
        log_info "Service account 'gcr-access-sa' not found"
    fi
}

cleanup_gke_cluster() {
    log_warning "GKE Cluster Cleanup"
    echo "==================="
    
    if gcloud container clusters describe $CLUSTER_NAME --zone=$ZONE &> /dev/null; then
        echo ""
        log_warning "⚠️  DANGER ZONE ⚠️"
        log_warning "This will DELETE the entire GKE cluster: $CLUSTER_NAME"
        log_warning "This action is IRREVERSIBLE and will affect ALL applications in the cluster!"
        echo ""
        
        # Show cluster info
        log_info "Cluster information:"
        gcloud container clusters describe $CLUSTER_NAME --zone=$ZONE --format="table(name,location,status,currentNodeCount,endpoint)"
        
        echo ""
        if confirm_action "❌ Are you ABSOLUTELY SURE you want to delete the entire cluster?"; then
            log_info "Deleting GKE cluster: $CLUSTER_NAME"
            log_warning "This may take several minutes..."
            
            gcloud container clusters delete $CLUSTER_NAME --zone=$ZONE --quiet
            
            log_success "GKE cluster deleted"
        else
            log_info "Cluster deletion cancelled"
        fi
    else
        log_info "GKE cluster '$CLUSTER_NAME' not found"
    fi
}

cleanup_local_files() {
    log_info "Cleaning up local files..."
    
    # Remove backup directories
    if [[ -d "./backups" ]]; then
        echo ""
        log_info "Backup directories found:"
        ls -la ./backups/ 2>/dev/null || echo "None"
        echo ""
        
        if confirm_action "Remove backup directories?"; then
            rm -rf ./backups
            log_success "Backup directories removed"
        else
            log_info "Backup cleanup skipped"
        fi
    fi
    
    # Remove log files
    if [[ -d "./logs" ]]; then
        echo ""
        if confirm_action "Remove log files?"; then
            rm -rf ./logs
            log_success "Log files removed"
        else
            log_info "Log cleanup skipped"
        fi
    fi
    
    # Remove temporary files
    if [[ -f "/tmp/gcr-key.json" ]]; then
        rm -f /tmp/gcr-key.json
        log_success "Removed temporary GCR key file"
    fi
}

show_cleanup_summary() {
    echo ""
    log_info "Cleanup Summary"
    echo "==============="
    echo ""
    
    # Check what's left
    log_info "Remaining resources:"
    
    # Kubernetes
    if kubectl get namespace $NAMESPACE &> /dev/null; then
        log_warning "  ❌ Kubernetes namespace '$NAMESPACE' still exists"
    else
        log_success "  ✅ Kubernetes resources cleaned"
    fi
    
    # Docker images
    if docker images --format "{{.Repository}}" | grep -q wander-verse-builder; then
        log_warning "  ❌ Local Docker images still exist"
    else
        log_success "  ✅ Local Docker images cleaned"
    fi
    
    # GCR images
    if gcloud container images list --repository=gcr.io/$PROJECT_ID --filter="name ~ wander-verse-builder" --format="value(name)" | grep -q wander-verse-builder; then
        log_warning "  ❌ GCR images still exist"
    else
        log_success "  ✅ GCR images cleaned"
    fi
    
    # Service account
    if gcloud iam service-accounts describe gcr-access-sa@$PROJECT_ID.iam.gserviceaccount.com &> /dev/null; then
        log_warning "  ❌ Service account still exists"
    else
        log_success "  ✅ Service account cleaned"
    fi
    
    # Cluster
    if gcloud container clusters describe $CLUSTER_NAME --zone=$ZONE &> /dev/null; then
        log_info "  ℹ️  GKE cluster still exists (not cleaned by default)"
    else
        log_success "  ✅ GKE cluster cleaned"
    fi
    
    echo ""
    log_success "Cleanup process completed!"
}

show_help() {
    echo "WanderVerse Builder Cleanup Script"
    echo "=================================="
    echo ""
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  all           Clean up everything except GKE cluster (default)"
    echo "  kubernetes    Clean up only Kubernetes resources"
    echo "  docker        Clean up only Docker images"
    echo "  gcp           Clean up only GCP resources (images, service accounts)"
    echo "  cluster       Clean up GKE cluster (DANGEROUS!)"
    echo "  local         Clean up only local files"
    echo "  help          Show this help message"
    echo ""
    echo "Options:"
    echo "  --project-id     GCP Project ID (default: keen-opus-470223-b7)"
    echo "  --cluster-name   GKE Cluster name (default: wander-verse-cluster)"
    echo "  --zone           GCP Zone (default: us-central1-a)"
    echo "  --force          Skip confirmation prompts (DANGEROUS!)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Interactive cleanup (all except cluster)"
    echo "  $0 kubernetes         # Clean up only Kubernetes resources"
    echo "  $0 cluster --force    # Delete cluster without confirmation"
}

# Parse command line arguments
FORCE_MODE=false
COMMAND="${1:-all}"

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
        --force)
            FORCE_MODE=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        all|kubernetes|docker|gcp|cluster|local|help)
            COMMAND="$1"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
done

# Override confirmation function in force mode
if [[ "$FORCE_MODE" == "true" ]]; then
    confirm_action() {
        return 0
    }
    log_warning "Running in FORCE mode - all confirmations will be skipped!"
fi

# Main execution
case "$COMMAND" in
    all)
        log_info "Starting comprehensive cleanup (excluding GKE cluster)..."
        cleanup_kubernetes
        cleanup_docker_images
        cleanup_gcp_resources
        cleanup_local_files
        show_cleanup_summary
        ;;
    kubernetes)
        log_info "Starting Kubernetes cleanup..."
        cleanup_kubernetes
        ;;
    docker)
        log_info "Starting Docker cleanup..."
        cleanup_docker_images
        ;;
    gcp)
        log_info "Starting GCP resource cleanup..."
        cleanup_gcp_resources
        ;;
    cluster)
        log_info "Starting GKE cluster cleanup..."
        cleanup_gke_cluster
        ;;
    local)
        log_info "Starting local files cleanup..."
        cleanup_local_files
        ;;
    help)
        show_help
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        show_help
        exit 1
        ;;
esac