# debug-engine
 A simple GUI based debugger for node.js applications

# Usage
At the very beginning of your script, create a new DebugEngine instance:

```javascript
const DebugEngine = require('../')
const debugEngine = new DebugEngine()
```

And replace the console with the debugEngine console:

```javascript
console = debugEngine.console
```

After starting your express app (if you are using express), call the `onListen` method:
```javascript
app.listen(3000, () => {
    debugEngine.onListening()() // Yes, you need to use double ()
})
```

If you are using express, you also need to pipe the app into debugEngine **before definig your routes and after every middleware**:
```javascript
debugEngine.pipe(app)
```



Now you can use the DebugEngine GUI. Happy debugging!

# Environment
When creating a new DebugEngine instance, you can pass an environment object to the constructor, which determines if the debugger should be started automatically or not.



**Automatically start debugger:**
```javascript
const debugEngine = new DebugEngine('development')
```

**Don't start debugger:**
```javascript
const debugEngine = new DebugEngine('production')
```