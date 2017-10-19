import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-dom/test-utils'
import JsxParser from './JsxParser'

jest.unmock('acorn-jsx')
jest.unmock('./JsxParser')

// eslint-disable-next-line react/prefer-stateless-function
class Custom extends Component {
  /* eslint-disable react/prop-types */

  render() {
    return (
      <div className={this.props.className}>
        {this.props.text}
        {this.props.children || []}
      </div>
    )
  }
}

describe('JsxParser Component', () => {
  let parent = null

  beforeEach(() => {
    parent = document.createElement('div')
  })

  function render(element) {
    // eslint-disable-next-line react/no-render-return-value
    const component = ReactDOM.render(element, parent)
    return {
      parent,
      component,
      // eslint-disable-next-line react/no-find-dom-node
      rendered: ReactDOM.findDOMNode(component),
    }
  }

  it('renders non-React components', () => {
    const { component, rendered } = render(
      <JsxParser
        jsx={
          '<h1>Header</h1>' +
          '<div class="foo">Foo</div>' +
          '<span class="bar">Bar</span>'
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
          '<div>' +
            'Outer' +
            '<div>Inner</div>' +
          '</div>'
        }
      />
    )

    expect(rendered.classList.contains('jsx-parser')).toBeTruthy()

    expect(component.ParsedChildren).toHaveLength(1)
    expect(rendered.childNodes).toHaveLength(1)

    const outer = rendered.childNodes[0]
    expect(outer.nodeName).toEqual('DIV')

    // React will wrap the Outer text with comments:
    // <!-- react-text: {key} -->
    // Outer
    // <!-- /react-text -->
    // <div>Inner</div>

    expect(outer.childNodes).toHaveLength(4)
    expect(outer.childNodes[0].nodeType).toEqual(8) // Comment
    expect(outer.childNodes[0].textContent).toMatch(/react-text/)

    expect(outer.childNodes[1].nodeType).toEqual(3) // Text
    expect(outer.childNodes[1].textContent).toEqual('Outer')

    expect(outer.childNodes[2].nodeType).toEqual(8) // Comment
    expect(outer.childNodes[2].textContent).toMatch(/\/react-text/)

    expect(outer.childNodes[3].nodeType).toEqual(1) // Element
    expect(outer.childNodes[3].nodeName).toEqual('DIV')
    expect(outer.childNodes[3].textContent).toEqual('Inner')
  })

  it('renders custom components', () => {
    const { component, rendered } = render(
      <JsxParser
        components={{ Custom }}
        jsx={
          '<h1>Header</h1>' +
          '<Custom className="blah" text="Test Text" />'
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

  it('renders custom components with nesting', () => {
    const { component, rendered } = render(
      <JsxParser
        components={{ Custom }}
        jsx={
          '<Custom className="outer" text="outerText">' +
            '<Custom className="inner" text="innerText">' +
              '<div>Non-Custom</div>' +
            '</Custom>' +
          '</Custom>'
        }
      />
    )
    expect(component.ParsedChildren).toHaveLength(1)
    expect(rendered.childNodes).toHaveLength(1)

    const outer = rendered.childNodes[0]
    expect(outer.nodeName).toEqual('DIV')

    const outerChildren = Array.from(outer.childNodes)
    expect(outerChildren.map(n => n.nodeType))
      .toEqual([8, 3, 8, 1])
    expect(outerChildren[1].textContent).toEqual('outerText')

    const inner = outer.childNodes[3]
    expect(inner.nodeName).toEqual('DIV')

    const innerChildren = Array.from(inner.childNodes)
    expect(innerChildren.map(n => n.nodeType))
      .toEqual([8, 3, 8, 1])
    expect(innerChildren[1].textContent).toEqual('innerText')

    const div = inner.childNodes[3]
    expect(div.nodeName).toEqual('DIV')

    const divChildren = Array.from(div.childNodes)
    expect(divChildren).toHaveLength(1)
    expect(divChildren[0].nodeType).toEqual(3)
    expect(divChildren[0].textContent).toEqual('Non-Custom')
  })

  it('handles unrecognized components', () => {
    /* eslint-disable no-console */
    const origConsoleError = console.error
    console.error = jest.fn()
    const { component, rendered } = render(
      <JsxParser
        components={[/* No Components Passed In */]}
        jsx={
          '<Unrecognized class="outer" foo="Foo">' +
            '<Unrecognized class="inner" bar="Bar">' +
              '<div>Non-Custom</div>' +
            '</Unrecognized>' +
          '</Unrecognized>'
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

    expect(console.error).toHaveBeenCalledTimes(2)
    expect(console.error.mock.calls[0][0]).toMatch(/Unknown prop `foo` on <Unrecognized> tag./)
    expect(console.error.mock.calls[1][0]).toMatch(/Unknown prop `bar` on <Unrecognized> tag./)

    console.error = origConsoleError
  })

  it('passes bindings to children', () => {
    const { component } = render(
      <JsxParser
        bindings={{ foo: 'Foo', bar: 'Bar' }}
        components={{ Custom }}
        jsx={
          '<Custom bar="Baz"></Custom>' +
          '<div foo="Fu"></div>'
        }
      />
    )

    expect(component.ParsedChildren).toHaveLength(2)
    expect(component.ParsedChildren[0].props).toEqual({
      foo: 'Foo', // from `bindings`
      bar: 'Baz', // from jsx attributes (takes precedence)
    })

    // The <div> should receive `bindings`, too
    expect(component.ParsedChildren[1].props).toEqual({
      foo: 'Fu',  // from jsx attributes (takes precedence)
      bar: 'Bar', // from `bindings`
    })
  })

  it('strips <script src="..."> tags by default', () => {
    const { component, rendered } = render(
      <JsxParser
        jsx={
          '<div>Before</div>' +
          '<script src="http://example.com/test.js"></script>' +
          '<div>After</div>'
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
          '<div>Before</div>' +
          '<script>' +
            'window.alert("This shouldn\'t happen!");' +
          '</script>' +
          '<div>After</div>'
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
          '<div onClick="handleClick()">first</div>' +
          '<div onChange="handleChange()">second</div>'
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

  it('parses childless elements with children = undefined', () => {
    const { component } = render(
      <JsxParser components={{ Custom }} jsx={'<Custom />'} />
    )

    expect(component.ParsedChildren).toHaveLength(1)
    expect(component.ParsedChildren[0].props.children).toBeUndefined()
  })

  it('parses bound object values', () => {
    const { component } = render(
      <JsxParser components={{ Custom }} jsx={'<Custom obj={{ foo: "bar" }} />'} />
    )

    expect(component.ParsedChildren).toHaveLength(1)
    expect(component.ParsedChildren[0].props.obj).toEqual({ foo: 'bar' })
  })

  it('strips custom blacklisted tags and attributes', () => {
    const { component, rendered } = render(
      <JsxParser
        blacklistedTags={['Foo']}
        blacklistedAttrs={['foo', 'prefixed[a-z]*']}
        jsx={
          '<div foo="bar" prefixedFoo="foo" prefixedBar="bar">first</div>' +
          '<Foo>second</Foo>'
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
    expect(rendered.childNodes).toHaveLength(5)
    expect(rendered.childNodes[0].nodeType).toEqual(1) // Element
    expect(rendered.childNodes[0].nodeName).toEqual('H1')
    expect(rendered.childNodes[4].nodeType).toEqual(1) // Element
    expect(rendered.childNodes[4].nodeName).toEqual('DIV')

    expect(rendered.childNodes[1].nodeType).toEqual(8) // Comment
    expect(rendered.childNodes[2].nodeType).toEqual(3) // Text
    expect(rendered.childNodes[3].nodeType).toEqual(8) // Comment
  })

  it('handles style attributes gracefully', () => {
    const { rendered } = render(
      <JsxParser
        jsx={
          '<div style="margin: 0 1px 2px 3px;"></div>' +
          '<div style="padding-left: 45px; padding-right: 1em;"></div>'
        }
      />
    )

    expect(rendered.childNodes).toHaveLength(2)
  })

  it('handles implicit boolean props correctly', () => {
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

  it('does not render children for poorly formed void elements', () => {
    const { rendered } = render(
      <JsxParser
        jsx={
          '<img src="/foo.png">' +
            '<div class="invalidChild"></div>' +
          '</img>'
        }
      />
    )

    expect(rendered.childNodes).toHaveLength(1)
    expect(rendered.getElementsByTagName('img')).toHaveLength(1)
    expect(rendered.childNodes[0].innerHTML).toEqual('')
    expect(rendered.childNodes[0].childNodes).toHaveLength(0)

    expect(rendered.getElementsByTagName('div')).toHaveLength(0)
  })

  it('does render custom element without closing tag', () => {
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

  it('does render custom element without closing tag', () => {
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

  it('skips over DOCTYPE, html, head, and div if found', () => {
    const { rendered } = render(
      <JsxParser
        jsx={'<!DOCTYPE html><html><head></head><body><h1>Test</h1><p>Another Text</p></body></html>'}
      />
    )

    expect(rendered.childNodes).toHaveLength(2)
  })

  const OnlyOne = ({ children }) => (
    <div>{React.Children.only(children)}</div>
  )

  it('renders only one children without throwing', () => {
    expect(() => render(
      <JsxParser
        components={{ OnlyOne }}
        jsx={'<OnlyOne><h1>Ipsum</h1></OnlyOne>'}
      />
      )
    ).not.toThrow()
  })

  it('throws with more than one child', () => {
    expect(() => render(
      <JsxParser
        components={{ OnlyOne }}
        jsx={'<OnlyOne><h1>Ipsum</h1><h1>Ipsum</h1></OnlyOne>'}
      />
      )
    ).toThrow()
  })

  it('allows void-element named custom components to take children', () => {
    const link = ({ to, children }) => (<a href={to}>{children}</a>)
    const { rendered } = render(
      <JsxParser components={{ link }} jsx={'<link to="/url">Text</link>'} />
    )
    expect(rendered.childNodes[0].nodeName).toEqual('A')
    expect(rendered.childNodes[0].textContent).toEqual('Text')
  })

  it('allows no-whitespace-element named custom components to take whitespace', () => {
    const tr = ({ children }) => (<div className="tr">{children}</div>)
    const { rendered } = render(
      <JsxParser components={{ tr }} jsx={'<tr> <a href="/url">Text</a> </tr>'} />
    )
    expect(rendered.childNodes[0].nodeName).toEqual('DIV')
    expect(rendered.childNodes[0].childNodes).toHaveLength(7)

    const nodeTypes = Array.from(rendered.childNodes[0].childNodes).map(cn => cn.nodeType)
    expect(nodeTypes).toEqual([8, 3, 8, 1, 8, 3, 8])
    expect(rendered.childNodes[0].childNodes[1].textContent).toEqual(' ')
    expect(rendered.childNodes[0].childNodes[3].textContent).toEqual('Text')
    expect(rendered.childNodes[0].childNodes[5].textContent).toEqual(' ')
  })
})
