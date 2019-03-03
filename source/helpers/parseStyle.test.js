import parseStyle from './parseStyle'

jest.unmock('./parseStyle')

describe('parseStyle', () => {
  it('returns objects without modification', () => {
    const before = { foo: 'bar', baz: { a: 'b' } }
    const after = parseStyle(before)

    expect(after).toEqual(before)
  })
  it('parses single rules with no semicolon', () => {
    const before = 'simple: rule'
    const after = parseStyle(before)

    expect(after).toEqual({ simple: 'rule' })
  })
  it('parses multiple rules', () => {
    const before = 'margin: 0 5px; padding: 1em 5px; text-decoration: underline'
    const after = parseStyle(before)

    /* eslint-disable key-spacing */
    expect(after).toEqual({
      margin: '0 5px',
      padding: '1em 5px',
      textDecoration: 'underline',
    })
  })
  it('returns undefined for invalid input', () => {
    expect(parseStyle(false)).toBe(undefined)
    expect(parseStyle(NaN)).toBe(undefined)
    expect(parseStyle(0)).toBe(undefined)
    expect(parseStyle()).toBe(undefined)
  })
})
