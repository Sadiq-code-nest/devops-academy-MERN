# backend/Dockerfile
# Multi-stage build — keeps image small and production clean

# ── Stage 1: Install dependencies ──────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# ── Stage 2: Final image ────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Copy installed dependencies from stage 1
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 5000
CMD ["node", "server.js"]
