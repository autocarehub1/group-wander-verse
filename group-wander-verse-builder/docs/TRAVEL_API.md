# 🌍 WanderVerse Builder - Travel API Reference

Complete API documentation for the WanderVerse Builder service, specialized for React Native travel applications.

## Base URL

```
Production: http://<external-ip>/api
Development: http://localhost:3000/api
```

## Authentication

All API endpoints require authentication via API key in headers:

```http
X-API-Key: your-api-key-here
# OR
Authorization: Bearer your-api-key-here
```

## Core Endpoints

### 🏗️ Build Management

#### Initiate Build
Creates a new travel app build with specified features and configurations.

```http
POST /api/builds
```

**Request Body:**
```json
{
  "appId": "my-travel-app",
  "travelFeatures": [
    "maps",
    "location", 
    "offline",
    "weather",
    "expense-tracking",
    "chat"
  ],
  "targetPlatform": "both",
  "apiIntegrations": {
    "googleMaps": {
      "apiKey": "your-google-maps-key",
      "features": ["directions", "places", "geocoding"]
    },
    "weather": {
      "provider": "openweather",
      "apiKey": "your-weather-key"
    },
    "booking": {
      "providers": ["booking.com", "airbnb"],
      "apiKeys": {
        "booking.com": "your-booking-key",
        "airbnb": "your-airbnb-key"
      }
    }
  },
  "buildOptions": {
    "optimization": "production",
    "minify": true,
    "sourceMaps": false
  },
  "notifications": {
    "webhook": "https://your-app.com/build-complete",
    "email": "developer@yourapp.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "buildId": "travel-build-1634567890123-abc123def",
    "status": "queued",
    "estimatedTime": "12 minutes",
    "message": "Travel app build initiated successfully"
  }
}
```

#### Get Build Status
Retrieves current status and progress of a build.

```http
GET /api/builds/{buildId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "travel-build-1634567890123-abc123def",
    "status": "building",
    "progress": 65,
    "currentStep": 7,
    "totalSteps": 10,
    "startTime": "2024-01-15T10:30:00.000Z",
    "endTime": null,
    "artifacts": null,
    "error": null
  }
}
```

**Build Statuses:**
- `queued` - Build is waiting to start
- `building` - Build is in progress
- `completed` - Build finished successfully
- `failed` - Build failed with error

#### Get Build Queue Status
Shows overall build queue metrics.

```http
GET /api/builds
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queued": 3,
    "building": 2,
    "completed": 156,
    "totalBuilds": 161
  }
}
```

### 🌟 Travel Features

#### Get Available Features
Lists all available travel features that can be included in builds.

```http
GET /api/travel/features
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "maps",
      "name": "Interactive Maps",
      "description": "Google Maps integration with custom markers and routes",
      "required": true
    },
    {
      "id": "location",
      "name": "Location Services",
      "description": "GPS tracking and location sharing for group coordination",
      "required": true
    },
    {
      "id": "offline",
      "name": "Offline Mode",
      "description": "Download maps and data for offline access",
      "required": true
    },
    {
      "id": "weather",
      "name": "Weather Integration",
      "description": "Real-time weather information for destinations",
      "required": false
    },
    {
      "id": "booking",
      "name": "Booking Integration",
      "description": "Hotel, flight, and activity booking capabilities",
      "required": false
    },
    {
      "id": "expense-tracking",
      "name": "Expense Tracking",
      "description": "Group expense management and bill splitting",
      "required": false
    },
    {
      "id": "chat",
      "name": "Group Chat",
      "description": "Real-time messaging for group communication",
      "required": false
    },
    {
      "id": "itinerary",
      "name": "Itinerary Planning",
      "description": "Collaborative trip planning and scheduling",
      "required": false
    },
    {
      "id": "photo-sharing",
      "name": "Photo Sharing",
      "description": "Group photo albums and memory sharing",
      "required": false
    },
    {
      "id": "translation",
      "name": "Language Translation",
      "description": "Real-time translation for international travel",
      "required": false
    }
  ]
}
```

### 📱 Platform Support

#### Get Supported Platforms
Lists all supported build platforms and their requirements.

```http
GET /api/travel/platforms
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ios",
      "name": "iOS",
      "description": "Native iOS application",
      "minVersion": "12.0",
      "buildTime": "8-12 minutes"
    },
    {
      "id": "android", 
      "name": "Android",
      "description": "Native Android application",
      "minVersion": "7.0 (API 24)",
      "buildTime": "6-10 minutes"
    },
    {
      "id": "both",
      "name": "Cross-Platform",
      "description": "Both iOS and Android builds",
      "minVersion": "iOS 12.0, Android 7.0",
      "buildTime": "12-20 minutes"
    }
  ]
}
```

### ✅ Validation

#### Validate Build Configuration
Validates a build configuration without starting the build.

```http
POST /api/travel/validate
```

**Request Body:** (same as build initiation)

