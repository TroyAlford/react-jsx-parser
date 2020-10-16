module.exports = {
	plugins: [
		'@babel/plugin-transform-typescript',
		'@babel/plugin-proposal-class-properties',
	],
	presets: [
		'@babel/preset-env',
		'@babel/preset-react',
		'@babel/preset-typescript',
	],
	highlightCode: true,
}
