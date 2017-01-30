export default function camelCase(string) {
  return string
    .replace(/([A-Z])([A-Z])/g, '$1 $2')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[^a-zA-Z\u00C0-\u00ff]/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(value => value)
    .map((s, i) => (i > 0 ? s[0].toUpperCase() + s.slice(1) : s))
    .join('')
}
