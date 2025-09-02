# WanderTogether Load Generator

A comprehensive load testing solution for the WanderTogether travel application, built with Locust and following Google Cloud microservices-demo patterns.

## Overview

The load generator simulates realistic user behavior for travel planning scenarios, including:
- User registration and authentication
- Trip creation and management
- Activity browsing and voting
- Expense tracking
- Group messaging
- API endpoint stress testing

## Features

### Realistic User Scenarios
- **TravelAppUser**: Simulates typical travel planning behavior
  - Creating user accounts with realistic travel preferences
  - Trip planning with destinations, dates, and budgets
  - Activity exploration and voting
  - Expense tracking and management
  - Group communication

- **AdminUser**: Simulates power user behavior with higher load
  - Stress testing critical endpoints
  - Higher frequency API calls
  - Performance monitoring

### Travel-Specific Test Data
- Random destinations and travel dates
- Realistic expense categories (accommodation, transportation, food, activities)
- Travel preferences (dietary restrictions, accessibility needs)
- Emergency contact information
- Group communication patterns

## Deployment

### Build and Deploy
```bash
# Build loadgenerator image
docker build -f Dockerfile.loadgenerator -t gcr.io/PROJECT_ID/wandertogether-loadgenerator:latest .

# Push to registry
docker push gcr.io/PROJECT_ID/wandertogether-loadgenerator:latest

# Deploy to Kubernetes
kubectl apply -f kubernetes/loadgenerator.yaml
```

### Access Load Generator UI
```bash
# Get external IP
kubectl get svc loadgenerator-external -n travel-app

# Or port forward for local access
kubectl port-forward svc/loadgenerator 8089:8089 -n travel-app
```

Access the Locust web interface at: `http://localhost:8089`

## Configuration

### Environment Variables
- `FRONTEND_ADDR`: Target frontend service (default: wandertogether-frontend:80)
- `USERS`: Number of concurrent users (default: 10)
- `SPAWN_RATE`: User spawn rate per second (default: 2)
- `LOCUST_WEB_PORT`: Web interface port (default: 8089)
- `LOCUST_LOG_LEVEL`: Logging level (default: info)
- `LOCUST_HOST`: Target host URL

### Load Testing Parameters
```python
# User behavior configuration
wait_time = between(1, 3)  # Wait time between requests
weight = 3                 # User type weight distribution

# Task distribution
@task(3)  # Higher number = more frequent execution
def browse_homepage(self):
    pass

@task(1)  # Lower number = less frequent execution  
def create_trip(self):
    pass
```

## Test Scenarios

### 1. Basic Load Test
- Start with 10 concurrent users
- Spawn rate: 2 users/second
- Focus on core user journeys

### 2. Stress Test
- Ramp up to 100+ concurrent users
- Test system breaking points
- Monitor resource utilization

### 3. Spike Test
- Sudden traffic spikes
- Simulate viral content or marketing campaigns
- Test auto-scaling behavior

### 4. Endurance Test
- Extended duration testing (1+ hours)
- Check for memory leaks
- Verify system stability

## API Endpoints Tested

### User Management
- `POST /api/users` - User registration
- `GET /api/users/{id}/trips` - User trip listing

### Trip Management
- `POST /api/users/{id}/trips` - Trip creation
- `GET /api/trips/{id}` - Trip details
- `GET /api/trips/{id}/participants` - Trip participants

### Activities
- `GET /api/trips/{id}/activities` - Activity listing
- `PATCH /api/activities/{id}` - Activity voting

### Expenses
- `POST /api/trips/{id}/expenses` - Expense creation
- `GET /api/trips/{id}/expenses` - Expense listing

### Messaging
- `POST /api/trips/{id}/messages` - Send message
- `GET /api/trips/{id}/messages` - View messages

### Health Checks
- `GET /health` - Application health

## Monitoring and Analysis

### Key Metrics
- **Response Time**: P50, P95, P99 percentiles
- **Throughput**: Requests per second
- **Error Rate**: Failed requests percentage
- **Resource Usage**: CPU, memory, network

### Reports
- Real-time statistics in Locust web UI
- Detailed response time charts
- Error analysis and debugging
- CSV export for external analysis

## Customization

### Adding New Test Scenarios
```python
@task(2)
def custom_scenario(self):
    """Custom test scenario"""
    # Implement specific user behavior
    response = self.client.get("/api/custom-endpoint")
    # Add validation logic
```

### Modifying User Behavior
```python
class CustomUser(HttpUser):
    wait_time = between(2, 5)  # Adjust wait times
    weight = 1                 # Adjust user distribution
    
    # Override on_start for custom initialization
    def on_start(self):
        self.setup_custom_data()
```

## Best Practices

### Load Testing Strategy
1. **Start Small**: Begin with low user counts
2. **Gradual Ramp-up**: Increase load incrementally
3. **Monitor Resources**: Watch CPU, memory, database connections
4. **Test Realistic Scenarios**: Use actual user behavior patterns
5. **Environment Parity**: Test in production-like environments

### Data Management
- Use realistic but non-sensitive test data
- Clean up test data after testing
- Avoid impacting production databases
- Use dedicated test environments

### Performance Baselines
- Establish performance benchmarks
- Set acceptable response time thresholds
- Define error rate tolerances
- Monitor system resource limits

## Troubleshooting

### Common Issues
```bash
# Pod not starting
kubectl describe pod <loadgenerator-pod> -n travel-app

# View logs
kubectl logs -f deployment/loadgenerator -n travel-app

# Check service connectivity
kubectl exec -it deployment/loadgenerator -n travel-app -- wget -O- http://wandertogether-frontend
```

### Performance Issues
- Monitor backend service logs
- Check database connection pools
- Verify network policies allow traffic
- Scale backend services if needed

The load generator provides comprehensive testing capabilities for the WanderTogether travel application, ensuring performance and reliability under various load conditions.