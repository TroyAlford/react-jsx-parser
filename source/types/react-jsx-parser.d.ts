/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Component } from 'react'

export type TProps = {
	allowUnknownElements?: boolean;
	bindings?: {
		[key: string]: unknown;
	};
	blacklistedAttrs?: Array<string | RegExp>;
	blacklistedTags?: string[];
	className?: string;
	components?: React.JSXElementConstructor<any>[];
	componentsOnly?: boolean;
	disableFragments?: boolean;
	disableKeyGeneration?: boolean;
	jsx?: string;
	onError?: (error: Error) => void;
	showWarnings?: boolean;
	renderError?: (props: { error: string }) => JSX.Element;
	renderInWrapper?: boolean;
	renderUnrecognized?: (tagName: string) => JSX.Element;
}

declare export class JsxParser extends Component<TProps> {}
