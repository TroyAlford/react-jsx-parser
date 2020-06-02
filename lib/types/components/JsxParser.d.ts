import React, { Component } from 'react';
import type { Expression, JSXElement, JSXIdentifier, JSXMemberExpression, MemberExpression } from '../types/acorn-jsx';
declare type BlacklistedAttr = string | RegExp;
declare type Props = {
    allowUnknownElements?: boolean;
    bindings?: {
        [key: string]: any;
    };
    blacklistedAttrs?: BlacklistedAttr[];
    blacklistedTags?: string[];
    className?: string;
    components?: React.JSXElementConstructor<any>[];
    componentsOnly?: boolean;
    disableFragments?: boolean;
    disableKeyGeneration?: boolean;
    jsx?: string;
    onError?: (error: Error) => void;
    showWarnings?: boolean;
    renderError?: ({ error: string }: {
        error: any;
    }) => JSX.Element;
    renderInWrapper?: boolean;
    renderUnrecognized?: (tagName: string) => JSX.Element;
};
export declare type ParsedJSX = JSX.Element | boolean | string;
export declare type ParsedTree = ParsedJSX | ParsedJSX[];
export default class JsxParser extends Component<Props> {
    static displayName: string;
    static defaultProps: {
        allowUnknownElements: boolean;
        bindings: {};
        blacklistedAttrs: RegExp[];
        blacklistedTags: string[];
        className: string;
        components: any[];
        componentsOnly: boolean;
        disableFragments: boolean;
        disableKeyGeneration: boolean;
        jsx: string;
        onError: () => void;
        showWarnings: boolean;
        renderError: any;
        renderInWrapper: boolean;
        renderUnrecognized: () => any;
    };
    ParsedChildren: ParsedTree;
    parseJSX: (jsx: string) => JSX.Element | JSX.Element[];
    parseExpression: (expression: Expression) => any;
    parseMemberExpression: (expression: MemberExpression) => any;
    parseName: (element: JSXIdentifier | JSXMemberExpression) => string;
    parseElement: (element: JSXElement) => JSX.Element | JSX.Element[];
    render: () => JSX.Element;
}
export {};
//# sourceMappingURL=JsxParser.d.ts.map