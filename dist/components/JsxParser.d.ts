import React from 'react';
import { ParserOptions } from '../utils/JsxParser';
export declare type TProps = ParserOptions & {
    jsx?: string;
    showWarnings?: boolean;
    renderError?: (props: {
        error: string;
    }) => JSX.Element | null;
    renderInWrapper?: boolean;
};
export default class JsxParser extends React.Component<TProps> {
    #private;
    static displayName: string;
    static defaultProps: TProps;
    private ParsedChildren;
    render: () => JSX.Element;
}
