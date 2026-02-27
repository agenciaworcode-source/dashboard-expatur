# Build stage
FROM node:20-alpine AS build

WORKDIR /app/frontend

# Copy package files from the frontend directory
COPY frontend/package.json ./
COPY frontend/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY frontend/ ./

# Set environment variables for build time (provided by Coolify)
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine

# Copy built assets from build stage (dist is inside frontend folder)
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy custom nginx config from the root
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
