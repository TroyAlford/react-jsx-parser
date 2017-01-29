'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _camelCase = require('../helpers/camelCase');

var _camelCase2 = _interopRequireDefault(_camelCase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NODE_TYPE = {
  1: 'Element',
  3: 'Text',
  7: 'Processing Instruction',
  8: 'Comment',
  9: 'Document',
  10: 'Document Type',
  11: 'Document Fragment',

  /* Deprecated Nodes */
  2: 'Attribute (Deprecated)',
  4: 'CData (Deprecated)',
  5: 'XML Entity Reference (Deprecated)',
  6: 'XML Entity (Deprecated)',
  12: 'XML Notation (Deprecated)'
};

var Node = {
  Element: 1,
  Text: 3
};
var parser = new DOMParser();

var JsxParser = function (_Component) {
  _inherits(JsxParser, _Component);

  function JsxParser(props) {
    _classCallCheck(this, JsxParser);

    var _this = _possibleConstructorReturn(this, (JsxParser.__proto__ || Object.getPrototypeOf(JsxParser)).call(this, props));

    _this.parseJSX.bind(_this);
    _this.parseNode.bind(_this);

    _this.ParsedChildren = _this.parseJSX(props.jsx || '');
    return _this;
  }

  _createClass(JsxParser, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(props) {
      this.ParsedChildren = this.parseJSX(props.jsx || '');
    }
  }, {
    key: 'parseJSX',
    value: function parseJSX(jsx) {
      if (!jsx) return [];

      var wrapped = '<!DOCTYPE html><html><body>' + jsx + '</body></html>';
      var doc = parser.parseFromString(wrapped, 'text/html');
      if (!doc) return [];

      var body = doc.getElementsByTagName('body')[0];
      if (!body || body.nodeName.toLowerCase() === 'parseerror') return [];

      var components = this.props.components.reduce(function (map, type) {
        return _extends({}, map, _defineProperty({}, type.constructor.name, type));
      }, {});

      return this.parseNode(doc.body.childNodes || [], components);
    }
  }, {
    key: 'parseNode',
    value: function parseNode(node) {
      var _this2 = this;

      var components = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var key = arguments[2];

      if (node instanceof NodeList || Array.isArray(node)) return Array.from(node) // handle nodeList or []
      .map(function (child, key) {
        return _this2.parseNode(child, components, key);
      }).filter(function (child) {
        return child;
      }); // remove falsy nodes

      switch (node.nodeType) {
        case Node.Text:
          // Text node. Collapse whitespace and return it as a String.
          return ('textContent' in node ? node.textContent : node.nodeValue || '').replace(/\w/g, ' ').replace(/  /g, ' ').trim();

        case Node.Element:
          // Element node. Parse its Attributes and Children, then call createElement
          return _react2.default.createElement(components[node.nodeName] || node.nodeName, this.parseAttrs(node.attributes, key), this.parseNode(node.childNodes, components));

        default:
          console.warn('JsxParser encountered a ' + NODE_TYPE[node.nodeType] + ' node, and discarded it.');
      }
    }
  }, {
    key: 'parseAttrs',
    value: function parseAttrs(attrs, key) {
      var props = { key: key };
      if (!attrs || !attrs.length) return props;

      return Array.from(attrs).reduce(function (current, attr) {
        var name = attr.name,
            value = attr.value;

        if (value === '') value = true;
        if (name.substring(0, 2) === 'on') value = new Function(value); // eslint-disable-line no-new-func
        if (name === 'class') name = 'className';

        return _extends({}, current, _defineProperty({}, (0, _camelCase2.default)(name), value));
      }, props);
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { className: 'jsx-parser' },
        this.ParsedChildren
      );
    }
  }]);

  return JsxParser;
}(_react.Component);

exports.default = JsxParser;


JsxParser.propTypes = {
  components: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.oneOf([_react2.default.PropTypes.instanceOf(_react2.default.Component), _react2.default.PropTypes.instanceOf(_react2.default.PureComponent)])),
  jsx: _react2.default.PropTypes.string
};
JsxParser.defaultProps = {
  components: [],
  jsx: ''
};
