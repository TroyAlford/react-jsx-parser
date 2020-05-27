/**
 * @jest-environment node
 */
/* eslint-disable global-require */

jest.unmock('../lib/cjs/react-jsx-parser.min')
jest.unmock('../lib/umd/react-jsx-parser.min')

describe('JSXParser', () => {
  describe('cjs', () => {
    it('should work without window object', () => {
      const fn = () => require('../lib/cjs/react-jsx-parser.min')
      expect(fn).not.toThrow()
    })
  })
  describe('umd', () => {
    it('should work without window object', () => {
      const fn = () => require('../lib/umd/react-jsx-parser.min')
      expect(fn).not.toThrow()
    })
  })
})

/* eslint-enable global-require */
