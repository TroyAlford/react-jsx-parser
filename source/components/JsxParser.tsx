/* global JSX */
import React, { ComponentType, ExoticComponent } from 'react'
import { TProps, ParsedJSX, ParsedTree } from '../utils/JsxParser'
import JsxParserUtil from '../utils/JsxParser'

export default class JsxParser extends React.Component<TProps> {
	static displayName = 'JsxParser'
	static defaultProps: TProps = {
		allowUnknownElements: true,
		autoCloseVoidElements: false,
		bindings: {},
		blacklistedAttrs: [/^on.+/i],
		blacklistedTags: ['script'],
		className: '',
		components: {},
		componentsOnly: false,
		disableFragments: false,
		disableKeyGeneration: false,
		jsx: '',
		onError: () => { },
		showWarnings: false,
		renderError: undefined,
		renderInWrapper: true,
		renderUnrecognized: () => null,
	}

	private ParsedChildren: ParsedTree = null

	#parseJSX = (jsx: string): JSX.Element | JSX.Element[] | null => {
		const parser = new JsxParserUtil(this.props);
		return parser.parseJSX(jsx);
	}

	render = (): JSX.Element => {
		const jsx = (this.props.jsx || '').trim().replace(/<!DOCTYPE([^>]*)>/g, '')
		this.ParsedChildren = this.#parseJSX(jsx)
		const className = [...new Set(['jsx-parser', ...String(this.props.className).split(' ')])]
			.filter(Boolean)
			.join(' ')

		return (
			this.props.renderInWrapper
				? <div className={className}>{this.ParsedChildren}</div>
				: <>{this.ParsedChildren}</>
		)
	}
}
