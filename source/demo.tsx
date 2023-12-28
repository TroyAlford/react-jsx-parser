/* eslint-disable no-console */
import React from 'react'
import { createRoot } from 'react-dom/client'
// @ts-expect-error - untyped output file
import JsxParser from '../dist/umd/react-jsx-parser.min'

const container = document.querySelector('#root')
if (container instanceof Element) {
	createRoot(container).render(
		<JsxParser
			autoCloseVoidElements
			jsx={`
        <img src="http://placekitten.com/300/500">
        <div className="foo">bar</div>
      `}
			onError={console.error}
			showWarnings
		/>,
	)
} else {
	console.error('The root container element was not found.')
}
