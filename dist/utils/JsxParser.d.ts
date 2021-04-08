import { ComponentType, ExoticComponent } from 'react';
export declare type ParsedJSX = JSX.Element | boolean | string;
export declare type ParsedTree = ParsedJSX | ParsedJSX[] | null;
export declare type ParserOptions = {
    allowUnknownElements?: boolean;
    autoCloseVoidElements?: boolean;
    bindings?: {
        [key: string]: unknown;
    };
    blacklistedAttrs?: Array<string | RegExp>;
    blacklistedTags?: string[];
    components?: Record<string, ComponentType | ExoticComponent>;
    componentsOnly?: boolean;
    disableFragments?: boolean;
    disableKeyGeneration?: boolean;
    onError?: (error: Error) => void;
    renderUnrecognized?: (tagName: string) => JSX.Element | null;
};
export default class JsxParser {
    #private;
    static displayName: string;
    static defaultProps: ParserOptions;
    private ParsedChildren;
    options: ParserOptions;
    constructor(props: ParserOptions);
    parseJSX: (jsx: string) => JSX.Element | JSX.Element[] | null;
}
