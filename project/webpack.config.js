var path = require("path")
var webpack = require('webpack')
var BundleTracker = require('webpack-bundle-tracker')

module.exports = {

  context: __dirname,

  entry: [
    'webpack-dev-server/client?http://localhost:9001',
    'webpack/hot/only-dev-server',
    './assets/js/index'
  ],

  output: {
    path: path.resolve('./assets/bundles/'),
    filename: '[name]-[hash].js',
    publicPath: 'http://localhost:9001/assets/bundles/',
  },

  externals: {
    // "jquery": "$",
    // "underscore": "_",
    // "backbone": "Backbone",
  },

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new BundleTracker({filename: './webpack-stats.json'})
  ],

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loaders: ['react-hot', 'babel'],
      }
    ],
  },

  resolve: {
    modulesDirectories: ['node_modules', 'bower_components'],
    extensions: ['', '.js', '.jsx']
  }
}
