const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = webpack.container;

function readEnv() {
  const file = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(fs.readFileSync(file, "utf8").split(/\r?\n/).filter((line) => line.includes("=")).map((line) => line.split("=")));
}

const env = readEnv();

module.exports = {
  entry: "./src/index.js",
  output: { publicPath: "auto", clean: true, path: path.resolve(__dirname, "dist") },
  resolve: { extensions: [".js", ".jsx"] },
  module: { rules: [
    { test: /\.(js|jsx)$/, exclude: /node_modules/, use: { loader: "babel-loader", options: { presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "automatic" }]] } } },
    { test: /\.css$/, use: ["style-loader", "css-loader"] },
  ] },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.TASKS_API_BASE_URL": JSON.stringify(env.TASKS_API_BASE_URL || "https://jsonplaceholder.typicode.com"),
      "process.env.TASKS_API_TIMEOUT": JSON.stringify(env.TASKS_API_TIMEOUT || "10000"),
    }),
    new ModuleFederationPlugin({
      name: "taskDetailsApp",
      filename: "remoteEntry.js",
      exposes: { "./TaskDetails": "./src/TaskDetails.js" },
      shared: { react: { singleton: true, requiredVersion: false }, "react-dom": { singleton: true, requiredVersion: false } },
    }),
    new HtmlWebpackPlugin({ template: "./public/index.html" }),
  ],
  devServer: { port: 9802, historyApiFallback: true, headers: { "Access-Control-Allow-Origin": "*" }, allowedHosts: "all" },
};
