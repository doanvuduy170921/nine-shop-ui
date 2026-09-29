# --- GIAI ĐOẠN 1: Build ứng dụng Angular ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
# Dùng npm install để cài đặt đầy đủ cả dependencies và devDependencies (chứa Angular CLI)
RUN npm install

COPY . .
# Chạy script build chuẩn từ package.json
RUN npm run build

# --- GIAI ĐOẠN 2: Chạy trên Nginx Web Server ---
FROM nginx:alpine

# Lưu ý: Với Angular 14, output path mặc định thường là dist/nineshop-fe
COPY --from=builder /app/dist/nineshop-fe /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
