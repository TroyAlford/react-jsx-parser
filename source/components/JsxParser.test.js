import React from 'react'
import TestUtils from 'react-dom/test-utils'
import { mount, shallow } from 'enzyme'
import JsxParser from './JsxParser'

jest.unmock('acorn-jsx')
jest.unmock('./JsxParser')

/* eslint-disable function-paren-newline, no-console, no-underscore-dangle */

// eslint-disable-next-line react/prop-types
const Custom = ({ children = [], className, text }) => (
  <div className={className}>
    {text}
    {children}
  </div>
)

describe('JsxParser Component', () => {
  let parent = null
  let originalConsoleError = null
  let originalJsDomEmit = null

  beforeAll(() => {
    originalConsoleError = console.error
    console.error = jest.fn()

    originalJsDomEmit = window._virtualConsole.emit
    window._virtualConsole.emit = jest.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
    window._virtualConsole.emit = originalJsDomEmit
  })

  beforeEach(() => {
    console.error.mockReset()
    window._virtualConsole.emit.mockReset()
    parent = document.createElement('div')
  })

  function render(element) {
    const wrapper = mount(element, { attachTo: parent })
    return {
      component: wrapper.instance(),
      html:      wrapper.html(),
      parent,
      rendered:  wrapper.getDOMNode(),
    }
  }

  describe('using ternaries', () => {
    it('should handle boolean test value ', () => {
      const { component, rendered } = render(<JsxParser jsx={
      '<p falsyProp={false ? 1 : 0} truthyProp={true ? 1 : 0}>'
        + '(display 1: {true ? 1 : 0}); (display 0: {false ? 1 : 0})'
        + '</p>'
      }
      />)

      expect(rendered.childNodes[0].textContent)
        .toEqual('(display 1: 1); (display 0: 0)')

      expect(component.ParsedChildren[0].props.truthyProp).toBe(1)
      expect(component.ParsedChildren[0].props.falsyProp).toBe(0)
    })

    it('should handle test predicate retruned value ', () => {
      const { rendered } = render(
        <JsxParser
          jsx={'<p>{true && false ? "a" : "b"}</p><p>{false || true ? "a" : "b"}</p>'}
        />
      )

      expect(rendered.childNodes[0].textContent).toEqual('b')
      expect(rendered.childNodes[1].textContent).toEqual('a')
    })
  })

  describe('basic rendering', () => {
    it('renders non-React components', () => {
      const { component, rendered } = render(
        <JsxParser
          jsx={
            '<h1>Header</h1>'
            + '<div class="foo">Foo</div>'
            + '<span class="bar">Bar</span>'
          }
        />
      )

      expect(rendered.classList.contains('jsx-parser')).toBeTruthy()

      expect(component.ParsedChildren).toHaveLength(3)
      expect(rendered.childNodes).toHaveLength(3)

      expect(rendered.childNodes[0].nodeName).toEqual('H1')
      expect(rendered.childNodes[0].textContent).toEqual('Header')

      expect(rendered.childNodes[1].nodeName).toEqual('DIV')
      expect(rendered.childNodes[1].classList.contains('foo')).toBeTruthy()
      expect(rendered.childNodes[1].textContent).toEqual('Foo')

      expect(rendered.childNodes[2].nodeName).toEqual('SPAN')
      expect(rendered.childNodes[2].classList.contains('bar')).toBeTruthy()
      expect(rendered.childNodes[2].textContent).toEqual('Bar')
    })
    it('renders nested components', () => {
      const { component, rendered } = render(
        <JsxParser
          jsx={
            '<div>'
            + 'Outer'
            + '<div>Inner</div>'
            + '</div>'
          }
        />
      )

      expect(rendered.classList.contains('jsx-parser')).toBeTruthy()

      expect(component.ParsedChildren).toHaveLength(1)
      expect(rendered.childNodes).toHaveLength(1)

      const outer = rendered.childNodes[0]
      expect(outer.nodeName).toEqual('DIV')
      expect(outer.childNodes).toHaveLength(2)

      const [text, div] = outer.childNodes
      expect(text.nodeType).toEqual(Node.TEXT_NODE) // Text
      expect(text.textContent).toEqual('Outer')

      expect(div.nodeType).toEqual(Node.ELEMENT_NODE) // Element
      expect(div.nodeName).toEqual('DIV')
      expect(div.textContent).toEqual('Inner')
    })
    it('renders custom components', () => {
      const { component, rendered } = render(
        <JsxParser
          components={{ Custom }}
          jsx={
            '<h1>Header</h1>'
            + '<Custom className="blah" text="Test Text" />'
          }
        />
      )

      expect(rendered.classList.contains('jsx-parser')).toBeTruthy()

      expect(component.ParsedChildren).toHaveLength(2)
      expect(rendered.childNodes).toHaveLength(2)

      expect(rendered.childNodes[0].nodeName).toEqual('H1')
      expect(rendered.childNodes[0].textContent).toEqual('Header')

      const custom = component.ParsedChildren[1]
      expect(custom instanceof Custom)
      expect(custom.props.text).toEqual('Test Text')

      const customHTML = rendered.childNodes[1]
      expect(customHTML.nodeName).toEqual('DIV')
      expect(customHTML.textContent).toEqual('Test Text')
    })
    it('renders custom components with spread operator', () => {
      const first = {
        className: 'blah',
        text:      'Will Be Overwritten',
      }
      const second = {
        innerProps: {
          text: 'Test Text',
        },
      }
      const { component, rendered } = render(
        <JsxParser
          components={{ Custom }}
          bindings={{ first, second }}
          jsx="<Custom {...first} {...second.innerProps} {...{ text: 'Will Not Spread' }} />"
        />
      )

      expect(rendered.classList.contains('jsx-parser')).toBeTruthy()

      expect(component.ParsedChildren).toHaveLength(1)
      expect(rendered.childNodes).toHaveLength(1)

      const custom = component.ParsedChildren[0]
      expect(custom instanceof Custom)
      expect(custom.props.className).toEqual('blah')
      expect(custom.props.text).toEqual('Test Text')

      const customNode = rendered.childNodes[0]
      expect(customNode.nodeName).toEqual('DIV')
      expect(customNode.textContent).toEqual('Test Text')
      const customHTML = rendered.childNodes[0].innerHTML
      expect(customHTML).not.toMatch(/Will Be Overwritten/)
      expect(customHTML).not.toMatch(/Will Not Spread/)
    })
    it('renders custom components with nesting', () => {
      const { component, rendered } = render(
        <JsxParser
          components={{ Custom }}
          jsx={
            '<Custom className="outer" text="outerText">'
            + '<Custom className="inner" text="innerText">'
            + '<div>Non-Custom</div>'
            + '</Custom>'
            + '</Custom>'
          }
        />
      )
      expect(component.ParsedChildren).toHaveLength(1)
      expect(rendered.childNodes).toHaveLength(1)

      const outer = rendered.childNodes[0]
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
    it('handles unrecognized components', () => {
      const { component, rendered } = render(
        <JsxParser
          components={[/* No Components Passed In */]}
          jsx={
            '<Unrecognized class="outer" foo="Foo">'
            + '<Unrecognized class="inner" bar="Bar">'
            + '<div>Non-Custom</div>'
            + '</Unrecognized>'
            + '</Unrecognized>'
          }
        />
      )

      expect(component.ParsedChildren[0].props.foo).toEqual('Foo')
      expect(component.ParsedChildren[0].props.children.props.bar).toEqual('Bar')

      expect(rendered.childNodes).toHaveLength(1)
      const outer = rendered.childNodes[0]
      expect(outer.nodeName).toEqual('UNRECOGNIZED')
      expect(outer.childNodes).toHaveLength(1)

      const inner = outer.childNodes[0]
      expect(inner.nodeName).toEqual('UNRECOGNIZED')
      expect(inner.childNodes).toHaveLength(1)

      const div = inner.childNodes[0]
      expect(div.nodeName).toEqual('DIV')
      expect(div.textContent).toEqual('Non-Custom')

      expect(console.error).toHaveBeenCalledTimes(1)
      expect(console.error.mock.calls[0][0]).toMatch(/unrecognized in this browser/)
    })
    it('renders falsy expressions correctly', () => {
      const jsx = '<b>{false}{undefined}{0}{null}{[]}</b>'
      const wrapper = shallow(<JsxParser jsx={jsx} renderInWrapper={false} />)
      expect(wrapper.html()).toBe('<b>0</b>')
    })
    it('skips over DOCTYPE, html, head, and div if found', () => {
      const { rendered } = render(
        <JsxParser jsx={'<!DOCTYPE html><html><head></head><body><h1>Test</h1><p>Another Text</p></body></html>'} />
      )

      expect(rendered.childNodes).toHaveLength(2)
    })
    it('renders custom elements without requiring closing tags', () => {
      // eslint-disable-next-line react/prefer-stateless-function
      const CustomContent = () => <h1>Custom Content</h1>

      const { rendered } = render(
        <JsxParser
          components={{ CustomContent }}
          jsx="<CustomContent /><p>Text</p>"
        />
      )

      expect(rendered.childNodes).toHaveLength(2)
      expect(rendered.getElementsByTagName('p')).toHaveLength(1)

      expect(rendered.getElementsByTagName('h1')).toHaveLength(1)
      expect(rendered.getElementsByTagName('h1')[0].textContent).toEqual('Custom Content')
    })
    it('renders custom elements without closing tags', () => {
      // eslint-disable-next-line react/prefer-stateless-function
      const CustomContent = () => <h1>Ipsum</h1>
      const CuStomContent = () => <h1>Lorem</h1>

      const { rendered } = render(
        <JsxParser
          components={{ CustomContent, CuStomContent }}
          jsx="<CustomContent /><CuStomContent />"
        />
      )

      expect(rendered.childNodes).toHaveLength(2)
      expect(rendered.getElementsByTagName('h1')).toHaveLength(2)
      expect(rendered.getElementsByTagName('h1')[0].textContent).toEqual('Ipsum')
      expect(rendered.getElementsByTagName('h1')[1].textContent).toEqual('Lorem')
    })
    it('renders custom elements with dot notation tags', () => {
      const Lib = { Custom }
      const { component, rendered } = render(
        <JsxParser
          components={{ Lib }}
          jsx={
            '<h1>Header</h1>'
            + '<Lib.Custom className="blah" text="Test Text" />'
          }
        />
      )

      expect(rendered.classList.contains('jsx-parser')).toBeTruthy()

      expect(component.ParsedChildren).toHaveLength(2)
      expect(rendered.childNodes).toHaveLength(2)

      expect(rendered.childNodes[0].nodeName).toEqual('H1')
      expect(rendered.childNodes[0].textContent).toEqual('Header')

      const custom = component.ParsedChildren[1]
      expect(custom instanceof Custom)
      expect(custom.props.text).toEqual('Test Text')

      const customHTML = rendered.childNodes[1]
      expect(customHTML.nodeName).toEqual('DIV')
      expect(customHTML.textContent).toEqual('Test Text')
    })
    it('renders custom elements with multiple dot notation tags', () => {
      const SubLib = { Custom }
      const Lib = { SubLib }
      const { component, rendered } = render(
        <JsxParser
          components={{ Lib }}
          jsx={
            '<h1>Header</h1>'
            + '<Lib.SubLib.Custom className="blah" text="Test Text" />'
          }
        />
      )

      expect(rendered.classList.contains('jsx-parser')).toBeTruthy()

      expect(component.ParsedChildren).toHaveLength(2)
      expect(rendered.childNodes).toHaveLength(2)

      expect(rendered.childNodes[0].nodeName).toEqual('H1')
      expect(rendered.childNodes[0].textContent).toEqual('Header')

      const custom = component.ParsedChildren[1]
      expect(custom instanceof Custom)
      expect(custom.props.text).toEqual('Test Text')

      const customHTML = rendered.childNodes[1]
      expect(customHTML.nodeName).toEqual('DIV')
      expect(customHTML.textContent).toEqual('Test Text')
    })
    it('outputs no wrapper element when renderInWrapper prop is false', () => {
      render(<JsxParser jsx={'<h1>Foo</h1><hr />'} renderInWrapper={false} />)
      expect(parent.childNodes).toHaveLength(2)

      const [h1, hr] = Array.from(parent.childNodes)
      expect([h1.nodeType, h1.nodeName, h1.textContent])
        .toEqual([Node.ELEMENT_NODE, 'H1', 'Foo'])
      expect([hr.nodeType, hr.nodeName]).toEqual([Node.ELEMENT_NODE, 'HR'])
    })
    it('omits unknown elements and errors if !allowUnknownElements', () => {
      const onError = jest.fn()
      const wrapper = mount(
        <JsxParser
          allowUnknownElements={false}
          jsx={'<foo>Foo</foo><div>div</div><bar>Bar</bar>'}
          onError={onError}
          renderInWrapper={false}
        />
      )
      expect(onError).toHaveBeenCalledTimes(2)
      expect(onError).toHaveBeenCalledWith(expect.stringContaining('<foo> is unrecognized'))
      expect(onError).toHaveBeenCalledWith(expect.stringContaining('<bar> is unrecognized'))
      expect(wrapper.html()).toMatchSnapshot()
    })
  })
  describe('blacklisting & whitelisting', () => {
    it('strips <script src="..."> tags by default', () => {
      const { component, rendered } = render(
        <JsxParser
          jsx={
            '<div>Before</div>'
            + '<script src="http://example.com/test.js"></script>'
            + '<div>After</div>'
          }
        />
      )

      expect(component.ParsedChildren).toHaveLength(2)
      expect(TestUtils.scryRenderedDOMComponentsWithTag(component, 'script')).toHaveLength(0)
      expect(rendered.childNodes).toHaveLength(2)
      expect(parent.getElementsByTagName('script')).toHaveLength(0)
    })
    it('strips <script>...</script> tags by default', () => {
      const { component, rendered } = render(
        <JsxParser
          jsx={
            '<div>Before</div>'
            + '<script>'
            + 'window.alert("This shouldn\'t happen!");'
            + '</script>'
            + '<div>After</div>'
          }
        />
      )

      expect(component.ParsedChildren).toHaveLength(2)
      expect(TestUtils.scryRenderedDOMComponentsWithTag(component, 'script')).toHaveLength(0)
      expect(rendered.childNodes).toHaveLength(2)
      expect(parent.getElementsByTagName('script')).toHaveLength(0)
    })
    it('strips onEvent="..." attributes by default', () => {
      const { component, rendered } = render(
        <JsxParser
          jsx={
            '<div onClick="handleClick()">first</div>'
            + '<div onChange="handleChange()">second</div>'
          }
        />
      )

      expect(component.ParsedChildren).toHaveLength(2)
      expect(rendered.childNodes).toHaveLength(2)
      expect(component.ParsedChildren[0].props.onClick).toBeUndefined()
      expect(rendered.childNodes[0].attributes).toHaveLength(0)
      expect(component.ParsedChildren[1].props.onChange).toBeUndefined()
      expect(rendered.childNodes[1].attributes).toHaveLength(0)
    })
    it('strips custom blacklisted tags and attributes', () => {
      const { component, rendered } = render(
        <JsxParser
          blacklistedTags={['Foo']}
          blacklistedAttrs={['foo', 'prefixed[a-z]*']}
          jsx={
            '<div foo="bar" prefixedFoo="foo" prefixedBar="bar">first</div>'
            + '<Foo>second</Foo>'
          }
        />
      )

      expect(component.ParsedChildren).toHaveLength(1)
      expect(rendered.childNodes).toHaveLength(1)
      expect(component.ParsedChildren[0].props.foo).toBeUndefined()
      expect(component.ParsedChildren[0].props.prefixedFoo).toBeUndefined()
      expect(component.ParsedChildren[0].props.prefixedBar).toBeUndefined()
      expect(rendered.childNodes[0].attributes.foo).toBeUndefined()
      expect(rendered.childNodes[0].attributes.prefixedFoo).toBeUndefined()
      expect(rendered.childNodes[0].attributes.prefixedBar).toBeUndefined()
    })
    it('strips HTML tags if componentsOnly=true', () => {
      // eslint-disable-next-line react/prop-types
      const Simple = ({ children, text }) => <div>{text}{children}</div>
      const { rendered } = render(
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
        />
      )
      expect(rendered.getElementsByTagName('h1')).toHaveLength(0)
      expect(rendered.getElementsByTagName('h2')).toHaveLength(0)
      expect(rendered.getElementsByTagName('div')).toHaveLength(2)
      expect(rendered.textContent.replace(/\s/g, '')).toEqual('ParentChild')
    })
  })
  describe('whitespace', () => {
    it('allows no-whitespace-element named custom components to take whitespace', () => {
      // eslint-disable-next-line react/prop-types
      const tr = ({ children }) => (<div className="tr">{children}</div>)
      const { rendered } = render(<JsxParser components={{ tr }} jsx={'<tr> <a href="/url">Text</a> </tr>'} />)
      expect(rendered.childNodes[0].nodeName).toEqual('DIV')
      expect(rendered.childNodes[0].childNodes).toHaveLength(3)

      const [space1, text, space2] = Array.from(rendered.childNodes[0].childNodes)
      const nodeTypes = [space1, text, space2].map(n => n.nodeType)
      expect(nodeTypes).toEqual([Node.TEXT_NODE, Node.ELEMENT_NODE, Node.TEXT_NODE])
      expect(space1.textContent).toEqual(' ')
      expect(text.textContent).toEqual('Text')
      expect(space2.textContent).toEqual(' ')
    })
    it('leaves a space between elements as-coded', () => {
      const jsx = '<b>first</b> <b>second</b>'
      const wrapper = shallow(<JsxParser jsx={jsx} renderInWrapper={false} />)
      expect(wrapper.html()).toBe(jsx)
    })
    it('keeps line-breaks', () => {
      const jsx = '<code class="markdown"># hello\n\na paragraph\n</code>'
      const wrapper = shallow(<JsxParser jsx={jsx} renderInWrapper={false} />)
      expect(wrapper.html()).toBe(jsx)
    })
    it('handles whitespace correctly', () => {
      const { rendered } = render(
        <JsxParser
          jsx={'\
            <h1>Title</h1>\
            <div class="foo">Bar</div>\
          '}
        />
      )

      // H1
      // Comment Whitespace Comment
      // DIV
      const children = Array.from(rendered.childNodes)
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
    it('keeps non-breaking spaces as such', () => {
      const { rendered } = render(
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
        />
      )

      // Entites are converted to utf sequences
      // The first four paragraphs should contain \u00A0 (utf non-breaking space)
      // The two next paragraphs should contain \u202F (utf narrow non-breaking space)
      // The last paragraph should *not* contain any non breaking spaces
      const children = Array.from(rendered.childNodes)

      expect(children).toHaveLength(7)
      expect(children.every(c => c.nodeType === Node.ELEMENT_NODE))
      expect(children.every(c => c.nodeName === 'P'))

      const last = children.pop()
      expect(children.every(c => c.textContent.match(/[\u00A0]/)))
      expect(last.textContent).not.toMatch(/[\u00A0|\u202F]/)
    })
  })
  describe('prop bindings', () => {
    it('allows void-element named custom components to take children', () => {
      // eslint-disable-next-line react/prop-types
      const link = ({ to, children }) => (<a href={to}>{children}</a>)
      const { rendered } = render(<JsxParser components={{ link }} jsx={'<link to="/url">Text</link>'} />)
      expect(rendered.childNodes[0].nodeName).toEqual('A')
      expect(rendered.childNodes[0].textContent).toEqual('Text')
    })
    it('does not render children for poorly formed void elements', () => {
      const { rendered } = render(
        <JsxParser
          jsx={
            '<img src="/foo.png">'
            + '<div class="invalidChild"></div>'
            + '</img>'
          }
        />
      )

      expect(rendered.childNodes).toHaveLength(1)
      expect(rendered.getElementsByTagName('img')).toHaveLength(1)
      expect(rendered.childNodes[0].innerHTML).toEqual('')
      expect(rendered.childNodes[0].childNodes).toHaveLength(0)

      expect(rendered.getElementsByTagName('div')).toHaveLength(0)
    })
    it('parses childless elements with children = undefined', () => {
      const { component } = render(<JsxParser components={{ Custom }} jsx={'<Custom />'} />)

      expect(component.ParsedChildren).toHaveLength(1)
      expect(component.ParsedChildren[0].props.children).toBeUndefined()
    })
    it('parses implicit boolean props', () => {
      const { component } = render(
        <JsxParser
          components={{ Custom }}
          jsx="<Custom shouldBeTrue shouldBeFalse={false} />"
        />
      )

      expect(component.ParsedChildren).toHaveLength(1)
      expect(component.ParsedChildren[0].props.shouldBeTrue).toBeTruthy()
      expect(component.ParsedChildren[0].props.shouldBeFalse).not.toBeTruthy()
    })
    it('parses bound object values', () => {
      const { component } = render(<JsxParser components={{ Custom }} jsx={'<Custom obj={{ foo: "bar", bar: "foo" }} />'} />)

      expect(component.ParsedChildren).toHaveLength(1)
      expect(component.ParsedChildren[0].props.obj).toEqual({ foo: 'bar', bar: 'foo' })
    })
    it('parses style attributes', () => {
      const { rendered } = render(
        <JsxParser
          jsx={
            '<div style="margin: 0 1px 2px 3px;"></div>'
            + '<div style="padding-left: 45px; padding-right: 1em;"></div>'
          }
        />
      )

      expect(rendered.childNodes).toHaveLength(2)
    })
    it('passes bindings to children', () => {
      const logFn = () => { console.log('Foo!') }
      const { component } = render(
        <JsxParser
          bindings={{
            foo:    'Foo',
            bar:    'Bar',
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
        />
      )

      expect(component.ParsedChildren).toHaveLength(5)
      expect(component.ParsedChildren[0].props).toEqual({ foo: 'Foo', bar: 'Bar' })
      expect(component.ParsedChildren[1].props).toEqual({ foo: 'Foo' })
      expect(component.ParsedChildren[2].props.onClick).toEqual(logFn)
      expect(component.ParsedChildren[3].props).toEqual({ doTheyWork: true })
      expect(component.ParsedChildren[4].props).toEqual({ unresolvable: undefined })
    })
    it('parses array values', () => {
      const { html } = render(
        <JsxParser jsx={'<div>{[1,2,3]}</div>'} renderInWrapper={false} />
      )
      expect(html).toEqual('<div>123</div>')
    })

    it('honors conditional rendering based on bound values', () => {
      const logFn = () => { console.log('Foo!') }
      const { component } = render(
        <JsxParser
          bindings={{
            foo:    'Foo',
            bar:    'Bar',
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
            '<div foo={foo} />'
            + '<span onClick={logFn}>Click Me!</span>'
            + '{nested.objects.work && <div doTheyWork={nested.objects.work} />}'
            + '<div unresolvable={a.bad.binding} />'
          }
        />
      )

      expect(component.ParsedChildren).toHaveLength(4)
      expect(component.ParsedChildren[0].props).toEqual({ foo: 'Foo' })
      expect(component.ParsedChildren[1].props.onClick).toEqual(logFn)
      expect(component.ParsedChildren[2].props).toEqual({ doTheyWork: true })
      expect(component.ParsedChildren[3].props).toEqual({ unresolvable: undefined })
    })
    it('allows use of bound functions in conditionals rendering', () => {
      const logFn = () => { console.log('Foo!') }
      const { component } = render(
        <JsxParser
          bindings={{
            foo:    'Foo',
            bar:    'Bar',
            logFn,
            nested: {
              objects: {
                work:   false,
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
        />
      )

      expect(component.ParsedChildren).toHaveLength(4)
      expect(component.ParsedChildren[0].props).toEqual({ foo: 'Foo' })
      expect(component.ParsedChildren[1].props.onClick).toEqual(logFn)
      expect(component.ParsedChildren[2].props).toEqual({ doTheyWork: false })
      expect(component.ParsedChildren[3].props).toEqual({ unresolvable: undefined })
    })
    it('updates bindings on subsequent renders', () => {
      const wrapper = mount(
        <JsxParser
          bindings={{ isChecked: true }}
          jsx={'<input type="checkbox" checked={isChecked} />'}
        />
      )

      expect(wrapper.find('input')).toHaveLength(1)
      expect(wrapper.find('input').props().checked).toBe(true)
      wrapper.setProps({ bindings: { isChecked: false } })
      expect(wrapper.find('input')).toHaveLength(1)
      expect(wrapper.find('input').props().checked).toBe(false)
    })
    it('will not execute arbitrary javascript', () => {
      window.foo = jest.fn(() => true)
      const wrapper = mount(
        <JsxParser
          jsx={
            '<div>Before {window.foo() && <span>Foo!</span>}</div>'
            + '<div>{Number.isNaN(NaN) && <span>Foo!</span>} After</div>'
          }
        />
      )

      expect(window.foo).toHaveBeenCalledTimes(0)
      expect(wrapper.find('span')).toHaveLength(0)
      expect(wrapper.html()).toMatchSnapshot()
    })
    it('can execute binary mathematical operations', () => {
      const { rendered } = render(<JsxParser jsx={'<span>{ 1 + 2 * 4 / 8 - 1 }</span>'} />)
      expect(rendered.childNodes[0].textContent).toEqual('1')
    })
    it('can execute unary plus operations', () => {
      const { rendered, component } = render(<JsxParser jsx={'<span testProp={+60}>{ +75 }</span>'} />)
      expect(rendered.childNodes[0].textContent).toEqual('75')
      expect(component.ParsedChildren[0].props.testProp).toEqual(60)
    })
    it('can execute unary negation operations', () => {
      const { rendered, component } = render(<JsxParser jsx={'<span testProp={-60}>{ -75 }</span>'} />)
      expect(rendered.childNodes[0].textContent).toEqual('-75')
      expect(component.ParsedChildren[0].props.testProp).toEqual(-60)
    })
    it('can execute unary NOT operations', () => {
      const { rendered, component } = render(<JsxParser jsx={'<span testProp={!60}>{ !false }</span>'} />)
      expect(rendered.childNodes[0].textContent).toEqual('true')
      expect(component.ParsedChildren[0].props.testProp).toEqual(false)
    })
  })
  describe('React.Children.only()', () => {
    // eslint-disable-next-line react/prop-types
    const OnlyOne = ({ children }) => (
      <div>{React.Children.only(children)}</div>
    )
    it('passes with a single child', () => {
      expect(() => render(
        <JsxParser
          components={{ OnlyOne }}
          jsx={'<OnlyOne><h1>Ipsum</h1></OnlyOne>'}
        />
      )).not.toThrow()
    })
    it('fails with multiple children', () => {
      // Multiple children passed - should throw
      expect(() => render(
        <JsxParser
          components={{ OnlyOne }}
          jsx={'<OnlyOne><h1>Ipsum</h1><h2>Foo</h2></OnlyOne>'}
        />
      )).toThrow()
    })
  })
})
