# syntax=docker/dockerfile:1.7

############################
# BUILD (Vite)
############################
ARG NODE_VERSION=20.17.0
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app

# Copia só manifestos para maximizar cache
COPY package.json package-lock.json* ./
# Usa cache de npm (BuildKit) e instala TUDO (inclui devDeps p/ build)
RUN --mount=type=cache,target=/root/.npm npm ci

# Copia código e faz o build
COPY . .
# Se usar variáveis VITE_ em tempo de build, exporte-as no build ou passe com --build-arg
# Ex.: docker build --build-arg VITE_API_URL=https://api...
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

############################
# RUNTIME (Nginx)
############################
FROM nginx:alpine AS runtime

# Remove confs default e adiciona conf SPA (fallback para /index.html)
RUN rm -f /etc/nginx/conf.d/default.conf

# Config SPA
RUN printf 'server {\n\
  listen 80;\n\
  server_name _;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / {\n\
    try_files $uri /index.html;\n\
  }\n\
  # Arquivos estáticos com cache agressivo (ajuste conforme necessidade)\n\
  location ~* \\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$ {\n\
    access_log off;\n\
    add_header Cache-Control \"public, max-age=31536000, immutable\";\n\
    try_files $uri =404;\n\
  }\n\
}\n' > /etc/nginx/conf.d/spa.conf

# Copia artefatos do build
COPY --from=build /app/dist /usr/share/nginx/html

# Segurança básica: roda como usuário do Nginx
RUN chown -R nginx:nginx /usr/share/nginx/html
USER nginx

EXPOSE 80

# Healthcheck simples (ok para Swarm/Traefik)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
