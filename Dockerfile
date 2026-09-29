# Giai đoạn 1: Build Angular production
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Giai đoạn 2: Serve bằng Nginx
FROM nginx:alpine
# Lưu ý: Thay `nines-shop-ui` bằng tên project Angular thực tế trong file angular.json (phần outputPath)
COPY --from=builder /app/dist/nines-shop-ui /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
