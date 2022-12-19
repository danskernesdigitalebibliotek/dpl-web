module.exports = {
  ci: {
    collect: {
      url: [
        "http://varnish:8080/",
        "http://varnish:8080/search?q=harry+potter&x=0&y=0",
        "http://varnish:8080/work/work-of:870970-basis:25245784?type=bog"
      ],
      // Use 3 runs to test both cold and warm caches.
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox",
        // Lighthouse best practices require HTTPS but we do not this available
        // on our CI environments so disable that check. It should not keep our
        // score down.
        skipAudits: ["is-on-https"],
        throttling: {
          // Lighthouse will throttle CPU by 4x by default to mimick the
          // performance of a midrange smartphone instead of a desktop
          // workstation. Experience shows that Docker containers and GitHub
          // Actions runners have significantly fewer resources than a desktop and
          // thus should be throttled less. This value is based on a benchmark
          // index of 1000. The actual benchmark in a run can be seen under
          // CPU/Memory Power in the generated report.
          // https://lighthouse-cpu-throttling-calculator.vercel.app/
          cpuSlowdownMultiplier: 2.9,
        },
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
