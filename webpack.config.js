const path = require("path");

module.exports = {
  mode: "development",
  target: "web",
  entry: path.resolve(__dirname, "src", "client.js"),
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "build"),
  },
};
