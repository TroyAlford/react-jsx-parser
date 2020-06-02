import * as Acorn from 'acorn'
import acornJsx from 'acorn-jsx'
import React, { Component, Fragment } from 'react'
import ATTRIBUTES from '../constants/attributeNames'
import { canHaveChildren, canHaveWhitespace } from '../constants/specialTags'
import { randomHash } from '../helpers/hash'
import { parseStyle } from '../helpers/parseStyle'
import { resolvePath } from '../helpers/resolvePath'
import type {
  Expression,
  JSXAttribute,
  JSXAttributeExpression,
  JSXElement,
  JSXIdentifier,
  JSXMemberExpression,
  JSXSpreadAttribute,
  MemberExpression,
} from '../types/acorn-jsx'

const parser = Acorn.Parser.extend(acornJsx())

type BlacklistedAttr = string | RegExp
type Props = {
  allowUnknownElements?: boolean,
  bindings?: { [key: string]: any },
  blacklistedAttrs?: BlacklistedAttr[],
  blacklistedTags?: string[],
  className?: string,
  components?: React.JSXElementConstructor<any>[],
  componentsOnly?: boolean,
  disableFragments?: boolean,
  disableKeyGeneration?: boolean,
  jsx?: string,
  onError?: (error: Error) => void,
  showWarnings?: boolean,
  renderError?: ({ error: string }) => JSX.Element,
  renderInWrapper?: boolean,
  renderUnrecognized?: (tagName: string) => JSX.Element,
}

export type ParsedJSX = JSX.Element | boolean | string
export type ParsedTree = ParsedJSX | ParsedJSX[]

/* eslint-disable consistent-return */
export default class JsxParser extends Component<Props> {
  static displayName = 'JsxParser'

  static defaultProps = {
    allowUnknownElements: true,
    bindings: {},
    blacklistedAttrs: [/^on.+/i],
    blacklistedTags: ['script'],
    className: '',
    components: [],
    componentsOnly: false,
    disableFragments: false,
    disableKeyGeneration: false,
    jsx: '',
    onError: () => { },
    showWarnings: false,
    renderError: undefined,
    renderInWrapper: true,
    renderUnrecognized: () => null,
  }

  ParsedChildren: ParsedTree = null

  parseJSX = (jsx: string): JSX.Element | JSX.Element[] => {
    const wrappedJsx = `<root>${jsx}</root>`
    let parsed: Expression[] = []
    try {
      // @ts-ignore - AcornJsx doesn't have typescript typings
      parsed = parser.parse(wrappedJsx)
      // @ts-ignore - AcornJsx doesn't have typescript typings
      parsed = parsed.body[0].expression.children || []
    } catch (error) {
      // eslint-disable-next-line no-console
      if (this.props.showWarnings) console.warn(error)
      if (this.props.onError) this.props.onError(error)
      if (this.props.renderError) {
        return this.props.renderError({ error: String(error) })
      }
      return []
    }

    return parsed.map(this.parseExpression).filter(Boolean)
  }

