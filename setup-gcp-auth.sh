#!/bin/bash

# Google Cloud Platform Authentication Setup
# Project: keen-opus-470223-b7

PROJECT_ID="keen-opus-470223-b7"

echo "Setting up Google Cloud authentication for project: $PROJECT_ID"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI not found. Please install Google Cloud SDK."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Set project
echo "Setting GCP project to $PROJECT_ID..."
gcloud config set project $PROJECT_ID

# Check authentication status
echo "Current authentication status:"
gcloud auth list

# Configure Docker for Google Container Registry
echo "Configuring Docker for Google Container Registry..."
gcloud auth configure-docker gcr.io --quiet

# Verify project access
echo "Verifying project access..."
if gcloud projects describe $PROJECT_ID &>/dev/null; then
    echo "✅ Successfully authenticated for project $PROJECT_ID"
else
    echo "❌ Cannot access project $PROJECT_ID"
    echo "Please ensure:"
    echo "1. You're logged in: gcloud auth login"
    echo "2. You have access to the project"
    echo "3. The project ID is correct"
    exit 1
fi

# Enable required APIs
echo "Enabling required APIs..."
gcloud services enable container.googleapis.com
gcloud services enable containerregistry.googleapis.com

echo "✅ Google Cloud authentication setup complete!"
echo "You can now run: ./build-images.sh"