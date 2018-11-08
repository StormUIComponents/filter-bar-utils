var webpack = require('webpack');
var path = require('path');
var devPort = process.env.PORT || 8005;
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var PATHS = {
  SRC: path.resolve(__dirname, '.'),
  TARGET: path.resolve(__dirname, 'dist')
};

var config = {
  entry: {
    filter_bar_utils_bundle: [
      './index.js'
    ]
    },
    output: {
      path: PATHS.TARGET,
      filename: '[name].js',
      library: 'filter-bar-utils',
      libraryTarget: 'umd',
      sourceMapFilename: '[name].js.map'
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
    mode: 'production',
    module: {
        preLoaders: [
            {test: /\.(js|jsx)$/, loader: 'source-map-loader'}
        ],
        loaders: [
            {test: /\.(js|jsx)$/, loaders: ['babel-loader', 'eslint-loader'], exclude: /node_modules/},
            {test: /\.json$/, loaders: ['json']}
        ]
    },
    devServer: {
      port: devPort,
      historyApiFallback: true,
      publicPath: `http://localhost:${devPort}/filter-bar-utils/`,
      contentBase: PATHS.TARGET,
      hot: true,
      progress: true,
      inline: true,
      debug: true,
      stats: {
        colors: true
      }
    },
    plugins: [
      new BundleAnalyzerPlugin(),
      new webpack.DefinePlugin({
        DEBUG: true
      }),
  
      new webpack.HotModuleReplacementPlugin()
    ]
};

module.exports = config;