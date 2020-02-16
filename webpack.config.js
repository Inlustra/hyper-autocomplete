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
    chunkFilename: "[id].bundle.js",
    path: path.resolve(__dirname, "dist"),
    libraryTarget: "commonjs"
  },
  optimization: {
    splitChunks: {
      // include all types of chunks
      chunks: "async",
      cacheGroups: {
        icons: {
          test: /[\\/]icons[\\/]/,
          name: "icons",
          chunks: "all"
        }
      }
    }
  }
};
