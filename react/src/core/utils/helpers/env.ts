/**
 * Safely read an environment variable at module scope.
 *
 * The Storybook arg modules that use this are evaluated in the browser the
 * moment they end up in an app bundle (e.g. through a value import, or a plain
 * type import that a Babel setting fails to elide). `process` is not defined in
 * the browser, and the production webpack build only replaces
 * `process.env.NODE_ENV` — every other `process.env.X` survives verbatim. A
 * bare read would therefore throw `ReferenceError: process is not defined` and
 * crash the whole app on mount.
 *
 * Guarding the access the same way `isVitestEnvironment` does keeps these
 * modules browser-safe regardless of how they get imported. Returning the raw
 * value (possibly `undefined`) lets callers keep their own `??` / `||`
 * fallback semantics unchanged.
 */
export const readEnv = (key: string): string | undefined =>
  typeof process !== "undefined" && process.env ? process.env[key] : undefined;

export default readEnv;