  parseExpression = (expression: Expression): any => {
    switch (expression.type) {
      case 'JSXAttribute':
        if (expression.value === null) return true
        return this.parseExpression(expression.value)
      case 'JSXElement':
        return this.parseElement(expression)
      case 'JSXExpressionContainer':
        return this.parseExpression(expression.expression)
      case 'JSXText':
        const key = this.props.disableKeyGeneration ? undefined : randomHash()
        return this.props.disableFragments
          ? expression.value
          : <Fragment key={key}>{expression.value}</Fragment>
      case 'ArrayExpression':
        return expression.elements.map(this.parseExpression) as ParsedTree
      case 'BinaryExpression':
        /* eslint-disable eqeqeq,max-len */
        switch (expression.operator) {
          case '-': return this.parseExpression(expression.left) - this.parseExpression(expression.right)
          case '!=': return this.parseExpression(expression.left) != this.parseExpression(expression.right)
          case '!==': return this.parseExpression(expression.left) !== this.parseExpression(expression.right)
          case '*': return this.parseExpression(expression.left) * this.parseExpression(expression.right)
          case '**': return this.parseExpression(expression.left) ** this.parseExpression(expression.right)
          case '/': return this.parseExpression(expression.left) / this.parseExpression(expression.right)
          case '%': return this.parseExpression(expression.left) % this.parseExpression(expression.right)
          case '+': return this.parseExpression(expression.left) + this.parseExpression(expression.right)
          case '<': return this.parseExpression(expression.left) < this.parseExpression(expression.right)
          case '<=': return this.parseExpression(expression.left) <= this.parseExpression(expression.right)
          case '==': return this.parseExpression(expression.left) == this.parseExpression(expression.right)
          case '===': return this.parseExpression(expression.left) === this.parseExpression(expression.right)
          case '>': return this.parseExpression(expression.left) > this.parseExpression(expression.right)
          case '>=': return this.parseExpression(expression.left) >= this.parseExpression(expression.right)
        /* eslint-enable eqeqeq,max-len */
        }
        return undefined
      case 'CallExpression':
        const parsedCallee = this.parseExpression(expression.callee)
        if (parsedCallee === undefined) {
          this.props.onError(new Error(`The expression '${expression.callee}' could not be resolved, resulting in an undefined return value.`))
          return undefined
        }
        return parsedCallee(...expression.arguments.map(this.parseExpression))
      case 'ConditionalExpression':
        return this.parseExpression(expression.test)
          ? this.parseExpression(expression.consequent)
          : this.parseExpression(expression.alternate)
      case 'ExpressionStatement':
        return this.parseExpression(expression.expression)
      case 'Identifier':
        return (this.props.bindings || {})[expression.name]
      case 'Literal':
        return expression.value
      case 'LogicalExpression':
        const left = this.parseExpression(expression.left)
        if (expression.operator === '||' && left) return left
        if ((expression.operator === '&&' && left) || (expression.operator === '||' && !left)) {
          return this.parseExpression(expression.right)
        }
        return false
      case 'MemberExpression':
        return this.parseMemberExpression(expression)
      case 'ObjectExpression':
        const object = {}
        expression.properties.forEach(prop => {
          object[prop.key.name || prop.key.value] = this.parseExpression(prop.value)
        })
        return object
      case 'TemplateElement':
        return expression.value.cooked
      case 'TemplateLiteral':
        return [...expression.expressions, ...expression.quasis]
          .sort((a, b) => {
            if (a.start < b.start) return -1
            return 1
          })
          .map(this.parseExpression)
          .join('')
      case 'UnaryExpression':
        switch (expression.operator) {
          case '+': return expression.argument.value
          case '-': return -expression.argument.value
          case '!': return !expression.argument.value
        }
        return undefined
    }
  }

  parseMemberExpression = (expression: MemberExpression): any => {
    // eslint-disable-next-line prefer-destructuring
    let { object } = expression
    const path = [expression.property?.name ?? JSON.parse(expression.property?.raw ?? '""')]

    if (expression.object.type !== 'Literal') {
      while (object && ['MemberExpression', 'Literal'].includes(object?.type)) {
        const { property } = (object as MemberExpression)
        if ((object as MemberExpression).computed) {
          path.unshift(this.parseExpression(property))
        } else {
          path.unshift(property?.name ?? JSON.parse(property?.raw ?? '""'))
        }

        object = (object as MemberExpression).object
      }
    }

    const target = this.parseExpression(object)
    try {
      let parent = target
      const member = path.reduce((value, next) => {
        parent = value
        return value[next]
      }, target)
      if (typeof member === 'function') return member.bind(parent)

      return member
    } catch {
      const name = (object as MemberExpression)?.name || 'unknown'
      this.props.onError(new Error(`Unable to parse ${name}["${path.join('"]["')}"]}`))
    }
  }

  parseName = (element: JSXIdentifier | JSXMemberExpression): string => {
    switch (element.type) {
      case 'JSXIdentifier':
        return element.name
      case 'JSXMemberExpression':
        return `${this.parseName(element.object)}.${this.parseName(element.property)}`
    }
  }

