#!/bin/bash

# WanderVerse Builder - Deployment Management Script
# Provides various deployment management commands

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="wander-verse"
APP_NAME="wander-verse-builder"
PROJECT_ID=${PROJECT_ID:-"keen-opus-470223-b7"}

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

show_status() {
    log_info "WanderVerse Builder Status"
    echo "================================"
    
    # Check if namespace exists
    if ! kubectl get namespace $NAMESPACE &> /dev/null; then
        log_error "Namespace $NAMESPACE not found. Is the application deployed?"
        return 1
    fi
    
    echo ""
    echo "📦 Pods:"
    kubectl get pods -n $NAMESPACE -l app=$APP_NAME
    
    echo ""
    echo "🌐 Services:"
    kubectl get services -n $NAMESPACE
    
    echo ""
    echo "📈 HPA Status:"
    kubectl get hpa -n $NAMESPACE
    
    echo ""
    echo "💾 Persistent Volumes:"
    kubectl get pvc -n $NAMESPACE
    
    echo ""
    echo "🔐 Secrets:"
    kubectl get secrets -n $NAMESPACE
    
    # Get external IP
    EXTERNAL_IP=$(kubectl get service ${APP_NAME}-lb -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
    if [[ "$EXTERNAL_IP" != "pending" && -n "$EXTERNAL_IP" ]]; then
        echo ""
        echo "🌍 External Access: http://$EXTERNAL_IP"
    fi
}

show_logs() {
    local follow=${1:-false}
    local lines=${2:-100}
    
    log_info "Showing application logs (last $lines lines)"
    
    if [[ "$follow" == "true" ]]; then
        kubectl logs -f deployment/$APP_NAME -n $NAMESPACE --tail=$lines
    else
        kubectl logs deployment/$APP_NAME -n $NAMESPACE --tail=$lines
    fi
}

scale_deployment() {
    local replicas=$1
    
    log_info "Scaling deployment to $replicas replicas"
    
    kubectl scale deployment $APP_NAME --replicas=$replicas -n $NAMESPACE
    
    log_info "Waiting for scaling to complete..."
    kubectl rollout status deployment/$APP_NAME -n $NAMESPACE
    
    log_success "Deployment scaled to $replicas replicas"
}

update_image() {
    local new_tag=$1
    local image_path="gcr.io/$PROJECT_ID/$APP_NAME:$new_tag"
    
    log_info "Updating deployment to use image: $image_path"
    
    # Update the deployment
    kubectl set image deployment/$APP_NAME builder=$image_path -n $NAMESPACE
    
    log_info "Waiting for rollout to complete..."
    kubectl rollout status deployment/$APP_NAME -n $NAMESPACE
    
    log_success "Image updated successfully"
}

restart_deployment() {
    log_info "Restarting deployment..."
    
    kubectl rollout restart deployment/$APP_NAME -n $NAMESPACE
    
    log_info "Waiting for restart to complete..."
    kubectl rollout status deployment/$APP_NAME -n $NAMESPACE
    
    log_success "Deployment restarted successfully"
}

port_forward() {
    local local_port=${1:-8080}
    
    log_info "Starting port forwarding: localhost:$local_port -> $APP_NAME:80"
    log_warning "Press Ctrl+C to stop port forwarding"
    
    kubectl port-forward service/${APP_NAME}-service $local_port:80 -n $NAMESPACE
}

run_health_check() {
    log_info "Running health check..."
    
    # Try internal service first
    if kubectl run health-check --rm -i --tty --image=curlimages/curl --restart=Never -- curl -f http://${APP_NAME}-service.$NAMESPACE.svc.cluster.local/health 2>/dev/null; then
        log_success "Internal health check passed"
    else
        log_error "Internal health check failed"
    fi
    
    # Try external service if available
    EXTERNAL_IP=$(kubectl get service ${APP_NAME}-lb -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    if [[ -n "$EXTERNAL_IP" && "$EXTERNAL_IP" != "null" ]]; then
        if curl -f http://$EXTERNAL_IP/health &> /dev/null; then
            log_success "External health check passed"
        else
            log_error "External health check failed"
        fi
    else
        log_warning "External IP not available for testing"
    fi
}

show_metrics() {
    log_info "Resource Metrics"
    echo "=================="
    
    if kubectl top pods -n $NAMESPACE &> /dev/null; then
        echo ""
        echo "📊 Pod Metrics:"
        kubectl top pods -n $NAMESPACE
        
        echo ""
        echo "🖥️ Node Metrics:"
        kubectl top nodes
    else
        log_warning "Metrics server not available"
    fi
    
    echo ""
    echo "📈 HPA Details:"
    kubectl describe hpa -n $NAMESPACE
}

update_config() {
    log_info "Current ConfigMap:"
    kubectl get configmap wander-verse-config -n $NAMESPACE -o yaml
    
    echo ""
    log_info "To update configuration:"
    log_info "  kubectl edit configmap wander-verse-config -n $NAMESPACE"
    log_info "  kubectl rollout restart deployment/$APP_NAME -n $NAMESPACE"
}

backup_data() {
    local backup_dir="./backups/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    log_info "Creating backup in $backup_dir"
    
    # Backup all Kubernetes resources
    kubectl get all -n $NAMESPACE -o yaml > "$backup_dir/all-resources.yaml"
    kubectl get secrets -n $NAMESPACE -o yaml > "$backup_dir/secrets.yaml"
    kubectl get configmaps -n $NAMESPACE -o yaml > "$backup_dir/configmaps.yaml"
    kubectl get pvc -n $NAMESPACE -o yaml > "$backup_dir/pvc.yaml"
    
    log_success "Backup created in $backup_dir"
}

run_tests() {
    log_info "Running API tests..."
    
    # Get service endpoint
    CLUSTER_IP=$(kubectl get service ${APP_NAME}-service -n $NAMESPACE -o jsonpath='{.spec.clusterIP}')
    
    # Create test pod
    kubectl run api-test --rm -i --image=curlimages/curl --restart=Never -- /bin/sh -c "
        echo 'Testing health endpoint...'
        curl -f http://$CLUSTER_IP/health || exit 1
        
        echo 'Testing features endpoint...'
        curl -f http://$CLUSTER_IP/api/travel/features || exit 1
        
        echo 'Testing platforms endpoint...'
        curl -f http://$CLUSTER_IP/api/travel/platforms || exit 1
        
        echo 'All tests passed!'
    "
    
    log_success "API tests completed successfully"
}

show_help() {
    echo "WanderVerse Builder Deployment Management"
    echo "========================================"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  status                    Show deployment status"
    echo "  logs [--follow] [--lines N]  Show application logs"
    echo "  scale <replicas>         Scale deployment to N replicas"
    echo "  update <image-tag>       Update to new image version"
    echo "  restart                  Restart the deployment"
    echo "  port-forward [port]      Forward local port to service (default: 8080)"
    echo "  health-check            Run health checks"
    echo "  metrics                 Show resource metrics"
    echo "  config                  Show/update configuration"
    echo "  backup                  Create backup of all resources"
    echo "  test                    Run API tests"
    echo "  help                    Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 logs --follow"
    echo "  $0 scale 5"
    echo "  $0 update v1.2.0"
    echo "  $0 port-forward 3000"
}

# Main command handling
case "${1:-help}" in
    status)
        show_status
        ;;
    logs)
        follow_flag=false
        lines=100
        shift
        while [[ $# -gt 0 ]]; do
            case $1 in
                --follow|-f)
                    follow_flag=true
                    shift
                    ;;
                --lines|-n)
                    lines="$2"
                    shift 2
                    ;;
                *)
                    log_error "Unknown option: $1"
                    exit 1
                    ;;
            esac
        done
        show_logs "$follow_flag" "$lines"
        ;;
    scale)
        if [[ -z "${2:-}" ]]; then
            log_error "Scale command requires number of replicas"
            echo "Usage: $0 scale <replicas>"
            exit 1
        fi
        scale_deployment "$2"
        ;;
    update)
        if [[ -z "${2:-}" ]]; then
            log_error "Update command requires image tag"
            echo "Usage: $0 update <image-tag>"
            exit 1
        fi
        update_image "$2"
        ;;
    restart)
        restart_deployment
        ;;
    port-forward)
        port_forward "${2:-8080}"
        ;;
    health-check)
        run_health_check
        ;;
    metrics)
        show_metrics
        ;;
    config)
        update_config
        ;;
    backup)
        backup_data
        ;;
    test)
        run_tests
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac