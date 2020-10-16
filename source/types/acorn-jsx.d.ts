/* eslint-disable no-use-before-define */

type BaseExpression = {
  type: string,
  start: number,
}

type JSXAttribute = BaseExpression & {
  type: 'JSXAttribute',
  elements?: Expression[],
  expression?: null | Expression,
  name: { name: string },
  value: Expression,
}

type JSXAttributeExpression = BaseExpression & {
  type: 'JSXAttributeExpression',
  argument?: Expression,
}

type JSXElement = BaseExpression & {
  type: 'JSXElement',
  children: JSXElement[],
  openingElement: JSXElement & {
    attributes: JSXAttribute[],
  },
  name: JSXIdentifier | JSXMemberExpression,
}

type JSXExpressionContainer = BaseExpression & {
  type: 'JSXExpressionContainer',
  expression: Expression,
}

type JSXIdentifier = BaseExpression & {
  type: 'JSXIdentifier',
  name: string,
}

type JSXMemberExpression = BaseExpression & {
  type: 'JSXMemberExpression',
  object: JSXIdentifier | JSXMemberExpression,
  property: JSXIdentifier | JSXMemberExpression,
}

type JSXSpreadAttribute = BaseExpression & {
  type: 'JSXSpreadAttribute',
  argument: Identifier,
}

type JSXText = BaseExpression & {
  type: 'JSXText',
  value: string,
}

type ArrayExpression = BaseExpression & {
  type: 'ArrayExpression',
  elements: Expression[],
}

type BinaryExpression = BaseExpression & {
  type: 'BinaryExpression',
  left: Expression,
  operator: string,
  right: Expression,
}

type CallExpression = BaseExpression & {
  type: 'CallExpression',
  arguments: Expression[],
  callee?: Expression,
}

type ConditionalExpression = BaseExpression & {
  type: 'ConditionalExpression',
  alternate: Expression,
  consequent: Expression,
  test: Expression,
}

type ExpressionStatement = BaseExpression & {
  type: 'ExpressionStatement',
  expression: Expression,
}

type Identifier = BaseExpression & {
  type: 'Identifier',
  name: string,
}

type Literal = BaseExpression & {
  type: 'Literal',
  value: string,
}

type LogicalExpression = BaseExpression & {
  type: 'LogicalExpression',
  left: Expression,
  operator: string,
  right: Expression,
}

type MemberExpression = BaseExpression & {
  type: 'MemberExpression',
  computed: boolean,
  name?: string,
  object: Literal | MemberExpression,
  property?: MemberExpression,
  raw?: string,
}

type ObjectExpression = BaseExpression & {
  type: 'ObjectExpression',
  properties: [{
    key: { name?: string, value?: string },
    value: Expression,
  }]
}

type TemplateElement = BaseExpression & {
  type: 'TemplateElement',
  value: { cooked: string },
}

type TemplateLiteral = BaseExpression & {
  type: 'TemplateLiteral',
  expressions: Expression[],
  quasis: Expression[],
}

type UnaryExpression = BaseExpression & {
  type: 'UnaryExpression',
  operator: string,
  argument: { value: any }
}

type Expression =
  JSXAttribute | JSXAttributeExpression | JSXElement | JSXExpressionContainer |
  JSXSpreadAttribute | JSXText |
  ArrayExpression | BinaryExpression | CallExpression | ConditionalExpression |
  ExpressionStatement | Identifier | Literal | LogicalExpression | MemberExpression |
  ObjectExpression | TemplateElement | TemplateLiteral | UnaryExpression

/* eslint-enable no-use-before-define */
