/* eslint-disable */
const path = require('path')
const webpack = require('webpack')

const ENVIRONMENT = process.env.NODE_ENV || 'development'
const PRODUCTION = ENVIRONMENT === 'production'

const library = 'react-jsx-parser'
const filename = PRODUCTION ? `${library}.min.js` : `${library}.js`

const plugins = []

if (PRODUCTION) {
  plugins.push(
    new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(ENVIRONMENT) }),
    new webpack.optimize.ModuleConcatenationPlugin()
  )
}

module.exports = {
  devtool: 'source-map',
  entry: `${__dirname}/source/components/JsxParser.js`,
  externals: {
    'react': 'react',
    'react-dom': 'react-dom',
  },
  mode: ENVIRONMENT,
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
    }],
  },
  optimization: {
    minimize: PRODUCTION,
  },
  output: {
    filename,
    library,
    path: `${__dirname}/lib`,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: 'this'
  },
  plugins,
}
