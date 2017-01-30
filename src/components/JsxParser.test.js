import * as React from 'react'
import * as ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'
import JsxParser from './JsxParser'

jest.unmock('./JsxParser')

// eslint-disable-next-line react/prefer-stateless-function
class Custom extends React.Component {
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
        jsx={'\
          <h1>Header</h1>\
          <div class="foo">Foo</div>\
          <span class="bar">Bar</span>\
        '}
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
        jsx={`
          <div>\
            Outer\
            <div>Inner</div>\
          </div>\
        `}
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
        components={[Custom]}
        jsx={'\
          <h1>Header</h1>\
          <Custom className="blah" text="Test Text" />\
        '}
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
        components={[Custom]}
        jsx={'\
          <Custom className="outer" text="outerText">\
            <Custom className="inner" text="innerText">\
              <div>Non-Custom</div>\
            </Custom>\
          </Custom>\
        '}
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
    expect(divChildren).toHaveLength(3)
    expect(divChildren.map(n => n.nodeType))
      .toEqual([8, 3, 8])
    expect(divChildren[1].textContent).toEqual('Non-Custom')
  })

  it('handles unrecognized components', () => {
    const origConsoleError = console.error
    console.error = jest.fn()
    const { component, rendered } = render(
      <JsxParser
        components={[/* No Components Passed In */]}
        jsx={'\
          <Unrecognized class="outer" foo="Foo">\
            <Unrecognized class="inner" bar="Bar">\
              <div>Non-Custom</div>\
            </Unrecognized>\
          </Unrecognized>\
        '}
      />
    )

    expect(component.ParsedChildren).toHaveLength(1)
    expect(component.ParsedChildren[0].props.foo).toEqual('Foo')
    expect(component.ParsedChildren[0].props.children).toHaveLength(1)
    expect(component.ParsedChildren[0].props.children[0].props.bar).toEqual('Bar')
    expect(component.ParsedChildren[0].props.children[0].props.children).toHaveLength(1)

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

  it('strips <script src="..."> tags by default', () => {
    const { component, rendered } = render(
      <JsxParser
        jsx={'\
          <div>Before</div>\
          <script src="http://example.com/test.js"></script>\
          <div>After</div>\
        '}
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
        jsx={'\
          <div>Before</div>\
          <script>\
            window.alert("This shouldn\'t happen!");\
          </script>\
          <div>After</div>\
        '}
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
        jsx={'\
          <div onClick="handleClick()">first</div>\
          <div onChange="handleChange()">second</div>\
        '}
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
        blacklistedTags={['Foo']} blacklistedAttrs={['foo', 'prefixed[a-z]*']}
        jsx={'\
          <div foo="bar" prefixedFoo="foo" prefixedBar="bar">first</div>\
          <Foo>second</Foo>\
        '}
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
})
