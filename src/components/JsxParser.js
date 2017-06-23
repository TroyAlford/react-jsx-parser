import React from 'react'
import camelCase from '../helpers/camelCase'
import parseStyle from '../helpers/parseStyle'

import ATTRIBUTES from '../constants/attributeNames'
import NODE_TYPES from '../constants/nodeTypes'
import { canHaveChildren, canHaveWhitespace } from '../constants/specialTags'

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
    , rawJSX).trim()

    const wrappedJsx = `<!DOCTYPE html>\n<html><body>${jsx}</body></html>`

    const doc = parser.parseFromString(wrappedJsx, 'application/xhtml+xml')

    if (!doc) return []

    Array.from(doc.getElementsByTagName('REMOVE')).forEach(tag =>
      tag.parentNode.removeChild(tag)
    )

    const body = doc.getElementsByTagName('body')[0]
    if (!body || body.nodeName.toLowerCase() === 'parseerror') {
      if (this.props.showWarnings) warnParseErrors(doc)
      return []
    }

    const components = this.props.components.reduce(
      (map, type) => ({
        ...map,
        [type.prototype.constructor.name]: type,
      })
    , {})

    return this.parseNode(body.childNodes || [], components)
  }
  parseNode(node, components = {}, key) {
    if (node instanceof NodeList || Array.isArray(node)) {
      return Array.from(node) // handle nodeList or []
        .map((child, index) => this.parseNode(child, components, index))
        .filter(child => child) // remove falsy nodes
    }

    if (node.nodeType === NODE_TYPES.TEXT) {
      // Text node. Collapse whitespace and return it as a String.
      return ('textContent' in node ? node.textContent : node.nodeValue || '')
        .replace(/[\r\n\t\f\v]/g, '')
        .replace(/\s{2,}/g, ' ')
    } else if (node.nodeType === NODE_TYPES.ELEMENT) {
      // Element node. Parse its Attributes and Children, then call createElement
      let children
      if (canHaveChildren(node.nodeName)) {
        children = this.parseNode(node.childNodes, components)
        if (!canHaveWhitespace(node.nodeName)) {
          children = children.filter(child =>
            typeof child !== 'string' || !child.match(/^\s*$/)
          )
        }
      }

      const component = components[node.nodeName] || node.nodeName

      return React.createElement(
        component,
        {
          ...this.props.bindings || {},
          ...this.parseAttrs(node.attributes, key),
        },
        children,
      )
    }

    if (this.props.showWarnings) {
      // eslint-disable-next-line no-console
      console.warn(`JsxParser encountered a(n) ${NODE_TYPES[node.nodeType]} node, and discarded it.`)
    }
    return null
  }

  parseAttrs(attrs, key) {
    if (!attrs || !attrs.length) return { key }

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

      if (name.match(/^on/i)) {
        value = new Function(value) // eslint-disable-line no-new-func
      } else if (name === 'style') {
        value = parseStyle(value)
      }

      name = ATTRIBUTES[name.toLowerCase()] || camelCase(name)

      return {
        ...current,
        [name]: value,
      }
    }, { key })
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
            component.prototype instanceof React.PureComponent ||
            typeof component === 'function'
        )) {
        passes = false
      }
    })

    return passes ? null : new Error(
      `${propName} must contain only Subclasses of React.Component or React.PureComponent.`
    )
  },
  jsx: React.PropTypes.string,

  showWarnings: React.PropTypes.bool,
}
JsxParser.defaultProps = {
  bindings:         {},
  blacklistedAttrs: ['on[a-z]*'],
  blacklistedTags:  ['script'],
  components:       [],
  jsx:              '',
  showWarnings:     false,
}
