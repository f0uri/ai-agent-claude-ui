# ===== Stage 1: Build Frontend =====
FROM node:22-slim AS build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ===== Stage 2: Production =====
FROM node:22-slim AS production

# Install system dependencies for file processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./
RUN npm install --production

# Copy backend code
COPY backend/ ./

# Copy built frontend
COPY --from=build /app/frontend/dist ./public

# Create uploads directory
RUN mkdir -p uploads

ENV NODE_ENV=production
ENV PORT=3001
ENV UPLOAD_DIR=uploads

EXPOSE 3001

CMD ["node", "server.js"]
