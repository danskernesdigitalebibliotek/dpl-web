module.exports = {
  ci: {
    collect: {
      url: [
        // TODO: Develop a test with representative homepage example content:
        // https://reload.atlassian.net/browse/DDFLSBP-668
        // "http://varnish:8080/",
        "http://varnish:8080/search?q=harry+potter&x=0&y=0",
        "http://varnish:8080/work/work-of:870970-basis:25245784?type=bog"
        "http://varnish:8080/articles",
        "http://varnish:8080/events",
        "http://varnish:8080/branches",
        // Article page from DPL Example Content
        // "http://varnish:8080/by_uuid/node/2cd0fe5e-4159-4452-86aa-e1a1ac8db4a1",
        // Event instance page from DPL Example Content
        // "http://varnish:8080/by_uuid/eventseries/c8177097-1438-493e-8177-e8ef968cc133",
        // Branch page from DPL Example Content
        "http://varnish:8080/by_uuid/node/dac275e4-9b8c-4959-a13a-6b9fdbc1f6b0",
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
          // performance of a mid-range smartphone instead of a desktop
          // workstation. That does not hold for us:
          // 1. Experience shows that Docker containers and GitHub Actions
          //    runners have significantly fewer resources and classifies
          //    as a low-end desktop
          // 2. Lighthouse targets a Moto G4 from 2016 as the mid-range device.
          //    We expect this to be underpowered compared to our target user
          //    range. Instead we target their definition of a high-end
          //    smartphone - a Samsung S10 from 2019.
          // Low-end desktop testing as high-end mobile yields a 1x multiplier:
          // https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md#cpu-throttling
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      assertions: {
        // Our quality standard requires all categories to be green. Green
        // translates to a score between 90 and 100 - or 0.9-1.
        // TODO: Implement inline critial CSS to raise score above 0.9
        // TODO: Implement depedency splitting to raise score above 0.75
        "categories:performance": ["warn", { minScore: 0.75 }],
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
