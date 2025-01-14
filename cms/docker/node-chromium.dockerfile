# Remember to update .nvmrc and @types/node if updating to a new Node version.
FROM uselagoon/node-20-builder:24.7.0

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN apk update \
    && apk add chromium \
    && rm -rf /var/cache/apk/*
