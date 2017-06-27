import { parse } from 'acorn-jsx'
import React, { Component } from 'react'
// import camelCase from '../helpers/camelCase'
import parseStyle from '../helpers/parseStyle'
// import hasDoctype from '../helpers/hasDoctype'

import ATTRIBUTES from '../constants/attributeNames'
// import NODE_TYPES from '../constants/nodeTypes'
import { canHaveChildren, canHaveWhitespace } from '../constants/specialTags'

export default class JsxParser extends Component {
  constructor(props) {
    super(props)
    this.parseElement = this.parseElement.bind(this)
    this.parseExpression = this.parseExpression.bind(this)
    this.parseJSX = this.parseJSX.bind(this)
    this.handleNewProps = this.handleNewProps.bind(this)

    this.handleNewProps(props)
  }

  componentWillReceiveProps(props) {
    this.handleNewProps(props)
  }

  handleNewProps(props) {
    this.blacklistedTags = (props.blacklistedTags || [])
      .map(tag => tag.trim().toLowerCase()).filter(Boolean)
    this.blacklistedAttrs = (props.blacklistedAttrs || [])
      .map(attr => (attr instanceof RegExp ? attr : new RegExp(attr, 'i')))

    const jsx = (props.jsx || '').trim().replace(/<!DOCTYPE([^>]*)>/g, '')
    this.ParsedChildren = this.parseJSX(jsx)
  }

  parseJSX(rawJSX) {
    const wrappedJsx = `<root>${rawJSX}</root>`
    let parsed = []
    try {
      parsed = parse(wrappedJsx, { plugins: { jsx: true } })
      parsed = parsed.body[0].expression.children || []
    } catch (error) {
      // eslint-disable-next-line no-console
      if (this.props.showWarnings) console.warn(error)
      return []
    }

    return parsed.map(this.parseExpression).filter(Boolean)
  }

  parseExpression(expression, key) {
    /* eslint-disable no-case-declarations */
    const name = expression.name && expression.name.name
    const value = expression.value

    switch (expression.type) {
      case 'JSXElement':
        return this.parseElement(expression, key)
      case 'JSXText':
        return (value || '').replace(/\s+/g, ' ')
      case 'JSXAttribute':
        return {
          name:  ATTRIBUTES[name] || name,
          value: this.parseExpression(value),
        }

      case 'ArrayExpression':
        return expression.elements.map(this.parseExpression)
      case 'ObjectExpression':
        const object = {}
        expression.properties.forEach((prop) => {
          object[prop.key.name] = this.parseExpression(prop.value)
        })
        return object
      case 'JsxExpressionContainer':
        return this.parseExpression(expression.expression)
      case 'Literal':
        return value

      default:
        return undefined
    }
  }

  parseElement(element, key) {
    const { bindings = {}, components = {} } = this.props
    const { children = [], openingElement: { attributes, name: { name } } } = element

    if (/^(html|head|body)$/i.test(name)) return children.map(c => this.parseElement(c))

    if (this.blacklistedTags.indexOf(name.trim().toLowerCase()) !== -1) return undefined
    let parsedChildren
    if (canHaveChildren(name)) {
      parsedChildren = children.map(this.parseExpression)
      if (!canHaveWhitespace(name)) {
        parsedChildren = parsedChildren.filter(child =>
          typeof child !== 'string' || !/^\s*$/.test(child)
        )
      }
    }

    const attrs = { key, ...bindings }
    attributes.forEach((expr) => {
      const attr = this.parseExpression(expr)
      const matches = this.blacklistedAttrs.filter(re => re.test(attr.name))
      if (matches.length === 0) attrs[attr.name] = attr.value
    })

    if (typeof attrs.style === 'string') {
      attrs.style = parseStyle(attrs.style)
    }

    return React.createElement(components[name] || name, attrs, parsedChildren)
  }

  render() {
    return (
      <div className="jsx-parser">
        {this.ParsedChildren}
      </div>
    )
  }
}

JsxParser.defaultProps = {
  bindings:         {},
  blacklistedAttrs: [/^on.+/i],
  blacklistedTags:  ['script'],
  components:       [],
  jsx:              '',
  showWarnings:     false,
}

if (process.env.NODE_ENV !== 'production') {
  /* eslint-disable react/no-unused-prop-types*/
  // eslint-disable-next-line global-require,import/no-extraneous-dependencies
  const PropTypes = require('prop-types')
  JsxParser.propTypes = {
    bindings:         PropTypes.shape({}),
    blacklistedAttrs: PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(RegExp),
    ])),
    blacklistedTags: PropTypes.arrayOf(PropTypes.string),
    components:      PropTypes.shape({}),
    jsx:             PropTypes.string,

    showWarnings: PropTypes.bool,
  }
}
