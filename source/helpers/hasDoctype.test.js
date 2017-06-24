import hasDoctype from './hasDoctype'

jest.unmock('./hasDoctype')

describe('hasDoctype', () => {
  it('recognizes correct html markup with spaces', () => {
    const input = `<!DOCTYPE html>
      <head>
      </head>
      <body>
      </body>
      </html>`
    const result = hasDoctype(input)

    expect(result).toEqual(true)
  })
  it('recognizes correct html markup without spaces', () => {
    const input = '<!DOCTYPE html><head></head><body></body></html>'
    const result = hasDoctype(input)

    expect(result).toEqual(true)
  })
  it('recognizes correct html markup with content', () => {
    const input = '<!DOCTYPE html><head></head><body><div></div></body></html>'
    const result = hasDoctype(input)

    expect(result).toEqual(true)
  })
  it('doesn\'t have false positives', () => {
    const input = '<body><div>Test</div></body>'
    const result = hasDoctype(input)

    expect(result).toEqual(false)
  })
  it('requires DOCTYPE', () => {
    const input = '<html><head></head><body><div></div></body></html>'
    const result = hasDoctype(input)

    expect(result).toEqual(false)
  })
})
