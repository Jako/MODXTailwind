global.modx = undefined;

const path = require('path');

module.exports = (env) => {
  global.modx = (env && env.modx) ? env.modx : false;

  const config = require('./site.config');
  const loaders = require('./webpack.loaders');
  const plugins = require('./webpack.plugins');

  return {
    context: path.join(config.root, config.paths.src),
    entry: [
      path.join(config.root, config.paths.src, 'js/main.js'),
      path.join(config.root, config.paths.src, 'css/style.scss'),
    ],
    output: {
      filename: (global.modx) ? 'assets/js/[name].js' : '[name].[hash].js',
      path: path.join(config.root, config.paths.dist),
      publicPath: '',
    },
    mode: ['production', 'development'].includes(config.env)
      ? config.env
      : 'development',
    devtool: config.env === 'production'
      ? 'hidden-source-map'
      : 'cheap-eval-source-map',
    devServer: {
      contentBase: path.join(config.root, config.paths.src),
      host: config.dev_host,
      hot: true,
      open: true,
      watchContentBase: true,
    },
    module: {
      rules: loaders,
    },
    stats: 'errors-only',
    plugins,
  };
};
