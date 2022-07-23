module.exports = {
  entry: "./src/index.js",
  output: {
    filename: "main.js"
  }
  // node:{fs:'empty'},
  // module: {
  //   rules: [
  //     { test: /node_modules\/JSONStream\/index\.js$/,
  //       loaders: ['shebang-loader'] }
  //   ]
  // }
}