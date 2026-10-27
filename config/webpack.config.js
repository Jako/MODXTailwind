global.modx = undefined;

const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

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
      filename: (global.modx) ? 'assets/js/[name].js' : '[name].[contenthash].js',
      path: path.join(config.root, config.paths.dist),
      publicPath: '',
      clean: true,
    },
    mode: ['production', 'development'].includes(config.env)
      ? config.env
      : 'development',
    devtool: config.env === 'production'
      ? 'hidden-source-map'
      : 'eval-cheap-source-map',
    devServer: {
      static: {
        directory: path.join(config.root, config.paths.src),
        watch: true,
      },
      host: config.dev_host,
      hot: true,
      open: true,
    },
    module: {
      rules: loaders,
    },
    optimization: {
      minimizer: [
        '...',
        new CssMinimizerPlugin({
          minimizerOptions: {
            preset: [
              'default',
              {
                discardComments: {
                  removeAll: true,
                },
              },
            ],
          },
        }),
      ],
    },
    stats: 'errors-only',
    plugins,
  };
};
