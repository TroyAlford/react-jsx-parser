/**
 * @jest-environment node
 */
/* eslint-disable global-require */

jest.unmock('../lib/cjs/react-jsx-parser.min')
jest.unmock('../lib/umd/react-jsx-parser.min')

describe('JSXParser', () => {
	describe('cjs build', () => {
		it('should load and parse', () => {
			const fn = () => require('../lib/cjs/react-jsx-parser.min')
			expect(fn).not.toThrow()
		})
	})
	describe('es5 build', () => {
		it('should load and parse', () => {
			const fn = () => require('../lib/es5/react-jsx-parser.min')
			expect(fn).not.toThrow()
		})
	})
	describe('umd build', () => {
		it('should load and parse', () => {
			const fn = () => require('../lib/umd/react-jsx-parser.min')
			expect(fn).not.toThrow()
		})
	})
})

/* eslint-enable global-require */
