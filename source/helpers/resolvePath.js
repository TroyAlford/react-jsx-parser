const pathToArrayPath = (path) => {
  if (path == null || path === '') return []
  return path.split('.')
}

const resolveArrayPath = (object, path) => {
  const [property, ...subPath] = path
  if (object == null || property == null) {
    return undefined
  }
  return subPath.length === 0
    ? object[property]
    : resolveArrayPath(object[property], subPath)
}

export default (object, path) => resolveArrayPath(object, pathToArrayPath(path))
