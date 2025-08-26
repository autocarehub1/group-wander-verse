# WanderTogether GCP Deployment Troubleshooting

## Common Build Issues and Solutions

### 1. "vite: not found" Error
**Cause:** Build tools not installed during Cloud Build
**Solution:** Ensure `--production=false` flag is used with npm install

### 2. "Service Unavailable" After Deployment
**Cause:** App not listening on correct port or health checks failing
**Solutions:**
- Verify server uses `process.env.PORT` or `8080` default
- Ensure `/health` endpoint exists and returns 200
- Check App Engine logs for startup errors

### 3. Build Step Failures
**Cause:** Missing dependencies or configuration issues
**Solutions:**
- Check Cloud Build logs for specific error messages
- Verify all devDependencies are properly installed
- Ensure TypeScript/Vite configuration is correct

### 4. Memory or Timeout Issues
**Cause:** Complex builds exceeding Cloud Build limits
**Solutions:**
- Increase timeout in app.yaml (max 1800s)
- Use smaller dependency set for production
- Pre-build assets locally and commit to repo

## Deployment Commands

```bash
# Deploy using Cloud Build
gcloud builds submit --config=app.yaml

# Check deployment status
gcloud app versions list

# View application logs
gcloud app logs tail -s default
```

## File Structure for GCP Deployment
```
├── app.yaml              # Cloud Build configuration
├── app.engine.yaml       # App Engine runtime configuration  
├── package.json          # Dependencies and build scripts
├── server/
│   └── index.ts          # Express server entry point
├── dist/                 # Build output (generated)
│   ├── index.js          # Built server
│   └── public/           # Built client assets
```

## Health Check Requirements
App Engine requires these endpoints:
- `GET /health` - Returns 200 OK for health checks
- Server must bind to `0.0.0.0:${PORT}` where PORT is provided by App Engine