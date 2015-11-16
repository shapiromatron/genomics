var webpack = require('webpack')
var WebpackDevServer = require('webpack-dev-server')
var config = require('./webpack.config')

config.__devFlagPlugin.definitions.__DEBUG__ = true;

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  inline: true,
  historyApiFallback: true,
  stats: { colors: true },
}).listen(9001, '0.0.0.0', function (err, result) {
  if (err) console.log(err);
  console.log('Listening at 0.0.0.0:9001');
})
