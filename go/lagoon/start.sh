# Ensure our Docker env vars are properly prepared before starting Next.js.
if [ ! -f .env.local ]; then
  node ./scripts/prepare-docker-env-vars.mjs
fi

exec /app/go/node_modules/.bin/next
