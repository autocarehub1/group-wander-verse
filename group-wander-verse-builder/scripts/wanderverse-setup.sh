#!/bin/bash

# GKE Setup Script for Group Wander Verse Travel App Build Service
set -euo pipefail

# ============================================
# CONFIGURATION - UPDATE THESE VALUES
# ============================================
PROJECT_ID="keen-opus-470223-b7"  # Set your GCP project ID here
CLUSTER_NAME="wandertogether-cluster"
ZONE="us-central1-a"
REGION="us-central1"

# Travel App Specific Configuration
APP_NAME="WanderTogether Travel App"
GITHUB_REPO="https://github.com/autocarehub1/group-wander-verse"
DOMAIN_NAME=""  # Optional: your custom domain for the build service

# ============================================
# COLORS AND LOGGING
# ============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }
log_step() { echo -e "${BLUE}[STEP]${NC} $1"; }
log_travel() { echo -e "${PURPLE}[TRAVEL-APP]${NC} $1"; }

# Error handling
handle_error() {
    log_error "An error occurred on line $1"
    log_error "Command that failed: $BASH_COMMAND"
    log_error "For troubleshooting, check the logs above and ensure:"
    echo "  1. Your PROJECT_ID is correct"
    echo "  2. You have necessary permissions"
    echo "  3. Required APIs are enabled"
    echo "  4. Docker is running"
    exit 1
}
trap 'handle_error $LINENO' ERR

# ============================================
# VALIDATION FUNCTIONS
# ============================================
validate_config() {
    log_step "Validating Group Wander Verse build configuration..."

    if [[ -z "$PROJECT_ID" ]]; then
        log_error "PROJECT_ID is not set. Please edit this script and set your GCP project ID."
        exit 1
    fi

    if [[ "$PROJECT_ID" == "your-project-id" ]] || [[ "$PROJECT_ID" == "" ]]; then
        log_error "Please change PROJECT_ID from the default value to your actual GCP project ID."
        exit 1
    fi

    log_travel "Configuration validated for $APP_NAME build service"
    log_info "Project ID: $PROJECT_ID"
    log_info "Cluster: $CLUSTER_NAME"
    log_info "Zone: $ZONE"
}

