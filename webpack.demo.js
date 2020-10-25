/* eslint-disable import/no-extraneous-dependencies */
const path = require('path')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')

const library = 'react-jsx-parser-demo'
const filename = `${library}.min.js`

module.exports = {
	devServer: {
		contentBase: './source',
		historyApiFallback: true,
		hot: true,
		injectHot: true,
		port: 3000,
		watchContentBase: true,
	},
	devtool: 'source-map',
	entry: `${__dirname}/source/demo.tsx`,
	externals: {
		react: 'React',
		'react-dom': 'ReactDOM',
	},
	mode: 'development',
	module: {
		rules: [{
			exclude: /node_modules/,
			loader: 'babel-loader',
			test: /\.[jt]sx?$/,
		}],
	},
	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()],
	},
	output: {
		filename,
		globalObject: 'this',
		library,
		libraryTarget: 'umd',
		path: path.resolve(__dirname, 'dist'),
		umdNamedDefine: true,
	},
	plugins: [
		new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('development') }),
		new webpack.optimize.ModuleConcatenationPlugin(),
	],
	resolve: {
		extensions: ['.js', '.scss', '.ts', '.tsx'], // .js is required in order to load node_modules
	},
}
