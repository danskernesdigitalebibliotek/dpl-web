module.exports = {
  ci: {
    collect: {
      url: ["http://varnish:8080/"],
      // Use 3 runs to test both cold and warm caches.
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox",
        // Lighthouse best practices require HTTPS but we do not this available
        // on our CI environments so disable that check. It should not keep our
        // score down.
        skipAudits: ["is-on-https"],
      },
    },
    assert: {
      assertions: {
        // Our quality standard requires all categories to be green. Green
        // translates to a score between 90 and 100 - or 0.9-1.
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.9 }],
        "categories:best-practices": ["error", { minScore: 0.9 }],
        "categories:seo": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      // Update to Googles public storage to make reports easily accessible.
      // The fact that the storage is public is fine. The project is open.
      target: "temporary-public-storage",
    },
  },
};
