const pathToArrayPath = (path: string) => {
	if (path == null || path === '') return []
	return path.split('.')
}

const resolveArrayPath = (object: any, path: string[]): string | undefined => {
	const [property, ...subPath] = path
	if (object == null || property == null) {
		return undefined
	}
	return subPath.length === 0
		? object[property]
		: resolveArrayPath(object[property], subPath)
}

/**
 * Returns the result of a path query from an object
 * @param {any} object the object to search
 * @param {string} path the path, whose value will be retrieved
 * @returns {any} the value (undefined if the path doesn't exist)
 * @example
 * resolvePath({ foo: { bar: { baz: 3 } } }, 'foo.bar.baz') // 3
 */
export const resolvePath = (object: any, path: string): any => (
	resolveArrayPath(object, pathToArrayPath(path))
)
