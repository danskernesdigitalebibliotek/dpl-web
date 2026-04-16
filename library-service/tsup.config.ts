import { defineConfig } from "tsup"
import { polyfillNode } from "esbuild-plugin-polyfill-node"

export default defineConfig({
  entry: ["src/index.ts"],
  // Output CJS. Emitting ESM with `external: ["react"]` causes esbuild to
  // wrap `require("react")` calls inside the bundled SDK in a `__require`
  // shim, which throws "Dynamic require of 'react' is not supported" at
  // runtime in the browser. CJS output lets consumer bundlers (Webpack /
  // Next.js / Turbopack) resolve `require()` the normal way.
  format: ["cjs"],
  dts: { resolve: true },
  sourcemap: true,
  clean: true,
  // `@wedobooks/sdk` bundles Firebase, which transitively pulls in browserify
  // shims (crypto-browserify → cipher-base → `require("stream")`) that
  // expect a browserify-style auto-polyfill environment. esbuild doesn't
  // provide those shims by default with `platform: "browser"`, so we wire
  // in `esbuild-plugin-polyfill-node` to fill them in automatically.
  platform: "browser",
  target: "es2020",
  esbuildPlugins: [polyfillNode({})],
  // `@colibrio/colibrio-reader-framework` (a transitive dep of the SDK)
  // ships UMD modules. esbuild bundles them but leaves the AMD
  // `define([...], factory)` branches intact — and consumer webpack builds
  // then pick up those dependency strings via static analysis and try to
  // resolve them as real modules (`Can't resolve './colibrio-core-base'`).
  //
  // Replacing the identifier `define` with `undefined` makes the AMD
  // branch's `typeof define === 'function'` check statically false, which
  // esbuild then dead-code-eliminates, removing the problematic strings.
  esbuildOptions(options) {
    options.define = {
      ...options.define,
      define: "undefined",
    }
  },
  // React is provided by each consumer app as a peer dep — don't bundle it.
  external: ["react", "react-dom"],
})
