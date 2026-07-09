# ────────────────────────────────────────────────────────────────────────────
# Etapa 1: build — compila TypeScript a JavaScript
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

LABEL stage="build"
LABEL description="Etapa de compilación del backend Node.js / TypeScript"

WORKDIR /app

RUN apk add --no-cache openssl

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# ────────────────────────────────────────────────────────────────────────────
# Etapa 2: producción — imagen final mínima (solo runtime)
# ────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS production

LABEL maintainer="Sistema de Gestión de Correspondencia"
LABEL description="Backend API REST — Node.js 20 + Express + Prisma"

WORKDIR /app

RUN apk add --no-cache openssl dos2unix

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist              ./dist
COPY --from=build /app/prisma            ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

RUN npm install -g prisma

RUN mkdir -p uploads && chown -R node:node uploads

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN dos2unix /usr/local/bin/docker-entrypoint.sh && \
    chmod +x /usr/local/bin/docker-entrypoint.sh

USER node

EXPOSE 3001

ENTRYPOINT ["/bin/sh", "/usr/local/bin/docker-entrypoint.sh"]
CMD ["npm", "start"]
