import React from 'react';
import { TProps } from '../utils/JsxParser';
export default class JsxParser extends React.Component<TProps> {
    #private;
    static displayName: string;
    static defaultProps: TProps;
    private ParsedChildren;
    render: () => JSX.Element;
}
