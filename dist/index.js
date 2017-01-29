'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NODE_TYPES = undefined;

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

var NODE_TYPES = exports.NODE_TYPES = {
  ELEMENT: 1,
  TEXT: 3,

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

var ATTRIBUTES = {
  'class': 'className',
  'for': 'htmlFor'
};

var parser = new DOMParser();

var warnParseErrors = function warnParseErrors(doc) {
  var errors = Array.from(doc.documentElement.childNodes);
  console.warn('Unable to parse jsx. Found ' + errors.length + ' error(s):');

  var warn = function warn(node, indent) {
    if (node.childNodes.length) Array.from(node.childNodes).forEach(function (n) {
      return warn(n, indent.concat(' '));
    });

    console.warn(indent + '==> ' + node.nodeValue);
  };

  errors.forEach(function (e) {
    return warn(e, ' ');
  });
};

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
    value: function parseJSX(rawJSX) {
      if (!rawJSX || typeof rawJSX !== 'string') return [];

      var jsx = this.props.blacklistedTags.reduce(function (raw, tag) {
        return raw.replace(new RegExp('(</?)' + tag, 'ig'), '$1REMOVE');
      }, rawJSX);

      var wrapped = '\n      <?xml version="1.0" encoding="UTF-8"?>      <xml>' + jsx + '</xml>    ';
      var doc = parser.parseFromString(wrapped, 'application/xml');
      if (!doc) return [];

      Array.from(doc.getElementsByTagName('REMOVE')).forEach(function (tag) {
        return tag.parentNode.removeChild(tag);
      });

      var xml = doc.getElementsByTagName('xml')[0];
      if (!xml || xml.nodeName.toLowerCase() === 'parseerror') {
        warnParseErrors(doc);
        return [];
      }

      var components = this.props.components.reduce(function (map, type) {
        return _extends({}, map, _defineProperty({}, type.prototype.constructor.name, type));
      }, {});

      return this.parseNode(xml.childNodes || [], components);
    }
  }, {
    key: 'parseNode',
    value: function parseNode(node) {
      var _this2 = this;

      var components = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var key = arguments[2];

      if (node instanceof NodeList || Array.isArray(node)) {
        return Array.from(node) // handle nodeList or []
        .map(function (child, key) {
          return _this2.parseNode(child, components, key);
        }).filter(function (child) {
          return child;
        }); // remove falsy nodes
      }

      switch (node.nodeType) {
        case NODE_TYPES.TEXT:
          // Text node. Collapse whitespace and return it as a String.
          return ('textContent' in node ? node.textContent : node.nodeValue || '').replace(/\s{2,}/g, ' ').trim();

        case NODE_TYPES.ELEMENT:
          // Element node. Parse its Attributes and Children, then call createElement
          return _react2.default.createElement(components[node.nodeName] || node.nodeName, this.parseAttrs(node.attributes, key), this.parseNode(node.childNodes, components));

        default:
          console.warn('JsxParser encountered a(n) ' + NODE_TYPES[node.nodeType] + ' node, and discarded it.');
          return null;
      }
    }
  }, {
    key: 'parseAttrs',
    value: function parseAttrs(attrs, key) {
      var props = { key: key };
      if (!attrs || !attrs.length) return props;

      var blacklist = this.props.blacklistedAttrs;

      return Array.from(attrs).filter(function (attr) {
        return !blacklist.map(function (mask) {
          return (
            // If any mask matches, it will return a non-null value
            attr.name.match(new RegExp(mask, 'gi'))
          );
        }).filter(function (match) {
          return match !== null;
        }).length;
      }).reduce(function (current, attr) {
        var name = attr.name,
            value = attr.value;

        if (value === '') value = true;
        if (name.substring(0, 2) === 'on') value = new Function(value); // eslint-disable-line no-new-func

        name = ATTRIBUTES[name.toLowerCase()] || (0, _camelCase2.default)(name);

        return _extends({}, current, _defineProperty({}, name, value));
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
  allowScripts: _react2.default.PropTypes.bool,
  blacklistedAttrs: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string),
  blacklistedTags: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string),
  components: function components(props, propName, componentName) {
    if (!Array.isArray(props[propName])) return new Error(propName + ' must be an Array of Components.');

    var passes = true;
    props[propName].forEach(function (component) {
      if (!component.prototype instanceof _react2.default.Component && !component.prototype instanceof _react2.default.PureComponent) passes = false;
    });

    return passes ? null : new Error(propName + ' must contain only Subclasses of React.Component or React.PureComponent.');
  },
  jsx: _react2.default.PropTypes.string
};
JsxParser.defaultProps = {
  allowScripts: false,
  blacklistedAttrs: ['on[a-z]*'],
  blacklistedTags: ['script'],
  components: [],
  jsx: ''
};
