#!/bin/bash

echo "🚀 Starting deployment to Google App Engine..."

# Ensure we're in the right directory
cd "$(dirname "$0")"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist/
rm -rf node_modules/.cache/

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Verify build output
echo "✅ Verifying build artifacts..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ Error: Server build not found at dist/index.js"
    exit 1
fi

if [ ! -d "dist/public" ]; then
    echo "❌ Error: Client build not found at dist/public/"
    exit 1
fi

echo "📁 Build contents:"
ls -la dist/
ls -la dist/public/

# Deploy to App Engine
echo "☁️ Deploying to Google App Engine..."
gcloud app deploy --quiet

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at: https://$(gcloud config get-value project).appspot.com"
echo "🏥 Health check: https://$(gcloud config get-value project).appspot.com/health"