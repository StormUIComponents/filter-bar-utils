var webpack = require('webpack');
var path = require('path');

var PATHS = {
  SRC: path.resolve(__dirname, '.'),
  TARGET: path.resolve(__dirname, 'dist')
};

var config = {
  entry: {
    bundle: [
      './index.js'
    ]
    },
    output: {
      path: PATHS.TARGET,
      filename: '[name].js',
      library: 'filter-bar-utils',
      libraryTarget: 'umd'
    },
    resolve: {
      root: [path.resolve('.')]
    },
    eslint: {
      failOnWarning: false,
      failOnError: true,
      configFile: '.eslintrc'
    },
    devtool: 'source-map',
    module: {
        preLoaders: [
            {test: /\.(js|jsx)$/, loader: 'source-map-loader'}
        ],
        loaders: [
            {test: /\.(js|jsx)$/, loaders: ['babel-loader', 'eslint-loader'], exclude: /node_modules/},
            {test: /\.json$/, loaders: ['json']}
        ]
    }
};

module.exports = config;