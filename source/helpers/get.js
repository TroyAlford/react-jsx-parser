const pathToArrayPath = (path) => {
  if (path == null || path === '') return []
  return path.split('.')
}

const getWithArrayPath = (object, path) => {
  const [ property, ...subPath ] = path
  if (object == null || property == null) {
    return undefined
  }
  return subPath.length === 0
    ? object[property] 
    : getWithArrayPath(object[property], subPath)
}

export default function get(object, path) {
  const arrayPath = pathToArrayPath(path)
  return getWithArrayPath(object, arrayPath)
}