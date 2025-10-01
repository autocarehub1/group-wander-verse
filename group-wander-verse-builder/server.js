const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

// Import custom modules
const logger = require("./src/utils/logger");
const buildService = require("./src/services/travelAppBuildService");
const authMiddleware = require("./src/middleware/auth");

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads (for travel app assets)
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for travel app assets
  },
});

// Security and CORS
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  }),
);

// Logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files (build artifacts)
app.use("/artifacts", express.static(path.join(__dirname, "artifacts")));

// Health check endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "Group Wander Verse Build Service",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
    },
    buildCapabilities: {
      android: true,
      ios: process.platform === "darwin",
      expo: true,
      reactNative: true,
    },
  });
});

app.get("/health/ready", (req, res) => {
  res.json({
    status: "ready",
    timestamp: new Date().toISOString(),
    services: {
      buildService: "ready",
      fileSystem: "ready",
      androidSDK: "ready",
    },
  });
});

app.get("/health/live", (req, res) => {
  res.json({
    status: "alive",
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Group Wander Verse Build Service",
    description: "Mobile app build service for the travel application",
    version: process.env.npm_package_version || "1.0.0",
    repository: "https://github.com/autocarehub1/group-wander-verse",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      build: "POST /api/v1/build",
      buildStatus: "GET /api/v1/build/:buildId",
      artifacts: "/artifacts/:filename",
    },
    supportedPlatforms: ["android", "ios", "expo"],
    travelAppFeatures: {
      maps: "Google Maps integration ready",
      payments: "Stripe/PayPal build support",
      notifications: "Push notification build ready",
      offline: "Offline map build capability",
    },
  });
});

// Build endpoints with authentication
app.post(
  "/api/v1/build",
  authMiddleware,
  upload.fields([
    { name: "assets", maxCount: 10 },
    { name: "config", maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const {
        platform = "android",
        branch = "main",
        buildType = "debug",
        version,
        travelFeatures = {},
      } = req.body;

      logger.info("Travel app build requested", {
        platform,
        branch,
        buildType,
        version,
        travelFeatures,
        user: req.user?.id,
      });

      const buildResult = await buildService.startTravelAppBuild({
        platform,
        branch,
        buildType,
        version,
        travelFeatures,
        assets: req.files?.assets || [],
        config: req.files?.config?.[0],
        userId: req.user?.id,
      });

      res.status(202).json({
        message: `Travel app ${platform} build started`,
        buildId: buildResult.buildId,
        platform,
        branch,
        buildType,
        status: "started",
        estimatedTime: buildResult.estimatedTime,
        startedAt: new Date().toISOString(),
        travelFeatures: travelFeatures,
        artifactUrl: buildResult.artifactUrl,
      });
    } catch (error) {
      next(error);
    }
  },
);

// Get build status
app.get("/api/v1/build/:buildId", authMiddleware, async (req, res, next) => {
  try {
    const { buildId } = req.params;
    const buildStatus = await buildService.getTravelAppBuildStatus(buildId);

    if (!buildStatus) {
      return res.status(404).json({
        error: "Travel app build not found",
        buildId,
      });
    }

    res.json(buildStatus);
  } catch (error) {
    next(error);
  }
});

// List builds
app.get("/api/v1/builds", authMiddleware, async (req, res, next) => {
  try {
    const { limit = 10, offset = 0, status, platform, userId } = req.query;

    const builds = await buildService.listTravelAppBuilds({
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      platform,
      userId: userId || req.user?.id,
    });

    res.json(builds);
  } catch (error) {
    next(error);
  }
});

// Cancel build
app.delete("/api/v1/build/:buildId", authMiddleware, async (req, res, next) => {
  try {
    const { buildId } = req.params;
    const result = await buildService.cancelTravelAppBuild(buildId);

    if (!result) {
      return res.status(404).json({
        error: "Travel app build not found or cannot be cancelled",
        buildId,
      });
    }

    res.json({
      message: "Travel app build cancelled",
      buildId,
      cancelledAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

// Download build artifact
app.get("/api/v1/artifact/:buildId", authMiddleware, async (req, res, next) => {
  try {
    const { buildId } = req.params;
    const artifactPath = await buildService.getArtifactPath(buildId);

    if (!artifactPath) {
      return res.status(404).json({
        error: "Build artifact not found",
        buildId,
      });
    }

    res.download(artifactPath);
  } catch (error) {
    next(error);
  }
});

// Travel app specific endpoints
app.get("/api/v1/travel/features", (req, res) => {
  res.json({
    availableFeatures: {
      maps: {
        providers: ["google", "mapbox", "osm"],
        offline: true,
        navigation: true,
      },
      payments: {
        providers: ["stripe", "paypal", "square"],
        currencies: ["USD", "EUR", "GBP", "JPY"],
      },
      social: {
        sharing: true,
        reviews: true,
        groupPlanning: true,
      },
      bookings: {
        hotels: true,
        flights: true,
        activities: true,
        restaurants: true,
      },
      notifications: {
        push: true,
        email: true,
        sms: true,
        inApp: true,
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("API Error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  const response = {
    error: "Internal Server Error",
    message: err.message,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  res.status(err.status || 500).json(response);
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Group Wander Verse Build Service started`, {
    port: PORT,
    environment: process.env.NODE_ENV || "development",
    nodeVersion: process.version,
    platform: process.platform,
  });
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
    process.exit(0);
  });
});

module.exports = app;
