/* eslint-disable no-console */
import React from 'react'
import ReactDOM from 'react-dom'
// @ts-expect-error - untyped output file
import JsxParser from '../dist/umd/react-jsx-parser.min'

ReactDOM.render(
	<JsxParser
		autoCloseVoidElements
		jsx={`
			<img src="http://placekitten.com/300/500">
			<div className="foo">bar</div>
		`}
		onError={console.error}
		showWarnings
	/>,
	document.querySelector('#root'),
)
