FROM oven/bun:1.3-slim AS base
WORKDIR /app

# ── Install: only package manifests + lockfile ──────────────────────────────
FROM base AS install
COPY package.json bun.lock ./
COPY apps/api/package.json        ./apps/api/package.json
COPY apps/frontend/package.json  ./apps/frontend/package.json
COPY packages/shared/package.json ./packages/shared/package.json
RUN bun install --frozen-lockfile

# ── Build: vite production build ─────────────────────────────────────────────
FROM install AS build
COPY apps/frontend ./apps/frontend
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN bun run --cwd apps/frontend build

# ── Release: nginx to serve the static dist ──────────────────────────────────
FROM nginx:alpine AS release
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
