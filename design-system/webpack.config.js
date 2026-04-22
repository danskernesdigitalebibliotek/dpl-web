const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const RemoveEmptyScriptsPlugin = require("webpack-remove-empty-scripts");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: {
    base: "./base.scss",
    wysiwyg: "./wysiwyg.scss",
    "admin-base": "./admin-base.scss",
  },
  output: {
    path: path.resolve(__dirname, "build"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader",
          "resolve-url-loader",
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
              sourceMap: true, // Required for resolve-url-loader
              sassOptions: { style: "compressed" },
            },
          },
        ],
      },
      {
        test: /\.(woff|woff2)$/,
        type: "asset/resource",
        generator: { filename: "fonts/[name][ext]" },
      },
    ],
  },
  plugins: [
    new RemoveEmptyScriptsPlugin(),
    new MiniCssExtractPlugin({ filename: "css/[name].css" }),
    new CopyPlugin({
      patterns: [
        { from: "public/icons", to: "icons" },
        {
          from: "src/**/*.js",
          to: ({ absoluteFilename }) => `js/${path.basename(absoluteFilename)}`,
        },
      ],
    }),
  ],
  optimization: {
    // Sass handles CSS compression via sassOptions.style: "compressed".
    // Disabling minimize prevents terser from minifying copied JS files.
    minimize: false,
  },
};
