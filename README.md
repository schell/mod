mod
=======
`mod` is a function for defining and loading JS modules from a browser. 
It serves as a method to break your project into a tree of maintainable 
pieces that depend on each other, much like an include or import statement. 
Once your project is loaded you may use mod to compile your code into one 
monolithic closure.

Use
---
`mod` uses initialization objects (called packages, internally) to define 
modules. An initialization object takes a name, an init function and 
optionally an array of dependencies. You can also supply an optional callback 
to execute after the module has been initialized. Both the init() and 
callback() are passed an object that contains all the initialized modules 
thus far.

Include mod.js in your `<head>`:
	
```html
<script src="mod.js" type="text/javascript" charset="utf-8"></script>
```

and then set up your main module, which will be the entry point (or root) of your project:

```html
<script type="text/javascript" charset="utf-8">
```
```javascript
	var onload = function () {
		// create the main module
		mod({
			name : 'Main',
			dependencies : [
				'anotherModule.js'
			],
			init : function initMain(modules) {
				// we can access anotherModule because mod.js
				// initializes dependencies in order
				var anotherModule = modules.anotherModule;
				return {
					someValue : anotherModule.someFunction(),
					functionToExpose : anotherModule.someFunctionToExpose
				};
			},
			callback : function cbMain(modules) {
				// we can access Main because callback() is not called
				// until after Main's init()
				var Main = modules.Main;
				window.exposedFunction = Main.functionToExpose;
			}
		});
	}
```
```html
</script>
```

In this first call `mod` packages your module initialization object and starts loading its dependencies (either through XMLHttpRequest or script tag injection). Once the dependencies are loaded (which may or may not define more modules and load more scripts), the result of the `init` function is stored in `mod.modules`, in this case as `mod.modules.Main`. The loaded modules are exposed to your `init` and `callback` functions as the only parameter, so they don't clutter global space.

As an added benefit, you can share data between modules using `mod.modules`.

Compiling
---------
If you use `mod` to write lots of modules (like you're making a big project), `mod` can 'compile' your project for you, removing all instances of `mod`. It essentially takes all your `init` and `callback` functions and prints them to one monolithic file, which you can then compress with YUI or a google 'something-or-other'. 
To do this, load your project in your browser, open the js console and type `mod.printCompilation()`. Alternatively, to store in a string, type `var compilation = mod.compile();`.

Notes
-----
In development situations the scripts `mod` loads can change often. In order to avoid the browser cacheing these files (and returning an old version of your scripts) set `mod.nocache = true`, which will enable the "force re-download" feature. Unfortunately with `mod.nocache` set to true, many javascript debuggers can't set breakpoints on the loaded scripts. Keep this in mind.