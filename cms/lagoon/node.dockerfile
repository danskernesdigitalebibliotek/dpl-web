FROM ghcr.io/danskernesdigitalebibliotek/dpl-go-node:0.25.20 as builder

ARG GO_CMS_DOMAIN=cms-playground.dpl-cms.dplplat01.dpl.reload.dk

ARG DRUPAL_REVALIDATE_SECRET
ARG GO_SESSION_SECRET
ARG NEXT_PUBLIC_APP_URL="https://go.${GO_CMS_DOMAIN}"
ARG NEXT_PUBLIC_DPL_CMS_HOSTNAME="${GO_CMS_DOMAIN}"
ARG NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_NAME
ARG NEXT_PUBLIC_GO_GRAPHQL_CONSUMER_USER_PASSWORD
ARG NEXT_PUBLIC_GRAPHQL_BASIC_TOKEN_DPL_CMS
ARG NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS="https://${GO_CMS_DOMAIN}/graphql"
ARG UNILOGIN_CLIENT_ID
ARG UNILOGIN_CLIENT_SECRET
ARG UNILOGIN_MUNICIPALITY_ID
ARG UNILOGIN_WELLKNOWN_URL
ARG UNLILOGIN_PUBHUB_CLIENT_ID
ARG UNLILOGIN_PUBHUB_RETAILER_ID
ARG UNLILOGIN_PUBHUB_RETAILER_KEY_CODE
ARG UNLILOGIN_SERVICES_WS_PASSWORD
ARG UNLILOGIN_SERVICES_WS_USER

RUN echo "Building DPL Go Node image with the following environment variables (2302)"
RUN printenv

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Production image, copy all the files and run next
FROM uselagoon/node-20:latest AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
# Make sure we have ourt startup script
COPY --from=builder /app/lagoon ./lagoon
RUN rm ./lagoon/*.dockerfile

# We need the middleware too.
COPY --from=builder /app/middleware.ts ./middleware.ts

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=10000:10000 /app/.next/standalone ./
COPY --from=builder --chown=10000:10000 /app/.next/static ./.next/static

CMD ["/app/lagoon/start.sh"]
