#!/usr/bin/env node

// Deployment Verification Script for WanderTogether GKE

const { execSync } = require('child_process');

console.log('🔍 Verifying WanderTogether GKE Deployment...\n');

function runCommand(command, description) {
  console.log(`📋 ${description}`);
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(output);
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    if (error.stdout) console.log('Output:', error.stdout);
    if (error.stderr) console.error('Error:', error.stderr);
    return false;
  }
}

// Check cluster connectivity
if (!runCommand('kubectl cluster-info', 'Checking cluster connectivity')) {
  console.error('❌ Cannot connect to Kubernetes cluster');
  process.exit(1);
}

// Check nodes
if (!runCommand('kubectl get nodes', 'Checking cluster nodes')) {
  console.error('❌ No nodes available in cluster');
  process.exit(1);
}

// Check if namespace exists
runCommand('kubectl get namespace travel-app', 'Checking travel-app namespace');

// Check deployments
runCommand('kubectl get deployments -n travel-app', 'Checking deployments');

// Check pods
runCommand('kubectl get pods -n travel-app', 'Checking pod status');

// Check services
runCommand('kubectl get services -n travel-app', 'Checking services');

// Check events for any issues
runCommand('kubectl get events --sort-by=.metadata.creationTimestamp -n travel-app', 'Checking recent events');

// Check for image pull issues
console.log('\n🔍 Checking for image availability...');
const images = [
  'gcr.io/keen-opus-470223-b7/wandertogether-backend:latest',
  'gcr.io/keen-opus-470223-b7/wandertogether-frontend:latest',
  'gcr.io/keen-opus-470223-b7/wandertogether-loadgenerator:latest'
];

images.forEach(image => {
  runCommand(`gcloud container images describe ${image}`, `Checking image: ${image}`);
});

console.log('\n✅ Deployment verification complete!');
console.log('\n📊 Summary:');
console.log('- If pods show "Running" status: Deployment successful');
console.log('- If pods show "Pending" or "ImagePullBackOff": Build images first');
console.log('- If pods show "CrashLoopBackOff": Check application logs');