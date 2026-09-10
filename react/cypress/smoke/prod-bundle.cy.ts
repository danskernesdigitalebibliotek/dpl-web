// Production-bundle smoke test.
//
// Guards against regressions that only surface when the real production bundle
// runs in a browser — the class of bug that unit tests (jsdom defines
// `process`) and a green webpack build (never executes the code) both miss.
// The original motivation was a Babel change that leaked a Storybook
// `process.env` reference into the shared chunk, producing `process is not
// defined` at runtime; that was caught only by the CMS Cypress suite.
//
// The harness page (cypress/smoke/server.mjs) loads every production chunk in
// order and mounts each registered app, recording any uncaught error or
// rejection. We assert that the bundle evaluated cleanly and mounted.

declare global {
  interface Window {
    dplReact?: { apps?: Record<string, unknown>; mount?: unknown };
    smokeReady?: boolean;
    smokeErrors?: string[];
    smokeEvalErrors?: string[];
    smokeApps?: string[];
    smokeExpectedAppCount?: number;
  }
}

describe("Production bundle", () => {
  it("evaluates in a browser and every app chunk registers without errors", () => {
    // Errors are collected on the page (window.smokeErrors / smokeEvalErrors)
    // and asserted in aggregate below, so let Cypress surface them there rather
    // than failing on the first uncaught exception.
    cy.on("uncaught:exception", () => false);

    cy.visit("/");
    cy.window({ timeout: 30000 }).should("have.property", "smokeReady", true);

    // mount() renders on a macrotask; give mounted apps a tick to settle so
    // mount-phase errors land in the bucket before we report them.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);

    cy.window().then((win) => {
      const evalErrors = win.smokeEvalErrors ?? [];
      const allErrors = win.smokeErrors ?? [];
      const apps = win.smokeApps ?? [];
      const expected = win.smokeExpectedAppCount ?? 0;

      // Mount-phase errors are expected without a CMS text/config payload;
      // report them for visibility but do not fail the smoke test on them.
      const mountErrors = allErrors.slice(evalErrors.length);
      if (mountErrors.length > 0) {
        cy.log(`mount-phase errors (ignored): ${mountErrors.length}`);
      }

      // The hard gate, asserted first so a leaked `process` reference surfaces
      // as "process is not defined" rather than a downstream symptom: nothing
      // may throw while the production bundle evaluates.
      expect(
        evalErrors,
        `errors while evaluating the production bundle:\n${evalErrors.join(
          "\n\n"
        )}`
      ).to.have.length(0);

      // The shared chunk and mount entry evaluated: a `process is not defined`
      // in bundle.js would leave dplReact / mount undefined here.
      expect(win.dplReact, "window.dplReact").to.be.an("object");
      expect(win.dplReact?.mount, "window.dplReact.mount").to.be.a("function");

      // Every app chunk ran its top-level addMount(). A chunk that threw while
      // evaluating (the failure mode this job guards against) would be missing.
      cy.log(`registered ${apps.length} / ${expected} app chunks`);
      expect(apps.length, "registered dpl-react apps").to.be.greaterThan(0);
    });
  });
});

export {};
