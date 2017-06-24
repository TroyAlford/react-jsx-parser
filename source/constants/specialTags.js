const VOID_ELEMENTS = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]

const NO_WHITESPACE = [
  'table',
  'tbody',
  'tfoot',
  'thead',
  'tr',
]

export default VOID_ELEMENTS

export function canHaveChildren(tagName) {
  return VOID_ELEMENTS.indexOf(tagName.toLowerCase()) === -1
}
export function canHaveWhitespace(tagName) {
  return NO_WHITESPACE.indexOf(tagName.toLowerCase()) !== -1
}
