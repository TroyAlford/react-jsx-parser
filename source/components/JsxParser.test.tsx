// @ts-nocheck
/* eslint-disable function-paren-newline, no-console, no-underscore-dangle, no-useless-escape */
import { render } from 'basis/libraries/react/testing/render'
import React from 'react'
import JsxParser from './JsxParser'

function Custom({ children = [], className, text }) {
	return (
		<div className={className}>
			{text}
			{children}
		</div>
	)
}

describe('JsxParser Component', () => {
	let originalConsoleError = null

	beforeAll(() => {
		originalConsoleError = console.error
		console.error = jest.fn()
	})

	afterAll(() => {
		console.error = originalConsoleError
	})

	beforeEach(() => {
		console.error.mockReset()
	})

	describe('conditional operators', () => {
		const testCases = [
			// Equality (==)
			['1 == "1"', true],
			['1 == 1', true],
			['0 == false', true],
			['"" == false', true],
			['null == undefined', true],
			['NaN == NaN', false],

			// Strict Equality (===)
			['1 === 1', true],
			['1 === "1"', false],
			['null === undefined', false],
			['NaN === NaN', false],

			// Inequality (!=)
			['1 != 2', true],
			['1 != "1"', false],
			['null != undefined', false],
			['NaN != NaN', true],

			// Strict Inequality (!==)
			['1 !== "1"', true],
			['1 !== 1', false],
			['null !== undefined', true],
			['NaN !== NaN', true],

			// Greater Than (>)
			['2 > 1', true],
			['1 > 1', false],
			['Infinity > 1', true],
			['1 > -Infinity', true],
			['NaN > 1', false],
			['1 > NaN', false],

			// Greater Than or Equal (>=)
			['2 >= 2', true],
			['2 >= 1', true],
			['1 >= 2', false],
			['Infinity >= Infinity', true],
			['NaN >= NaN', false],

			// Less Than (<)
			['1 < 2', true],
			['1 < 1', false],
			['-Infinity < 1', true],
			['1 < Infinity', true],
			['NaN < 1', false],
			['1 < NaN', false],

			// Less Than or Equal (<=)
			['2 <= 2', true],
			['1 <= 2', true],
			['2 <= 1', false],
			['-Infinity <= -Infinity', true],
			['NaN <= NaN', false],
		]

		test.each(testCases)('should evaluate %s = %p correctly', (expression, expected) => {
			const { instance } = render(<JsxParser jsx={`<span data-foo={${expression}} />`} />)
			expect(instance.ParsedChildren[0].props['data-foo']).toEqual(expected)
		})
	})

	describe('mathematical operations', () => {
		const testCases = [
			['1 + 2', '3'],
			['2 - 1', '1'],
			['2 * 3', '6'],
			['6 / 2', '3'],
			['2 ** 4', '16'],
			['27 % 14', '13'],
			['Infinity + 1', 'Infinity'],
			['Infinity - Infinity', 'NaN'],
			['1 / 0', 'Infinity'],
			['0 / 0', 'NaN'],
		]

		test.each(testCases)('should evaluate %s correctly', (operation, expected) => {
			const { node } = render(<JsxParser jsx={`{${operation}}`} />)
			expect(node.innerHTML).toEqual(expected)
		})
	})

	describe('unary operations', () => {
		const testCases = [
			['+60', 60],
			['-60', -60],
			['!true', false],
			['!false', true],
			['!0', true],
			['!1', false],
			['!null', true],
			['!undefined', true],
			['!NaN', true],
			['!""', true],
			['!{}', false],
			['![]', false],
			['+true', 1],
			['+false', 0],
			['+null', 0],
			['+undefined', NaN],
			['+""', 0],
			['+"123"', 123],
			['+"-123"', -123],
		]

		test.each(testCases)(
			'should evaluate unary %s correctly',
			({ operation, expected }) => {
				const { instance } = render(<JsxParser jsx={`{${operation}}`} />)
				if (Number.isNaN(expected)) {
					expect(Number.isNaN(instance.ParsedChildren[0])).toBe(true)
				} else {
					expect(instance.ParsedChildren[0]).toEqual(expected)
				}
			},
		)
	})

	describe('ternary expressions', () => {
		const testCases = [
			// [expression, expected, bindings (optional), context ('prop' or 'content')]
			// Testing in props
			['false ? 1 : 0', 0, {}, 'prop'],
			['true ? 1 : 0', 1, {}, 'prop'],
			['foo === 1 ? "isOne" : "isNotOne"', 'isOne', { foo: 1 }, 'prop'],
			// Testing in content
			['{true ? 1 : 0}', '1', {}, 'content'],
			['{false ? 1 : 0}', '0', {}, 'content'],
			['{foo !== 1 ? "isNotOne" : "isOne"}', 'isOne', { foo: 1 }, 'content'],
			['{true && true ? "a" : "b"}', 'a', {}, 'content'],
			['{true && false ? "a" : "b"}', 'b', {}, 'content'],
			['{true || false ? "a" : "b"}', 'a', {}, 'content'],
			['{false || false ? "a" : "b"}', 'b', {}, 'content'],
		]

		test.each(testCases)(
			'should evaluate %s correctly in %s',
			(expression, expected, bindings, context) => {
				if (context === 'prop') {
					const { instance } = render(<JsxParser jsx={`<div data-test={${expression}} />`} bindings={bindings} />)
					expect(instance.ParsedChildren[0].props['data-test']).toEqual(expected)
				} else {
					const { node } = render(<JsxParser jsx={`<div>${expression}</div>`} bindings={bindings} />)
					expect(node.textContent.trim()).toEqual(expected)
				}
			},
		)
	})

	describe('logical OR expressions', () => {
		const testCases = [
			// [expression, expected, bindings (optional), context ('prop' or 'content')]
			['false || "fallback"', 'fallback', {}, 'prop'],
			['true || "fallback"', true, {}, 'prop'],
			['"good" || "fallback"', 'good', {}, 'content'],
			['"" || "fallback"', 'fallback', {}, 'content'],
			// Adjusted expressions for content context to return strings
			['foo === 1 ? "trueResult" : "fallback"', 'trueResult', { foo: 1 }, 'content'],
			['foo !== 1 ? "trueResult" : "fallback"', 'fallback', { foo: 1 }, 'content'],
		]

		test.each(testCases)(
			'should evaluate %s correctly in %s',
			(expression, expected, bindings, context) => {
				if (context === 'prop') {
					const { instance } = render(<JsxParser jsx={`<div data-test={${expression}} />`} bindings={bindings} />)
					expect(instance.ParsedChildren[0].props['data-test']).toEqual(expected)
				} else {
					const { node } = render(<JsxParser jsx={`<div>{${expression}}</div>`} bindings={bindings} />)
					expect(node.textContent.trim()).toEqual(String(expected))
				}
			},
		)
	})

	describe('logical AND expressions', () => {
		const testCases = [
			// [expression, expected, bindings (optional), context ('prop' or 'content')]
			['false && "result"', false, {}, 'prop'],
			['true && "result"', 'result', {}, 'prop'],
			['"good" && "result"', 'result', {}, 'content'],
			['"" && "result"', '', {}, 'content'],
			// Adjusted expressions for content context to return strings
			['foo === 1 ? "result" : ""', 'result', { foo: 1 }, 'content'],
			['foo !== 1 ? "result" : ""', '', { foo: 1 }, 'content'],
		]

		test.each(testCases)(
			'should evaluate %s correctly in %s',
			(expression, expected, bindings, context) => {
				if (context === 'prop') {
					const { instance } = render(<JsxParser jsx={`<div data-test={${expression}} />`} bindings={bindings} />)
					expect(instance.ParsedChildren[0].props['data-test']).toEqual(expected)
				} else {
					const { node } = render(<JsxParser jsx={`<div>{${expression}}</div>`} bindings={bindings} />)
					expect(node.textContent.trim()).toEqual(String(expected))
				}
			},
		)
	})

	// Rewritten 'basic rendering' suite
	describe('Basic Rendering', () => {
		test('renders standard HTML elements', () => {
			const { node } = render(
				<JsxParser
					jsx={
						'<h1>Header</h1>'
						+ '<div class="foo">Foo</div>'
						+ '<span class="bar">Bar</span>'
					}
				/>,
			)

			expect(node.childNodes).toHaveLength(3)

			expect(node.childNodes[0].nodeName).toEqual('H1')
			expect(node.childNodes[0].textContent).toEqual('Header')

			expect(node.childNodes[1].nodeName).toEqual('DIV')
			expect(node.childNodes[1].classList.contains('foo')).toBeTruthy()
			expect(node.childNodes[1].textContent).toEqual('Foo')

			expect(node.childNodes[2].nodeName).toEqual('SPAN')
			expect(node.childNodes[2].classList.contains('bar')).toBeTruthy()
			expect(node.childNodes[2].textContent).toEqual('Bar')
		})

		test('renders nested elements correctly', () => {
			const { node } = render(
				<JsxParser jsx="<div>Outer<div>Inner</div></div>" />,
			)

			expect(node.childNodes).toHaveLength(1)

			const outer = node.childNodes[0]
			expect(outer.nodeName).toEqual('DIV')
			expect(outer.childNodes).toHaveLength(2)

			const [text, innerDiv] = outer.childNodes
			expect(text.nodeType).toEqual(Node.TEXT_NODE)
			expect(text.textContent).toEqual('Outer')

			expect(innerDiv.nodeType).toEqual(Node.ELEMENT_NODE)
			expect(innerDiv.nodeName).toEqual('DIV')
			expect(innerDiv.textContent).toEqual('Inner')
		})

		test('renders custom components', () => {
			const { instance, node } = render(
				<JsxParser
					components={{ Custom }}
					jsx={
						'<h1>Header</h1>'
						+ '<Custom className="blah" text="Test Text" />'
					}
				/>,
			)

			expect(node.classList.contains('jsx-parser')).toBeTruthy()
			expect(node.childNodes).toHaveLength(2)

			expect(node.childNodes[0].nodeName).toEqual('H1')
			expect(node.childNodes[0].textContent).toEqual('Header')

			// Verify that the Custom component is rendered correctly
			const customElement = node.childNodes[1]
			expect(customElement.nodeName).toEqual('DIV')
			expect(customElement.className).toEqual('blah')
			expect(customElement.textContent).toEqual('Test Text')

			// Additionally, check the component props via instance
			const customInstance = instance.ParsedChildren[1]
			expect(customInstance.props.className).toEqual('blah')
			expect(customInstance.props.text).toEqual('Test Text')
		})

		test('renders custom components with spread attributes', () => {
			const first = {
				className: 'blah',
				text: 'Will Be Overwritten',
			}
			const second = {
				innerProps: {
					text: 'Test Text',
				},
			}
			const { instance, node } = render(
				<JsxParser
					components={{ Custom }}
					bindings={{ first, second }}
					jsx="<Custom {...first} {...second.innerProps} {...{ text: 'Will Not Spread' }} />"
				/>,
			)

			expect(node.classList.contains('jsx-parser')).toBeTruthy()
			expect(node.childNodes).toHaveLength(1)

			const customElement = node.childNodes[0]
			expect(customElement.nodeName).toEqual('DIV')
			expect(customElement.className).toEqual('blah')
			expect(customElement.textContent).toEqual('Test Text')

			// Check component props
			const customInstance = instance.ParsedChildren[0]
			expect(customInstance.props.className).toEqual('blah')
			expect(customInstance.props.text).toEqual('Test Text')
		})

		test('renders custom components with nesting', () => {
			const { instance, node } = render(
				<JsxParser
					components={{ Custom }}
					jsx={
						'<Custom className="outer" text="outerText">'
            + '<Custom className="inner" text="innerText">'
            + '<div>Non-Custom</div>'
            + '</Custom>'
            + '</Custom>'
					}
				/>,
			)
			expect(instance.ParsedChildren).toHaveLength(1)
			expect(node.childNodes).toHaveLength(1)

			const outer = node.childNodes[0]
			expect(outer.nodeName).toEqual('DIV')
			expect(outer.className).toEqual('outer')
			expect(outer.childNodes).toHaveLength(2)

			const [text, inner] = Array.from(outer.childNodes)
			expect(text.nodeType).toEqual(Node.TEXT_NODE)
			expect(text.textContent).toEqual('outerText')
			expect(inner.nodeType).toEqual(Node.ELEMENT_NODE)
			expect(inner.nodeName).toEqual('DIV')
			expect(inner.className).toEqual('inner')
			expect(inner.childNodes).toHaveLength(2)

			const [innerText, innerDiv] = Array.from(inner.childNodes)
			expect(innerText.nodeType).toEqual(Node.TEXT_NODE)
			expect(innerText.textContent).toEqual('innerText')
			expect(innerDiv.nodeType).toEqual(Node.ELEMENT_NODE)
			expect(innerDiv.nodeName).toEqual('DIV')
			expect(innerDiv.textContent).toEqual('Non-Custom')
		})

		test('handles fragment shorthand syntax (<></>)', () => {
			const { node } = render(<JsxParser jsx="<><>Test</> <>Test</></>" />)
			expect(node.textContent).toBe('Test Test')
		})

		test('renders falsy expressions correctly', () => {
			const { node } = render(<JsxParser jsx="<b>{false}{undefined}{0}{null}{[]}</b>" />)
			expect(node.innerHTML).toBe('<b>0</b>')
		})

		test('skips over DOCTYPE, html, head, and body if found', () => {
			const { node } = render(
				<JsxParser jsx="<!DOCTYPE html><html><head></head><body><h1>Test</h1><p>Another Text</p></body></html>" />,
			)

			expect(node.childNodes).toHaveLength(2)
			expect(node.querySelector('h1').textContent).toEqual('Test')
			expect(node.querySelector('p').textContent).toEqual('Another Text')
		})

		test('renders custom elements without requiring closing tags', () => {
			function CustomContent() {
				return <h1>Custom Content</h1>
			}

			const { node } = render(
				<JsxParser
					components={{ CustomContent }}
					jsx="<CustomContent /><p>Text</p>"
				/>,
			)

			expect(node.childNodes).toHaveLength(2)
			expect(node.querySelectorAll('p')).toHaveLength(1)

			expect(node.querySelectorAll('h1')).toHaveLength(1)
			expect(node.querySelector('h1').textContent).toEqual('Custom Content')
		})

		test('renders custom elements with dot notation tags', () => {
			const Lib = { Custom }
			const { instance, node } = render(
				<JsxParser
					components={{ Lib }}
					jsx={
						'<h1>Header</h1>'
						+ '<Lib.Custom className="blah" text="Test Text" />'
					}
				/>,
			)

			expect(node.classList.contains('jsx-parser')).toBeTruthy()
			expect(node.childNodes).toHaveLength(2)

			expect(node.childNodes[0].nodeName).toEqual('H1')
			expect(node.childNodes[0].textContent).toEqual('Header')

			const customElement = node.childNodes[1]
			expect(customElement.nodeName).toEqual('DIV')
			expect(customElement.className).toEqual('blah')
			expect(customElement.textContent).toEqual('Test Text')

			// Check component props
			const customInstance = instance.ParsedChildren[1]
			expect(customInstance.props.className).toEqual('blah')
			expect(customInstance.props.text).toEqual('Test Text')
		})

		test('outputs no wrapper element when renderInWrapper prop is false', () => {
			const { root } = render(<JsxParser jsx="<h1>Foo</h1><hr />" renderInWrapper={false} />)
			expect(root.innerHTML).toEqual('<h1>Foo</h1><hr>')
		})
	})

	// Rewritten 'blacklisting & whitelisting' suite
	describe('Blacklisting & Whitelisting', () => {
		test('strips <script> tags by default', () => {
			const { instance, node } = render(
				<JsxParser
					jsx={
						'<div>Before</div>'
            + '<script src="http://example.com/test.js"></script>'
            + '<div>After</div>'
					}
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(2)
			expect(node.querySelector('script')).toBeNull()
			expect(node.childNodes).toHaveLength(2)
		})

		test('strips event handler attributes by default', () => {
			const { instance, node } = render(
				<JsxParser
					jsx={
						'<div onClick="handleClick()">first</div>'
            + '<div onChange="handleChange()">second</div>'
					}
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(2)
			expect(node.childNodes).toHaveLength(2)
			expect(instance.ParsedChildren[0].props.onClick).toBeUndefined()
			expect(node.childNodes[0].attributes).toHaveLength(0)
			expect(instance.ParsedChildren[1].props.onChange).toBeUndefined()
			expect(node.childNodes[1].attributes).toHaveLength(0)
		})

		test('strips custom blacklisted tags and attributes', () => {
			const { instance, node } = render(
				<JsxParser
					blacklistedTags={['Foo']}
					blacklistedAttrs={['foo', 'prefixed[a-z]*']}
					jsx={
						'<div foo="bar" prefixedFoo="foo" prefixedBar="bar">first</div>'
            + '<Foo>second</Foo>'
					}
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(1)
			expect(node.childNodes).toHaveLength(1)
			expect(instance.ParsedChildren[0].props.foo).toBeUndefined()
			expect(instance.ParsedChildren[0].props.prefixedFoo).toBeUndefined()
			expect(instance.ParsedChildren[0].props.prefixedBar).toBeUndefined()
		})

		test('strips HTML tags if componentsOnly is true', () => {
			function Simple({ children, text }) {
				return <div>{text}{children}</div>
			}
			const { node } = render(
				<JsxParser
					components={{ Simple }}
					componentsOnly
					jsx={`
            <h1>Ignored</h1>
            <Simple text="Parent">
              <Simple text="Child">
                <h2>Ignored</h2>
              </Simple>
            </Simple>
          `}
				/>,
			)
			expect(node.querySelector('h1')).toBeNull()
			expect(node.querySelector('h2')).toBeNull()
			expect(node.querySelectorAll('div')).toHaveLength(2)
			expect(node.textContent.replace(/\s/g, '')).toEqual('ParentChild')
		})
	})

	describe('whitespace', () => {
		test('allows no-whitespace-element named custom components to take whitespace', () => {
			// eslint-disable-next-line react/prop-types
			const tr = ({ children }) => <div className="tr">{children}</div>
			const { node } = render(<JsxParser components={{ tr }} jsx='<tr> <a href="/url">Text</a> </tr>' />)
			expect(node.childNodes[0].nodeName).toEqual('DIV')
			expect(node.childNodes[0].childNodes).toHaveLength(3)

			const [space1, text, space2] = Array.from(node.childNodes[0].childNodes)
			const nodeTypes = [space1, text, space2].map(n => n.nodeType)
			expect(nodeTypes).toEqual([Node.TEXT_NODE, Node.ELEMENT_NODE, Node.TEXT_NODE])
			expect(space1.textContent).toEqual(' ')
			expect(text.textContent).toEqual('Text')
			expect(space2.textContent).toEqual(' ')
		})
		test('leaves a space between elements as-coded', () => {
			const jsx = '<b>first</b> <b>second</b>'
			const { node } = render(<JsxParser jsx={jsx} />)
			expect(node.innerHTML).toBe(jsx)
		})
		test('keeps line-breaks', () => {
			const jsx = '<code class="markdown"># hello\n\na paragraph\n</code>'
			const { node } = render(<JsxParser jsx={jsx} />)
			expect(node.innerHTML).toBe(jsx)
		})
		test('handles whitespace correctly', () => {
			const { node } = render(
				<JsxParser
					jsx={'\
						<h1>Title</h1>\
						<div class="foo">Bar</div>\
					'}
				/>,
			)

			// H1
			// Comment Whitespace Comment
			// DIV
			const children = Array.from(node.childNodes)
			expect(children).toHaveLength(3)

			const [h1, whitespace, div] = children
			expect(h1.nodeType).toEqual(Node.ELEMENT_NODE)
			expect(h1.nodeName).toEqual('H1')
			expect(h1.textContent).toEqual('Title')
			expect(whitespace.nodeType).toEqual(Node.TEXT_NODE)
			expect(whitespace.textContent).toMatch(/^\s+$/i)
			expect(div.nodeType).toEqual(Node.ELEMENT_NODE)
			expect(div.nodeName).toEqual('DIV')
			expect(div.textContent).toEqual('Bar')
			expect(div.className).toEqual('foo')
		})
		test('keeps non-breaking spaces as such', () => {
			const { node } = render(
				<JsxParser
					jsx={
						'<p>Contains a&nbsp;non-breaking space (html named entity)</p>'
						+ '<p>Contains a&#160;non-breaking space (html numbered entity)</p>'
						+ '<p>Contains a\u00a0non-breaking space (utf sequence)</p>'
						+ '<p>Contains a non-breaking space (hard coded, using alt+space)</p>'
						+ '<p>Contains a&#8239;narrow non-breaking space (html numbered entity)</p>'
						+ '<p>Contains a\u202Fnarrow non-breaking space (utf sequence)</p>'
						+ '<p>This is a test with regular spaces only</p>'
					}
				/>,
			)

			// Entites are converted to utf sequences
			// The first four paragraphs should contain \u00A0 (utf non-breaking space)
			// The two next paragraphs should contain \u202F (utf narrow non-breaking space)
			// The last paragraph should *not* contain any non breaking spaces
			const children = Array.from(node.childNodes)

			expect(children).toHaveLength(7)
			expect(children.every(c => c.nodeType === Node.ELEMENT_NODE))
			expect(children.every(c => c.nodeName === 'P'))

			const last = children.pop()
			expect(children.every(c => c.textContent.match(/[\u00A0]/)))
			expect(last.textContent).not.toMatch(/[\u00A0|\u202F]/)
		})
	})
	describe('prop bindings', () => {
		test('parses childless elements with children = undefined', () => {
			const { instance } = render(<JsxParser components={{ Custom }} jsx="<Custom />" />)

			expect(instance.ParsedChildren).toHaveLength(1)
			expect(instance.ParsedChildren[0].props.children).toBeUndefined()
		})
		test('parses implicit boolean props', () => {
			const { instance } = render(
				<JsxParser
					components={{ Custom }}
					jsx="<Custom shouldBeTrue shouldBeFalse={false} />"
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(1)
			expect(instance.ParsedChildren[0].props.shouldBeTrue).toBe(true)
			expect(instance.ParsedChildren[0].props.shouldBeFalse).toBe(false)
		})
		test('parses explicit boolean props', () => {
			const { instance } = render(
				<JsxParser
					components={{ Custom }}
					jsx="<Custom shouldBeTrue={true} shouldBeFalse={false} />"
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(1)
			expect(instance.ParsedChildren[0].props.shouldBeTrue).toBe(true)
			expect(instance.ParsedChildren[0].props.shouldBeFalse).toBe(false)
		})
		test('parses bound object values', () => {
			const { instance } = render(<JsxParser components={{ Custom }} jsx='<Custom obj={{ foo: "bar", bar: "foo" }} />' />)

			expect(instance.ParsedChildren).toHaveLength(1)
			expect(instance.ParsedChildren[0].props.obj).toEqual({ foo: 'bar', bar: 'foo' })
		})
		test('parses style attributes', () => {
			const { node } = render(
				<JsxParser
					jsx={
						'<div style="margin: 0 1px 2px 3px;"></div>'
						+ '<div style="padding-left: 45px; padding-right: 1em;"></div>'
					}
				/>,
			)

			expect(node.childNodes).toHaveLength(2)
		})
		test('passes bindings to children', () => {
			const logFn = () => { console.log('Foo!') }
			const { instance } = render(
				<JsxParser
					bindings={{
						foo: 'Foo',
						bar: 'Bar',
						logFn,
						nested: {
							objects: {
								work: true,
							},
						},
					}}
					blacklistedAttrs={[]}
					components={{ Custom }}
					jsx={
						'<Custom foo={foo} bar={bar}></Custom>'
						+ '<div foo={foo} />'
						+ '<span onClick={logFn}>Click Me!</span>'
						+ '<div doTheyWork={nested.objects.work} />'
						+ '<div unresolvable={a.bad.binding} />'
					}
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(5)
			expect(instance.ParsedChildren[0].props).toEqual({ foo: 'Foo', bar: 'Bar' })
			expect(instance.ParsedChildren[1].props).toEqual({ foo: 'Foo' })
			expect(instance.ParsedChildren[2].props.onClick).toEqual(logFn)
			expect(instance.ParsedChildren[3].props).toEqual({ doTheyWork: true })
			expect(instance.ParsedChildren[4].props).toEqual({ unresolvable: undefined })
		})
		test('parses array values', () => {
			const { node } = render(<JsxParser jsx="<div>{[1,2,3]}</div>" />)
			expect(node.innerHTML).toEqual('<div>123</div>')
		})
		test('honors conditional rendering based on bound values', () => {
			const logFn = () => { console.log('Foo!') }
			const { instance } = render(
				<JsxParser
					bindings={{
						foo: 'Foo',
						bar: 'Bar',
						logFn,
						nested: { objects: { work: true } },
					}}
					blacklistedAttrs={[]}
					components={{ Custom }}
					jsx={
						'<div foo={foo} />'
						+ '<span onClick={logFn}>Click Me!</span>'
						+ '{nested.objects.work && <div doTheyWork={nested.objects.work} />}'
						+ '{nested.objects.work === "nope" && <div>Do not show me</div>}'
						+ '<div unresolvable={a.bad.binding} />'
					}
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(4)
			expect(instance.ParsedChildren[0].props).toEqual({ foo: 'Foo' })
			expect(instance.ParsedChildren[1].props.onClick).toEqual(logFn)
			expect(instance.ParsedChildren[2].props).toEqual({ doTheyWork: true })
			expect(instance.ParsedChildren[3].props).toEqual({ unresolvable: undefined })
		})
		test('allows use of bound functions in conditionals rendering', () => {
			const logFn = () => { console.log('Foo!') }
			const { instance } = render(
				<JsxParser
					bindings={{
						foo: 'Foo',
						bar: 'Bar',
						logFn,
						nested: {
							objects: {
								work: false,
								noWork: () => true,
							},
						},
					}}
					blacklistedAttrs={[]}
					components={{ Custom }}
					jsx={
						'<div foo={foo} />'
						+ '<span onClick={logFn}>Click Me!</span>'
						+ '{( nested.objects.work || nested.objects.noWork()) && <div doTheyWork={nested.objects.work} />}'
						+ '<div unresolvable={a.bad.binding} />'
					}
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(4)
			expect(instance.ParsedChildren[0].props).toEqual({ foo: 'Foo' })
			expect(instance.ParsedChildren[1].props.onClick).toEqual(logFn)
			expect(instance.ParsedChildren[2].props).toEqual({ doTheyWork: false })
			expect(instance.ParsedChildren[3].props).toEqual({ unresolvable: undefined })
		})
		test('updates bindings on subsequent renders', () => {
			const jsx = '<div data-value={value} />'
			const { node: first, update } = render(<JsxParser jsx={jsx} bindings={{ value: 'foo' }} />)
			expect(first.querySelector('div')?.dataset.value).toBe('foo')

			const { node: second } = update(<JsxParser jsx={jsx} bindings={{ value: 'bar' }} />)
			expect(second.querySelector('div')?.dataset.value).toBe('bar')
		})
		test('will not execute arbitrary javascript', () => {
			window.foo = jest.fn(() => true)
			const { node } = render(
				<JsxParser
					jsx={
						'<div>Before {window.foo() && <span>Foo!</span>}</div>'
						+ '<div>{Number.isNaN(NaN) && <span>Foo!</span>} After</div>'
					}
				/>,
			)

			expect(window.foo).toHaveBeenCalledTimes(0)
			expect(node.querySelector('span')).toBeNull()
			expect(node.innerHTML)
				.toMatch('<div>Before </div><div> After</div>')
		})
		test('will render options', () => {
			window.foo = jest.fn(() => true)
			const jsx = '<select><option>Some value</option></select>'
			const { node } = render(<JsxParser jsx={jsx} />)

			expect(node.innerHTML).toMatch(jsx)
		})
		describe('can evaluate multi-level property accessors', () => {
			/* eslint-disable dot-notation,no-useless-concat */
			const bindings = {
				array: [{ of: 'objects' }],
				index: 0,
				object: { with: { child: 'objects' } },
			}

			test('can evaluate a.b.c', () => {
				const expression = 'object.with.child'
				const jsx = `<span foo={${expression}}>{${expression}}</span>`
				const { node, instance } = render(<JsxParser {...{ bindings, jsx }} />)

				expect(node.childNodes[0].textContent).toEqual(bindings.object.with.child)
				expect(instance.ParsedChildren[0].props.foo).toEqual(bindings.object.with.child)
			})
			test('can evaluate a["b"].c', () => {
				const expression = 'object["with"].child'
				const jsx = `<span foo={${expression}}>{${expression}}</span>`
				const { node, instance } = render(<JsxParser {...{ bindings, jsx }} />)

				expect(node.childNodes[0].textContent).toEqual(bindings.object['with'].child)
				expect(instance.ParsedChildren[0].props.foo).toEqual(bindings.object['with'].child)
			})
			test('can evaluate a["b" + 1].c', () => {
				const expression = 'object["wi" + "th"].child'
				const jsx = `<span foo={${expression}}>{${expression}}</span>`
				const { node, instance } = render(<JsxParser {...{ bindings, jsx }} />)

				expect(node.childNodes[0].textContent).toEqual(bindings.object['wi' + 'th'].child)
				expect(instance.ParsedChildren[0].props.foo).toEqual(bindings.object['wi' + 'th'].child)
			})
			test('can evaluate a[0].b', () => {
				const expression = 'array[0].of'
				const jsx = `<span foo={${expression}}>{${expression}}</span>`
				const { node, instance } = render(<JsxParser {...{ bindings, jsx }} />)

				expect(node.childNodes[0].textContent).toEqual(bindings.array[0].of)
				expect(instance.ParsedChildren[0].props.foo).toEqual(bindings.array[0].of)
			})
			test('can evaluate a[1 - 1].b', () => {
				const expression = 'array[1 - 1].of'
				const jsx = `<span foo={${expression}}>{${expression}}</span>`
				const { node, instance } = render(<JsxParser {...{ bindings, jsx }} />)

				expect(node.childNodes[0].textContent).toEqual(bindings.array[1 - 1].of)
				expect(instance.ParsedChildren[0].props.foo).toEqual(bindings.array[1 - 1].of)
			})
			test('can evaluate a[b].c', () => {
				const expression = 'array[index].of'
				const jsx = `<span foo={${expression}}>{${expression}}</span>`
				const { node, instance } = render(<JsxParser {...{ bindings, jsx }} />)

				expect(node.childNodes[0].textContent).toEqual(bindings.array[bindings.index].of)
				expect(instance.ParsedChildren[0].props.foo).toEqual(bindings.array[bindings.index].of)
			})
			it('can evaluate a[b]', () => {
				const { node } = render(
					<JsxParser
						bindings={{ items: { 0: 'hello', 1: 'world' }, arr: [0, 1] }}
						jsx="{items[arr[0]]}"
					/>,
				)
				expect(node.innerHTML).toMatch('hello')
			})
			it('handles optional chaining', () => {
				const { node } = render(
					<JsxParser
						bindings={{ foo: { bar: 'baz' }, baz: undefined }}
						jsx="{foo?.bar} {baz?.bar}"
					/>,
				)
				expect(node.innerHTML).toMatch('baz')
			})
			it('optional short-cut', () => {
				const { node } = render(
					<JsxParser
						bindings={{ foo: { bar: { baz: 'baz' } }, foo2: undefined }}
						jsx="{foo?.bar.baz} {foo2?.bar.baz}"
					/>,
				)
				expect(node.innerHTML).toMatch('baz')
			})
			it('optional function call', () => {
				const { node } = render(
					<JsxParser
						bindings={{ foo: { bar: () => 'baz' }, foo2: undefined }}
						jsx="{foo?.bar()} {foo2?.bar()}"
					/>,
				)
				expect(node.innerHTML).toMatch('baz')
			})
			/* eslint-enable dot-notation,no-useless-concat */
		})
	})
	describe('template strings', () => {
		test('correctly parse/bind bindings', () => {
			const { node } = render(
				<JsxParser
					bindings={{ foo: 2, bar: 3 }}
					// eslint-disable-next-line no-template-curly-in-string
					jsx="<span>{`foo: ${foo}, bar: ${bar}, baz: ${foo * bar}`}</span>"
				/>,
			)
			expect(node.childNodes[0].textContent).toEqual('foo: 2, bar: 3, baz: 6')
		})
	})
	describe('React.Children.only()', () => {
		// eslint-disable-next-line react/prop-types
		function OnlyOne({ children }) {
			return <div>{React.Children.only(children)}</div>
		}
		test('passes with a single child', () => {
			expect(() => render(
				<JsxParser
					components={{ OnlyOne }}
					jsx="<OnlyOne><h1>Ipsum</h1></OnlyOne>"
				/>,
			)).not.toThrow()
		})
		test('fails with multiple children', () => {
			// Multiple children passed - should throw
			expect(() => render(
				<JsxParser
					components={{ OnlyOne }}
					jsx="<OnlyOne><h1>Ipsum</h1><h2>Foo</h2></OnlyOne>"
				/>,
			)).toThrow()
		})
	})
	describe('instance methods', () => {
		test.each([
			['String_startsWith', '"foobar".startsWith("fo")', true],
			['String_endsWith', '"foobar".endsWith("ar")', true],
			['String_includes', '"foobar".includes("ooba")', true],
			['String_substr', '"foobar".substr(1, 2)', 'oo'],
			['String_replace', '"foobar".replace("oo", "uu")', 'fuubar'],
			['String_search', '"foobar".search("bar")', 3],
			['String_toUpperCase', '"foobar".toUpperCase()', 'FOOBAR'],
			['String_toLowerCase', '"FOOBAR".toLowerCase()', 'foobar'],
			['String_trim', '"    foobar     ".trim()', 'foobar'],
			['Number_toFixed', '100.12345.toFixed(2)', '100.12'],
			['Number_toPrecision', '123.456.toPrecision(4)', '123.5'],
			['Array_includes', '[1, 2, 3].includes(2)', true],
			['Array_join', '[1, 2, 3].join("+")', '1+2+3'],
			['Array_sort', '[3, 1, 2].sort()', [1, 2, 3]],
			['Array_slice', '[1, 2, 3].slice(1, 2)', [2]],
		])('should evaluate %s correctly', (propName, expression, expected) => {
			const { instance } = render(
				<JsxParser jsx={`<span ${propName}={${expression}} />`} />,
			)
			expect(instance.ParsedChildren[0].props[propName]).toEqual(expected)
		})
		test('bind properties', () => {
			const { node } = render(
				<JsxParser
					bindings={{ foo: { bar: { baz: 'quux' } } }}
					jsx="<div>{foo.bar.baz.toUpperCase()}</div>"
				/>,
			)
			expect(node.textContent).toEqual('QUUX')
		})
	})
	test('props.renderUnrecognized()', () => {
		const { node } = render(
			<JsxParser
				allowUnknownElements={false}
				jsx="<foo />"
				renderInWrapper={false}
				renderUnrecognized={name => <div className={name}>{name}</div>}
			/>,
		)
		expect(node.outerHTML).toEqual('<div class="foo">foo</div>')
	})
	describe('void elements', () => {
		test('void-element named custom components to take children', () => {
			// eslint-disable-next-line react/prop-types
			const link = ({ to, children }) => (<a href={to}>{children}</a>)
			const { node } = render(<JsxParser components={{ link }} jsx='<link to="/url">Text</link>' />)
			expect(node.childNodes[0].nodeName).toEqual('A')
			expect(node.childNodes[0].textContent).toEqual('Text')
		})
	})
	describe('self-closing tags', () => {
		test('by default, renders self-closing tags without their children', () => {
			const { node } = render(
				<JsxParser showWarnings jsx='<img src="/foo.png"><div class="invalidChild"></div></img>' />,
			)

			expect(node.childNodes).toHaveLength(1)
			expect(node.getElementsByTagName('img')).toHaveLength(1)
			expect(node.childNodes[0].innerHTML).toEqual('')
			expect(node.childNodes[0].childNodes).toHaveLength(0)

			expect(node.getElementsByTagName('div')).toHaveLength(0)
		})
		test('props.autoCloseVoidElements=true auto-closes self-closing tags', () => {
			const { node } = render(
				<JsxParser autoCloseVoidElements jsx='<img src="/foo.png"><div>Foo</div>' />,
			)

			expect(node.childNodes).toHaveLength(2)
			expect(node.getElementsByTagName('img')).toHaveLength(1)
			expect(node.childNodes[0].innerHTML).toEqual('')
			expect(node.childNodes[0].childNodes).toHaveLength(0)
			expect(node.getElementsByTagName('div')).toHaveLength(1)
		})
		test('props.autoCloseVoidElements=false will treats self-closing tags by jsx rules (does not parse)', () => {
			const { node } = render(
				<JsxParser autoCloseVoidElements={false} jsx='<img src="/foo.png"><div></div>' />,
			)
			expect(node.childNodes).toHaveLength(0)
		})
	})

	test('throws on non-simple literal and global object instance methods', () => {
		// Some of these would normally fail silently, set `onError` forces throw for assertion purposes
		expect(() => render(<JsxParser jsx="{ window.scrollTo() }" onError={e => { throw e }} />)).toThrow()
		expect(() => render(<JsxParser jsx='{ (() => { window.location = "badsite" })() }' onError={e => { throw e }} />)).toThrow()
		expect(() => render(<JsxParser jsx='{ document.querySelector("body") }' onError={e => { throw e }} />)).toThrow()
		expect(() => render(<JsxParser jsx='{ document.createElement("script") }' onError={e => { throw e }} />)).toThrow()
	})
	test('supports className prop', () => {
		const { node } = render(<JsxParser className="foo" jsx="Text" />)
		expect(node.classList.contains('foo')).toBeTruthy()
	})

	describe('children', () => {
		test('keys are preserved if present and generated otherwise', () => {
			const { instance, node } = render(
				<JsxParser
					components={{ Custom }}
					jsx={
						'<Custom className="parent" text="parent">'
						+ '<Custom className="child-1" text="child-1" key="child-1" />'
						+ '<Custom className="child-2" text="child-2" />'
						+ '<Custom className="child-3" text="child-3" key="child-3" />'
						+ '</Custom>'
					}
				/>,
			)

			expect(node.classList.contains('jsx-parser')).toBeTruthy()

			expect(node.childNodes).toHaveLength(1)
			expect(instance.ParsedChildren).toHaveLength(1)

			expect(instance.ParsedChildren[0].props.className).toEqual('parent')
			expect(instance.ParsedChildren[0].props.text).toEqual('parent')
			expect(instance.ParsedChildren[0].props.children).toHaveLength(3)

			expect(instance.ParsedChildren[0].props.children[0].props.className).toEqual('child-1')
			expect(instance.ParsedChildren[0].props.children[0].props.text).toEqual('child-1')
			expect(instance.ParsedChildren[0].props.children[0].key).toEqual('child-1')

			expect(instance.ParsedChildren[0].props.children[1].props.className).toEqual('child-2')
			expect(instance.ParsedChildren[0].props.children[1].props.text).toEqual('child-2')
			expect(instance.ParsedChildren[0].props.children[1].key).toBeTruthy()

			expect(instance.ParsedChildren[0].props.children[2].props.className).toEqual('child-3')
			expect(instance.ParsedChildren[0].props.children[2].props.text).toEqual('child-3')
			expect(instance.ParsedChildren[0].props.children[2].key).toEqual('child-3')
		})

		test('key generation respects disableKeyGeneration', () => {
			const { instance, node } = render(
				<JsxParser
					components={{ Custom }}
					jsx={
						'<Custom className="parent" text="parent">'
						+ '<Custom className="child-1" text="child-1" key="child-1" />'
						+ '<Custom className="child-2" text="child-2" />'
						+ '</Custom>'
					}
					disableKeyGeneration
				/>,
			)

			expect(node.classList.contains('jsx-parser')).toBeTruthy()

			expect(node.childNodes).toHaveLength(1)
			expect(instance.ParsedChildren).toHaveLength(1)

			expect(instance.ParsedChildren[0].props.className).toEqual('parent')
			expect(instance.ParsedChildren[0].props.text).toEqual('parent')
			expect(instance.ParsedChildren[0].props.children).toHaveLength(2)

			expect(instance.ParsedChildren[0].props.children[0].props.className).toEqual('child-1')
			expect(instance.ParsedChildren[0].props.children[0].props.text).toEqual('child-1')
			expect(instance.ParsedChildren[0].props.children[0].key).toEqual('child-1')

			expect(instance.ParsedChildren[0].props.children[1].props.className).toEqual('child-2')
			expect(instance.ParsedChildren[0].props.children[1].props.text).toEqual('child-2')
			expect(instance.ParsedChildren[0].props.children[1].key).toBeFalsy()
		})
	})

	describe('Functions', () => {
		it('supports nested JSX and expressions inside arrow functions', () => {
			const { node } = render(
				<JsxParser
					components={{ Custom }}
					bindings={{
						numbers: [1, 2],
						items: [
							{ name: 'Megeara', title: 'Fury' },
							{ name: 'Alecto', title: 'Anger' },
						],
					}}
					jsx={`
						<div>
							{numbers.map(num => <Custom><p>Number: {num}</p></Custom>)}
							{items.map(item => <Custom text={item.title}><p>{item.name}</p></Custom>)}
						</div>
					`}
				/>,
			)

			expect(node.innerHTML.replace(/[\n\t]+/g, '')).toMatch(
				'<div>' +
					'<div><p>Number: 1</p></div>' +
					'<div><p>Number: 2</p></div>' +
					'<div>Fury<p>Megeara</p></div>' +
					'<div>Anger<p>Alecto</p></div>' +
				'</div>',
			)
		})

		it('supports math with scope', () => {
			const { node } = render(<JsxParser jsx="{[1, 2, 3].map(num => num * 2)}" />)
			expect(node.innerHTML).toEqual('246')
		})

		it('supports conditional with scope', () => {
			const { node } = render(<JsxParser jsx="{[1, 2, 3].map(num => num == 1 || num == 3 ? num : -1)}" />)
			expect(node.innerHTML).toEqual('1-13')
		})
	})
})
