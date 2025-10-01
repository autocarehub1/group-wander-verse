const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');
const { promisify } = require('util');
const archiver = require('archiver');
const logger = require('../utils/logger');

const execAsync = promisify(exec);

class TravelAppBuildService {
  constructor() {
    this.builds = new Map();
    this.buildQueue = [];
    this.isProcessing = false;
    this.maxConcurrentBuilds = parseInt(process.env.MAX_CONCURRENT_BUILDS) || 2;
    this.artifactsPath = process.env.ARTIFACTS_PATH || './artifacts';

    // Ensure artifacts directory exists
    this.initializeService();
  }

  async initializeService() {
    try {
      await fs.mkdir(this.artifactsPath, { recursive: true });
      logger.info('Travel App Build Service initialized', {
        artifactsPath: this.artifactsPath,
        maxConcurrentBuilds: this.maxConcurrentBuilds
      });
    } catch (error) {
      logger.error('Failed to initialize build service', error);
    }
  }

  async startTravelAppBuild(options) {
    const {
      platform,
      branch,
      buildType,
      version,
      travelFeatures,
      assets,
      config,
      userId
    } = options;

    const buildId = uuidv4();
    const buildInfo = {
      buildId,
      platform,
      branch,
      buildType,
      version,
      travelFeatures,
      status: 'queued',
      startedAt: new Date().toISOString(),
      userId,
      estimatedTime: this.getEstimatedBuildTime(platform, buildType, travelFeatures),
      assets: assets?.map(asset => ({
        filename: asset.filename,
        path: asset.path,
        mimetype: asset.mimetype
      })) || [],
      config: config ? {
        filename: config.filename,
        path: config.path
      } : null
    };

    this.builds.set(buildId, buildInfo);
    this.buildQueue.push(buildId);

    logger.info('Travel app build queued', buildInfo);

    // Start processing queue
    this.processQueue();

    return {
      buildId,
      estimatedTime: buildInfo.estimatedTime,
      artifactUrl: `/api/v1/artifact/${buildId}`
    };
  }

