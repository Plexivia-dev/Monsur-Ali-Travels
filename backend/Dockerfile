# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Production stage
FROM node:22-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV=production

# Copy only necessary files from builder with correct ownership
COPY --chown=nodejs:nodejs --from=builder /app/package.json /app/package-lock.json ./
COPY --chown=nodejs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs --from=builder /app/src ./src
COPY --chown=nodejs:nodejs --from=builder /app/scripts ./scripts

# Create public, uploads, documents, and storage directories with correct ownership
RUN mkdir -p /app/public /app/uploads /app/src/uploads /app/documents /app/src/documents /app/storage/exports/reports && \
    chown -R nodejs:nodejs /app/public /app/uploads /app/src/uploads /app/documents /app/src/documents /app/storage

USER nodejs

EXPOSE 5092

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=5 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5092), (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

CMD ["npm", "run", "prod"]
