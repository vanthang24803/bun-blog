# use the official Bun image
FROM oven/bun:1.3-slim as base
WORKDIR /usr/src/app

# install dependencies
FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# build the application into a standalone binary
FROM install AS build
COPY . .
RUN bun run build

# production image
FROM base AS release
# copy the binary from the build stage
COPY --from=build /usr/src/app/server /usr/src/app/server
# copy migrations because they are needed at runtime for 'db:migrate' (if you run it via binary)
# or if the binary needs to read them.
COPY --from=build /usr/src/app/drizzle /usr/src/app/drizzle

# run the app
USER bun
EXPOSE 8888/tcp
ENTRYPOINT [ "./server" ]
