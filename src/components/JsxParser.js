import React, { Component, createElement } from 'react'
import camelCase from '../helpers/camelCase'

const NODE_TYPE = {
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

const Node = {
  Element: 1,
  Text: 3,
}
const parser = new DOMParser()

export default class JsxParser extends Component {
  constructor(props) {
    super(props)
    this.parseJSX.bind(this)
    this.parseNode.bind(this)

    this.ParsedChildren = this.parseJSX(props.jsx || '')
  }
  componentWillReceiveProps(props) {
    this.ParsedChildren = this.parseJSX(props.jsx || '')
  }

  parseJSX(jsx) {
    if (!jsx) return []

    const wrapped = `<!DOCTYPE html><html><body>${jsx}</body></html>`
    const doc = parser.parseFromString(wrapped, 'text/html')
    if (!doc) return []

    const body = doc.getElementsByTagName('body')[0]
    if (!body || body.nodeName.toLowerCase() === 'parseerror') return []

    const components = this.props.components.reduce(
      (map, type) => ({ ...map, [type.constructor.name]: type })
    , {})

    return this.parseNode(doc.body.childNodes || [], components)
  }
  parseNode(node, components = {}, key) {
    if (node instanceof NodeList || Array.isArray(node))
      return Array.from(node) // handle nodeList or []
        .map((child, key) => this.parseNode(child, components, key))
        .filter(child => child) // remove falsy nodes

    switch (node.nodeType) {
      case Node.Text:
        // Text node. Collapse whitespace and return it as a String.
        return ('textContent' in node ? node.textContent : node.nodeValue || '')
          .replace(/\w/g, ' ').replace(/  /g, ' ').trim()

      case Node.Element:
        // Element node. Parse its Attributes and Children, then call createElement
        return React.createElement(
          components[node.nodeName] || node.nodeName,
          this.parseAttrs(node.attributes, key),
          this.parseNode(node.childNodes, components),
        )

      default:
        console.warn(
          `JsxParser encountered a ${NODE_TYPE[node.nodeType]} node, and discarded it.`
        )
    }
  }
  parseAttrs(attrs, key) {
    const props = { key }
    if (!attrs || !attrs.length) return props

    return Array.from(attrs).reduce((current, attr) => {
      let { name, value } = attr
      if (value === '') value = true
      if (name.substring(0, 2) === 'on')
        value = new Function(value) // eslint-disable-line no-new-func
      if (name === 'class') name = 'className'

      return {
        ...current,
        [camelCase(name)]: value
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
  components: React.PropTypes.arrayOf(
    React.PropTypes.oneOf([
      React.PropTypes.instanceOf(React.Component),
      React.PropTypes.instanceOf(React.PureComponent),
    ])
  ),
  jsx: React.PropTypes.string,
}
JsxParser.defaultProps = {
  components: [],
  jsx: '',
}
