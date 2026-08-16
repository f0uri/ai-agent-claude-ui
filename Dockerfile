# Frontend Dockerfile
FROM node:20-alpine AS build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
COPY --from=build /app/frontend/dist ./public

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server.js"]