  async processQueue() {
    if (this.isProcessing || this.buildQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const buildId = this.buildQueue.shift();

    try {
      await this.executeTravelAppBuild(buildId);
    } catch (error) {
      logger.error('Build execution failed', { buildId, error });
    } finally {
      this.isProcessing = false;
      // Process next build in queue
      if (this.buildQueue.length > 0) {
        setTimeout(() => this.processQueue(), 1000);
      }
    }
  }

  async executeTravelAppBuild(buildId) {
    const buildInfo = this.builds.get(buildId);
    if (!buildInfo) return;

    try {
      // Update status to running
      buildInfo.status = 'running';
      buildInfo.actualStartedAt = new Date().toISOString();
      this.builds.set(buildId, buildInfo);

      logger.info('Starting travel app build execution', { buildId, platform: buildInfo.platform });

      // Prepare build environment
      await this.prepareBuildEnvironment(buildInfo);

      // Execute platform-specific build
      let buildResult;
      switch (buildInfo.platform) {
        case 'android':
          buildResult = await this.buildAndroidTravelApp(buildInfo);
          break;
        case 'ios':
          buildResult = await this.buildiOSTravelApp(buildInfo);
          break;
        case 'expo':
          buildResult = await this.buildExpoTravelApp(buildInfo);
          break;
        default:
          throw new Error(`Unsupported platform: ${buildInfo.platform}`);
      }

      // Package artifacts
      const artifactPath = await this.packageArtifacts(buildInfo, buildResult);

      // Update build info with success
      buildInfo.status = 'completed';
      buildInfo.completedAt = new Date().toISOString();
      buildInfo.duration = Date.now() - new Date(buildInfo.actualStartedAt).getTime();
      buildInfo.result = buildResult;
      buildInfo.artifactPath = artifactPath;

      this.builds.set(buildId, buildInfo);

      logger.info('Travel app build completed successfully', {
        buildId,
        platform: buildInfo.platform,
        duration: buildInfo.duration
      });

    } catch (error) {
      // Update build info with error
      buildInfo.status = 'failed';
      buildInfo.completedAt = new Date().toISOString();
      buildInfo.error = error.message;
      buildInfo.duration = buildInfo.actualStartedAt 
        ? Date.now() - new Date(buildInfo.actualStartedAt).getTime() 
        : 0;

      this.builds.set(buildId, buildInfo);

      logger.error('Travel app build failed', {
        buildId,
        platform: buildInfo.platform,
        error: error.message
      });
    }
  }

  async prepareBuildEnvironment(buildInfo) {
    const buildDir = path.join(this.artifactsPath, buildInfo.buildId);
    await fs.mkdir(buildDir, { recursive: true });

    // Clone repository (simulated - in real implementation would clone from GitHub)
    logger.info('Preparing build environment for Group Wander Verse', {
      buildId: buildInfo.buildId,
      branch: buildInfo.branch
    });

    // Simulate repository preparation
    await this.simulateRepoSetup(buildDir, buildInfo);

    // Copy uploaded assets if any
    if (buildInfo.assets.length > 0) {
      const assetsDir = path.join(buildDir, 'assets');
      await fs.mkdir(assetsDir, { recursive: true });

      for (const asset of buildInfo.assets) {
        const destPath = path.join(assetsDir, asset.filename);
        await fs.copyFile(asset.path, destPath);
      }
    }

    // Apply travel app specific configurations
    await this.applyTravelAppConfig(buildDir, buildInfo);
  }

  async simulateRepoSetup(buildDir, buildInfo) {
    // In a real implementation, this would:
    // 1. Clone the repository from GitHub
    // 2. Checkout the specified branch
    // 3. Install dependencies

    // For now, create a mock project structure
    const packageJsonContent = {
      name: 'group-wander-verse',
      version: buildInfo.version || '1.0.0',
      dependencies: {
        'react-native': '^0.72.0',
        'react-native-maps': '^1.7.1',
        '@react-navigation/native': '^6.1.0',
        'react-native-vector-icons': '^10.0.0',
        'react-native-gesture-handler': '^2.12.0'
      }
    };

    await fs.writeFile(
      path.join(buildDir, 'package.json'),
      JSON.stringify(packageJsonContent, null, 2)
    );

    logger.info('Repository setup completed', { buildDir });
  }

  async applyTravelAppConfig(buildDir, buildInfo) {
    const { travelFeatures } = buildInfo;

    // Generate travel app specific configuration
    const travelConfig = {
      maps: {
        enabled: travelFeatures.maps || false,
        provider: travelFeatures.mapsProvider || 'google',
        apiKey: process.env.GOOGLE_MAPS_API_KEY || 'your-maps-api-key'
      },
      payments: {
        enabled: travelFeatures.payments || false,
        providers: travelFeatures.paymentProviders || ['stripe'],
        stripeKey: process.env.STRIPE_PUBLISHABLE_KEY || 'your-stripe-key'
      },
      notifications: {
        enabled: travelFeatures.notifications || false,
        firebase: {
          apiKey: process.env.FIREBASE_API_KEY || 'your-firebase-key'
        }
      },
      analytics: {
        enabled: travelFeatures.analytics || false,
        googleAnalyticsId: process.env.GA_TRACKING_ID || 'your-ga-id'
      }
    };

    await fs.writeFile(
      path.join(buildDir, 'travel-config.json'),
      JSON.stringify(travelConfig, null, 2)
    );

    logger.info('Travel app configuration applied', {
      buildId: buildInfo.buildId,
      features: Object.keys(travelFeatures)
    });
  }

  async buildAndroidTravelApp(buildInfo) {
    logger.info('Building Android travel app', { buildId: buildInfo.buildId });

    // Simulate Android build process
    await this.delay(15000); // 15 seconds for demo

    return {
      success: true,
      platform: 'android',
      buildType: buildInfo.buildType,
      artifacts: [
        {
          name: `wanderverse-${buildInfo.buildType}.apk`,
          type: 'apk',
          size: 25 * 1024 * 1024 // 25MB
        }
      ],
      metadata: {
        minSdkVersion: 21,
        targetSdkVersion: 33,
        versionCode: 1,
        travelFeatures: buildInfo.travelFeatures
      }
    };
  }

  async buildiOSTravelApp(buildInfo) {
    if (process.platform !== 'darwin') {
      throw new Error('iOS builds require macOS');
    }

    logger.info('Building iOS travel app', { buildId: buildInfo.buildId });

    // Simulate iOS build process
    await this.delay(25000); // 25 seconds for demo

    return {
      success: true,
      platform: 'ios',
      buildType: buildInfo.buildType,
      artifacts: [
        {
          name: `WanderVerse-${buildInfo.buildType}.ipa`,
          type: 'ipa',
          size: 35 * 1024 * 1024 // 35MB
        }
      ],
      metadata: {
        minOSVersion: '12.0',
        bundleId: 'com.autocarehub.wanderverse',
        travelFeatures: buildInfo.travelFeatures
      }
    };
  }

  async buildExpoTravelApp(buildInfo) {
    logger.info('Building Expo travel app', { buildId: buildInfo.buildId });

    // Simulate Expo build process
    await this.delay(20000); // 20 seconds for demo

    return {
      success: true,
      platform: 'expo',
      buildType: buildInfo.buildType,
      artifacts: [
        {
          name: `wanderverse-expo-${buildInfo.buildType}.apk`,
          type: 'apk',
          size: 30 * 1024 * 1024 // 30MB
        }
      ],
      metadata: {
        expoVersion: '49.0.0',
        sdkVersion: '49.0.0',
        travelFeatures: buildInfo.travelFeatures
      }
    };
  }

  async packageArtifacts(buildInfo, buildResult) {
    const buildDir = path.join(this.artifactsPath, buildInfo.buildId);
    const artifactPath = path.join(this.artifactsPath, `${buildInfo.buildId}.zip`);

    return new Promise((resolve, reject) => {
      const output = require('fs').createWriteStream(artifactPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        logger.info('Artifacts packaged', {
          buildId: buildInfo.buildId,
          size: archive.pointer(),
          path: artifactPath
        });
        resolve(artifactPath);
      });

      archive.on('error', reject);
      archive.pipe(output);

      // Add build artifacts to archive
      buildResult.artifacts.forEach(artifact => {
        // Create mock artifact file
        archive.append(`Mock ${artifact.name} for ${buildInfo.platform}`, {
          name: artifact.name
        });
      });

      // Add build metadata
      archive.append(JSON.stringify({
        buildInfo,
        buildResult,
        timestamp: new Date().toISOString()
      }, null, 2), { name: 'build-metadata.json' });

      // Add travel app configuration
      archive.append(JSON.stringify({
        travelFeatures: buildInfo.travelFeatures,
        platform: buildInfo.platform,
        buildType: buildInfo.buildType
      }, null, 2), { name: 'travel-config.json' });

      archive.finalize();
    });
  }

