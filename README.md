require
=======
A function for loading external js sources. It serves the same purpose as other popular client-side include systems, but aims to be small and easy to understand. It uses script tag injection and callbacks to achieve this goal.

Use
---
You should only ever have to have one script tag in your document head. Just include require.js:

```html
<script src="require.js" type="text/javascript" charset="utf-8"></script>
```

and then set up your module (or not, but I like using modules) to use require(src, callback):

```html
<script type="text/javascript" charset="utf-8">
```
```javascript
	var onload = function () {
		// I suggest creating modules that list their dependencies and then
		// init() in the require callback...
		var testModule = {
			dependencies : [
				'test.js'
			],
			init : function initTestModule() {
				// then return the final form of the module
				return {
					note : 'All done. Check your console for test output.'
				};
			}
		};
		// then load the dependencies and call init() in the callback
		require(testModule.dependencies, function testModuleDependenciesLoaded() {
			// before this callback is called test.js is loaded and eval'd - which
			// makes more calls to require, which loads more scripts, which make more
			// calls to require, etc. 
			// The callbacks for all these require()'s will get called in FILO, (first in last out),
			// so the most deeply nested require()'s callback will fire first. This callback will
			// fire last. This way things will be all set up for this callback by the time it runs...
			
			globalTests.requireTests(function allTestsAreDone() {
				// assert is defined in test.js
				assert.eq(require.completedLoads.length, 4, 'total number of loaded sources is 4');
				// re-assign the module to it's final form
				testModule = testModule.init();
				alert(testModule.note);
				// print test results to console...
				assert.stat();
			});
		});
	}
```
```html
</script>
```