# Multi-stage build for production optimization
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for building)
RUN npm install --omit=optional

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim AS production

# Create non-root user for security
RUN addgroup --gid 1001 nodejs \
  && adduser --uid 1001 --gid 1001 --disabled-password --gecos "" nodejs


# Set working directory
WORKDIR /app

# Copy production package.json
COPY package.prod.json package.json

# Install only production dependencies
RUN npm install --omit=optional

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy any static assets if needed
COPY --from=builder /app/dist/public ./dist/public

# Create necessary directories and set permissions
RUN mkdir -p /tmp && \
    chown -R nodejs:nodejs /app /tmp

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]