  parseElement = (element: JSXElement): JSX.Element | JSX.Element[] => {
    const { allowUnknownElements, components = {}, componentsOnly, onError } = this.props
    const { children: childNodes = [], openingElement } = element
    const { attributes = [] } = openingElement
    const name = this.parseName(openingElement.name)

    const blacklistedAttrs = (this.props.blacklistedAttrs || [])
      .map(attr => (attr instanceof RegExp ? attr : new RegExp(attr, 'i')))
    const blacklistedTags = (this.props.blacklistedTags || [])
      .map(tag => tag.trim().toLowerCase()).filter(Boolean)

    if (/^(html|head|body)$/i.test(name)) {
      return childNodes.map(c => this.parseElement(c)) as JSX.Element[]
    }
    const tagName = name.trim().toLowerCase()
    if (blacklistedTags.indexOf(tagName) !== -1) {
      onError(new Error(`The tag <${name}> is blacklisted, and will not be rendered.`))
      return undefined
    }

    if (!resolvePath(components, name)) {
      if (componentsOnly) {
        onError(new Error(`The component <${name}> is unrecognized, and will not be rendered.`))
        return this.props.renderUnrecognized(name)
      }

      if (!allowUnknownElements && document.createElement(name) instanceof HTMLUnknownElement) {
        onError(new Error(`The tag <${name}> is unrecognized in this browser, and will not be rendered.`))
        return this.props.renderUnrecognized(name)
      }
    }

    let children
    const component = resolvePath(components, name)
    if (component || canHaveChildren(name)) {
      children = childNodes.map(this.parseExpression)
      if (!component && !canHaveWhitespace(name)) {
        children = children.filter(child => (
          typeof child !== 'string' || !/^\s*$/.test(child)
        ))
      }

      if (children.length === 0) {
        children = undefined
      } else if (children.length === 1) {
        [children] = children
      } else if (children.length > 1) {
        // Add `key` to any child that is a react element (by checking if it has `.type`)
        children = children.map((child, key) => ((child && child.type) ? { ...child, key } : child))
      }
    }

    const props: { [key: string]: any } = {
      key: this.props.disableKeyGeneration ? undefined : randomHash(),
    }
    attributes.forEach((expr: JSXAttribute | JSXAttributeExpression | JSXSpreadAttribute) => {
      if (expr.type === 'JSXAttribute') {
        const rawName = expr.name.name
        const attributeName = ATTRIBUTES[rawName] || rawName
        // if the value is null, this is an implicitly "true" prop, such as readOnly
        const value = this.parseExpression(expr)

        const matches = blacklistedAttrs.filter(re => re.test(attributeName))
        if (matches.length === 0) {
          props[attributeName] = value
        }
      } else if (
        (expr.type === 'JSXSpreadAttribute' && expr.argument.type === 'Identifier')
        || expr.argument.type === 'MemberExpression'
      ) {
        const value = this.parseExpression(expr.argument)
        if (typeof value === 'object') {
          Object.keys(value).forEach(rawName => {
            const attributeName = ATTRIBUTES[rawName] || rawName
            const matches = blacklistedAttrs.filter(re => re.test(attributeName))
            if (matches.length === 0) {
              props[attributeName] = value[rawName]
            }
          })
        }
      }
    })

    if (typeof props.style === 'string') {
      props.style = parseStyle(props.style)
    }

    return React.createElement(component || name.toLowerCase(), props, children)
  }

  render = (): JSX.Element => {
    const jsx = (this.props.jsx || '').trim().replace(/<!DOCTYPE([^>]*)>/g, '')
    this.ParsedChildren = this.parseJSX(jsx)
    const className = [...new Set(['jsx-parser', ...String(this.props.className).split(' ')])]
      .filter(Boolean)
      .join(' ')

    return (
      this.props.renderInWrapper
        ? <div className={className}>{this.ParsedChildren}</div>
        : <>{this.ParsedChildren}</>
    )
  }
}
/* eslint-enable consistent-return */
