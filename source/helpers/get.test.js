import get from './get'

jest.unmock('./get')

describe('get', () => {
  it('null object, null path', () => {
    const result = get(null, null)
    expect(result).toBeUndefined()
  })
  it('null object, undefined path', () => {
    const result = get(null, undefined)
    expect(result).toBeUndefined()
  })
  it('null object, empty string path', () => {
    const result = get(null, '')
    expect(result).toBeUndefined()
  })
  it('null object, non-empty string path', () => {
    const result = get(null, 'path')
    expect(result).toBeUndefined()
  })
  it('undefined object, null path', () => {
    const result = get(undefined, null)
    expect(result).toBeUndefined()
  })
  it('undefined object, undefined path', () => {
    const result = get(undefined, undefined)
    expect(result).toBeUndefined()
  })
  it('undefined object, empty string path', () => {
    const result = get(undefined, '')
    expect(result).toBeUndefined()
  })
  it('undefined object, non-empty string path', () => {
    const result = get(undefined, 'path')
    expect(result).toBeUndefined()
  })
  it('valid object, null path', () => {
    const result = get({ a: 'test' }, null)
    expect(result).toBeUndefined()
  })
  it('valid object, undefined path', () => {
    const result = get({ a: 'test' }, undefined)
    expect(result).toBeUndefined()
  })
  it('valid object, empty string path', () => {
    const result = get({ a: 'test' }, '')
    expect(result).toBeUndefined()
  })
  it('valid object, one-level string path', () => {
    const result = get({ a: 'test' }, 'a')
    expect(result).toEqual('test')
  })
  it('valid object, string path level exceeds', () => {
    const result = get({ a: 'test' }, 'a.b')
    expect(result).toBeUndefined()
  })
  it('valid object, string path not exist', () => {
    const result = get({ a: 'test' }, 'b')
    expect(result).toBeUndefined()
  })
  it('valid object, string path not exist', () => {
    const object = {
      a: {
        b: 'test',
      }
    }
    const result = get(object, 'b')
    expect(result).toBeUndefined()
  })
  it('valid object, multilevel string path not exist', () => {
    const object = {
      a: {
        b: 'test',
      }
    }
    const result = get(object, 'b.a')
    expect(result).toBeUndefined()
  })
  it('valid object, two level string path', () => {
    const object = {
      a: {
        b: 'test',
      }
    }
    const result = get(object, 'a.b')
    expect(result).toEqual('test')
  })
  it('valid object, string path not reach end', () => {
    const object = {
      a: {
        b: 'test',
      }
    }
    const result = get(object, 'a')
    expect(result).toEqual({b: 'test'})
  })
})
