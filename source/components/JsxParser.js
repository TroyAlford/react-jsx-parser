import { Parser } from 'acorn-jsx'
import React, { Component } from 'react'
import parseStyle from '../helpers/parseStyle'

import ATTRIBUTES from '../constants/attributeNames'
import { canHaveChildren, canHaveWhitespace } from '../constants/specialTags'

const parserOptions = { plugins: { jsx: true } }

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
      parsed = (new Parser(parserOptions, wrappedJsx)).parse()
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
    const value = expression.value

    switch (expression.type) {
      case 'JSXElement':
        return this.parseElement(expression, key)
      case 'JSXText':
        return (value || '').replace(/\s+/g, ' ')
      case 'JSXAttribute':
        if (expression.value === null) return true
        return this.parseExpression(expression.value)

      case 'ArrayExpression':
        return expression.elements.map(this.parseExpression)
      case 'ObjectExpression':
        const object = {}
        expression.properties.forEach((prop) => {
          object[prop.key.name] = this.parseExpression(prop.value)
        })
        return object
      case 'JSXExpressionContainer':
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

      if (parsedChildren.length === 0) parsedChildren = undefined
    }

    const attrs = { key, ...bindings }
    attributes.forEach((expr) => {
      const rawName = expr.name.name
      const attributeName = ATTRIBUTES[rawName] || rawName
      // if the value is null, this is an implicitly "true" prop, such as readOnly
      const value = this.parseExpression(expr)

      const matches = this.blacklistedAttrs.filter(re => re.test(attributeName))
      if (matches.length === 0) attrs[attributeName] = value
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
