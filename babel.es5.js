module.exports = {
	plugins: [
		['@babel/plugin-transform-typescript', { allowDeclareFields: true }],
		'@babel/plugin-proposal-class-properties',
	],
	presets: [
		['@babel/preset-env', {
			corejs: '3.6.5',
			modules: 'commonjs',
			targets: { chrome: '58', ie: '11' },
			useBuiltIns: 'usage',
		}],
		'@babel/preset-react',
		['@babel/preset-typescript', { allowDeclareFields: true }],
	],
}
