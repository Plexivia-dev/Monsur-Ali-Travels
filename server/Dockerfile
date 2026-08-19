# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and prisma schema
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install all dependencies including devDependencies for prisma
RUN npm ci || npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Production stage
FROM node:22-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5093

# Copy dependencies, prisma, and source from builder
COPY --chown=nodejs:nodejs --from=builder /app/package.json /app/package-lock.json* ./
COPY --chown=nodejs:nodejs --from=builder /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs --from=builder /app/prisma ./prisma
COPY --chown=nodejs:nodejs --from=builder /app/src ./src
COPY --chown=nodejs:nodejs --from=builder /app/jsconfig.json ./jsconfig.json

# Create uploads and documents directories with proper permissions
RUN mkdir -p /app/uploads /app/documents && \
    chown -R nodejs:nodejs /app/uploads /app/documents

USER nodejs

EXPOSE 5093

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=5 \
    CMD node -e "import('http').then(h => h.get('http://localhost:' + (process.env.PORT || 5093) + '/api/v1/health', r => { if (r.statusCode !== 200) process.exit(1); }))" || exit 1

CMD ["npm", "start"]
