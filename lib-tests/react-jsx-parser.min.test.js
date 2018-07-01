/**
 * @jest-environment node
 */

jest.unmock('../lib/react-jsx-parser.min')

describe('JSXParser', () => {
  it('should work without window object', () => {
    const fn = () => require('../lib/react-jsx-parser.min')
    expect(fn).not.toThrow()
  })
})
