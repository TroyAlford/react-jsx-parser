import { ComponentType, ExoticComponent } from 'react';
export declare type ParsedJSX = JSX.Element | boolean | string;
export declare type ParsedTree = ParsedJSX | ParsedJSX[] | null;
export declare type TProps = {
    allowUnknownElements?: boolean;
    autoCloseVoidElements?: boolean;
    bindings?: {
        [key: string]: unknown;
    };
    blacklistedAttrs?: Array<string | RegExp>;
    blacklistedTags?: string[];
    className?: string;
    components?: Record<string, ComponentType | ExoticComponent>;
    componentsOnly?: boolean;
    disableFragments?: boolean;
    disableKeyGeneration?: boolean;
    jsx?: string;
    onError?: (error: Error) => void;
    showWarnings?: boolean;
    renderError?: (props: {
        error: string;
    }) => JSX.Element | null;
    renderInWrapper?: boolean;
    renderUnrecognized?: (tagName: string) => JSX.Element | null;
};
export default class JsxParser {
    #private;
    static displayName: string;
    static defaultProps: TProps;
    private ParsedChildren;
    props: TProps;
    constructor(props: TProps);
    parseJSX: (jsx: string) => JSX.Element | JSX.Element[] | null;
}
