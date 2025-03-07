import * as Acorn from 'acorn'
import * as AcornJSX from 'acorn-jsx'
import React, { Fragment } from 'react'
import ATTRIBUTES from '../constants/attributeNames'
import { canHaveChildren, canHaveWhitespace } from '../constants/specialTags'
import { NullishShortCircuit } from '../errors/NullishShortCircuit'
import { randomHash } from '../helpers/hash'
import { parseStyle } from '../helpers/parseStyle'
import { resolvePath } from '../helpers/resolvePath'

function handleNaN<T>(child: T): T | 'NaN' {
	return Number.isNaN(child) ? 'NaN' : child
}

type ParsedJSX = React.ReactNode | boolean | string
type ParsedTree = ParsedJSX | ParsedJSX[] | null

/**
 * Props for the JsxParser component
 */
export type TProps = {
	/** Whether to allow rendering of unrecognized HTML elements. Defaults to true. */
	allowUnknownElements?: boolean,

	/**
	 * Whether to auto-close void elements like <img>, <br>, <hr> etc. in HTML style.
	 * Defaults to false.
	 */
	autoCloseVoidElements?: boolean,

	/** Object containing values that can be referenced in the JSX string */
	bindings?: { [key: string]: unknown; },

	/**
	 * Array of attribute names or RegExp patterns to blacklist.
	 * By default removes 'on*' attributes
	 */
	blacklistedAttrs?: Array<string | RegExp>,

	/**
	 * Array of HTML tag names to blacklist.
	 * By default removes 'script' tags
	 */
	blacklistedTags?: string[],

	/** CSS class name(s) to add to the wrapper div */
	className?: string,

	/** Map of component names to their React component definitions */
	components?: Record<
		string,
		| React.ComponentType // allows for class components
		| React.ExoticComponent // allows for forwardRef
		| (() => React.ReactNode) // allows for function components
	>,

	/** If true, only renders custom components defined in the components prop */
	componentsOnly?: boolean,

	/** If true, disables usage of React.Fragment. May affect whitespace handling */
	disableFragments?: boolean,

	/** If true, disables automatic generation of key props */
	disableKeyGeneration?: boolean,

	/** The JSX string to parse and render */
	jsx?: string,

	/** Callback function when parsing/rendering errors occur */
	onError?: (error: Error) => void,

	/** If true, shows parsing/rendering warnings in console */
	showWarnings?: boolean,

	/** Custom error renderer function */
	renderError?: (props: { error: string }) => React.ReactNode | null,

	/** Whether to wrap output in a div. If false, renders children directly */
	renderInWrapper?: boolean,

	/** Custom renderer for unrecognized elements */
	renderUnrecognized?: (tagName: string) => React.ReactNode | null,
}

type Scope = Record<string, any>

