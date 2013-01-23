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
modules. An initialization object takes a name, an array of dependencies 
and an init function, which by my convention always returns a constructor. 

Include mod.js in your `<head>`:
	
```html
<script src="mod.js" type="text/javascript" charset="utf-8"></script>
```

and then set up your a module:

```html
<script type="text/javascript" charset="utf-8">
```
```javascript
	// create a main module
		mod({
			name : 'SomeModule',
			dependencies : [
				'path/to/AnotherModule.js',
				'path/to/YetAnotherModule.js'
			],
			init : function initMain(AnotherModule, YetAnotherModule) {
				// We can access AnotherModule and YetAnotherModule because mod.js
				// initializes dependencies in order and provides them to your init
				// in the order that you declare them in the dependencies array above...
				function SomeConstructor() {
					this.foo = "bar";
				}
				SomeConstructor.prototype = {
					anotherInstance : new AnotherModule(),
					yetAnotherInstance : new YetAnotherInstance()
				};
				return SomeConstructor;
			}
		});
```
```html
</script>
```

In this first call `mod` packages your module and starts loading its dependencies (either through XMLHttpRequest or script tag injection). 
Once the dependencies are loaded, which probably define more modules and load more scripts, the result of the `init` function is stored in `mod.modules`, in this case as `mod.modules.SomeModule`, so they don't clutter global space. 
The initialized modules are provided to other `init` functions in the order they are asked for.

As an added benefit, you can share data between modules using `mod.modules`.

Compiling
---------
If you use `mod` to write lots of modules (when you're making a big project) `mod` can 'compile' your project for you, removing all instances of `mod`. 
It essentially takes all your `init` functions and prints them to one monolithic file, which you can then compress with YUI or Google Closure. 
To do this, load your project in your browser, open the js console and type `mod.printCompilation()`. Alternatively, to store in a string, type `var compilation = mod.compile();`.

Examples
--------
For more examples check out my other project `bang` at https://github.com/schell/bang
Notes
-----
In development situations the scripts `mod` loads can change often. In order to avoid the browser cacheing these files (and returning an old version of your scripts) set `mod.nocache = true`, which will enable the "force re-download" feature. Unfortunately with `mod.nocache` set to true, many javascript debuggers can't set breakpoints on the loaded scripts. Keep this in mind.
