FROM oven/bun:1.3-slim AS base
WORKDIR /usr/src/app

# ── Install: only package manifests + lockfile ──────────────────────────────
FROM base AS install
COPY package.json bun.lock ./
COPY apps/api/package.json         ./apps/api/package.json
COPY apps/frontend/package.json    ./apps/frontend/package.json
COPY packages/shared/package.json  ./packages/shared/package.json
RUN bun install --frozen-lockfile

# ── Build: compile to a standalone binary ───────────────────────────────────
FROM install AS build
COPY tsconfig.json ./
COPY apps/api      ./apps/api
COPY packages/shared ./packages/shared
RUN bun run build:api

# ── Release: minimal image with just the binary + migrations ─────────────────
FROM base AS release
COPY --from=build /usr/src/app/apps/api/server  ./server
COPY --from=build /usr/src/app/apps/api/drizzle ./drizzle

USER bun
EXPOSE 8888/tcp
ENTRYPOINT ["./server"]
