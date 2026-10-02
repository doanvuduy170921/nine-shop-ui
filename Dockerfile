
FROM node:18-alpine AS builder

WORKDIR /app


COPY package*.json ./


RUN npm ci

COPY . .

RUN npm run build -- --configuration production


FROM nginx:alpine


RUN rm -rf /etc/nginx/conf.d/default.conf


COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist/nineshop-fe /usr/share/nginx/html

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

EXPOSE 80


HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
