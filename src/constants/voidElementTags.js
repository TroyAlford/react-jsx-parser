const VOID_ELEMENTS = {
  area:     true,
  base:     true,
  br:       true,
  col:      true,
  embed:    true,
  hr:       true,
  img:      true,
  input:    true,
  keygen:   true,
  link:     true,
  menuitem: true,
  meta:     true,
  param:    true,
  source:   true,
  track:    true,
  wbr:      true,
}

export default VOID_ELEMENTS

export function canHaveChildren(tagName) {
  return !VOID_ELEMENTS[tagName.toLowerCase()]
}
