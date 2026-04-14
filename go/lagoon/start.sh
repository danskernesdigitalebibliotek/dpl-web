# NEXT_PUBLIC_* vars are inlined into the client JS bundle at build time
# (see node.dockerfile). These runtime exports only affect server-side
# rendering — they ensure SSR uses the correct URLs for the environment.

node ./scripts/prepare-docker-env-vars.mjs
exec yarn start