check_prerequisites() {
    log_step "Checking prerequisites for travel app build service..."

    local missing_tools=()

    command -v gcloud >/dev/null 2>&1 || missing_tools+=("gcloud")
    command -v kubectl >/dev/null 2>&1 || missing_tools+=("kubectl")
    command -v docker >/dev/null 2>&1 || missing_tools+=("docker")

    if [[ ${#missing_tools[@]} -ne 0 ]]; then
        log_error "Missing required tools: ${missing_tools[*]}"
        log_error "Please install them before running this script:"
        echo "  - gcloud: https://cloud.google.com/sdk/docs/install"
        echo "  - kubectl: https://kubernetes.io/docs/tasks/tools/"
        echo "  - docker: https://docs.docker.com/get-docker/"
        exit 1
    fi

    # Check if Docker is running
    if ! docker ps >/dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi

    log_info "All prerequisites are available"
}

# ============================================
# GCP PROJECT SETUP
# ============================================
setup_gcp_project() {
    log_step "Setting up GCP project for travel app builds..."

    # Set project
    if ! gcloud config set project "$PROJECT_ID"; then
        log_error "Failed to set project. Please check:"
        echo "  1. Project ID is correct: $PROJECT_ID"
        echo "  2. You have access to the project"
        echo "  3. You're authenticated: run 'gcloud auth login'"
        exit 1
    fi

    # Enable required APIs for travel app
    log_info "Enabling required APIs for travel app build service..."
    local apis=(
        "container.googleapis.com"
        "containerregistry.googleapis.com" 
        "cloudbuild.googleapis.com"
        "compute.googleapis.com"
        "storage-api.googleapis.com"
        "logging.googleapis.com"
        "monitoring.googleapis.com"
    )

    for api in "${apis[@]}"; do
        log_info "Enabling $api..."
        if ! gcloud services enable "$api" --quiet; then
            log_warn "Failed to enable $api, continuing..."
        fi
    done

    log_travel "GCP project configured for $APP_NAME build service"
}

# ============================================
# GKE CLUSTER CREATION
# ============================================
create_gke_cluster() {
    log_step "Creating GKE cluster for travel app builds..."

    # Check if cluster exists
    if gcloud container clusters describe "$CLUSTER_NAME" --zone="$ZONE" --project="$PROJECT_ID" &>/dev/null; then
        log_warn "Cluster $CLUSTER_NAME already exists"
        return 0
    fi

    log_travel "Creating optimized cluster for $APP_NAME builds..."
    log_info "This may take 5-10 minutes..."

    # Create cluster optimized for travel app builds
    if ! gcloud container clusters create "$CLUSTER_NAME" \
        --zone="$ZONE" \
        --machine-type="e2-standard-2" \
        --disk-type="pd-ssd" \
        --disk-size="50GB" \
        --num-nodes=1 \
        --enable-autoscaling \
        --min-nodes=1 \
        --max-nodes=3 \
        --enable-autorepair \
        --enable-autoupgrade \
        --preemptible \
        --enable-network-policy \
        --enable-ip-alias \
        --metadata disable-legacy-endpoints=true \
        --enable-shielded-nodes \
        --enable-autorepair \
        --enable-autoupgrade \
        --maintenance-window-start=2024-01-01T09:00:00Z \
        --maintenance-window-end=2024-01-01T17:00:00Z \
        --maintenance-window-recurrence="FREQ=WEEKLY;BYDAY=SA" \
        --labels="app=wanderverse,type=build-service,cost-center=development" \
        --quiet; then
        log_error "Failed to create cluster"
        exit 1
    fi

    log_travel "GKE cluster created successfully for $APP_NAME"
}

# ============================================
# KUBECTL CONFIGURATION
# ============================================
configure_kubectl() {
    log_step "Configuring kubectl for travel app cluster..."

    if ! gcloud container clusters get-credentials "$CLUSTER_NAME" --zone="$ZONE" --project="$PROJECT_ID"; then
        log_error "Failed to configure kubectl"
        exit 1
    fi

    # Test connection
    if ! kubectl get nodes >/dev/null 2>&1; then
        log_error "Cannot connect to cluster"
        exit 1
    fi

    log_info "kubectl configured successfully"
}

# ============================================
# CONTAINER BUILD AND PUSH
# ============================================
build_and_push_container() {
    log_step "Building container image for travel app build service..."

    # Verify we're in the correct directory
    if [[ ! -f "Dockerfile" ]]; then
        log_error "Dockerfile not found. Please ensure you're in the correct directory."
        exit 1
    fi

    # Configure Docker authentication
    if ! gcloud auth configure-docker --quiet; then
        log_error "Failed to configure Docker authentication"
        exit 1
    fi

    local image_name="gcr.io/$PROJECT_ID/wanderverse-builder"
    local image_tag="latest"
    local full_image="$image_name:$image_tag"

    log_travel "Building $APP_NAME build service container..."
    if ! docker build -t "$full_image" \
        --label "app=wanderverse" \
        --label "version=1.0.0" \
        --label "build-date=$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --label "source-repo=$GITHUB_REPO" \
        .; then
        log_error "Docker build failed"
        exit 1
    fi

    log_info "Pushing container image to Google Container Registry..."
    if ! docker push "$full_image"; then
        log_error "Docker push failed"
        exit 1
    fi

    log_travel "Container image ready: $full_image"
}

# ============================================
# KUBERNETES DEPLOYMENT
# ============================================
deploy_to_kubernetes() {
    log_step "Deploying travel app build service to Kubernetes..."

    # Update deployment file with project ID
    if [[ -f "k8s/travel-app-all-in-one.yaml" ]]; then
        sed "s/PROJECT_ID_PLACEHOLDER/$PROJECT_ID/g" k8s/travel-app-all-in-one.yaml > k8s/deployment-updated.yaml
    else
        log_error "k8s/travel-app-all-in-one.yaml not found"
        exit 1
    fi

    log_travel "Applying Kubernetes manifests for $APP_NAME..."
    if ! kubectl apply -f k8s/deployment-updated.yaml; then
        log_error "Failed to apply Kubernetes manifests"
        exit 1
    fi

    # Clean up temporary file
    rm -f k8s/deployment-updated.yaml

    log_info "Waiting for travel app build service to be ready..."
    log_info "This may take 2-3 minutes for the first deployment..."

    # Wait for deployment with longer timeout for travel app
    if ! kubectl wait --for=condition=available --timeout=600s deployment/wanderverse-builder -n wanderverse-builds; then
        log_warn "Deployment is taking longer than expected. Checking status..."
        kubectl get pods -n wanderverse-builds
        log_warn "You can check the logs with: kubectl logs -n wanderverse-builds -l app=wanderverse-builder"
    else
        log_travel "$APP_NAME build service deployed successfully!"
    fi
}

# ============================================
# POST-DEPLOYMENT SETUP
# ============================================
setup_secrets() {
    log_step "Setting up secrets for travel app integrations..."

    log_warn "IMPORTANT: Update the following secrets in GCP Secret Manager or kubectl:"
    echo "  - Google Maps API Key"
    echo "  - Stripe API Keys"
    echo "  - Firebase Configuration"
    echo "  - GitHub Personal Access Token"
    echo