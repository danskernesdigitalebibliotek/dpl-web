FROM ghcr.io/danskernesdigitalebibliotek/dpl-go-node:0.25.18 as builder

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

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=root:10001 /app/.next/standalone ./
COPY --from=builder --chown=root:10001 /app/.next/static ./.next/static

CMD ["/app/lagoon/start.sh"]
