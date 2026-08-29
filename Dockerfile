# ==========================================
# Stage 1: Build dependencies & applications
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Optional build arguments for Vite environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

# Copy root package definitions and workspace package definitions
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Copy source code files
COPY frontend ./frontend
COPY backend ./backend

# Build both frontend SPA and backend TypeScript code
RUN npm run build:frontend
RUN npm run build:backend

# Prune devDependencies to keep only production dependencies
RUN npm prune --omit=dev

# ==========================================
# Stage 2: Minimal & Secure Distroless Runtime
# ==========================================
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

WORKDIR /app

# Copy production node_modules and root package definition
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/package.json ./package.json

# Copy compiled backend code and configuration
COPY --from=builder --chown=nonroot:nonroot /app/backend/dist ./backend/dist
COPY --from=builder --chown=nonroot:nonroot /app/backend/package.json ./backend/package.json

# Copy compiled frontend static assets
COPY --from=builder --chown=nonroot:nonroot /app/frontend/dist ./frontend/dist

# Set production environment and default port
ENV NODE_ENV=production
ENV PORT=5001

# Expose server port
EXPOSE 5001

# Run as non-root unprivileged user (UID 65532)
USER nonroot:nonroot

# Entrypoint executes node with the compiled backend entry point
CMD ["backend/dist/src/index.js"]
