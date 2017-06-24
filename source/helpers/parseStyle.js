import camelCase from './camelCase'

export default function parseStyle(style) {
  switch (typeof style) {
    case 'string':
      return style.split(';').filter(r => r)
        .reduce((map, rule) => {
          const name = rule.slice(0, rule.indexOf(':')).trim()
          const value = rule.slice(rule.indexOf(':') + 1).trim()

          return {
            ...map,
            [camelCase(name)]: value,
          }
        }, {})
    case 'object':
      return style

    default:
      return undefined
  }
}
