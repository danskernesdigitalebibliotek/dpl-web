const path = require("path");
const { glob } = require("glob");
const webpack = require("webpack");
const VersionFile = require("webpack-version-file-plugin");
const { EnvironmentPlugin } = require("webpack");
const ESLintPlugin = require("eslint-webpack-plugin");
const { getWebPackEnvVariables } = require("./webpack.helpers");

// Force singleton instances of packages that hold React context. Workspace
// packages such as the service layer get their own node_modules, and resolving
// a second copy there gives it a separate QueryClientContext - the provider in
// this project then looks unset from inside the package. Mirrors the aliasing
// GO does for the same reason.
const singletonModules = ["react", "react-dom", "@tanstack/react-query"];
const singletonAliases = Object.fromEntries(
  singletonModules.map((m) => [m, path.resolve(__dirname, "node_modules", m)])
);

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
    devtool: production ? "source-map" : "inline-source-map",
    optimization: {
      runtimeChunk: "single",
      splitChunks: {
        name: () => "bundle",
        chunks: "all"
      },
      // Enable tree-shaking to remove unused Lodash methods
      usedExports: true
    },
    resolve: {
      extensions: [".js", ".jsx", ".tsx", ".ts", ".json"],
      alias: singletonAliases
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
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
