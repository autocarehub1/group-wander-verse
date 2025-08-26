#!/bin/bash

echo "🚀 Deploying WanderTogether to Google Cloud App Engine"

# Ensure we're using the correct gcloud project
echo "📋 Current gcloud project: $(gcloud config get-value project)"

# Deploy using Cloud Build
echo "🔨 Starting Cloud Build deployment..."
gcloud builds submit --config=app.yaml

echo "✅ Deployment initiated. Check Cloud Console for status."