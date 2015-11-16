var path = require("path"),
    webpack = require('webpack'),
    BundleTracker = require('webpack-bundle-tracker'),
    devFlagPlugin = new webpack.DefinePlugin({__DEBUG__: false});

module.exports = {

  __devFlagPlugin: devFlagPlugin,

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

  externals: {},

  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(),
    new BundleTracker({filename: './webpack-stats.json'}),
    devFlagPlugin,
  ],

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'react-hot'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {stage: 0}  // TODO add decorators
      }
    ],
  },

  resolve: {
    modulesDirectories: ['node_modules', 'bower_components'],
    extensions: ['', '.js', '.jsx']
  }
}
