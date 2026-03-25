# Remember to update .nvmrc and @types/node if updating to a new Node version.
FROM uselagoon/node-22-builder:24.7.0

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apk update \
    && apk add chromium \
    && rm -rf /var/cache/apk/*

# Use a yarn cache directory outside /app so it survives the volume mount
# at runtime. The /app directory is volume-mounted so node_modules will be
# hidden, but the yarn cache persists inside the image and speeds up the
# runtime yarn install.
ENV YARN_CACHE_FOLDER=/tmp/yarn-cache
COPY package.json yarn.lock /app/
RUN yarn install --frozen-lockfile
