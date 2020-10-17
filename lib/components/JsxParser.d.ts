import React from 'react';
export declare type TProps = {
    allowUnknownElements?: boolean;
    bindings?: {
        [key: string]: unknown;
    };
    blacklistedAttrs?: Array<string | RegExp>;
    blacklistedTags?: string[];
    className?: string;
    components?: React.JSXElementConstructor<unknown>[];
    componentsOnly?: boolean;
    disableFragments?: boolean;
    disableKeyGeneration?: boolean;
    jsx?: string;
    onError?: (error: Error) => void;
    showWarnings?: boolean;
    renderError?: (props: {
        error: string;
    }) => JSX.Element;
    renderInWrapper?: boolean;
    renderUnrecognized?: (tagName: string) => JSX.Element;
};
export default class JsxParser extends React.Component<TProps> {
    static displayName: string;
    static defaultProps: TProps;
    private ParsedChildren;
    private parseJSX;
    private parseExpression;
    private parseMemberExpression;
    private parseName;
    private parseElement;
    render: () => JSX.Element;
}
