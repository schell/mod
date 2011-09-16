mod
=======
A function for defining and loading external js sources/modules. It serves the same purpose as other popular client-side include systems, but aims to be small and easy to understand.

Use
---
`mod` uses initialization objects (called packages internally) to define modules. An initialization object takes a name, dependencies and an init function. You can supply an optional callback to execute after 'main' has been initialized.

Include mod.js in your `<head>`:
	
```html
<script src="mod.js" type="text/javascript" charset="utf-8"></script>
```

and then set up your main module:

```html
<script type="text/javascript" charset="utf-8">
```
```javascript
	var onload = function () {
		// create the main module
		mod({
			name : 'main',
			dependencies : [
				't1.js'
			],
			init : function initMain(modules) {
				return {};
			},
			callback : function cbMain(modules) {
				assert.stat();
			}
		});
	}
```
```html
</script>
```

In this first call `mod` packages your module initialization object and starts loading its dependencies (either through XMLHttpRequest or script tag injection). Once the dependencies are loaded (which may or may not define more modules and load more scripts), the result of the `init` function is stored in `mod.modules`, in this case as `mod.modules.main`. The loaded modules are exposed to your `init` and `callback` functions as the only parameter, so they don't clutter global space.

Notes
-----
In development situations the scripts `mod` loads can change often. In order to avoid the browser cacheing these files (and returning an old version of your scripts) set `mod.nocache = true`, which will enable the "force re-download" feature. Unfortunately with `mod.nocache` set to true, many javascript debuggers can't set breakpoints on the loaded scripts. Keep this in mind.

See tests/index.html and associated files for more info.