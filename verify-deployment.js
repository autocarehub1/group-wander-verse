#!/usr/bin/env node

/**
 * Deployment verification script for Node.js App Engine applications
 * This script helps verify that your app is properly configured for deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying App Engine deployment configuration...\n');

const checks = [];

// Check 1: app.yaml exists and has required fields
if (fs.existsSync('app.yaml')) {
  const appYaml = fs.readFileSync('app.yaml', 'utf8');
  if (appYaml.includes('runtime: nodejs')) {
    checks.push('✅ app.yaml exists with Node.js runtime');
  } else {
    checks.push('❌ app.yaml missing Node.js runtime specification');
  }
} else {
  checks.push('❌ app.yaml file not found');
}

// Check 2: Health check endpoint implementation
const serverPath = 'server/index.ts';
if (fs.existsSync(serverPath)) {
  const serverCode = fs.readFileSync(serverPath, 'utf8');
  if (serverCode.includes('/health') && serverCode.includes('healthy')) {
    checks.push('✅ Health check endpoint implemented');
  } else {
    checks.push('❌ Health check endpoint missing');
  }
} else {
  checks.push('❌ server/index.ts not found');
}

// Check 3: Port configuration
if (fs.existsSync(serverPath)) {
  const serverCode = fs.readFileSync(serverPath, 'utf8');
  if (serverCode.includes('process.env.PORT')) {
    checks.push('✅ Dynamic port configuration (process.env.PORT)');
  } else {
    checks.push('❌ Hardcoded port - will cause deployment issues');
  }
}

// Check 4: Package.json has required scripts
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const scripts = packageJson.scripts || {};
  
  if (scripts.build && scripts.start) {
    checks.push('✅ Build and start scripts configured');
  } else {
    checks.push('❌ Missing build or start scripts in package.json');
  }
} else {
  checks.push('❌ package.json not found');
}

// Check 5: .gcloudignore exists
if (fs.existsSync('.gcloudignore')) {
  checks.push('✅ .gcloudignore file exists (optimizes deployment)');
} else {
  checks.push('⚠️  .gcloudignore missing (optional but recommended)');
}

// Check 6: Cloud Build configuration
if (fs.existsSync('cloudbuild.yaml')) {
  checks.push('✅ Cloud Build configuration available');
} else {
  checks.push('ℹ️  cloudbuild.yaml not found (optional for GitHub integration)');
}

// Print results
console.log('📋 Deployment Readiness Report:\n');
checks.forEach(check => console.log(`   ${check}`));

const errors = checks.filter(check => check.includes('❌')).length;
const warnings = checks.filter(check => check.includes('⚠️')).length;

console.log('\n' + '='.repeat(60));

if (errors === 0) {
  console.log('🎉 Your application is ready for App Engine deployment!');
  console.log('\n📚 Next steps:');
  console.log('   1. Run: gcloud app deploy');
  console.log('   2. Visit your deployed app');
  console.log('   3. Check health endpoint: /health');
} else {
  console.log(`❗ Found ${errors} error(s) that need to be fixed before deployment.`);
  if (warnings > 0) {
    console.log(`   Also found ${warnings} warning(s) - these won't break deployment but should be addressed.`);
  }
}

console.log('\n🔗 For detailed deployment instructions, see: DEPLOYMENT_README.md');