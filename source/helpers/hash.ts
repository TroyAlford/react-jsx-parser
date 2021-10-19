/**
 * Hashes a value
 * @param value the value to hash
 * @param radix the base-n to hash into (default 16)
 */
export const hash = (value: string = '', radix: number = 16): string => {
	const string = String(value)
	let h = 0
	string.split('').forEach((char: string) => {
		/* eslint-disable no-bitwise */
		h = ((h << 5) - h) + char.charCodeAt(0)
		h &= h // Convert to 32-bit integer
		/* eslint-enable no-bitwise */
	})
	return Math.abs(h).toString(radix)
}

/**
 * Hashes a Math.random() value, returning it in base16
 */
export const randomHash = () => hash(Math.random().toString())