export default class JsxParser extends React.Component<TProps> {
	static displayName = 'JsxParser'
	static defaultProps: TProps = {
		allowUnknownElements: true,
		autoCloseVoidElements: false,
		bindings: {},
		blacklistedAttrs: [/^on.+/i],
		blacklistedTags: ['script'],
		className: '',
		components: {},
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

	/** Stores the parsed React elements */
	private ParsedChildren: ParsedTree = null

	/**
	 * Parses a JSX string into React elements
	 * @param jsx - The JSX string to parse
	 * @returns The parsed React node(s) or null if parsing fails
	 */
	#parseJSX = (jsx: string): React.ReactNode | React.ReactNode[] | null => {
		const parser = Acorn.Parser.extend(AcornJSX.default({
			autoCloseVoidElements: this.props.autoCloseVoidElements,
		}))
		const wrappedJsx = `<root>${jsx}</root>`
		let parsed: AcornJSX.Expression[] = []
		try {
			// @ts-ignore - AcornJsx doesn't have typescript typings
			parsed = parser.parse(wrappedJsx, { ecmaVersion: 'latest' })
			// @ts-ignore - AcornJsx doesn't have typescript typings
			parsed = parsed.body[0].expression.children || []
		} catch (error) {
			if (this.props.showWarnings) console.warn(error) // eslint-disable-line no-console
			if (this.props.onError) this.props.onError(error as Error)
			if (this.props.renderError) {
				return this.props.renderError({ error: String(error) })
			}
			return null
		}

		return parsed.map(p => this.#parseExpression(p)).filter(Boolean)
	}

	/**
	 * Parses a single JSX expression into its corresponding value/element
	 * @param expression - The JSX expression to parse
	 * @param scope - Optional scope for variable resolution
	 * @returns The parsed value/element
	 */
	#parseExpression = (expression: AcornJSX.Expression, scope?: Scope): any => {
		switch (expression.type) {
			case 'JSXAttribute':
				if (expression.value === null) return true
				return this.#parseExpression(expression.value, scope)
			case 'JSXElement':
			case 'JSXFragment':
				return this.#parseElement(expression, scope)
			case 'JSXExpressionContainer':
				return this.#parseExpression(expression.expression, scope)
			case 'JSXText':
				const key = this.props.disableKeyGeneration ? undefined : randomHash()
				return this.props.disableFragments
					? expression.value
					: <Fragment key={key}>{expression.value}</Fragment>
			case 'ArrayExpression':
				return expression.elements.map(ele => this.#parseExpression(ele, scope)) as ParsedTree
			case 'BinaryExpression':
				const binaryLeft = this.#parseExpression(expression.left, scope)
				const binaryRight = this.#parseExpression(expression.right, scope)
				let binaryResult
				switch (expression.operator) {
					case '-': binaryResult = binaryLeft - binaryRight; break
					case '!=': binaryResult = binaryLeft != binaryRight; break // eslint-disable-line eqeqeq
					case '!==': binaryResult = binaryLeft !== binaryRight; break
					case '*': binaryResult = binaryLeft * binaryRight; break
					case '**': binaryResult = binaryLeft ** binaryRight; break
					case '/': binaryResult = binaryLeft / binaryRight; break
					case '%': binaryResult = binaryLeft % binaryRight; break
					case '+': binaryResult = binaryLeft + binaryRight; break
					case '<': binaryResult = binaryLeft < binaryRight; break
					case '<=': binaryResult = binaryLeft <= binaryRight; break
					case '==': binaryResult = binaryLeft == binaryRight; break // eslint-disable-line eqeqeq
					case '===': binaryResult = binaryLeft === binaryRight; break
					case '>': binaryResult = binaryLeft > binaryRight; break
					case '>=': binaryResult = binaryLeft >= binaryRight; break
					default:
						this.props.onError!(new Error(`Unsupported binary operator: ${expression.operator}`))
						return undefined
				}
				return handleNaN(binaryResult)
			case 'CallExpression':
				const parsedCallee = this.#parseExpression(expression.callee, scope)
				if (parsedCallee === undefined) {
					if (expression.optional) {
						throw new NullishShortCircuit()
					}
					this.props.onError!(new Error(`The expression '${expression.callee}' could not be resolved, resulting in an undefined return value.`))
					return undefined
				}
				return parsedCallee(...expression.arguments.map(
					arg => this.#parseExpression(arg, scope),
				))
			case 'ConditionalExpression':
				return this.#parseExpression(expression.test, scope)
					? this.#parseExpression(expression.consequent, scope)
					: this.#parseExpression(expression.alternate, scope)
			case 'ExpressionStatement':
				return this.#parseExpression(expression.expression, scope)
			case 'Identifier':
				if (expression.name === 'Infinity') return Infinity
				if (expression.name === '-Infinity') return -Infinity
				if (expression.name === 'NaN') return NaN
				if (scope && expression.name in scope) {
					return handleNaN(scope[expression.name])
				}
				return handleNaN((this.props.bindings || {})[expression.name])
			case 'Literal':
				return expression.value
			case 'LogicalExpression':
				const left = this.#parseExpression(expression.left, scope)
				if (expression.operator === '||' && left) return left
				if ((expression.operator === '&&' && left) || (expression.operator === '||' && !left)) {
					return this.#parseExpression(expression.right, scope)
				}
				return false
			case 'MemberExpression':
				return this.#parseMemberExpression(expression, scope)
			case 'ChainExpression':
				return this.#parseChainExpression(expression, scope)
			case 'ObjectExpression':
				const object: Record<string, any> = {}
				expression.properties.forEach(prop => {
					object[prop.key.name! || prop.key.value!] = this.#parseExpression(prop.value, scope)
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
					.map(item => this.#parseExpression(item, scope))
					.join('')
			case 'UnaryExpression':
				const unaryValue = this.#parseExpression(
					expression.argument as AcornJSX.Expression,
					scope,
				)
				switch (expression.operator) {
					case '+': return +unaryValue
					case '-': return -unaryValue
					case '!': return !unaryValue
				}
				return undefined
			case 'ArrowFunctionExpression':
				if (expression.async || expression.generator) {
					this.props.onError?.(new Error('Async and generator arrow functions are not supported.'))
				}
				return (...args: any[]): any => {
					const functionScope: Record<string, any> = { ...scope }
					expression.params.forEach((param, idx) => {
						functionScope[param.name] = args[idx]
					})
					return this.#parseExpression(expression.body, functionScope)
				}
			default:
				this.props.onError!(new Error(`The expression type '${expression.type}' is not supported.`))
				return undefined
		}
	}

	/**
	 * Parses a chain expression (optional chaining)
	 * @param expression - The chain expression to parse
	 * @param scope - Optional scope for variable resolution
	 * @returns The parsed value
	 */
	#parseChainExpression = (expression: AcornJSX.ChainExpression, scope?: Scope): any => {
		try {
			return this.#parseExpression(expression.expression, scope)
		} catch (error) {
			if (error instanceof NullishShortCircuit) return undefined
			throw error
		}
	}

	/**
	 * Parses a member expression (e.g., obj.prop or obj['prop'])
	 * @param expression - The member expression to parse
	 * @param scope - Optional scope for variable resolution
	 * @returns The resolved member value
	 */
	#parseMemberExpression = (expression: AcornJSX.MemberExpression, scope?: Scope): any => {
		const object = this.#parseExpression(expression.object, scope)

		let property

		if (expression.computed) {
			property = this.#parseExpression(expression.property, scope)
		} else if (expression.property.type === 'Identifier') {
			property = expression.property.name
		} else {
			this.props.onError!(new Error('Only simple MemberExpressions are supported.'))
			return undefined
		}

		if (object === null || object === undefined) {
			if (expression.optional) throw new NullishShortCircuit()
		}

		let member
		try {
			member = object[property]
		} catch {
			this.props.onError!(new Error(`The property '${property}' could not be resolved on the object '${object}'.`))
			return undefined
		}
		if (typeof member === 'function') return member.bind(object)
		return member
	}

	/**
	 * Parses a JSX element name (simple or member expression)
	 * @param element - The JSX identifier or member expression
	 * @returns The parsed element name as a string
	 */
	#parseName = (element: AcornJSX.JSXIdentifier | AcornJSX.JSXMemberExpression): string => {
		if (element.type === 'JSXIdentifier') { return element.name }
		return `${this.#parseName(element.object)}.${this.#parseName(element.property)}`
	}

