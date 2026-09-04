const path = require("path");
const { glob } = require("glob");
const webpack = require("webpack");
const VersionFile = require("webpack-version-file-plugin");
const { EnvironmentPlugin } = require("webpack");
const ESLintPlugin = require("eslint-webpack-plugin");
const {
  getWebPackEnvVariables,
  moduleAliases
} = require("./webpack.helpers");

module.exports = (_env, argv) => {
  const production = argv.mode === "production";

  const entry = glob
    .sync("./src/apps/**/*.mount.ts")
    .reduce((acc, entryPath) => {
      const distPath = entryPath
        .replace(/src\/apps\/.+\//, "")
        .replace(".mount.ts", "");
      acc[distPath] = `./${entryPath}`;
      return acc;
    }, {});

  const plugins = [
    new EnvironmentPlugin({
      NODE_ENV: "development"
    }),
    new ESLintPlugin({
      files: ["*.js", "*.jsx", "*.ts", "*.tsx"],
      context: path.resolve(__dirname, "./src")
    })
  ];

  if (process.env.VERSION_FILE_NAME && process.env.VERSION_FILE_VERSION) {
    const currentTime = new Date();
    plugins.push(
      new VersionFile({
        template: path.join(__dirname, ".version.json.ejs"),
        outputFile: path.join(__dirname, "dist/version.json"),
        name: process.env.VERSION_FILE_NAME,
        version: process.env.VERSION_FILE_VERSION,
        currentTime, // Required
        // We intentionally do not use any information from package.json but
        // VersionFile requires that we provide it.
        packageFile: path.join(__dirname, "package.json")
      })
    );
  }

  if (production) {
    // Source maps for everything except the WeDoBooks chunk. That chunk is the
    // pre-bundled SDK, and its map would embed Colibrio's modules in readable
    // form - which both defeats the minification their licence asks for and
    // ships ~15 MB of it to every library site.
    plugins.push(
      new webpack.SourceMapDevToolPlugin({
        filename: "[file].map",
        exclude: /wedobooks/
      })
    );
  }

  // Add environment variables to webpack in development mode
  if (!production) {
    const variables = getWebPackEnvVariables();
    if (variables) {
      plugins.push(new webpack.DefinePlugin(variables));
    }
  }

  return {
    entry: {
      ...entry,
      mount: "./src/core/mount.js"
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "dist")
    },
    mode: argv.mode,
    // Production maps come from SourceMapDevToolPlugin above, which can
    // exclude the WeDoBooks chunk; the `devtool` shorthand cannot.
    devtool: production ? false : "inline-source-map",
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        name: () => "bundle",
        chunks: "all",
        cacheGroups: {
          // The WeDoBooks SDK is megabytes of reading framework, Firebase and
          // component library, and only a patron opening a book needs any of
          // it. Everything else here is deliberately merged into one shared
          // bundle, which would drag the SDK onto every page that loads any
          // DPL app - so this group keeps its async chunk to itself.
          wedobooks: {
            test: /[\\/]packages[\\/]wedobooks[\\/]/,
            name: "wedobooks",
            chunks: "async",
            priority: 10,
            enforce: true
          }
        }
      },
      // Enable tree-shaking to remove unused Lodash methods
      usedExports: true
    },
    resolve: {
      extensions: [".js", ".jsx", ".tsx", ".ts", ".json"],
      alias: moduleAliases
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          // The WeDoBooks wrapper is the one workspace package that ships a
          // build rather than sources: esbuild has already bundled the SDK and
          // its polyfills into browser-ready output. Running it through Babel
          // again makes preset-env inject core-js imports it cannot resolve
          // from that package's own directory.
          exclude: [/node_modules/, /packages[\\/]wedobooks[\\/]dist/],
          use: [
            {
              loader: "babel-loader",
              // Workspace packages such as the service layer ship raw
              // TypeScript and resolve (through symlinks) to paths outside
              // this project root where file-relative .babelrc discovery
              // does not reach. Point Babel at the config explicitly so they
              // are transpiled like our own source.
              options: {
                babelrc: false,
                configFile: path.resolve(__dirname, ".babelrc")
              }
            }
          ]
        },
        // We consume css, svg and raster image files from dpl-design-system package
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: "svg-url-loader"
            }
          ]
        },
        {
          test: /\.(png|jpe?g|gif|webp)$/,
          type: "asset/resource"
        }
      ]
    },
    stats: {
      assets: true,
      chunks: true,
      modules: true
    },
    plugins
  };
};
