// @ts-nocheck
/* eslint-disable function-paren-newline, no-console, no-underscore-dangle, no-useless-escape */
import React from 'react'
import { render } from 'basis/libraries/react/testing/render'
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
	let parent = null
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
		parent = document.createElement('div')
	})

	describe('using ternaries', () => {
		test('should handle boolean test value ', () => {
			const { instance, node } = render(<JsxParser jsx={`
				<p falsyProp={false ? 1 : 0} truthyProp={true ? 1 : 0}>
					(display 1: {true ? 1 : 0}); (display 0: {false ? 1 : 0})
				</p>`}
			/>)

			expect(node.querySelector('p').textContent?.trim())
				.toEqual('(display 1: 1); (display 0: 0)')

			expect(instance.ParsedChildren[0].props.truthyProp).toBe(1)
			expect(instance.ParsedChildren[0].props.falsyProp).toBe(0)
		})

		test('should handle evaluative ternaries', () => {
			const { node } = render(
				<JsxParser
					bindings={{ foo: 1 }}
					jsx={`
						<div className={foo === 1 ? 'isOne' : 'isNotOne'}>
							{foo !== 1 ? 'isNotOne' : 'isOne'}
						</div>
					`}
				/>,
			)

			expect(node.childNodes[0].classList).toContain('isOne')
			expect(node.childNodes[0].textContent.trim()).toEqual('isOne')
		})

		test('should handle test predicate returned value ', () => {
			const { node } = render(
				<JsxParser
					jsx={`
						<p>{true && true ? "a" : "b"}</p>
						<p>{true && false ? "a" : "b"}</p>
						<p>{true || false ? "a" : "b"}</p>
						<p>{false || false ? "a" : "b"}</p>
					`}
				/>,
			)
			const [p1, p2, p3, p4] = Array.from(node.querySelectorAll('p'))
			expect(p1.textContent).toEqual('a')
			expect(p2.textContent).toEqual('b')
			expect(p3.textContent).toEqual('a')
			expect(p4.textContent).toEqual('b')
		})
	})
	describe('conditional || rendering', () => {
		test('should handle boolean test value ', () => {
			const { instance, node } = render(<JsxParser jsx={
				'<p falsyProp={false || "fallback"} truthyProp={true || "fallback"}>'
				+ '(display "good": {"good" || "fallback"}); (display "fallback": {"" || "fallback"})'
				+ '</p>'
			}
			/>)

			expect(node.childNodes[0].textContent)
				.toEqual('(display "good": good); (display "fallback": fallback)')

			expect(instance.ParsedChildren[0].props.falsyProp).toBe('fallback')
			expect(instance.ParsedChildren[0].props.truthyProp).toBe(true)
		})

		test('should handle evaluative', () => {
			const { instance, node } = render(
				<JsxParser
					bindings={{ foo: 1 }}
					jsx={`
						<div truthyProp={foo === 1 || 'fallback'} falseyProp={foo !== 1 || 'fallback'}>
							{foo === 1 || 'trueFallback'}{foo !== 1 || 'falseFallback'}
						</div>
					`}
				/>,
			)
			expect(instance.ParsedChildren[0].props.truthyProp).toBe(true)
			expect(instance.ParsedChildren[0].props.falseyProp).toBe('fallback')
			expect(node.childNodes[0].textContent.trim()).toEqual('falseFallback')
		})
	})
	describe('conditional && rendering', () => {
		test('should handle boolean test value ', () => {
			const { instance, node } = render(
				<JsxParser
					jsx={`
						<p falsyProp={false && "fallback"} truthyProp={true && "fallback"}>
							(display "fallback": {"good" && "fallback"}); (display "": {"" && "fallback"})
						</p>
					`}
				/>,
			)

			expect(node.childNodes[0].textContent.trim())
				.toEqual('(display "fallback": fallback); (display "": )')

			expect(instance.ParsedChildren[0].props.falsyProp).toBe(false)
			expect(instance.ParsedChildren[0].props.truthyProp).toBe('fallback')
		})

		test('should handle evaluative', () => {
			const { instance, node } = render(
				<JsxParser
					bindings={{ foo: 1 }}
					jsx={`
						<div truthyProp={foo === 1 && 'fallback'} falseyProp={foo !== 1 && 'fallback'}>
							{foo === 1 && 'trueFallback'}{foo !== 1 && 'falseFallback'}
						</div>
					`}
				/>,
			)
			expect(instance.ParsedChildren[0].props.truthyProp).toBe('fallback')
			expect(instance.ParsedChildren[0].props.falseyProp).toBe(false)
			expect(node.childNodes[0].textContent.trim()).toEqual('trueFallback')
		})
	})
	describe('basic rendering', () => {
		test('renders non-React components', () => {
			const { instance, node } = render(
				<JsxParser
					jsx={
						'<h1>Header</h1>'
						+ '<div class="foo">Foo</div>'
						+ '<span class="bar">Bar</span>'
					}
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(3)
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
		test('renders nested components', () => {
			const { instance, node } = render(
				<JsxParser jsx="<div>Outer<div>Inner</div></div>" />,
			)

			expect(instance.ParsedChildren).toHaveLength(1)
			expect(node.childNodes).toHaveLength(1)

			const outer = node.childNodes[0]
			expect(outer.nodeName).toEqual('DIV')
			expect(outer.childNodes).toHaveLength(2)

			const [text, div] = outer.childNodes
			expect(text.nodeType).toEqual(Node.TEXT_NODE) // Text
			expect(text.textContent).toEqual('Outer')

			expect(div.nodeType).toEqual(Node.ELEMENT_NODE) // Element
			expect(div.nodeName).toEqual('DIV')
			expect(div.textContent).toEqual('Inner')
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

			expect(instance.ParsedChildren).toHaveLength(2)
			expect(node.childNodes).toHaveLength(2)

			expect(node.childNodes[0].nodeName).toEqual('H1')
			expect(node.childNodes[0].textContent).toEqual('Header')

			const custom = instance.ParsedChildren[1]
			expect(custom instanceof Custom)
			expect(custom.props.text).toEqual('Test Text')

			const customHTML = node.childNodes[1]
			expect(customHTML.nodeName).toEqual('DIV')
			expect(customHTML.textContent).toEqual('Test Text')
		})
		test('renders custom components with spread operator', () => {
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

			expect(instance.ParsedChildren).toHaveLength(1)
			expect(node.childNodes).toHaveLength(1)

			const custom = instance.ParsedChildren[0]
			expect(custom instanceof Custom)
			expect(custom.props.className).toEqual('blah')
			expect(custom.props.text).toEqual('Test Text')

			const customNode = node.childNodes[0]
			expect(customNode.nodeName).toEqual('DIV')
			expect(customNode.textContent).toEqual('Test Text')
			const customHTML = node.childNodes[0].innerHTML
			expect(customHTML).not.toMatch(/Will Be Overwritten/)
			expect(customHTML).not.toMatch(/Will Not Spread/)
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
		test('handles unrecognized components', () => {
			const { node } = render(
				<JsxParser
					components={[/* No Components Passed In */]}
					jsx={`
						<Unrecognized class="outer" foo="Foo">
							<Unrecognized class="inner" bar="Bar">
								<div>Non-Custom</div>
							</Unrecognized>
						</Unrecognized>
					`}
				/>,
			)
			const unrecognized = node.querySelectorAll('unrecognized')
			expect(unrecognized).toHaveLength(2)

			const [outer, inner] = Array.from(unrecognized)
			expect(outer.classList).toContain('outer')
			expect(outer.getAttribute('foo')).toEqual('Foo')
			expect(inner.classList).toContain('inner')
			expect(inner.getAttribute('bar')).toEqual('Bar')

			const div = inner.querySelector('div')
			expect(div.textContent).toEqual('Non-Custom')

			expect(console.error).toHaveBeenLastCalledWith(
				expect.stringMatching(/is unrecognized in this browser/),
				'unrecognized',
				expect.stringMatching(/unrecognized/),
			)
		})
		test('handles fragment shorthand syntax (<></>)', () => {
			const { node } = render(<JsxParser jsx="<><>Test</> <>Test</></>" />)
			expect(node.textContent).toBe('Test Test')
		})
		test('renders falsy expressions correctly', () => {
			const { node } = render(<JsxParser jsx="<b>{false}{undefined}{0}{null}{[]}</b>" />)
			expect(node.innerHTML).toBe('<b>0</b>')
		})
		test('skips over DOCTYPE, html, head, and div if found', () => {
			const { node } = render(
				<JsxParser jsx="<!DOCTYPE html><html><head></head><body><h1>Test</h1><p>Another Text</p></body></html>" />,
			)

			expect(node.childNodes).toHaveLength(2)
		})
		test('renders custom elements without requiring closing tags', () => {
			// eslint-disable-next-line react/prefer-stateless-function
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
		test('renders custom elements without closing tags', () => {
			function CustomContent() { return <h1>Ipsum</h1> }
			function CuStomContent() { return <h2>Lorem</h2> }

			const { node } = render(
				<JsxParser
					components={{ CustomContent, CuStomContent }}
					jsx="<CustomContent /><CuStomContent />"
				/>,
			)

			expect(node.childNodes).toHaveLength(2)
			expect(node.querySelectorAll('h1,h2')).toHaveLength(2)
			expect(node.querySelector('h1').textContent).toEqual('Ipsum')
			expect(node.querySelector('h2').textContent).toEqual('Lorem')
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

			expect(instance.ParsedChildren).toHaveLength(2)
			expect(node.childNodes).toHaveLength(2)

			expect(node.childNodes[0].nodeName).toEqual('H1')
			expect(node.childNodes[0].textContent).toEqual('Header')

			const custom = instance.ParsedChildren[1]
			expect(custom instanceof Custom)
			expect(custom.props.text).toEqual('Test Text')

			const customHTML = node.childNodes[1]
			expect(customHTML.nodeName).toEqual('DIV')
			expect(customHTML.textContent).toEqual('Test Text')
		})
		test('renders custom elements with multiple dot notation tags', () => {
			const SubLib = { Custom }
			const Lib = { SubLib }
			const { instance, node } = render(
				<JsxParser
					components={{ Lib }}
					jsx={
						'<h1>Header</h1>'
						+ '<Lib.SubLib.Custom className="blah" text="Test Text" />'
					}
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(2)
			expect(node.childNodes).toHaveLength(2)

			expect(node.childNodes[0].nodeName).toEqual('H1')
			expect(node.childNodes[0].textContent).toEqual('Header')

			const custom = instance.ParsedChildren[1]
			expect(custom instanceof Custom)
			expect(custom.props.text).toEqual('Test Text')

			const customHTML = node.childNodes[1]
			expect(customHTML.nodeName).toEqual('DIV')
			expect(customHTML.textContent).toEqual('Test Text')
		})
		test('outputs no wrapper element when renderInWrapper prop is false', () => {
			const { root } = render(<JsxParser jsx="<h1>Foo</h1><hr />" renderInWrapper={false} />)
			expect(root.innerHTML).toEqual('<h1>Foo</h1><hr>')
		})
		test('omits unknown elements and errors if !allowUnknownElements', () => {
			const onError = jest.fn()
			const { node } = render(
				<JsxParser
					allowUnknownElements={false}
					jsx="<foo>Foo</foo><div>div</div><bar>Bar</bar>"
					onError={onError}
				/>,
			)
			expect(onError).toHaveBeenCalledTimes(2)
			expect(onError).toHaveBeenCalledWith(
				expect.objectContaining({ message: expect.stringContaining('<foo> is unrecognized') }),
			)
			expect(onError).toHaveBeenCalledWith(
				expect.objectContaining({ message: expect.stringContaining('<bar> is unrecognized') }),
			)
			expect(node.innerHTML).toMatch('<div>div</div>')
		})
		test('renders errors with renderError prop, if supplied', () => {
			const onError = jest.fn()
			// eslint-disable-next-line
			const renderError = ({ error }) => <div className="error">{error}</div>
			const { node } = render(
				<JsxParser {...{ onError, renderError }} jsx="<h2>No closing tag " />,
			)

			expect(onError).toHaveBeenCalledTimes(1)
			expect(node.querySelectorAll('h2')).toHaveLength(0)
			expect(node.querySelectorAll('div')).toHaveLength(1)
			expect(node.textContent).toMatch(/SyntaxError: Expected corresponding JSX closing tag for <h2>/)
		})
		test('re-rendering should update child elements rather than unmount and remount them', () => {
			const updates = jest.fn()
			const unmounts = jest.fn()
			const props = {
				components: {
					Custom: class extends React.Component {
						componentDidUpdate() { updates() }
						componentWillUnmount() { unmounts() }
						render() { return 'Custom element!' }
					},
				},
				disableKeyGeneration: true,
				jsx: '<div><p>Hello</p><hr /><Custom /></div>',
			}
			const { update } = render(<JsxParser {...props} />)
			update(<JsxParser {...props} someProp />)

			expect(updates).toHaveBeenCalled()
			expect(unmounts).not.toHaveBeenCalled()
		})
	})
	describe('blacklisting & whitelisting', () => {
		test('strips <script src="..."> tags by default', () => {
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
		test('strips <script>...</script> tags by default', () => {
			const { instance, node } = render(
				<JsxParser
					jsx={
						'<div>Before</div>'
						+ '<script>'
						+ 'window.alert("This shouldn\'t happen!");'
						+ '</script>'
						+ '<div>After</div>'
					}
				/>,
			)

			expect(instance.ParsedChildren).toHaveLength(2)
			expect(node.querySelector('script')).toBeNull()
			expect(node.childNodes).toHaveLength(2)
			expect(parent.getElementsByTagName('script')).toHaveLength(0)
		})
		test('strips onEvent="..." attributes by default', () => {
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
			expect(node.childNodes[0].attributes.foo).toBeUndefined()
			expect(node.childNodes[0].attributes.prefixedFoo).toBeUndefined()
			expect(node.childNodes[0].attributes.prefixedBar).toBeUndefined()
		})
		test('strips HTML tags if componentsOnly=true', () => {
			// eslint-disable-next-line react/prop-types
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
		test('can execute binary mathematical operations', () => {
			const { node } = render(<JsxParser jsx="<span>{ 1 + 2 * 4 / 8 - 1 }</span>" />)
			expect(node.childNodes[0].textContent).toEqual('1')
		})
		test('can evaluate binary exponent operations', () => {
			const { instance } = render(<JsxParser jsx="<span testProp={2 ** 4} />" />)
			expect(instance.ParsedChildren[0].props.testProp).toEqual(16)
		})
		test('can evaluate binary modulo operations', () => {
			const { instance } = render(<JsxParser jsx="<span testProp={27 % 14} />" />)
			expect(instance.ParsedChildren[0].props.testProp).toEqual(13)
		})
		test('can evaluate equality comparison', () => {
			const { instance } = render(<JsxParser jsx="<span testProp={1 == 2} />" />)
			expect(instance.ParsedChildren[0].props.testProp).toEqual(false)
		})
		test('can evaluate inequality comparison', () => {
			const { instance } = render(<JsxParser jsx='<span testProp={1 != "1"} />' />)
			expect(instance.ParsedChildren[0].props.testProp).toEqual(false)
		})
		test('can evaluate strict equality comparison', () => {
			const { instance } = render(<JsxParser jsx="<span testProp={1 === 1} />" />)
			expect(instance.ParsedChildren[0].props.testProp).toEqual(true)
		})
		test('can evaluate strict inequality comparison', () => {
			const { instance } = render(<JsxParser jsx='<span testProp={1 !== "1"} />' />)
			expect(instance.ParsedChildren[0].props.testProp).toEqual(true)
		})
		test('can execute unary plus operations', () => {
			const { node, instance } = render(<JsxParser jsx="<span testProp={+60}>{ +75 }</span>" />)
			expect(node.childNodes[0].textContent).toEqual('75')
			expect(instance.ParsedChildren[0].props.testProp).toEqual(60)
		})
		test('can execute unary negation operations', () => {
			const { node, instance } = render(<JsxParser jsx="<span testProp={-60}>{ -75 }</span>" />)
			expect(node.childNodes[0].textContent).toEqual('-75')
			expect(instance.ParsedChildren[0].props.testProp).toEqual(-60)
		})
		test('can execute unary NOT operations', () => {
			const { node, instance } = render(<JsxParser jsx='<span testProp={!60}>{ !false && "Yes" }</span>' />)
			expect(node.childNodes[0].textContent).toEqual('Yes')
			expect(instance.ParsedChildren[0].props.testProp).toEqual(false)
		})
		test('can evaluate > operator', () => {
			const { node, instance } = render(<JsxParser jsx='<span testProp={1 > 2}>{1 > 2 || "Nope"}</span>' />)
			expect(node.childNodes[0].textContent).toEqual('Nope')
			expect(instance.ParsedChildren[0].props.testProp).toEqual(false)
		})
		test('can evaluate >= operator', () => {
			const { node, instance } = render(<JsxParser jsx='<span testProp={1 >= 2}>{1 >= 2 || "Nope"}</span>' />)
			expect(node.childNodes[0].textContent).toEqual('Nope')
			expect(instance.ParsedChildren[0].props.testProp).toEqual(false)
		})
		test('can evaluate < operator', () => {
			const { node, instance } = render(<JsxParser jsx='<span testProp={1 < 2}>{2 < 1 || "Nope"}</span>' />)
			expect(node.childNodes[0].textContent).toEqual('Nope')
			expect(instance.ParsedChildren[0].props.testProp).toEqual(true)
		})
		test('can evaluate <= operator', () => {
			const { node, instance } = render(<JsxParser jsx='<span testProp={1 <= 2}>{2 <= 1 || "Nope"}</span>' />)
			expect(node.childNodes[0].textContent).toEqual('Nope')
			expect(instance.ParsedChildren[0].props.testProp).toEqual(true)
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
		test('literal value instance methods', () => {
			const { instance } = render(
				<JsxParser jsx={
					'<span ' +
					'String_startsWith={ "foobar".startsWith("fo") }' +
					'String_endsWith={ "foobar".endsWith("ar") }' +
					'String_includes={ "foobar".includes("ooba") }' +
					'String_substr={ "foobar".substr(1, 2) }' +
					'String_replace={ "foobar".replace("oo", "uu") }' +
					'String_search={ "foobar".search("bar") }' +
					'String_toUpperCase={ "foobar".toUpperCase() }' +
					'String_toLowerCase={ "FOOBAR".toLowerCase() }' +
					'String_trim={ "    foobar     ".trim() }' +
					'Number_toFixed={ 100.12345.toFixed(2) }' +
					'Number_toPrecision={ 123.456.toPrecision(4) }' +
					'Array_includes={ [1, 2, 3].includes(2) }' +
					'Array_join={ [1, 2, 3].join("+") }' +
					'Array_sort={ [3, 1, 2].sort() }' +
					'Array_slice={ [1, 2, 3].slice(1, 2) }' +
					' />'
				}
				/>,
			)
			expect(instance.ParsedChildren[0].props.String_startsWith).toEqual(true)
			expect(instance.ParsedChildren[0].props.String_endsWith).toEqual(true)
			expect(instance.ParsedChildren[0].props.String_includes).toEqual(true)
			expect(instance.ParsedChildren[0].props.String_substr).toEqual('oo')
			expect(instance.ParsedChildren[0].props.String_replace).toEqual('fuubar')
			expect(instance.ParsedChildren[0].props.String_search).toEqual(3)
			expect(instance.ParsedChildren[0].props.String_toUpperCase).toEqual('FOOBAR')
			expect(instance.ParsedChildren[0].props.String_toLowerCase).toEqual('foobar')
			expect(instance.ParsedChildren[0].props.String_trim).toEqual('foobar')
			expect(instance.ParsedChildren[0].props.Number_toFixed).toEqual('100.12')
			expect(instance.ParsedChildren[0].props.Number_toPrecision).toEqual('123.5')
			expect(instance.ParsedChildren[0].props.Array_includes).toEqual(true)
			expect(instance.ParsedChildren[0].props.Array_join).toEqual('1+2+3')
			expect(instance.ParsedChildren[0].props.Array_sort).toEqual([1, 2, 3])
			expect(instance.ParsedChildren[0].props.Array_slice).toEqual([2])
		})
		test('bound property instance methods', () => {
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

	/* TODO: Fix for React 18+: we still eject the script correctly, but onError is not thrown. */
	test.skip('throws on non-simple literal and global object instance methods', () => {
		// Some of these would normally fail silently, set `onError` forces throw for assertion purposes
		expect(() => render(<JsxParser jsx="{ window.scrollTo() }" onError={e => { throw e }} />)).toThrow()
		expect(() => render(<JsxParser jsx='{ (() => { window.location = "badsite" })() }' onError={e => { throw e }} />)).toThrow()
		expect(() => render(<JsxParser jsx='{ document.querySelector("body") }' onError={e => { throw e }} />)).toThrow()
		expect(() => render(<JsxParser jsx='{ document.createElement("script") }' onError={e => { throw e }} />)).toThrow()
		expect(() => render(<JsxParser jsx="{ [1, 2, 3].filter(num => num === 2) }" />)).toThrow()
		expect(() => render(<JsxParser jsx="{ [1, 2, 3].map(num => num * 2) }" />)).toThrow()
		expect(() => render(<JsxParser jsx="{ [1, 2, 3].reduce((a, b) => a + b) }" />)).toThrow()
		expect(() => render(<JsxParser jsx="{ [1, 2, 3].find(num => num === 2) }" />)).toThrow()
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
		it('supports nested jsx inside arrow functions', () => {
			// see
			// https://astexplorer.net/#/gist/fc48b12b8410a4ef779e0477a644bb06/cdbfc8b929b31e11e577dceb88e3a1ee9343f68e
			// for acorn AST
			const { node } = render(
				<JsxParser
					components={{ Custom }}
					bindings={{ items: [1, 2] }}
					jsx="{items.map(item => <Custom><p>{item}</p></Custom>)}"
				/>,
			)
			expect(node.innerHTML).toMatch('<div><p>1</p></div><div><p>2</p></div>')
		})

		it('supports JSX expressions inside arrow functions', () => {
			const { node } = render(
				<JsxParser
					components={{ Custom }}
					bindings={{ items: [{ name: 'Megeara', title: 'Fury' }] }}
					jsx="{items.map(item => <Custom text={item.title}><p>{item.name}</p></Custom>)}"
				/>,
			)
			expect(node.innerHTML).toMatch('<div>Fury<p>Megeara</p></div>')
		})

		it('passes attributes', () => {
			function PropTest(props: { booleanAttribute: boolean }) {
				return `val:${props.booleanAttribute}`
			}
			const { node, instance } = render(
				<JsxParser
					components={{ PropTest }}
					bindings={{
						items: [
							{ name: 'Megeara', friend: true },
							{ name: 'Austerious', friend: false },
						],
					}}
					jsx="{items.map(item => <p><PropTest booleanAttribute={item.friend} /></p>)}"
				/>,
			)
			expect(node.innerHTML).toEqual('<p>val:true</p><p>val:false</p>')
			expect(instance.ParsedChildren?.[0]).toHaveLength(2)
			expect(instance.ParsedChildren[0][0].props.children.props.booleanAttribute).toEqual(true)
			expect(instance.ParsedChildren[0][1].props.children.props.booleanAttribute).toEqual(false)
		})

		it('passes spread attributes', () => {
			function PropTest(props: any) {
				return <>{JSON.stringify(props)}</>
			}
			const { node } = render(
				<JsxParser
					components={{ PropTest }}
					bindings={{
						items: [
							{ name: 'Megeara', friend: true },
						],
					}}
					jsx="{items.map(item => <PropTest {...item} />)}"
				/>,
			)
			expect(node.innerHTML).toEqual('{"name":"Megeara","friend":true}')
		})

		it('supports render props', () => {
			const fakeData = { name: 'from-container' }
			const RenderPropContainer = (props: any) => props.children(fakeData)
			const { node } = render(
				<JsxParser
					renderInWrapper={false}
					components={{ PropTest: RenderPropContainer }}
					jsx="{<PropTest>{(data) => <p>{data.name}</p>}</PropTest>}"
				/>,
			)
			expect(node.outerHTML).toEqual('<p>from-container</p>')
		})
	})
})
