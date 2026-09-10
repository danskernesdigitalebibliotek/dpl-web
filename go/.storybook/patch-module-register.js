// jest-runtime >= 30.5.1 replaces module.register/registerHooks with a stub
// that throws. Storybook >= 10.6.0's importModule() calls register()
// unconditionally to install a TypeScript loader, so @storybook/test-runner
// loading .storybook/test-runner.ts kills every suite during Jest setup.
//
// Nothing is lost by no-oping it. Node's ESM hooks live in a separate hooks
// thread, and the loader is already registered by the parent test-storybook
// process before any Jest worker exists - so it still transforms
// test-runner.ts as usual. Jest only stubs register() inside its own sandbox,
// where a second registration would attach to the wrong module loader and
// leak into every later test file - exactly what Jest is objecting to.
// Storybook's own isTypescriptLoaderRegistered guard misses this because the
// flag is per-module-instance and does not cross the process boundary.
//
// This file is a Jest `setupFiles` entry, so it has to stay CommonJS.
// Remove once storybook stops calling register() unconditionally.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Module = require("node:module")

for (const name of ["register", "registerHooks"]) {
  if (typeof Module[name] === "function") {
    Module[name] = function noopRegister() {}
  }
}
