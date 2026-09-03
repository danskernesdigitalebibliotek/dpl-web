import * as esbuild from "esbuild"
import { polyfillNode } from "esbuild-plugin-polyfill-node"

const isWatch = process.argv.includes("--watch")

/** @type {import("esbuild").BuildOptions} */
const buildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "cjs",
  outdir: "dist",
  platform: "browser",
  target: "es2020",
  // Colibrio, the reading framework the SDK bundles, licenses its
  // redistributables on the condition that they are "compiled or bundled in a
  // manner so that any of its modules are not easily extractable" - so this
  // build is minified, and no source map is emitted. A map would hand the
  // original modules straight back, and this output is served publicly from
  // every library site.
  minify: true,
  sourcemap: false,
  external: ["react", "react-dom"],
  plugins: [polyfillNode({})],
  // The SDK ships main.css (a highlight animation the reader uses) but does
  // not import it, leaving it to the consumer. Pulling it in as text lets the
  // wrapper inject it itself, so it stays sourced from the package rather than
  // copied into ours where it would drift.
  loader: { ".css": "text" },
  // `@colibrio/colibrio-reader-framework` (transitive dep of the SDK) ships
  // UMD modules. esbuild bundles them but leaves the AMD
  // `define([...], factory)` branches intact — consumer webpack builds then
  // pick up those dependency strings via static analysis and try to resolve
  // them as real modules. Replacing the identifier `define` with `undefined`
  // makes the AMD branch's `typeof define === 'function'` check statically
  // false, so esbuild dead-code-eliminates the problematic strings.
  define: {
    define: "undefined",
  },
}

if (isWatch) {
  const ctx = await esbuild.context(buildOptions)
  await ctx.watch()
  console.log("esbuild: watching for changes...")
} else {
  await esbuild.build(buildOptions)
}
