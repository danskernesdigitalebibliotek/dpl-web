# Build base Dockerfile for deployment to lagoon.
FROM uselagoon/node-24-builder:latest
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
COPY go /app/go
WORKDIR /app/go
RUN yarn install --frozen-lockfile

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN yarn run build:stage1
