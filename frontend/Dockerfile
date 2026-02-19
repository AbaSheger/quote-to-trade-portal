# Build stage
FROM node:24-alpine AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build -- --configuration production

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Copy nginx configuration (default for Docker Compose)
COPY nginx.conf /etc/nginx/conf.d/default.conf



EXPOSE 80


