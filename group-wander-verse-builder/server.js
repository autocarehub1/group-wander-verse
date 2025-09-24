const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const travelBuildRoutes = require('./src/routes');
const { errorHandler, notFoundHandler } = require('./src/middleware');
const logger = require('./src/utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Security and performance middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) }}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'wander-verse-builder',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API routes
app.use('/api', travelBuildRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 WanderVerse Builder service running on port ${PORT}`);
  logger.info(`📱 Ready to build travel apps!`);
});

module.exports = app;