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
	//--------------------------------------
	//  VARIABLES
	//--------------------------------------
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
	require.nocache = require.nocache || false;
	// whether or not to use script tag injection for loading scripts
	require.useTagInjection = require.useTagInjection || false;
	// a string to hold our loaded scripts (for compile)
	require.compilation = require.compilation || '/// - require.js compilation';
	// whether or not we can compile (if script tag injection is used we cannot)
	var canCompile = !require.useTagInjection;
	//--------------------------------------
	//  RESET
	//--------------------------------------
	require.reset = function resetRequire() {
		for (key in require) {
			delete require[key];
		}
	};
	//--------------------------------------
	//  MODULES
	//--------------------------------------
	var isModule = function (module) {
		return ('name' 			in module &&
				'dependencies' 	in module &&
				'init' 			in module &&
				'callback' 		in module);
	};
	// this is the module format
	/*
	{
		name 			: someStringName,
		dependencies 	: anArrayOfDependenciesAsStringPaths,
		init 			: aFunctionThatReturnsTheModuleObject,
		callback 		: aFunctionToRunAfterTheModuleHasBeenCreated
	};
	*/
	require.compile = function () {
		/**
		 *	Compiles the loaded modules into one script for optimization
		 */
		var sortOnLoadOrder = function (pa, pb) {
			if (isModule(pa) && isModule(pb)) {
				return pa.callbackOrder < pb.callbackOrder ? -1 : 1;
			} else {
				return 0;
			}
		};
		require.packages.sort(sortOnLoadOrder);
		var output = '';
		output += ('/// require.js compilation '+Date.now().toString());
		for (var i = 0; i < require.packages.length; i++) {
			if (isModule(require.packages[i])) {
				var module = require.packages[i];
				output += ('\n\n/// '+module.name);
				output += ('\nvar '+module.name+' = ('+module.init.toString()+')();\n');
				output += ('('+module.callback.toString()+')();\n');
			}
		}
		return output;
	};
	require.printCompilation = function () {
		document.write('<pre>'+require.compile()+'</pre>');
	};
	//--------------------------------------
	//  LOADING
	//--------------------------------------
	var args = Array.prototype.slice.call(arguments, 0);
	
	var packageDependencies = function (fromArguments) {
		/**
		 *	Takes the arguments from require and bundles them into a
		 *	dependency object.
		 */
		var name, dependencies, init, callback;
		var packageFromArguments = function (fromArguments) {
			var subcallback = fromArguments.pop();

			var match = subcallback.toString().match(/^function ([a-zA-Z0-9].*)\(/g);
			var name = 'function anonymous(';
			if (match) {
				name = match[0];
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
				name : name,
				dependencies : dependencies,
				callback : subcallback,
				identifier : subcallback.toString(),
				completed : false,
				toString : function () {
					return '[require() Dependency package]';
				}
			};
		};
		var packageFromModule = function (module) {
			if (!isModule(module)) {
				throw new Error('require() - module is malformed');
			}
			
			var subcallback = module.callback;
			var name = module.name;
			var init = module.init;
			var dependencies = [];
			for (var i = 0; i < module.dependencies.length; i++) {
				if(require.completedLoads.indexOf(module.dependencies[i]) === -1) {
					dependencies.push(module.dependencies[i]);
				}
			}

			// return the dependency package
			return {
				name : name,
				dependencies : dependencies,
				callback : subcallback,
				init : init,
				identifier : subcallback.toString(),
				completed : false,
				callbackOrder : -1,
				toString : function () {
					return '[require() Dependency Module package]';
				}
			};
		};
		if (fromArguments.length === 1) {
			// require is loading a module
			return packageFromModule(fromArguments[0]);
		} else if (fromArguments.length === 2) {
			return packageFromArguments(fromArguments);
		} else {
			throw new Error('require() either no module sources were provided or no callback');
		}
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
		 *	Loads a script from *src*, calls *onload* on load complete.
		 */
		var nocache = (Math.random()*100000000).toString()
		nocache = nocache.substr(0, nocache.indexOf('.'));

		var loadWithTagInjection = function (src, onload) {
			/**
			 *	Uses script tag injection to download and exec a js file.
			 */
			canCompile = false;
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.id = 'require_script_'+nocache;
			script.onload = function() {
				require.head.removeChild(script);
				onload();
			};
			require.head.appendChild(script);
			if (require.nocache) {
				src += '?nocache='+nocache;
			}
			script.src = src;
		};
		var loadWithXMLHttpRequest = function (src, onload) {
			/**
			 *	Uses XMLHttpRequest to download and exec a js file.
			 *	Also stores the response for compilation.
			 */
			var request = new XMLHttpRequest();
			request.open('GET', src, true);
			request.onreadystatechange = function (e) {
				if (request.readyState === 4) {
					if (request.status === 200 || request.status === 0) {
						require.compilation += '\n\n/// ' + src + '\n' + request.responseText;
						window.eval(request.responseText);
						onload();
					} else {
						console.log('Error', request.statusText);
					}
				}
			};
			request.send(null);
		};
		
		if (require.useTagInjection) {
			loadWithTagInjection(src, onload);
		} else {
			loadWithXMLHttpRequest(src, onload);
		}
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
	
	// a var to hold how many completed loads, to use with ordering compiled modules
	var callbackOrder = 0;
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
				console.warn('require::resolvePackageDependencies()',package.name,'still has dependencies');
				continue;
			}
			package.completed = true;
			package.callbackOrder = callbackOrder++;
			if (isModule(package)) {
				window[package.name] = package.init();
			}
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