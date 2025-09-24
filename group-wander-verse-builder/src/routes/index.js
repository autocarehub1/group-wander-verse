const express = require('express');
const TravelAppBuildService = require('../services/travelAppBuildService');
const { validateBuildRequest, authenticateRequest } = require('../middleware');
const logger = require('../utils/logger');

const router = express.Router();
const buildService = new TravelAppBuildService();

/**
 * POST /api/builds
 * Initiate a new travel app build
 */
router.post('/builds', authenticateRequest, validateBuildRequest, async (req, res) => {
  try {
    const buildConfig = {
      appId: req.body.appId,
      travelFeatures: req.body.travelFeatures,
      targetPlatform: req.body.targetPlatform,
      apiIntegrations: req.body.apiIntegrations
    };

    const result = await buildService.initiateBuild(buildConfig);
    
    logger.info('Build initiated', { buildId: result.buildId, appId: buildConfig.appId });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Build initiation failed', { error: error.message });
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/builds/:buildId
 * Get build status and details
 */
router.get('/builds/:buildId', authenticateRequest, async (req, res) => {
  try {
    const { buildId } = req.params;
    const buildStatus = buildService.getBuildStatus(buildId);
    
    res.json({
      success: true,
      data: buildStatus
    });
  } catch (error) {
    const status = error.message.includes('not found') ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/builds
 * Get build queue status
 */
router.get('/builds', authenticateRequest, async (req, res) => {
  try {
    const queueStatus = buildService.getQueueStatus();
    
    res.json({
      success: true,
      data: queueStatus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/travel/features
 * Get available travel features
 */
router.get('/travel/features', (req, res) => {
  const features = [
    {
      id: 'maps',
      name: 'Interactive Maps',
      description: 'Google Maps integration with custom markers and routes',
      required: true
    },
    {
      id: 'location',
      name: 'Location Services',
      description: 'GPS tracking and location sharing for group coordination',
      required: true
    },
    {
      id: 'offline',
      name: 'Offline Mode',
      description: 'Download maps and data for offline access',
      required: true
    },
    {
      id: 'weather',
      name: 'Weather Integration',
      description: 'Real-time weather information for destinations',
      required: false
    },
    {
      id: 'booking',
      name: 'Booking Integration',
      description: 'Hotel, flight, and activity booking capabilities',
      required: false
    },
    {
      id: 'expense-tracking',
      name: 'Expense Tracking',
      description: 'Group expense management and bill splitting',
      required: false
    },
    {
      id: 'chat',
      name: 'Group Chat',
      description: 'Real-time messaging for group communication',
      required: false
    },
    {
      id: 'itinerary',
      name: 'Itinerary Planning',
      description: 'Collaborative trip planning and scheduling',
      required: false
    },
    {
      id: 'photo-sharing',
      name: 'Photo Sharing',
      description: 'Group photo albums and memory sharing',
      required: false
    },
    {
      id: 'translation',
      name: 'Language Translation',
      description: 'Real-time translation for international travel',
      required: false
    }
  ];

  res.json({
    success: true,
    data: features
  });
});

/**
 * GET /api/travel/platforms
 * Get supported platforms
 */
router.get('/travel/platforms', (req, res) => {
  const platforms = [
    {
      id: 'ios',
      name: 'iOS',
      description: 'Native iOS application',
      minVersion: '12.0',
      buildTime: '8-12 minutes'
    },
    {
      id: 'android',
      name: 'Android',
      description: 'Native Android application',
      minVersion: '7.0 (API 24)',
      buildTime: '6-10 minutes'
    },
    {
      id: 'both',
      name: 'Cross-Platform',
      description: 'Both iOS and Android builds',
      minVersion: 'iOS 12.0, Android 7.0',
      buildTime: '12-20 minutes'
    }
  ];

  res.json({
    success: true,
    data: platforms
  });
});

/**
 * POST /api/travel/validate
 * Validate build configuration
 */
router.post('/travel/validate', authenticateRequest, async (req, res) => {
  try {
    // Create a temporary build service instance for validation
    const tempService = new TravelAppBuildService();
    await tempService.validateTravelConfig(req.body);
    
    res.json({
      success: true,
      message: 'Configuration is valid',
      estimatedTime: tempService.estimateBuildTime(req.body)
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;