const path = require('path')
const webpack = require('webpack')

module.exports = {
  devtool: 'inline-source-map',
  target: 'node',
  entry: [path.join(__dirname, './src/index.js')],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[name].js',
    publicPath: '/',
  },
  plugins: [],
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
}
