
# ---- Build stage ----
    FROM node:20 AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm ci --legacy-peer-deps
    
    COPY . .
    RUN npm run build
    
    # ---- Production Nginx stage ----
    FROM nginx:alpine
    
    # CHANGED: use 'public' instead of 'build'
    FROM nginx:alpine
COPY --from=builder /app/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
    
    EXPOSE 80
    
    CMD ["nginx", "-g", "daemon off;"]
    