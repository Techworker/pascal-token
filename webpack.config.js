/* global __dirname, require, module*/

const path = require('path');
const env = require('yargs').argv.env;

const pkg = require(__dirname + '/package.json');

let libraryName = pkg.name;

let outputFile, mode;

console.log(env);
if (env === 'build') {
  mode = 'production';
  outputFile = libraryName + '.min.js';
} else {
  mode = 'development';
  outputFile = libraryName + '.js';
}

module.exports = [{
  target: 'web',
  mode: mode,
  entry: [__dirname + '/index.js'],
  devtool: 'source-map',
  output: {
    path: __dirname + '/lib',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  module: {
    rules: [
      {
        test: /(\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    usedExports: true
  },
  resolve: {
    modules: [path.resolve(__dirname + '/node_modules'), path.resolve(__dirname + '/node_modules'), path.resolve(__dirname + '/src')],
    extensions: ['.mjs', '.json', '.js']
  }
}];
