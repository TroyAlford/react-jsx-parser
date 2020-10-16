const path = require('path')

module.exports = {
	collectCoverageFrom: [
		'**/source/**/*.{ts,tsx,js}',
		'!**/node_modules/**',
		'!**/lib/**',
		'!**/*.d.ts',
		'!**/*.test.{ts,tsx,js}',
	],
	coverageDirectory: path.resolve(__dirname, 'test-coverage'),
	coverageReporters: ['html', 'lcov'],
	coverageThreshold: {
		global: { branches: 85, functions: 95, lines: 95, statements: 95 },
	},
	globals: {
		moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
	},
	moduleDirectories: ['node_modules'],
	/* eslint-disable sort-keys */
	moduleNameMapper: {
		'^(.*).scss$': path.resolve(__dirname, 'jest/mock.styles.ts'),
		'^(.*).(jpg|png|gif|eot|otf|svg|ttf|woff2?)$': path.resolve(__dirname, 'jest/mock.files.ts'),
	},
	/* eslint-enable sort-keys */
	modulePaths: [
		'<rootDir>/mocks',
		'<rootDir>/node_modules',
	],
	setupFilesAfterEnv: [
		path.resolve(__dirname, 'jest/jest.setup.ts'),
	],
	testEnvironment: 'jsdom',
	transform: {
		'^.+\\.[jt]sx?$': 'babel-jest',
	},
}
