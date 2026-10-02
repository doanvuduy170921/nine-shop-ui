# --- GIAI ĐOẠN 1: Build ứng dụng Angular ---
FROM node:18-alpine AS builder

WORKDIR /app

# Sao chép các file quản lý dependency trước để tận dụng Docker Layer Caching
COPY package*.json ./

# Sử dụng npm ci thay cho npm install để build ổn định và nhanh hơn trong môi trường CI/CD
RUN npm ci

# Sao chép toàn bộ mã nguồn
COPY . .

# Build ứng dụng ở chế độ production
RUN npm run build -- --configuration production

# --- GIAI ĐOẠN 2: Chạy trên Nginx Web Server (Production) ---
FROM nginx:alpine

# Xóa file cấu hình mặc định của Nginx để tránh xung đột
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy file cấu hình Nginx tối ưu cho SPA (đã xử lý triệt để lỗi F5 404)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy các file build tĩnh từ giai đoạn builder sang thư mục public của Nginx
# (Lưu ý: Tùy theo phiên bản Angular và cấu hình output trong angular.json,
# đường dẫn dist có thể là /app/dist/nineshop-fe hoặc /app/dist/nineshop-fe/browser)
COPY --from=builder /app/dist/nineshop-fe /usr/share/nginx/html

# Thiết lập quyền hạn an toàn cho thư mục chứa code
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80

# Healthcheck để giám sát trạng thái container trong hệ thống Docker Compose / Orchestrator
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
