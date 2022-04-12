// Create new DebugEngine instance
const DebugEngine = require('../')
const debugEngine = new DebugEngine()
console = debugEngine.console // Pipe console to debug engine

// Express app
const express = require('express')
const app = express()
app.listen(3000, () => {})

// Pipe express app into the debug engine
debugEngine.pipe(app) // Put this code before your routes and after every other middleware

// Define routes
app.get('/', (req, res) => {
    res.status(200)
    res.send('Hello World!')
})


// Console Output
console.log('Hello World!')

setTimeout(() => {
    console.warn('Hello my friendo!')
}, 5000)