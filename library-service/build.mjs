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
  sourcemap: true,
  external: ["react", "react-dom"],
  plugins: [polyfillNode({})],
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
