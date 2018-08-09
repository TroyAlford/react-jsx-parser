import resolvePath from './resolvePath'

jest.unmock('./resolvePath')

describe('resolvePath', () => {
  it('null object, null path', () => {
    const result = resolvePath(null, null)
    expect(result).toBeUndefined()
  })
  it('null object, undefined path', () => {
    const result = resolvePath(null, undefined)
    expect(result).toBeUndefined()
  })
  it('null object, empty string path', () => {
    const result = resolvePath(null, '')
    expect(result).toBeUndefined()
  })
  it('null object, non-empty string path', () => {
    const result = resolvePath(null, 'path')
    expect(result).toBeUndefined()
  })
  it('undefined object, null path', () => {
    const result = resolvePath(undefined, null)
    expect(result).toBeUndefined()
  })
  it('undefined object, undefined path', () => {
    const result = resolvePath(undefined, undefined)
    expect(result).toBeUndefined()
  })
  it('undefined object, empty string path', () => {
    const result = resolvePath(undefined, '')
    expect(result).toBeUndefined()
  })
  it('undefined object, non-empty string path', () => {
    const result = resolvePath(undefined, 'path')
    expect(result).toBeUndefined()
  })
  it('valid object, null path', () => {
    const result = resolvePath({ a: 'test' }, null)
    expect(result).toBeUndefined()
  })
  it('valid object, undefined path', () => {
    const result = resolvePath({ a: 'test' }, undefined)
    expect(result).toBeUndefined()
  })
  it('valid object, empty string path', () => {
    const result = resolvePath({ a: 'test' }, '')
    expect(result).toBeUndefined()
  })
  it('valid object, one-level string path', () => {
    const result = resolvePath({ a: 'test' }, 'a')
    expect(result).toEqual('test')
  })
  it('valid object, string path level exceeds', () => {
    const result = resolvePath({ a: 'test' }, 'a.b')
    expect(result).toBeUndefined()
  })
  it('valid object, string path not exist', () => {
    const result = resolvePath({ a: 'test' }, 'b')
    expect(result).toBeUndefined()
  })
  it('valid object, string path not exist', () => {
    const object = { a: { b: 'test' } }
    const result = resolvePath(object, 'b')
    expect(result).toBeUndefined()
  })
  it('valid object, multilevel string path not exist', () => {
    const object = { a: { b: 'test' } }
    const result = resolvePath(object, 'b.a')
    expect(result).toBeUndefined()
  })
  it('valid object, two level string path', () => {
    const object = { a: { b: 'test' } }
    const result = resolvePath(object, 'a.b')
    expect(result).toEqual('test')
  })
  it('valid object, string path not reach end', () => {
    const object = { a: { b: 'test' } }
    const result = resolvePath(object, 'a')
    expect(result).toEqual({ b: 'test' })
  })
})