	/**
	 * Parses a JSX element into React elements
	 * @param element - The JSX element to parse
	 * @param scope - Optional scope for variable resolution
	 * @returns The parsed React node(s) or null
	 */
	#parseElement = (
		element: AcornJSX.JSXElement | AcornJSX.JSXFragment,
		scope?: Scope,
	): React.ReactNode | React.ReactNode[] | null => {
		const { allowUnknownElements, components, componentsOnly, onError } = this.props
		const { children: childNodes = [] } = element
		const openingTag = element.type === 'JSXElement'
			? element.openingElement
			: element.openingFragment
		const { attributes = [] } = openingTag
		const name = element.type === 'JSXElement'
			? this.#parseName(openingTag.name)
			: ''

		const blacklistedAttrs = (this.props.blacklistedAttrs || [])
			.map(attr => (attr instanceof RegExp ? attr : new RegExp(attr, 'i')))
		const blacklistedTags = (this.props.blacklistedTags || [])
			.map(tag => tag.trim().toLowerCase()).filter(Boolean)

		if (/^(html|head|body)$/i.test(name)) {
			return childNodes.map(c => this.#parseElement(c, scope)) as React.ReactNode[]
		}
		const tagName = name.trim().toLowerCase()
		if (blacklistedTags.indexOf(tagName) !== -1) {
			onError!(new Error(`The tag <${name}> is blacklisted, and will not be rendered.`))
			return null
		}

		if (name !== '' && !resolvePath(components, name)) {
			if (componentsOnly) {
				onError!(new Error(`The component <${name}> is unrecognized, and will not be rendered.`))
				return this.props.renderUnrecognized!(name)
			}

			if (!allowUnknownElements && document.createElement(name) instanceof HTMLUnknownElement) {
				onError!(new Error(`The tag <${name}> is unrecognized in this browser, and will not be rendered.`))
				return this.props.renderUnrecognized!(name)
			}
		}

		let children
		let component = element.type === 'JSXElement'
			? resolvePath(components, name)
			: Fragment

		if (component || canHaveChildren(name)) {
			children = childNodes.map(node => this.#parseExpression(node, scope))
			if (name.includes('.')) {
				const nameParts = name.split('.')
				const componentPath = nameParts
					.reduce((acc: any, part) => (acc ? acc[part] : components?.[part]), null)
				if (componentPath) {
					component = componentPath
				}
			}
			if (!component && !canHaveWhitespace(name)) {
				children = children.filter(child => (
					typeof child !== 'string' || !/^\s*$/.test(child)
				))
			}

			const childFn = children.find(child => typeof child === 'function')
			if (children.length === 0) {
				children = undefined
			} else if (childFn) {
				children = childFn
			} else if (children.length === 1) {
				[children] = children
			} else if (children.length > 1 && !this.props.disableKeyGeneration) {
				// Add `key` to any child that is a react element (by checking if it has `.type`) if one
				// does not already exist.
				children = children.map((child, key) => (
					(child?.type && !child?.key) ? { ...child, key: child.key || key } : child
				))
			}
		}

		const props: { [key: string]: any } = {
			key: this.props.disableKeyGeneration ? undefined : randomHash(),
		}
		attributes.forEach( // eslint-disable-next-line max-len
			(expr: AcornJSX.JSXAttribute | AcornJSX.JSXAttributeExpression | AcornJSX.JSXSpreadAttribute) => {
				if (expr.type === 'JSXAttribute') {
					const rawName = expr.name.name
					const attributeName = ATTRIBUTES[rawName] || rawName
					// if the value is null, this is an implicitly "true" prop, such as readOnly
					const value = this.#parseExpression(expr, scope)

					const matches = blacklistedAttrs.filter(re => re.test(attributeName))
					if (matches.length === 0) {
						props[attributeName] = value
					}
				} else if (
					(expr.type === 'JSXSpreadAttribute' && expr.argument.type === 'Identifier')
					|| expr.argument!.type === 'MemberExpression'
				) {
					const value = this.#parseExpression(expr.argument!, scope)
					if (typeof value === 'object') {
						Object.keys(value).forEach(rawName => {
							const attributeName: string = ATTRIBUTES[rawName] || rawName
							const matches = blacklistedAttrs.filter(re => re.test(attributeName))
							if (matches.length === 0) {
								props[attributeName] = value[rawName]
							}
						})
					}
				}
			},
		)

		if (typeof props.style === 'string') {
			props.style = parseStyle(props.style)
		}
		const lowerName = name.toLowerCase()
		if (lowerName === 'option') {
			children = children.props.children
		}

		return React.createElement(component || lowerName, props, children)
	}

	/**
	 * Renders the parsed JSX content
	 * @returns The rendered React elements wrapped in a div (if renderInWrapper is true)
	 */
	render() {
		const jsx = (this.props.jsx || '').trim().replace(/<!DOCTYPE([^>]*)>/g, '')
		this.ParsedChildren = this.#parseJSX(jsx)
		const className = [...new Set(['jsx-parser', ...String(this.props.className).split(' ')])]
			.filter(Boolean)
			.join(' ')

		return (
			this.props.renderInWrapper
				? <div className={className}>{this.ParsedChildren}</div>
				: this.ParsedChildren
		)
	}
}
/* eslint-enable consistent-return */
