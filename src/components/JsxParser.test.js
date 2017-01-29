jest.unmock('./JsxParser')

import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Simulate } from 'react-addons-test-utils'
import JsxParser from './JsxParser'

describe('JsxParser Component', () => {
  function render(element) {
    const parent = document.createElement('div')
    const component = ReactDOM.render(element, parent)
    return {
      parent, component,
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

    expect(component.ParsedChildren).toHaveLength(3)
    expect(rendered.classList.contains('jsx-parser')).toBeTruthy()
    // console.log(rendered.children)
    // expect(rendered.children).toHaveLength(3)
  })
})
