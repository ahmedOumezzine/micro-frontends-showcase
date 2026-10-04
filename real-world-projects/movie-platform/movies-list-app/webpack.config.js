const fs = require("fs");
const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

function readEnv() {
  const envPath = path.resolve(__dirname, "../.env");
  if (!fs.existsSync(envPath)) return {};
  return fs.readFileSync(envPath, "utf8").split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return acc;
    const index = trimmed.indexOf("=");
    acc[trimmed.slice(0, index)] = trimmed.slice(index + 1);
    return acc;
  }, {});
}

const localEnv = readEnv();

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
    new webpack.DefinePlugin({
      "process.env.MOVIE_API_KEY": JSON.stringify(localEnv.MOVIE_API_KEY || localEnv.TMDB_API_KEY || process.env.MOVIE_API_KEY || process.env.TMDB_API_KEY || ""),
      "process.env.MOVIE_API_BASE_URL": JSON.stringify(localEnv.MOVIE_API_BASE_URL || process.env.MOVIE_API_BASE_URL || "https://api.themoviedb.org/3"),
      "process.env.TMDB_API_KEY": JSON.stringify(localEnv.TMDB_API_KEY || localEnv.MOVIE_API_KEY || process.env.TMDB_API_KEY || process.env.MOVIE_API_KEY || ""),
      "process.env.MOVIE_API_TIMEOUT": JSON.stringify(localEnv.MOVIE_API_TIMEOUT || process.env.MOVIE_API_TIMEOUT || "10000")
    }),
    new ModuleFederationPlugin({
      name: "moviesListApp",
      filename: "remoteEntry.js",
      exposes: {
        "./MoviesList": "./src/App"
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
    port: 9201,
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    allowedHosts: "all"
  }
};
