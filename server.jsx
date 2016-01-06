import express from 'express'
import React from 'react'
import { renderToString } from 'react-dom/server'

import TodoListStore from './src/Stores/TodoStore'

import TodoApp from './src/Components/TodoApp.jsx'

// set request provider
import Request from './src/Helpers/Request'
Request.setServerProvider(require('request'))

const app = express()

// set dist folder accessible
app.use('/dist', express.static('dist'))
app.use('/node_modules', express.static('node_modules'))

// handle all other requests
app.use((req, res) => {
  console.log(req.url)
  // set user agent for server rendering
  GLOBAL.navigator = {
    userAgent: req.headers['user-agent']
  }

  // we fill the todo store with an api fietch before rendering
  TodoListStore.fetchData((err, data) => {
    if (err) {
      console.log('Can\'t get initial data')
    }

    const InitialComponent = (
      <TodoApp />
    )

    const componentHTML = renderToString(InitialComponent)
    const HTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Isomorphic Redux Demo</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css" media="screen" title="no title" charset="utf-8">
      </head>
      <body style="margin: 0">
        <div id="todo-app">${componentHTML}</div>
        <script type="application/javascript" src="dist/app.js"></script>
      </body>
    </html>`

    res.send(HTML)
  })
})

module.exports = app
