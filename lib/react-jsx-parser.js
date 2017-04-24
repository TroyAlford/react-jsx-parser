(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define("react-jsx-parser", ["react"], factory);
	else if(typeof exports === 'object')
		exports["react-jsx-parser"] = factory(require("react"));
	else
		root["react-jsx-parser"] = factory(root["react"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_5__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = camelCase;
function camelCase(string) {
  return string.replace(/([A-Z])([A-Z])/g, '$1 $2').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[^a-zA-Z\u00C0-\u00ff]/g, ' ').toLowerCase().split(' ').filter(function (value) {
    return value;
  }).map(function (s, i) {
    return i > 0 ? s[0].toUpperCase() + s.slice(1) : s;
  }).join('');
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  class: 'className',
  for: 'htmlFor',
  maxlength: 'maxLength',

  colspan: 'colSpan',
  rowspan: 'rowSpan'
};

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  ELEMENT: 1,
  TEXT: 3,
  PROCESSING_INSTRUCTION: 7,
  COMMENT: 8,
  DOCUMENT: 9,
  DOCUMENT_TYPE: 10,
  DOCUMENT_FRAGMENT: 11,

  1: 'Element',
  3: 'Text',
  7: 'Processing Instruction',
  8: 'Comment',
  9: 'Document',
  10: 'Document Type',
  11: 'Document Fragment',

  /* Deprecated Nodes */
  ATTRIBUTE: 2,
  CDATA: 4,
  XML_ENTITY_REFERENCE: 5,
  XML_ENTITY: 6,
  XML_NOTATION: 12,

  2: 'Attribute (Deprecated)',
  4: 'CData (Deprecated)',
  5: 'XML Entity Reference (Deprecated)',
  6: 'XML Entity (Deprecated)',
  12: 'XML Notation (Deprecated)'
};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canHaveChildren = canHaveChildren;
exports.canHaveWhitespace = canHaveWhitespace;
var VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr'];

var NO_WHITESPACE = ['table', 'tbody', 'tfoot', 'thead', 'tr'];

exports.default = VOID_ELEMENTS;
function canHaveChildren(tagName) {
  return VOID_ELEMENTS.indexOf(tagName.toLowerCase()) === -1;
}
function canHaveWhitespace(tagName) {
  return NO_WHITESPACE.indexOf(tagName.toLowerCase()) !== -1;
}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = parseStyle;

var _camelCase = __webpack_require__(0);

var _camelCase2 = _interopRequireDefault(_camelCase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function parseStyle(style) {
  switch (typeof style === 'undefined' ? 'undefined' : _typeof(style)) {
    case 'string':
      return style.split(';').filter(function (r) {
        return r;
      }).reduce(function (map, rule) {
        var name = rule.slice(0, rule.indexOf(':')).trim();
        var value = rule.slice(rule.indexOf(':') + 1).trim();

        return _extends({}, map, _defineProperty({}, (0, _camelCase2.default)(name), value));
      }, {});
    case 'object':
      return style;

    default:
      return undefined;
  }
}

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = __webpack_require__(5);

var _react2 = _interopRequireDefault(_react);

var _camelCase = __webpack_require__(0);

var _camelCase2 = _interopRequireDefault(_camelCase);

var _parseStyle = __webpack_require__(4);

var _parseStyle2 = _interopRequireDefault(_parseStyle);

var _attributeNames = __webpack_require__(1);

var _attributeNames2 = _interopRequireDefault(_attributeNames);

var _nodeTypes = __webpack_require__(2);

var _nodeTypes2 = _interopRequireDefault(_nodeTypes);

var _specialTags = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var parser = new DOMParser();

var warnParseErrors = function warnParseErrors(doc) {
  var errors = Array.from(doc.documentElement.childNodes);
  // eslint-disable-next-line no-console
  console.warn('Unable to parse jsx. Found ' + errors.length + ' error(s):');

  var warn = function warn(node, indent) {
    if (node.childNodes.length) {
      Array.from(node.childNodes).forEach(function (n) {
        return warn(n, indent.concat(' '));
      });
    }

    // eslint-disable-next-line no-console
    console.warn(indent + '==> ' + node.nodeValue);
  };

  errors.forEach(function (e) {
    return warn(e, ' ');
  });
};

var JsxParser = function (_React$Component) {
  _inherits(JsxParser, _React$Component);

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
      }, rawJSX).trim();

      var doc = parser.parseFromString(jsx, 'text/html');
      if (!doc) return [];

      Array.from(doc.getElementsByTagName('REMOVE')).forEach(function (tag) {
        return tag.parentNode.removeChild(tag);
      });

      var body = doc.getElementsByTagName('body')[0];
      if (!body || body.nodeName.toLowerCase() === 'parseerror') {
        if (this.props.showWarnings) warnParseErrors(doc);
        return [];
      }

      var components = this.props.components.reduce(function (map, type) {
        return _extends({}, map, _defineProperty({}, type.prototype.constructor.name.toUpperCase(), type));
      }, {});

      return this.parseNode(body.childNodes || [], components);
    }
  }, {
    key: 'parseNode',
    value: function parseNode(node) {
      var _this2 = this;

      var components = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var key = arguments[2];

      if (node instanceof NodeList || Array.isArray(node)) {
        return Array.from(node) // handle nodeList or []
        .map(function (child, index) {
          return _this2.parseNode(child, components, index);
        }).filter(function (child) {
          return child;
        }); // remove falsy nodes
      }

      if (node.nodeType === _nodeTypes2.default.TEXT) {
        // Text node. Collapse whitespace and return it as a String.
        return ('textContent' in node ? node.textContent : node.nodeValue || '').replace(/[\r\n\t\f\v]/g, '').replace(/\s{2,}/g, ' ');
      } else if (node.nodeType === _nodeTypes2.default.ELEMENT) {
        // Element node. Parse its Attributes and Children, then call createElement
        var children = void 0;
        if ((0, _specialTags.canHaveChildren)(node.nodeName)) {
          children = this.parseNode(node.childNodes, components);
          if (!(0, _specialTags.canHaveWhitespace)(node.nodeName)) {
            children = children.filter(function (child) {
              return typeof child !== 'string' || !child.match(/^\s*$/);
            });
          }
        }

        return _react2.default.createElement(components[node.nodeName] || node.nodeName, _extends({}, this.props.bindings || {}, this.parseAttrs(node.attributes, key)), children);
      }

      if (this.props.showWarnings) {
        // eslint-disable-next-line no-console
        console.warn('JsxParser encountered a(n) ' + _nodeTypes2.default[node.nodeType] + ' node, and discarded it.');
      }
      return null;
    }
  }, {
    key: 'parseAttrs',
    value: function parseAttrs(attrs, key) {
      if (!attrs || !attrs.length) return { key: key };

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

        if (name.match(/^on/i)) {
          value = new Function(value); // eslint-disable-line no-new-func
        } else if (name === 'style') {
          value = (0, _parseStyle2.default)(value);
        }

        name = _attributeNames2.default[name.toLowerCase()] || (0, _camelCase2.default)(name);

        return _extends({}, current, _defineProperty({}, name, value));
      }, { key: key });
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
}(_react2.default.Component);

exports.default = JsxParser;


JsxParser.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  bindings: _react2.default.PropTypes.object.isRequired,
  blacklistedAttrs: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string),
  blacklistedTags: _react2.default.PropTypes.arrayOf(_react2.default.PropTypes.string),
  components: function components(props, propName) {
    if (!Array.isArray(props[propName])) {
      return new Error(propName + ' must be an Array of Components.');
    }

    var passes = true;
    props[propName].forEach(function (component) {
      if (!(component.prototype instanceof _react2.default.Component || component.prototype instanceof _react2.default.PureComponent)) {
        passes = false;
      }
    });

    return passes ? null : new Error(propName + ' must contain only Subclasses of React.Component or React.PureComponent.');
  },
  jsx: _react2.default.PropTypes.string,

  showWarnings: _react2.default.PropTypes.bool
};
JsxParser.defaultProps = {
  bindings: {},
  blacklistedAttrs: ['on[a-z]*'],
  blacklistedTags: ['script'],
  components: [],
  jsx: '',
  showWarnings: false
};

/***/ })
/******/ ]);
});