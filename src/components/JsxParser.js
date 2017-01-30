import React from 'react'
import camelCase from '../helpers/camelCase'

export const NODE_TYPES = {
  ELEMENT: 1,
  TEXT:    3,

  1:  'Element',
  3:  'Text',
  7:  'Processing Instruction',
  8:  'Comment',
  9:  'Document',
  10: 'Document Type',
  11: 'Document Fragment',

  /* Deprecated Nodes */
  2:  'Attribute (Deprecated)',
  4:  'CData (Deprecated)',
  5:  'XML Entity Reference (Deprecated)',
  6:  'XML Entity (Deprecated)',
  12: 'XML Notation (Deprecated)',
}

const ATTRIBUTES = {
  class: 'className',
  for:   'htmlFor',
}

const parser = new DOMParser()

const warnParseErrors = (doc) => {
  const errors = Array.from(doc.documentElement.childNodes)
  // eslint-disable-next-line no-console
  console.warn(`Unable to parse jsx. Found ${errors.length} error(s):`)

  const warn = (node, indent) => {
    if (node.childNodes.length) {
      Array.from(node.childNodes)
        .forEach(n => warn(n, indent.concat(' ')))
    }

    // eslint-disable-next-line no-console
    console.warn(`${indent}==> ${node.nodeValue}`)
  }

  errors.forEach(e => warn(e, ' '))
}

export default class JsxParser extends React.Component {
  constructor(props) {
    super(props)
    this.parseJSX.bind(this)
    this.parseNode.bind(this)

    this.ParsedChildren = this.parseJSX(props.jsx || '')
  }
  componentWillReceiveProps(props) {
    this.ParsedChildren = this.parseJSX(props.jsx || '')
  }

  parseJSX(rawJSX) {
    if (!rawJSX || typeof rawJSX !== 'string') return []

    const jsx = this.props.blacklistedTags.reduce((raw, tag) =>
      raw.replace(new RegExp(`(</?)${tag}`, 'ig'), '$1REMOVE')
    , rawJSX)

    const wrapped = `
      <?xml version="1.0" encoding="UTF-8"?>\
      <xml>${jsx}</xml>\
    `
    const doc = parser.parseFromString(wrapped, 'application/xml')
    if (!doc) return []

    Array.from(doc.getElementsByTagName('REMOVE')).forEach(tag =>
      tag.parentNode.removeChild(tag)
    )

    const xml = doc.getElementsByTagName('xml')[0]
    if (!xml || xml.nodeName.toLowerCase() === 'parseerror') {
      warnParseErrors(doc)
      return []
    }

    const components = this.props.components.reduce(
      (map, type) => ({
        ...map,
        [type.prototype.constructor.name]: type,
      })
    , {})

    return this.parseNode(xml.childNodes || [], components)
  }
  parseNode(node, components = {}, key) {
    if (node instanceof NodeList || Array.isArray(node)) {
      return Array.from(node) // handle nodeList or []
        .map((child, index) => this.parseNode(child, components, index))
        .filter(child => child) // remove falsy nodes
    }

    switch (node.nodeType) {
      case NODE_TYPES.TEXT:
        // Text node. Collapse whitespace and return it as a String.
        return ('textContent' in node ? node.textContent : node.nodeValue || '')
          .replace(/\s{2,}/g, ' ').trim()

      case NODE_TYPES.ELEMENT:
        // Element node. Parse its Attributes and Children, then call createElement
        return React.createElement(
          components[node.nodeName] || node.nodeName,
          {
            ...this.props.bindings || {},
            ...this.parseAttrs(node.attributes, key),
          },
          this.parseNode(node.childNodes, components),
        )

      default:
        // eslint-disable-next-line no-console
        console.warn(`JsxParser encountered a(n) ${NODE_TYPES[node.nodeType]} node, and discarded it.`)
        return null
    }
  }
  parseAttrs(attrs, key) {
    const props = { key }
    if (!attrs || !attrs.length) return props

    const blacklist = this.props.blacklistedAttrs

    return Array.from(attrs)
    .filter(attr =>
      !blacklist.map(mask =>
        // If any mask matches, it will return a non-null value
        attr.name.match(new RegExp(mask, 'gi'))
      ).filter(match => match !== null).length
    )
    .reduce((current, attr) => {
      let { name, value } = attr
      if (value === '') value = true
      if (name.substring(0, 2) === 'on') {
        value = new Function(value) // eslint-disable-line no-new-func
      }

      name = ATTRIBUTES[name.toLowerCase()] || camelCase(name)

      return {
        ...current,
        [name]: value,
      }
    }, props)
  }

  render() {
    return (
      <div className="jsx-parser">
        {this.ParsedChildren}
      </div>
    )
  }
}

JsxParser.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  bindings:         React.PropTypes.object.isRequired,
  blacklistedAttrs: React.PropTypes.arrayOf(React.PropTypes.string),
  blacklistedTags:  React.PropTypes.arrayOf(React.PropTypes.string),
  components:       (props, propName) => {
    if (!Array.isArray(props[propName])) {
      return new Error(`${propName} must be an Array of Components.`)
    }

    let passes = true
    props[propName].forEach((component) => {
      if (!(component.prototype instanceof React.Component ||
            component.prototype instanceof React.PureComponent)) {
        passes = false
      }
    })

    return passes ? null : new Error(
      `${propName} must contain only Subclasses of React.Component or React.PureComponent.`
    )
  },
  jsx: React.PropTypes.string,
}
JsxParser.defaultProps = {
  bindings:         {},
  blacklistedAttrs: ['on[a-z]*'],
  blacklistedTags:  ['script'],
  components:       [],
  jsx:              '',
}
