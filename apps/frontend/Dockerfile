FROM node:18-alpine AS base

FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune --scope=@dundring/frontend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk add --no-cache openssl1.1-compat
RUN apk update
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
RUN yarn install --ignore-scripts --frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

RUN yarn turbo run build --filter=@dundring/frontend

# Use a lightweight web server to serve the static files
FROM nginx:1.25.2-alpine AS runner

# Copy the built React app from the build stage to the NGINX web server
COPY --from=installer /app/apps/frontend/dist /usr/share/nginx/html
COPY /apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for incoming HTTP traffic
EXPOSE 80

# Start the NGINX web server
CMD ["nginx", "-g", "daemon off;"]
