# Builds the PoC into static files and serves them with Lagoon's nginx image.
# The build context is the repository root, as for the other services in
# docker-compose.lagoon.yml.
FROM uselagoon/node-24-builder:latest AS builder

ENV CI=true
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV CYPRESS_INSTALL_BINARY=0

# The PoC links the service layer with workspace:*, so the workspace packages
# have to be in place before the install can link them.
COPY packages /app/packages
COPY package.json pnpm-* .npmrc /app/
COPY work-page-poc /app/work-page-poc
WORKDIR /app

RUN corepack enable
RUN pnpm install --frozen-lockfile --filter @danskernesdigitalebibliotek/dpl-work-page-poc...
RUN pnpm --dir work-page-poc run build

FROM uselagoon/nginx:latest
COPY work-page-poc/lagoon/nginx.conf /etc/nginx/conf.d/app.conf
COPY --from=builder /app/work-page-poc/dist /app
