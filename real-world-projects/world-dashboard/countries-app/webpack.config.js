const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const deps = require("./package.json").dependencies;

module.exports = {
  entry: "./src/index.js",
  output: {
    publicPath: "auto",
    clean: true,
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env", ["@babel/preset-react", { runtime: "automatic" }]]
          }
        }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  plugins: [
    new ModuleFederationPlugin({
      name: "countriesApp",
      filename: "remoteEntry.js",
      exposes: {
        "./Countries": "./src/App"
},
      shared: {
        react: {
          singleton: true,
          requiredVersion: false
        },
        "react-dom": {
          singleton: true,
          requiredVersion: false
        }
      }
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html"
    })
  ],
  devServer: {
    port: 9101,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    allowedHosts: "all"
  }
};