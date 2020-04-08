const path = require('path');
const webpack = require('@cypress/webpack-preprocessor');

module.exports = (on) => {
  const webpackOptions = require('../../webpack.config.babel.js')();
  webpackOptions.mode = 'development';
  webpackOptions.externals = {};

  const options = {
    webpackOptions,
    watchOptions: {},
  };

  on('file:preprocessor', webpack(options));
};
