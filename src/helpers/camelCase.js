export default function camelCase(s) {
  return s
    .replace(/([A-Z])([A-Z])/g, "$1 $2")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z\u00C0-\u00ff]/g, ' ')
    .toLowerCase().split(' ')
    .filter(s => s)
    .map((s, i) => i > 0 ? s[0].toUpperCase() + s.slice(1) : s)
    .join('')
}
