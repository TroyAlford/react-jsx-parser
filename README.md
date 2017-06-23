# react-jsx-parser ![CircleCI][circle-ci] ![Version][npm-version] ![License][npm-license]

[circle-ci]: https://img.shields.io/circleci/project/github/TroyAlford/react-jsx-parser/master.svg
[npm-version]: https://img.shields.io/npm/v/react-jsx-parser.svg
[npm-license]: https://img.shields.io/npm/l/react-jsx-parser.svg

A React component which can parse JSX and output rendered React Components.

## Basic Usage - Injecting JSX as a String
```javascript
import * as React from 'react'
import JsxParser from 'react-jsx-parser'

class InjectableComponent extends React.Component {
  // ... inner workings of InjectableComponent
}

class MyComponent extends React.Component {
  render() {
    /* Pull out parent props which shouldn't be bound,
       then pass the rest as `bindings` to all children */
    const { prop1, prop2, ...bindings } = this.props

    return (
      <JsxParser
        bindings={bindings}
        components={[InjectableComponent]}
        jsx={'\
          <h1>Header</h1>\
          <InjectableComponent></InjectableComponent>\
        '}
      />
    )
  }
}
```

Because `InjectableComponent` is passed into the `JsxParser.props.components` prop, it is treated as a known element type, and created using `React.createElement(...)` when parsed out of the JSX.

## Advanced Usage - Injecting Dynamic JSX
```javascript
// Import desired set of components
import ComponentA from 'somePackage/ComponentA'
import ComponentB from 'somePackage/ComponentB'
import ComponentC from 'somePackage/ComponentC'
import ComponentD from 'somePackage/ComponentD'
...
// Load an HTML or XML fragment from a remote API
const dynamicHtml = loadRemoteData()
...
// Within your component's render method, bind these components and the fragment as props
<JsxParser
  bindings={bindings}
  components={[ComponentA, ComponentB, ComponentC, ComponentD]}
  jsx={dynamicHtml}
/>
```

Any `ComponentA`, `ComponentB`, `ComponentC` or `ComponentD` tags in the dynamically loaded XML/HTML fragment will be rendered as React components. Any unrecognized tags will be handled by `React`.

_Note:_ Non-standard tags may throw errors and warnings, but will typically be rendered in a reasonable way.

## PropTypes / Settings
```javascript
JsxParser.defaultProps = {
  bindings: {}, // by default, do not add any additional bindings

  // by default, just removes `on*` attributes (onClick, onChange, etc.)
  // values are used as a regex to match property names
  blacklistedAttrs: ['on[a-z]*'], //= /on[a-z]*/gi

  // by default, removes all <script> tags
  blacklistedTags:  ['script'],

  // Components must extend React.Component or React.PureComponent
  components: [],

  jsx: '',
}
```

## Known Limitations
* Custom elements must have a closing tag.
