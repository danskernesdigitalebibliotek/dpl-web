module.exports = {
  proxy: {
    target: 'https://https',
    // Disable local Varnish caching by pretending to be an "upstream Varnish".
    // This is especially relevant for static files like CSS and JS which are
    // not returned with cache-disabling headers even though Drupal cache is
    // disabled.
    proxyReq: [
      function (proxyReq) {
        proxyReq.setHeader('X-LAGOON-VARNISH', 'browsersync');
      },
    ],
  },
  cors: true,
  files: [
    'web/themes/custom/novel/assets/**/*.css',
    'web/themes/custom/novel/assets/**/*.js',
    'web/themes/custom/novel/css/**/*.css',
    'web/libraries/dpl-react/**/*.css',
    'web/libraries/dpl-react/**/*.js',
    'web/themes/custom/novel/templates/**/*.twig',
  ],
  host: '0.0.0.0',
  port: 443,
  ui: {
    port: 3001,
  },
  open: false,
  reloadDebounce: 300,
  logLevel: 'debug',
};
