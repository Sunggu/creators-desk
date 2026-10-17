# ==========================================
# Creators Desk: Multi-Stage Ultra-Light Docker Image
# ==========================================

# 1. Builder Stage
FROM node:24-alpine AS builder

WORKDIR /app

# Enable pnpm (version comes from package.json#packageManager)
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build Vite frontend & Hono server bundle
RUN pnpm run build

# 2. Production Runtime Stage
FROM node:24-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV DATA_DIR=/data

# Install production dependencies only (@hono/node-server & hono)
COPY package.json ./
RUN npm install --omit=dev

# Copy compiled bundles from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

# Licence texts: AGPL-3.0 for this product, attributions for bundled libraries.
# The same documents are reachable in the running app at /notice.html
COPY LICENSE THIRD-PARTY-NOTICES.txt ./

# Volume for user notes and SQLite database
VOLUME ["/data"]

EXPOSE 3000

CMD ["node", "dist-server/node-server.js"]
