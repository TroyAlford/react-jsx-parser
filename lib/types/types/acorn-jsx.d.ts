export declare type BaseExpression = {
    type: string;
    start: number;
};
export declare type JSXAttribute = BaseExpression & {
    type: 'JSXAttribute';
    elements?: Expression[];
    expression?: null | Expression;
    name: {
        name: string;
    };
    value: Expression;
};
export declare type JSXAttributeExpression = BaseExpression & {
    type: 'JSXAttributeExpression';
    argument?: Expression;
};
export declare type JSXElement = BaseExpression & {
    type: 'JSXElement';
    children: JSXElement[];
    openingElement: JSXElement & {
        attributes: JSXAttribute[];
    };
    name: JSXIdentifier | JSXMemberExpression;
};
export declare type JSXExpressionContainer = BaseExpression & {
    type: 'JSXExpressionContainer';
    expression: Expression;
};
export declare type JSXIdentifier = BaseExpression & {
    type: 'JSXIdentifier';
    name: string;
};
export declare type JSXMemberExpression = BaseExpression & {
    type: 'JSXMemberExpression';
    object: JSXIdentifier | JSXMemberExpression;
    property: JSXIdentifier | JSXMemberExpression;
};
export declare type JSXSpreadAttribute = BaseExpression & {
    type: 'JSXSpreadAttribute';
    argument: Identifier;
};
export declare type JSXText = BaseExpression & {
    type: 'JSXText';
    value: string;
};
export declare type ArrayExpression = BaseExpression & {
    type: 'ArrayExpression';
    elements: Expression[];
};
export declare type BinaryExpression = BaseExpression & {
    type: 'BinaryExpression';
    left: Expression;
    operator: string;
    right: Expression;
};
export declare type CallExpression = BaseExpression & {
    type: 'CallExpression';
    arguments: Expression[];
    callee?: Expression;
};
export declare type ConditionalExpression = BaseExpression & {
    type: 'ConditionalExpression';
    alternate: Expression;
    consequent: Expression;
    test: Expression;
};
export declare type ExpressionStatement = BaseExpression & {
    type: 'ExpressionStatement';
    expression: Expression;
};
export declare type Identifier = BaseExpression & {
    type: 'Identifier';
    name: string;
};
export declare type Literal = BaseExpression & {
    type: 'Literal';
    value: string;
};
export declare type LogicalExpression = BaseExpression & {
    type: 'LogicalExpression';
    left: Expression;
    operator: string;
    right: Expression;
};
export declare type MemberExpression = BaseExpression & {
    type: 'MemberExpression';
    computed: boolean;
    name?: string;
    object: Literal | MemberExpression;
    property?: MemberExpression;
    raw?: string;
};
export declare type ObjectExpression = BaseExpression & {
    type: 'ObjectExpression';
    properties: [{
        key: {
            name?: string;
            value?: string;
        };
        value: Expression;
    }];
};
export declare type TemplateElement = BaseExpression & {
    type: 'TemplateElement';
    value: {
        cooked: string;
    };
};
export declare type TemplateLiteral = BaseExpression & {
    type: 'TemplateLiteral';
    expressions: Expression[];
    quasis: Expression[];
};
export declare type UnaryExpression = BaseExpression & {
    type: 'UnaryExpression';
    operator: string;
    argument: {
        value: any;
    };
};
export declare type Expression = JSXAttribute | JSXAttributeExpression | JSXElement | JSXExpressionContainer | JSXSpreadAttribute | JSXText | ArrayExpression | BinaryExpression | CallExpression | ConditionalExpression | ExpressionStatement | Identifier | Literal | LogicalExpression | MemberExpression | ObjectExpression | TemplateElement | TemplateLiteral | UnaryExpression;
//# sourceMappingURL=acorn-jsx.d.ts.map