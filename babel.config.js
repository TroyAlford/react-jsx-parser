module.exports = {
	plugins: [
		['@babel/plugin-transform-typescript', { allowDeclareFields: true }],
		'@babel/plugin-proposal-class-properties',
	],
	presets: [
		['@babel/preset-env', { corejs: '3.6.5', modules: 'auto', useBuiltIns: 'entry' }],
		'@babel/preset-react',
		['@babel/preset-typescript', { allowDeclareFields: true }],
	],
	highlightCode: true,
}
