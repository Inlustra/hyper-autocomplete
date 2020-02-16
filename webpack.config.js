const path = require("path");

const webpack = require("webpack");

module.exports = {
  entry: "./src/index.ts",
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"]
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  devtool: false,
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs"
  },
  optimization: {
    splitChunks: {
      chunks: "async",
      cacheGroups: {
        defaultVendors: {
          filename: "vendors.[chunkhash].js",
        },
        icons: {
          test: /[\\/]icons[\\/]/,
          filename: "icons.[chunkhash].js",
          chunks: "all"
        }
      }
    }
  }
};
