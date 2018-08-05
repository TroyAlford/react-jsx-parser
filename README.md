# react-jsx-parser [![CircleCI][circle-ci-badge]](https://circleci.com/gh/TroyAlford/react-jsx-parser) [![Version][npm-version]][npm-link] [![NPM Downloads][npm-downloads]][npm-link] [![License][npm-license]](https://github.com/TroyAlford/react-jsx-parser/blob/master/LICENSE)

[circle-ci-badge]: https://img.shields.io/circleci/project/github/TroyAlford/react-jsx-parser/master.svg
[npm-version]: https://img.shields.io/npm/v/react-jsx-parser.svg
[npm-downloads]: https://img.shields.io/npm/dt/react-jsx-parser.svg
[npm-license]: https://img.shields.io/npm/l/react-jsx-parser.svg
[npm-link]: https://www.npmjs.com/package/react-jsx-parser

A React component which can parse JSX and output rendered React Components.

## Basic Usage - Injecting JSX as a String
```javascript
import React from 'react'
import JsxParser from 'react-jsx-parser'
import Library from 'someLibrary'

class InjectableComponent extends Component {
  static defaultProps = {
    eventHandler: () => {}
  }
  // ... inner workings of InjectableComponent
}

const MyComponent = () => (
  <JsxParser
    bindings={{
      myEventHandler: () => { /* ... do stuff ... */ }
    }}
    components={{ InjectableComponent, Library }}
    jsx={`
      <h1>Header</h1>
      <InjectableComponent eventHandler={myEventHandler} />
      <Library.SomeComponent />
    `}
  />
)
```

Because `InjectableComponent` is passed into the `JsxParser.props.components` prop, it is treated as a known element type, and created using `React.createElement(...)` when parsed out of the JSX.

You can also pass a set of components into the `JsxParser.props.components` prop, and use it in JSX with dot notation.

## Advanced Usage - Injecting Dynamic JSX
```javascript
// Import desired set of components
import { ComponentA, ComponentB } from 'somePackage/Components'
import ComponentC from 'somePackage/ComponentC'
import ComponentD from 'somePackage/ComponentD'
...
// Load an HTML or XML fragment from a remote API
const dynamicHtml = loadRemoteData()
...
// Within your component's render method, bind these components and the fragment as props
<JsxParser
  bindings={bindings}
  components={{ ComponentA, ComponentB, ComponentC, ComponentD }}
  jsx={dynamicHtml}
/>
```

Any `ComponentA`, `ComponentB`, `ComponentC` or `ComponentD` tags in the dynamically loaded XML/HTML fragment will be rendered as React components. Any unrecognized tags will be handled by `React`.

_Note:_ Non-standard tags may throw errors and warnings, but will typically be rendered in a reasonable way.

## PropTypes / Settings
```javascript
JsxParser.defaultProps = {
  // if false, unrecognized elements like <foo> are omitted and reported via onError
  allowUnknownElements: true, // by default, allow unrecognized elements

  bindings: {}, // by default, do not add any additional bindings

  // by default, just removes `on*` attributes (onClick, onChange, etc.)
  // values are used as a regex to match property names
  blacklistedAttrs: [/^on.+/i],

  // by default, removes all <script> tags
  blacklistedTags:  ['script'],

  // an object map of component tag-names to their definitions - see above for examples
  // components must extend React.Component, React.PureComponent, or be a Function
  components: {},

  componentsOnly: false, // non-component HTML tags are allowed by default, omitted if true

  jsx: '', // the jsx string to be parsed & rendered

  onError: () => {}, // if specified, any rendering errors are reported via this method

  showWarnings: false, // if true showWarnings, rendering errors are output with console.warn

  renderInWrapper: true, // if false, the HTML output will have no <div> wrapper
}
```