**Response:**
```json
{
  "success": true,
  "message": "Configuration is valid",
  "estimatedTime": "15 minutes"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing required travel features: maps, location, offline",
  "field": "travelFeatures"
}
```

## Build Process Steps

When a build is initiated, it goes through these steps:

1. **Setting up React Native environment** - Preparing build environment
2. **Installing travel-specific dependencies** - Adding required packages
3. **Configuring map integrations** - Setting up Google Maps/navigation
4. **Setting up location services** - Configuring GPS and geolocation
5. **Building travel UI components** - Creating travel-specific screens
6. **Integrating payment systems** - Adding booking/payment features
7. **Configuring push notifications** - Setting up real-time alerts
8. **Running travel feature tests** - Validating functionality
9. **Packaging application** - Creating final builds
10. **Uploading build artifacts** - Storing results

## Build Artifacts

Upon successful completion, builds generate these artifacts:

### iOS Artifacts (when targetPlatform is "ios" or "both")
- `app-name.ipa` - iOS application package
- `app-name.dSYM.zip` - Debug symbols for crash reporting
- `app-name-manifest.plist` - Installation manifest

### Android Artifacts (when targetPlatform is "android" or "both")
- `app-name.apk` - Android application package
- `app-name.aab` - Android App Bundle for Play Store
- `mapping.txt` - ProGuard mapping file for crash reporting

### Metadata
- Build timestamp and version information
- List of included travel features
- Estimated app size
- Performance metrics

## Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `400` | Bad Request | Check request body format and required fields |
| `401` | Unauthorized | Verify API key is valid and included in headers |
| `404` | Build Not Found | Check buildId parameter |
| `429` | Rate Limit Exceeded | Wait before making additional requests |
| `500` | Internal Server Error | Check build logs or contact support |

## Rate Limiting

- **Development**: 100 requests per 15 minutes per IP
- **Production**: 500 requests per 15 minutes per API key

Exceeded limits return HTTP 429 with `Retry-After` header.

## Webhooks

Configure webhooks to receive build completion notifications:

```json
{
  "buildId": "travel-build-1634567890123-abc123def",
  "status": "completed",
  "appId": "my-travel-app",
  "artifacts": {
    "ios": {
      "ipa": "my-travel-app.ipa",
      "dsym": "my-travel-app.dSYM.zip"
    },
    "android": {
      "apk": "my-travel-app.apk",
      "aab": "my-travel-app.aab"
    }
  },
  "buildTime": "2024-01-15T10:45:23.000Z",
  "duration": "14m 32s"
}
```

## SDK Examples

### cURL
```bash
# Start a build
curl -X POST https://your-service/api/builds \
  -H "X-API-Key: your-key" \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "my-travel-app",
    "travelFeatures": ["maps", "location", "offline", "weather"],
    "targetPlatform": "both"
  }'

# Check build status
curl -H "X-API-Key: your-key" \
  https://your-service/api/builds/travel-build-123
```

### JavaScript/Node.js
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://your-service/api',
  headers: {
    'X-API-Key': 'your-key',
    'Content-Type': 'application/json'
  }
});

// Start build
const build = await client.post('/builds', {
  appId: 'my-travel-app',
  travelFeatures: ['maps', 'location', 'offline'],
  targetPlatform: 'both'
});

// Poll for completion
const pollBuild = async (buildId) => {
  const response = await client.get(`/builds/${buildId}`);
  const { status, progress } = response.data.data;
  
  if (status === 'completed') {
    console.log('Build completed!');
    return response.data.data;
  } else if (status === 'failed') {
    throw new Error('Build failed');
  } else {
    console.log(`Build progress: ${progress}%`);
    setTimeout(() => pollBuild(buildId), 5000);
  }
};
```

### Python
```python
import requests
import time

class WanderVerseClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.headers = {'X-API-Key': api_key}
    
    def start_build(self, config):
        response = requests.post(
            f"{self.base_url}/builds",
            json=config,
            headers=self.headers
        )
        return response.json()
    
    def get_build_status(self, build_id):
        response = requests.get(
            f"{self.base_url}/builds/{build_id}",
            headers=self.headers
        )
        return response.json()
    
    def wait_for_build(self, build_id):
        while True:
            result = self.get_build_status(build_id)
            status = result['data']['status']
            
            if status == 'completed':
                return result['data']
            elif status == 'failed':
                raise Exception(f"Build failed: {result['data']['error']}")
            
            time.sleep(5)

# Usage
client = WanderVerseClient('https://your-service/api', 'your-key')
build = client.start_build({
    'appId': 'my-travel-app',
    'travelFeatures': ['maps', 'location', 'offline'],
    'targetPlatform': 'both'
})
result = client.wait_for_build(build['data']['buildId'])
```

## Support

For additional help:
- Check [troubleshooting guide](./TROUBLESHOOTING.md)
- Review [deployment documentation](./DEPLOYMENT.md)
- Contact support: support@wanderverse.com