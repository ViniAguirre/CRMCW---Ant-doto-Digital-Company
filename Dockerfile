# ---------- BUILD ----------
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev=false
COPY . .
# Se seu build usa variáveis VITE_ no .env, garanta que elas existam
RUN npm run build

# ---------- RUNTIME ----------
FROM nginx:alpine
# remove config default e adiciona uma que lida bem com rotas SPA
RUN rm -rf /usr/share/nginx/html/* \
    && apk add --no-cache bash
COPY --from=builder /app/dist /usr/share/nginx/html
# Opcional: config Nginx para SPA
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri /index.html;\n\
  }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
