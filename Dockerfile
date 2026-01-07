# Stage 1: Build Frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Setup Backend & Serve
FROM node:18-alpine
WORKDIR /app

# Install backend dependencies
COPY server/package.json ./
RUN npm install --production

# Copy backend source
COPY server/index.js ./

# Copy built frontend to public directory
COPY --from=frontend-builder /app/dist ./public

# Expose port
EXPOSE 3030

# Environment variables
ENV PORT=3030
# API Keys should be provided at runtime
ENV API_KEY=""
ENV MIMO_API_KEY=""
ENV MIMO_BASE_URL="https://api.xiaomimimo.com/v1"

CMD ["node", "index.js"]
