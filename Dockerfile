# Backend for WanderTogether Travel App
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=optional

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "dist/index.js"]