  async getTravelAppBuildStatus(buildId) {
    const buildInfo = this.builds.get(buildId);
    if (!buildInfo) return null;

    return {
      ...buildInfo,
      queuePosition: buildInfo.status === 'queued' 
        ? this.buildQueue.indexOf(buildId) + 1 
        : null
    };
  }

  async listTravelAppBuilds(options = {}) {
    const { limit = 10, offset = 0, status, platform, userId } = options;

    let builds = Array.from(this.builds.values());

    // Filter by userId if provided
    if (userId) {
      builds = builds.filter(build => build.userId === userId);
    }

    // Filter by status if provided
    if (status) {
      builds = builds.filter(build => build.status === status);
    }

    // Filter by platform if provided
    if (platform) {
      builds = builds.filter(build => build.platform === platform);
    }

    // Sort by startedAt descending
    builds.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    // Apply pagination
    const total = builds.length;
    const paginatedBuilds = builds.slice(offset, offset + limit);

    return {
      builds: paginatedBuilds,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    };
  }

  async cancelTravelAppBuild(buildId) {
    const buildInfo = this.builds.get(buildId);

    if (!buildInfo) return false;

    if (buildInfo.status === 'completed' || buildInfo.status === 'failed') {
      return false; // Cannot cancel completed builds
    }

    // Remove from queue if queued
    if (buildInfo.status === 'queued') {
      const queueIndex = this.buildQueue.indexOf(buildId);
      if (queueIndex > -1) {
        this.buildQueue.splice(queueIndex, 1);
      }
    }

    buildInfo.status = 'cancelled';
    buildInfo.cancelledAt = new Date().toISOString();

    this.builds.set(buildId, buildInfo);

    logger.info('Travel app build cancelled', { buildId });

    return true;
  }

  async getArtifactPath(buildId) {
    const buildInfo = this.builds.get(buildId);

    if (!buildInfo || buildInfo.status !== 'completed') {
      return null;
    }

    return buildInfo.artifactPath;
  }

  getEstimatedBuildTime(platform, buildType, travelFeatures) {
    let baseTime = {
      android: { debug: 300000, release: 600000 }, // 5min debug, 10min release
      ios: { debug: 900000, release: 1200000 },     // 15min debug, 20min release
      expo: { debug: 480000, release: 720000 }      // 8min debug, 12min release
    };

    let estimatedTime = baseTime[platform]?.[buildType] || 300000;

    // Add time for travel-specific features
    const featureOverhead = {
      maps: 60000,        // 1 minute for maps integration
      payments: 90000,    // 1.5 minutes for payment integration
      notifications: 30000, // 30 seconds for push notifications
      analytics: 15000,   // 15 seconds for analytics
      social: 45000,      // 45 seconds for social features
      offline: 120000     // 2 minutes for offline capabilities
    };

    Object.keys(travelFeatures).forEach(feature => {
      if (travelFeatures[feature] && featureOverhead[feature]) {
        estimatedTime += featureOverhead[feature];
      }
    });

    return estimatedTime;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup old builds (call periodically)
  async cleanupOldBuilds() {
    const retentionDays = parseInt(process.env.BUILD_RETENTION_DAYS) || 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const buildsToDelete = [];

    this.builds.forEach((buildInfo, buildId) => {
      const buildDate = new Date(buildInfo.startedAt);
      if (buildDate < cutoffDate) {
        buildsToDelete.push(buildId);
      }
    });

    for (const buildId of buildsToDelete) {
      const buildInfo = this.builds.get(buildId);

      // Delete artifact files
      if (buildInfo.artifactPath) {
        try {
          await fs.unlink(buildInfo.artifactPath);
        } catch (error) {
          logger.warn('Failed to delete artifact file', {
            buildId,
            artifactPath: buildInfo.artifactPath,
            error: error.message
          });
        }
      }

      // Remove build directory
      const buildDir = path.join(this.artifactsPath, buildId);
      try {
        await fs.rmdir(buildDir, { recursive: true });
      } catch (error) {
        logger.warn('Failed to delete build directory', {
          buildId,
          buildDir,
          error: error.message
        });
      }

      // Remove from memory
      this.builds.delete(buildId);
    }

    if (buildsToDelete.length > 0) {
      logger.info('Cleaned up old builds', {
        deletedCount: buildsToDelete.length,
        retentionDays
      });
    }
  }
}

module.exports = new TravelAppBuildService();
