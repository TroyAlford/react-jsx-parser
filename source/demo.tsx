/* eslint-disable no-console */
import React from 'react'
import { createRoot } from 'react-dom/client'
// @ts-expect-error - untyped output file
import JsxParser from '../dist/umd/react-jsx-parser.min'

const root = createRoot(document.querySelector('#root')!)

root.render(
	<JsxParser
		autoCloseVoidElements
		jsx={`
			<img src="https://picsum.photos/300/500">
			<div className="foo">bar</div>
		`}
		onError={console.error}
		showWarnings
	/>,
)
