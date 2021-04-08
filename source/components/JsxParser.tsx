/* global JSX */
import React, { ComponentType, ExoticComponent } from 'react'
import { ParserOptions, ParsedJSX, ParsedTree } from '../utils/JsxParser'
import JsxParserUtil from '../utils/JsxParser'

export declare type TProps = ParserOptions & {
    jsx?: string;
	className?: string,
    showWarnings?: boolean;
    renderError?: (props: {
        error: string;
    }) => JSX.Element | null;
    renderInWrapper?: boolean;
};

export default class JsxParser extends React.Component<TProps> {
	static displayName = 'JsxParser'
	static defaultProps: TProps = {
		...JsxParserUtil.defaultProps,
		className: '',
		jsx: '',
		showWarnings: false,
		renderError: undefined,
		renderInWrapper: true,
	}

	private ParsedChildren: ParsedTree = null

	#parseJSX = (jsx: string): JSX.Element | JSX.Element[] | null => {
		const parser = new JsxParserUtil(this.props);
		try {
			return parser.parseJSX(jsx);
		} catch (error) {
			if (this.props.showWarnings) console.warn(error) // eslint-disable-line no-console
			if (this.props.onError) this.props.onError(error)
			if (this.props.renderError) {
				return this.props.renderError({ error: String(error) })
			}
			return null
		}
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
