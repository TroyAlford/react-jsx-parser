export default function hash(value = '', radix = 16) {
  const string = String(value)
  let h = 0
  string.split('').forEach((char) => {
    /* eslint-disable no-bitwise */
    h = ((h << 5) - h) + char.charCodeAt(0)
    h &= h // Convert to 32-bit integer
    /* eslint-enable no-bitwise */
  })
  return Math.abs(h).toString(radix)
}

export const randomHash = () => hash(Math.random().toString())
