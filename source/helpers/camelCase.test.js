import camelCase from './camelCase'

jest.unmock('./camelCase')

describe('camelCase', () => {
  it('removes non-word characters', () => {
    const before = '!@#$%^&*() this is a test #$()&@*#'
    const after = camelCase(before)

    expect(after).toEqual('thisIsATest')
  })
  it('handles partial camelCase correctly', () => {
    const before = 'this isATest concatenation'
    const after = camelCase(before)

    expect(after).toEqual('thisIsATestConcatenation')
  })
  it('handles unicode characters correctly', () => {
    const before = 'thís is á test'
    const after = camelCase(before)

    expect(after).toEqual('thísIsÁTest')
  })
})
