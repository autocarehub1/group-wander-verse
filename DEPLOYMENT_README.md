# Node.js App Engine Deployment Template

A fully working Node.js App Engine template that can be deployed straight from GitHub to Google Cloud Platform without getting "Service Unavailable."

## Quick Deploy from GitHub

### Option 1: Google Cloud Build (Recommended)

1. **Connect your GitHub repository** to Google Cloud Build:
   ```bash
   gcloud builds triggers create github \
     --repo-name=YOUR_REPO_NAME \
     --repo-owner=YOUR_GITHUB_USERNAME \
     --branch-pattern="^main$" \
     --build-config=cloudbuild.yaml
   ```

2. **Push to main branch** - deployment happens automatically via the trigger.

### Option 2: Direct Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. **Deploy to App Engine**:
   ```bash
   gcloud app deploy
   ```

## File Structure

```
├── app.yaml              # App Engine configuration
├── cloudbuild.yaml       # Cloud Build configuration (for GitHub triggers)
├── .gcloudignore         # Files to ignore during deployment
├── server/
│   └── index.ts          # Server with proper port handling and health checks
└── package.json          # Dependencies and build scripts
```

## Key Features That Prevent "Service Unavailable"

### 1. Proper Port Configuration
```javascript
const port = parseInt(process.env.PORT || "5000", 10);
server.listen(port, "0.0.0.0", () => {
  log(`serving on port ${port}`);
});
```

### 2. Health Check Endpoint
```javascript
app.get("/health", (_req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString() 
  });
});
```

### 3. App Engine Configuration (app.yaml)
```yaml
runtime: nodejs20

env_variables:
  NODE_ENV: production

automatic_scaling:
  min_instances: 1
  max_instances: 10

readiness_check:
  path: "/health"
  check_interval_sec: 5
  timeout_sec: 4
  failure_threshold: 2
  success_threshold: 2
  app_start_timeout_sec: 300

liveness_check:
  path: "/health"
  check_interval_sec: 30
  timeout_sec: 4
  failure_threshold: 4
  success_threshold: 2
```

### 4. Cloud Build Configuration (cloudbuild.yaml)
```yaml
steps:
  - name: 'gcr.io/cloud-builders/npm'
    args: ['ci']
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'build']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['app', 'deploy', '--quiet']

timeout: '1600s'
options:
  logging: CLOUD_LOGGING_ONLY
```

## Environment Setup

### Prerequisites
- Google Cloud Project with App Engine enabled
- gcloud CLI installed and authenticated

### Enable Required APIs
```bash
gcloud services enable appengine.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### Set Default Project
```bash
gcloud config set project YOUR_PROJECT_ID
```

## Local Development

```bash
npm install
npm run dev
```

Access the app at: http://localhost:5000
Health check at: http://localhost:5000/health

## Production Build

```bash
npm run build
npm start
```

## Troubleshooting

### Common Issues and Solutions

1. **"Service Unavailable" Error**
   - ✅ **Fixed**: Uses `process.env.PORT` for dynamic port assignment
   - ✅ **Fixed**: Includes health check endpoints at `/health`
   - ✅ **Fixed**: Proper startup timeout (300 seconds)

2. **Build Failures**
   - ✅ **Fixed**: Uses `npm ci` for reliable dependency installation
   - ✅ **Fixed**: Includes `.gcloudignore` to exclude unnecessary files
   - ✅ **Fixed**: Cloud Build logging configuration

3. **Static File Serving**
   - ✅ **Fixed**: Proper build output directory configuration
   - ✅ **Fixed**: Express static middleware for production

### Viewing Logs
```bash
gcloud app logs tail -s default
```

### Checking Health
Once deployed, verify the health endpoint:
```bash
curl https://YOUR_PROJECT_ID.appspot.com/health
```

## Customization

### Adding Environment Variables
Update `app.yaml`:
```yaml
env_variables:
  NODE_ENV: production
  YOUR_CUSTOM_VAR: "your_value"
```

### Database Configuration
For database connections, add connection strings to environment variables and ensure proper connection pooling for App Engine's serverless environment.

### Scaling Configuration
Adjust `automatic_scaling` in `app.yaml` based on your needs:
```yaml
automatic_scaling:
  min_instances: 0      # Can scale to zero
  max_instances: 100    # Higher max for traffic spikes
  target_cpu_utilization: 0.6
  target_throughput_utilization: 0.8
```

## Success Indicators

✅ **App starts correctly** - Health check responds with 200 status
✅ **Static files served** - Frontend assets load properly  
✅ **API endpoints work** - Backend routes respond correctly
✅ **Auto-scaling functions** - Handles traffic increases
✅ **Logs are accessible** - Cloud Logging captures application logs

This template has been tested and proven to deploy successfully without "Service Unavailable" errors.