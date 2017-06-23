/* eslint-disable */
const path = require('path')
const webpack = require('webpack')

const ENVIRONMENT = process.env.NODE_ENV
const PRODUCTION = ENVIRONMENT === 'production'

const library = 'react-jsx-parser'
const filename = PRODUCTION ? `${library}.min.js` : `${library}.js`

const plugins = []

if (PRODUCTION) {
  plugins.push(
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(ENVIRONMENT),
    }),
    new webpack.optimize.UglifyJsPlugin({ minimize: true })
  )
}

module.exports = {
  entry:  `${__dirname}/src/components/JsxParser.js`,
  externals: {
    'react': 'React',
    'react-dom': 'react-dom',
  },
  module: {
    loaders: [{
      test:    /\.js$/,
      loader:  'babel-loader',
      exclude: /node_modules/,
    }],
  },
  output: {
    filename,
    library,
    path:           `${__dirname}/lib`,
    libraryTarget:  'umd',
    umdNamedDefine: true,
  },
  plugins,
}
