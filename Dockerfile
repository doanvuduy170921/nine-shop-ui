# --- GIAI ĐOẠN 1: Build ứng dụng Angular ---
# Dùng node:18-alpine thay vì node:20 để tương thích hoàn toàn với Angular 14
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- GIAI ĐOẠN 2: Chạy trên Nginx Web Server ---
FROM nginx:alpine

# Copy các file build tĩnh ra thư mục Nginx (với name trong package.json là nineshop-fe)
COPY --from=builder /app/dist/nineshop-fe /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
