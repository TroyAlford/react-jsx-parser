jest.unmock('./JsxParser')

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Simulate } from 'react-addons-test-utils'
import JsxParser from './JsxParser'

describe('JsxParser Component', () => {
  let parent = null

  beforeEach(() => {
    parent = document.createElement('div')
  })

  function render(element) {
    const component = ReactDOM.render(element, parent)
    return {
      parent, component,
      rendered: ReactDOM.findDOMNode(component),
    }
  }

  it('renders non-React components', () => {
    const { component, rendered } = render(
      <JsxParser jsx={'\
        <h1>Header</h1>\
        <div class="foo">Foo</div>\
        <span class="bar">Bar</span>\
      '} />
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
      <JsxParser jsx={`
        <div>\
          Outer\
          <div>Inner</div>\
        </div>\
      `} />
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
      <JsxParser components={[Custom]}jsx={`\
        <h1>Header</h1>\
        <Custom className="blah" text="Test Text" />\
      `} />
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
})

class Custom extends React.Component {
  render() {
    return (
      <div className={this.props.className}>
        {this.props.text}
      </div>
    )
  }
}
