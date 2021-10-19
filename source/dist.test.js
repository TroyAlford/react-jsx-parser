/**
 * @jest-environment node
 */
/* eslint-disable global-require */

jest.unmock('../dist/cjs/react-jsx-parser.min')
jest.unmock('../dist/umd/react-jsx-parser.min')

describe('JSXParser', () => {
	describe('cjs build', () => {
		it('should load and parse', () => {
			const fn = () => require('../dist/cjs/react-jsx-parser.min')
			expect(fn).not.toThrow()
		})
	})
	describe('es5 build', () => {
		it('should load and parse', () => {
			const fn = () => require('../dist/es5/react-jsx-parser.min')
			expect(fn).not.toThrow()
		})
	})
	describe('umd build', () => {
		it('should load and parse', () => {
			const fn = () => require('../dist/umd/react-jsx-parser.min')
			expect(fn).not.toThrow()
		})
	})
})

/* eslint-enable global-require */
