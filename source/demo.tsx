import React from 'react'
import ReactDOM from 'react-dom'
// @ts-ignore
import JsxParser from '../dist/umd/react-jsx-parser.min'

ReactDOM.render(
	<JsxParser
		jsx="<div className='foo'>bar</div>"
	/>,
	document.querySelector('#root'),
)
