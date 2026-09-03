ARG NODE_VERSION=22.16.0

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN npm i -g corepack@latest && corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG BASE_PATH=/stats
ENV BASE_PATH=${BASE_PATH}
RUN pnpm build

FROM node:${NODE_VERSION}-alpine AS release
WORKDIR /app
ENV NODE_ENV=production
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN npm i -g corepack@latest && corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod && pnpm store prune
COPY --from=build /app/dist ./dist
ARG BASE_PATH=/stats
ENV BASE_PATH=${BASE_PATH}
ENV PORT=3100
ENV STATIC_DIR=/app/dist/web
USER node
EXPOSE 3100
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- "http://127.0.0.1:${PORT}${BASE_PATH}/api/health" || exit 1
CMD ["node", "dist/server/index.js"]
