const Joi = require('joi');
const logger = require('../utils/logger');

/**
 * Authentication middleware
 */
const authenticateRequest = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization'];
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required'
    });
  }

  // In production, validate against a real auth service
  const validApiKey = process.env.API_KEY || 'wander-verse-dev-key';
  
  if (apiKey !== validApiKey && !apiKey.includes(validApiKey)) {
    logger.warn('Invalid API key attempt', { 
      ip: req.ip, 
      userAgent: req.get('User-Agent')
    });
    
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
};

/**
 * Build request validation middleware
 */
const validateBuildRequest = (req, res, next) => {
  const schema = Joi.object({
    appId: Joi.string()
      .alphanum()
      .min(3)
      .max(50)
      .required()
      .description('Unique application identifier'),
    
    travelFeatures: Joi.array()
      .items(Joi.string().valid(
        'maps', 'location', 'offline', 'weather', 'booking',
        'expense-tracking', 'chat', 'itinerary', 'photo-sharing', 'translation'
      ))
      .min(3)
      .required()
      .description('Travel features to include'),
    
    targetPlatform: Joi.string()
      .valid('ios', 'android', 'both')
      .required()
      .description('Target platform for build'),
    
    apiIntegrations: Joi.object({
      googleMaps: Joi.object({
        apiKey: Joi.string().required(),
        features: Joi.array().items(Joi.string())
      }).optional(),
      
      weather: Joi.object({
        provider: Joi.string().valid('openweather', 'weatherapi').default('openweather'),
        apiKey: Joi.string().required()
      }).optional(),
      
      booking: Joi.object({
        providers: Joi.array().items(Joi.string().valid('booking.com', 'expedia', 'airbnb')),
        apiKeys: Joi.object().pattern(Joi.string(), Joi.string())
      }).optional(),
      
      translation: Joi.object({
        provider: Joi.string().valid('google', 'microsoft').default('google'),
        apiKey: Joi.string().required()
      }).optional()
    }).optional(),
    
    buildOptions: Joi.object({
      optimization: Joi.string().valid('development', 'production').default('production'),
      minify: Joi.boolean().default(true),
      sourceMaps: Joi.boolean().default(false)
    }).optional(),
    
    notifications: Joi.object({
      webhook: Joi.string().uri().optional(),
      email: Joi.string().email().optional()
    }).optional()
  });

  const { error, value } = schema.validate(req.body);
  
  if (error) {
    logger.warn('Build request validation failed', { 
      error: error.details[0].message,
      body: req.body 
    });
    
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
      field: error.details[0].path.join('.')
    });
  }

  req.body = value;
  next();
};

/**
 * Rate limiting middleware
 */
const rateLimitMiddleware = (req, res, next) => {
  // In production, use Redis-based rate limiting
  const clientId = req.ip;
  const key = `rate_limit:${clientId}`;
  
  // Simple in-memory rate limiting for development
  if (!global.rateLimitStore) {
    global.rateLimitStore = new Map();
  }
  
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  const clientRequests = global.rateLimitStore.get(key) || [];
  const recentRequests = clientRequests.filter(timestamp => now - timestamp < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    logger.warn('Rate limit exceeded', { clientId, requestCount: recentRequests.length });
    
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
  
  recentRequests.push(now);
  global.rateLimitStore.set(key, recentRequests);
  
  next();
};

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * 404 handler
 */
const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  res.status(404).json({
    success: false,
    error: 'Route not found',
    availableEndpoints: [
      'POST /api/builds',
      'GET /api/builds/:buildId',
      'GET /api/builds',
      'GET /api/travel/features',
      'GET /api/travel/platforms',
      'POST /api/travel/validate'
    ]
  });
};

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};

module.exports = {
  authenticateRequest,
  validateBuildRequest,
  rateLimitMiddleware,
  errorHandler,
  notFoundHandler,
  requestLogger
};