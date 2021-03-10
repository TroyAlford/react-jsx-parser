const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')
const babelConfig = require('./babel.config')
const babelES5 = require('./babel.es5')

const ENVIRONMENT = process.env.NODE_ENV || 'development'
const PRODUCTION = ENVIRONMENT === 'production'

const library = 'react-jsx-parser'
const filename = PRODUCTION ? `${library}.min.js` : `${library}.js`

const plugins = []

if (PRODUCTION) {
	plugins.push(
		new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify(ENVIRONMENT) }),
		new webpack.optimize.ModuleConcatenationPlugin(),
	)
}

const buildTarget = {
	devtool: 'source-map',
	entry: `${__dirname}/source/utils/JsxParser.tsx`,
	externals: {
		react: 'react',
		'react-dom': 'react-dom',
	},
	mode: ENVIRONMENT,
	optimization: {
		minimize: PRODUCTION,
		minimizer: [new TerserPlugin()],
	},
	output: {
		filename,
		globalObject: 'this',
		library,
		libraryTarget: 'commonjs2',
		path: `${__dirname}/dist`,
		umdNamedDefine: true,
	},
	plugins,
	resolve: {
		extensions: ['.js', '.scss', '.ts', '.tsx'], // .js is required in order to load node_modules
	},
}

const TYPES = {
	cjs: 'commonjs2',
	es5: 'commonjs2',
	umd: 'umd',
}

module.exports = Object.entries(TYPES).map(([typeName, libraryTarget]) => ({
	...buildTarget,
	module: {
		rules: [{
			exclude: (
				typeName === 'es5'
					? /node_modules\/(?!(acorn-jsx)\/).*/
					: /node_modules/
			),
			test: /\.[jt]sx?$/,
			use: {
				loader: 'babel-loader',
				options: typeName === 'es5' ? babelES5 : babelConfig,
			},
		}],
	},
	output: {
		...buildTarget.output,
		libraryTarget,
		path: `${__dirname}/dist/${typeName}`,
	},
}))
