FROM node:20-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app
RUN yarn config set prefix ~/.yarn
RUN yarn global add turbo
COPY . .
RUN yarn run turbo prune --scope=@dundring/backend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY --from=builder root/.yarn/bin/turbo /usr/local/bin/turbo

RUN yarn install --ignore-scripts --frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN turbo run build --filter=@dundring/backend

FROM base AS runner
WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 expressjs
RUN adduser --system --uid 1001 expressjs
# USER expressjs
COPY --from=installer /app .

# CMD  libs/database && node apps/backend/build/server.js
ENTRYPOINT ["/app/apps/backend/docker-entrypoint.sh"]
CMD node /app/apps/backend/build/server.js
