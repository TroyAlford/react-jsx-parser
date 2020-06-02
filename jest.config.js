const path = require('path')

module.exports = {
  collectCoverageFrom: [
    '**/apps/**/*.{ts,tsx,js}',
    '**/libs/**/*.{ts,tsx,js}',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: path.resolve(__dirname, 'test-coverage'),
  coverageReporters: ['html', 'lcov'],
  coverageThreshold: {
    global: { branches: 90, functions: 90, lines: 90, statements: 90 },
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
  testEnvironment: 'jest-environment-jsdom-fourteen',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
}
