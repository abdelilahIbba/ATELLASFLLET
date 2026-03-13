# ── Stage 1: Build React App ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve with lightweight Node static server ───────────────
FROM node:20-alpine AS production

WORKDIR /app

# Install serve (tiny static file server)
RUN npm install -g serve

# Copy built assets from stage 1
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# Serve the React SPA – fallback to index.html for client-side routing
CMD ["serve", "-s", "dist", "-l", "3000"]
