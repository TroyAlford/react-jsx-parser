import hash, { randomHash } from './hash'

describe('helpers/hash', () => {
  it('hashes correctly/consistently', () => {
    expect(hash('foo')).toEqual('18cc6')
    expect(hash('foo', 8)).toEqual('306306')
  })
  it('generates random hashes', () => {
    const oldMathRandom = Math.random
    Math.random = jest.fn(() => Math.PI / 10)

    expect(randomHash('foo')).toEqual('29a766ba')
    expect(Math.random).toHaveBeenCalledTimes(1)

    Math.random = oldMathRandom
  })
})