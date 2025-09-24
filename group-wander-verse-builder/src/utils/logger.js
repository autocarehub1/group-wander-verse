const winston = require('winston');
const path = require('path');

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return msg;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports: [
    // Console transport for development
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/app.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      level: 'info'
    }),
    
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      format: fileFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      level: 'error'
    }),
    
    // Build-specific logs
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/builds.log'),
      format: fileFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 20,
      level: 'info',
      filter: (info) => {
        return info.message && info.message.toLowerCase().includes('build');
      }
    })
  ],
  
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log'),
      format: fileFormat
    })
  ],
  
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log'),
      format: fileFormat
    })
  ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add build-specific logging methods
logger.buildStart = (buildId, config) => {
  logger.info('🚀 Build started', {
    buildId,
    appId: config.appId,
    platform: config.targetPlatform,
    features: config.travelFeatures,
    timestamp: new Date().toISOString()
  });
};

logger.buildStep = (buildId, step, stepNumber, totalSteps) => {
  logger.info(`⚙️ Build step ${stepNumber}/${totalSteps}: ${step}`, {
    buildId,
    step,
    stepNumber,
    totalSteps,
    progress: Math.round((stepNumber / totalSteps) * 100)
  });
};

logger.buildComplete = (buildId, duration, artifacts) => {
  logger.info('✅ Build completed successfully', {
    buildId,
    duration,
    artifacts: Object.keys(artifacts).length,
    timestamp: new Date().toISOString()
  });
};

logger.buildError = (buildId, error, step) => {
  logger.error('❌ Build failed', {
    buildId,
    error: error.message,
    stack: error.stack,
    failedStep: step,
    timestamp: new Date().toISOString()
  });
};

logger.apiRequest = (method, endpoint, duration, status) => {
  const level = status >= 400 ? 'warn' : 'http';
  logger[level](`${method} ${endpoint} - ${status} (${duration}ms)`, {
    method,
    endpoint,
    status,
    duration,
    timestamp: new Date().toISOString()
  });
};

// In production, also log to external services
if (process.env.NODE_ENV === 'production') {
  // Example: Add Loggly, DataDog, or other external logging services
  if (process.env.LOGGLY_TOKEN) {
    const { Loggly } = require('winston-loggly-bulk');
    logger.add(new Loggly({
      token: process.env.LOGGLY_TOKEN,
      subdomain: process.env.LOGGLY_SUBDOMAIN,
      tags: ['wander-verse-builder', 'production'],
      json: true,
      level: 'info'
    }));
  }
}

module.exports = logger;