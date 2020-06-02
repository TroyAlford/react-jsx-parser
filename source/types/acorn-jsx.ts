/* eslint-disable no-use-before-define */

export type BaseExpression = {
  type: string,
  start: number,
}

export type JSXAttribute = BaseExpression & {
  type: 'JSXAttribute',
  elements?: Expression[],
  expression?: null | Expression,
  name: { name: string },
  value: Expression,
}

export type JSXAttributeExpression = BaseExpression & {
  type: 'JSXAttributeExpression',
  argument?: Expression,
}

export type JSXElement = BaseExpression & {
  type: 'JSXElement',
  children: JSXElement[],
  openingElement: JSXElement & {
    attributes: JSXAttribute[],
  },
  name: JSXIdentifier | JSXMemberExpression,
}

export type JSXExpressionContainer = BaseExpression & {
  type: 'JSXExpressionContainer',
  expression: Expression,
}

export type JSXIdentifier = BaseExpression & {
  type: 'JSXIdentifier',
  name: string,
}

export type JSXMemberExpression = BaseExpression & {
  type: 'JSXMemberExpression',
  object: JSXIdentifier | JSXMemberExpression,
  property: JSXIdentifier | JSXMemberExpression,
}

export type JSXSpreadAttribute = BaseExpression & {
  type: 'JSXSpreadAttribute',
  argument: Identifier,
}

export type JSXText = BaseExpression & {
  type: 'JSXText',
  value: string,
}

export type ArrayExpression = BaseExpression & {
  type: 'ArrayExpression',
  elements: Expression[],
}

export type BinaryExpression = BaseExpression & {
  type: 'BinaryExpression',
  left: Expression,
  operator: string,
  right: Expression,
}

export type CallExpression = BaseExpression & {
  type: 'CallExpression',
  arguments: Expression[],
  callee?: Expression,
}

export type ConditionalExpression = BaseExpression & {
  type: 'ConditionalExpression',
  alternate: Expression,
  consequent: Expression,
  test: Expression,
}

export type ExpressionStatement = BaseExpression & {
  type: 'ExpressionStatement',
  expression: Expression,
}

export type Identifier = BaseExpression & {
  type: 'Identifier',
  name: string,
}

export type Literal = BaseExpression & {
  type: 'Literal',
  value: string,
}

export type LogicalExpression = BaseExpression & {
  type: 'LogicalExpression',
  left: Expression,
  operator: string,
  right: Expression,
}

export type MemberExpression = BaseExpression & {
  type: 'MemberExpression',
  computed: boolean,
  name?: string,
  object: Literal | MemberExpression,
  property?: MemberExpression,
  raw?: string,
}

export type ObjectExpression = BaseExpression & {
  type: 'ObjectExpression',
  properties: [{
    key: { name?: string, value?: string },
    value: Expression,
  }]
}

export type TemplateElement = BaseExpression & {
  type: 'TemplateElement',
  value: { cooked: string },
}

export type TemplateLiteral = BaseExpression & {
  type: 'TemplateLiteral',
  expressions: Expression[],
  quasis: Expression[],
}

export type UnaryExpression = BaseExpression & {
  type: 'UnaryExpression',
  operator: string,
  argument: { value: any }
}

export type Expression =
  JSXAttribute | JSXAttributeExpression | JSXElement | JSXExpressionContainer |
  JSXSpreadAttribute | JSXText |
  ArrayExpression | BinaryExpression | CallExpression | ConditionalExpression |
  ExpressionStatement | Identifier | Literal | LogicalExpression | MemberExpression |
  ObjectExpression | TemplateElement | TemplateLiteral | UnaryExpression

/* eslint-enable no-use-before-define */
