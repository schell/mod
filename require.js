/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *	require.js
 *	A system for loading external js sources.
 *	
 *	MIT LICENSE
 *	Copyright (C) 2011 by Schell Scivally
 *	
 *	Permission is hereby granted, free of charge, to any person obtaining a copy
 *	of this software and associated documentation files (the "Software"), to deal
 *	in the Software without restriction, including without limitation the rights
 *	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *	copies of the Software, and to permit persons to whom the Software is
 *	furnished to do so, subject to the following conditions:
 *	
 *	The above copyright notice and this permission notice shall be included in
 *	all copies or substantial portions of the Software.
 *	
 *	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *	THE SOFTWARE.
 *
 *	@author	Schell Scivally
 *	@since	Thu Jul 21 10:33:36 PDT 2011
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/
var require = function (src, callback) {
	/**
	 *	Loads a source at *src* and then calls *callback*.
	 *	Can load multiple src's. Pass all src's to load as parameters or as an array, pass *callback* last,
	 *	as it gets pop'd off the end of `arguments`.
	 *	
	 *	@param src - any number of string parameters or an array of strings (paths to sources to load)
	 *	@param callback - a function to run after all sources have loaded
	 */
	if (src === null || src === undefined) {
		throw new Error('require.js - no module sources were provided');
	}
	// whether or not require is currently loading
	require.loading = require.loading || false;
	// a list of paths to loaded sources, ordered last loaded to first loaded
	require.completedLoads = require.completedLoads || [];
	// a list of paths to not-loaded sources, newest to oldest
	require.incompleteLoads = require.incompleteLoads || [];
	// a reference to the DOM's head tag
	require.head = require.head || document.getElementsByTagName('head')[0];
	// all the packages (groups of dependencies) we've loaded/begun loading
	require.packages = require.packages || [];
	// whether or not to force the browser not to cache sources
	require.nocache = true;
	
	var args = Array.prototype.slice.call(arguments, 0);
	
	var packageDependencies = function (fromArguments) {
		/**
		 *	Takes the arguments from require and bundles them into a
		 *	dependency object.
		 */
		if (fromArguments.length < 2) {
			throw new Error('ddm_global::require() either no module sources were provided or no callback');
		}
		var subcallback = fromArguments.pop();
		
		var match = subcallback.toString().match(/^function ([a-zA-Z0-9].*)\(/g);
		var shortName = 'function anonymous(';
		if (match) {
			shortName = match[0];
		}
		
		var dependencies = [];
		if (fromArguments[0] instanceof Array) {
			dependencies = args[0];
		} else {
			dependencies = fromArguments;
		}
		
		for (var i = 0; i < dependencies.length; i++) {
			if(require.completedLoads.indexOf(dependencies[i]) !== -1) {
				dependencies.splice(i, 1);
				i--;
			}
		}
		
		// return the dependency package
		return {
			dependencies : dependencies,
			callback : subcallback,
			identifier : subcallback.toString(),
			shortName : shortName,
			completed : false,
			toString : function () {
				return '[require() Dependency package]';
			}
		};
	};
	
	var packageExists = function (package) {
		/**
		 *	Returns whether a package exists in the packages list.
		 */
		for (var i = 0; i < require.packages.length; i++) {
			var storedPackage = require.packages[i];
			if (storedPackage.identifier === package.identifier) {
				return true;
			}
		}	
		return false;
	};
	
	var package = packageDependencies(args);
	
	if (packageExists(package)) {
		// the package exists, the module is loading or has loaded,
		// its callback has either been called or doesn't need to be
		return;
	}
	
	var addPackageToRequire = function (package) {
		/**
		 *	Adds a dependency package to our packages list.
		 */
		// put the package at the top of the stack (newest is most important)
		require.packages.unshift(package);
		for (var i = 0; i < package.dependencies.length; i++) {
			var dependency = package.dependencies[i];
			if (require.completedLoads.indexOf(dependency) === -1) {
				// if the dependency has not been loaded
				var indexOf = require.incompleteLoads.indexOf(dependency);
				if (indexOf !== -1) {
					// if this unloaded dependency already exists we'll cut it out
					require.incompleteLoads.splice(indexOf, 1);
				}
				// move it to the top, because we need it...now
				require.incompleteLoads.unshift(dependency);
			}
		}
	};
	addPackageToRequire(package);
	
	var loadScript = function (src, onload) {
		/**
		 *	Uses script tag injection to download a js file.
		 */
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.onload = function () {
			require.head.removeChild(script);
			onload();
		};
		require.head.appendChild(script);
		if (require.nocache) {
			src += '?'+Math.random()*1000000;
		}
		script.src = src;
	};
	
	var removeDependencyFromPackages = function(dependency) {
		/**
		 *	Removes a dependency from all packages.
		 */
		for (var i = 0; i < require.packages.length; i++) {
			var package = require.packages[i];
			for (var j = 0; j < package.dependencies.length; j++) {
				if (package.dependencies[j] == dependency) {
					package.dependencies.splice(j, 1);
					j--;
				}
			}
		}
	};
	
	var resolvePackageDependencies = function() {
		/**
		 *	Runs through all packages and calls callbacks in filo order (because they were shifted onto require.packages).
		 */
		for (var i = 0; i < require.packages.length; i++) {
			var package = require.packages[i];
			if (package.completed) {
				continue;
			}
			if (package.dependencies.length) {
				console.warn('require::resolvePackageDependencies()',package.shortName,'still has dependencies');
				continue;
			}
			package.completed = true;
			package.callback();
		}
	};
	
	var loadNextDependency = function() {
		/**
		 *	Loads the next dependency needed by our packages.
		 */
		if (require.incompleteLoads.length) {
			require.loading = true;
			var dependency = require.incompleteLoads[0];
			loadScript(dependency, function onLoadedRequiredScript(src) {
				// move the dependency to the loaded list
				require.completedLoads.unshift(dependency);
				require.incompleteLoads.splice(require.incompleteLoads.indexOf(dependency), 1);
				removeDependencyFromPackages(dependency);
				loadNextDependency();
			});
		} else {
			// there are no more unloaded dependencies,
			// go through and call the callbacks in order
			require.loading = false;
			resolvePackageDependencies();
		}
	}
	
	if (!require.loading) {
		loadNextDependency();
	}
};