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
  // redistributables only "compiled or bundled in a manner so that any of its
  // modules are not easily extractable". Hence minified with no source map:
  // this output is served publicly from every library site.
  minify: true,
  sourcemap: false,
  external: ["react", "react-dom"],
  plugins: [polyfillNode({})],
  // `@colibrio/colibrio-reader-framework` (transitive dep of the SDK) ships
  // UMD modules whose AMD `define([...], factory)` branches survive bundling,
  // and webpack then tries to resolve their dependency strings as modules.
  // With `define` statically undefined esbuild drops the branch.
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
