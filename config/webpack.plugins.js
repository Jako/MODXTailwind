/* eslint-disable no-console */
// eslint-disable-next-line max-classes-per-file
const webpack = require('webpack');
const cssnano = require('cssnano');
const glob = require('glob');
const path = require('path');
const replace = require('replace-in-file');

const WebpackBar = require('webpackbar');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const FileManagerWebpackPlugin = require('filemanager-webpack-plugin');
const BeautifyHtmlWebpackPlugin = require('@sumotto/beautify-html-webpack-plugin');

const config = require('./site.config');

// Hot module replacement
const hmr = new webpack.HotModuleReplacementPlugin();

// Optimize CSS assets
const optimizeCss = new OptimizeCssAssetsPlugin({
  assetNameRegExp: /\.css$/g,
  cssProcessor: cssnano,
  cssProcessorPluginOptions: {
    preset: [
      'default',
      {
        discardComments: {
          removeAll: true,
        },
      },
    ],
  },
  canPrint: true,
});

// Clean webpack
const clean = new CleanWebpackPlugin();

// Copy assets
const copy = new CopyWebpackPlugin({
  patterns: [
    {
      from: 'images',
      to: 'images',
      globOptions: {
        ignore: ['**/favicon.*'],
      },
    },
  ],
});

// Stylelint
const stylelint = new StyleLintPlugin();

// Extract CSS
const cssExtract = new MiniCssExtractPlugin({
  filename: (global.modx) ? 'assets/css/style.css' : 'style.[contenthash].css',
});

// HTML generation
const paths = [];
const generateHTMLPlugins = () => glob.sync('./src/*.html').map((dir) => {
  const filename = path.basename(dir);
  const basename = path.basename(dir, '.html');

  if (filename !== '404.html') {
    paths.push(filename);
  }

  return new HTMLWebpackPlugin({
    filename: (global.modx) ? `${basename}.template.html` : filename,
    template: path.join(config.root, config.paths.src, filename),
    meta: {
      viewport: config.viewport,
    },
    base: (global.modx) ? '[[!++site_url]]' : '',
    minify: {
      removeRedundantAttributes: false, // do not remove type="text"
    },
  });
});

// Webpack bar
const webpackBar = new WebpackBar({
  color: '#5F48FF',
});

// Beautify HTML
const beautifyHtml = new BeautifyHtmlWebpackPlugin({
  indent_size: 2,
  indent_char: ' ',
  indent_level: 0,
  indent_with_tabs: false,
  preserve_newlines: true,
  max_preserve_newlines: 10,
  jslint_happy: false,
  space_after_named_function: false,
  space_after_anon_function: false,
  brace_style: 'collapse',
  keep_array_indentation: false,
  keep_function_indentation: false,
  space_before_conditional: true,
  break_chained_methods: false,
  eval_code: false,
  unescape_strings: false,
  wrap_line_length: 0,
  indent_empty_lines: false,
  templating: ['auto'],
});

// File copy + delete
const fileManager = new FileManagerWebpackPlugin({
  events: {
    onStart: {
      copy: [{
        source: path.join(config.root, config.paths.src_std),
        destination: path.join(config.root, config.paths.src_modx),
      }],
      delete: [
        `${path.join(config.root, config.paths.src_modx)}/partials`,
      ],
    },
    onEnd: {
      copy: [{
        source: `${path.join(config.root, config.paths.dist)}/*.html`,
        destination: `${path.join(config.root, config.paths.dist)}/core/components/modxtailwind/elements/templates`,
      }, {
        source: `${path.join(config.root, config.paths.dist)}/images/**/*`,
        destination: `${path.join(config.root, config.paths.dist)}/assets/images`,
      }],
      delete: [
        `${path.join(config.root, config.paths.dist)}/index.template.html`,
        `${path.join(config.root, config.paths.dist)}/*.html`,
        `${path.join(config.root, config.paths.dist)}/images`,
      ],
    },
  },
  runTasksInSeries: true,
  context: path.join(config.root, config.paths.dist),
});

class PreparePlugin {
  constructor(callback) {
    this.apply = (compiler) => {
      if (compiler.hooks && compiler.hooks.compile) {
        compiler.hooks.compile.tap('Prepare', callback);
      }
    };
  }
}

const PrepareCallback = () => {
  function setPartials(input) {
    let output = '';
    if (typeof input === 'string') {
      output = input.replace(new RegExp('<%= require\\(\'html-loader!.\\/(.*?)\\/(.*?).html\'\\) %>', 'g'), '[[$$$1.$2]]');
    }
    return output;
  }

  // replace in html templates
  replace({
    files: [
      `${path.join(config.root, config.paths.src)}/*.html`,
    ],
    processor: [setPartials],
  })
    .catch((error) => {
      console.error('Error occurred:', error);
    });
};
const prepare = new PreparePlugin(PrepareCallback);

class CleanUpPlugin {
  constructor(callback) {
    this.apply = (compiler) => {
      if (compiler.hooks && compiler.hooks.done) {
        compiler.hooks.done.tap('CleanUp', callback);
      }
    };
  }
}

const cleanUpCallback = () => {
  function setChecksumFile(input) {
    let output = '';
    if (typeof input === 'string') {
      output = input.replace(new RegExp('(src|href)="(assets/.*(js|css))"', 'g'), '$1="[[checksumFile? &file=`$2`]]"');
    }
    return output;
  }

  function setTitle(input) {
    let output = '';
    if (typeof input === 'string') {
      output = input.replace(new RegExp('<title>.*?</title>', 'g'), '<title>[[+pagetitle]] | [[++site_name]]</title>');
    }
    return output;
  }

  // replace in html templates
  replace({
    files: [
      `${path.join(config.root, config.paths.dist)}/core/components/modxtailwind/elements/templates/*.html`,
    ],
    processor: [setChecksumFile, setTitle],
  })
    .catch((error) => {
      console.error('Error occurred:', error);
    });
};
const cleanUp = new CleanUpPlugin(cleanUpCallback);

module.exports = [
  clean,
  config.env === 'production' && copy,
  stylelint,
  cssExtract,
  ...generateHTMLPlugins(),
  config.env === 'production' && optimizeCss,
  webpackBar,
  config.env === 'development' && hmr,
  config.env === 'production' && global.modx && fileManager,
  config.env === 'production' && global.modx && prepare,
  config.env === 'production' && global.modx && cleanUp,
  config.env === 'production' && global.modx && beautifyHtml,
].filter(Boolean);
