/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* mod.js
* A system for defining modules and loading external js sources.
* 
* MIT LICENSE
* Copyright (C) 2011 by Schell Scivally
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
* THE SOFTWARE.
* 
* @author    Schell Scivally
* @since    Thu Jul 21 10:33:36 PDT 2011
* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * **/
var mod = function (module) {
    /**
     *    Defines a module using an init object of the form: module = {
     *        name : aStringName,
     *      dependencies : anArrayOfPathsToDependencies,
     *      init : aFunctionThatReturnsTheInitializedModule,
     *      callback : anOptionalFunctionToCallAfterInitialization // optional
     *  };
     *    
     *    @param module - a module initializer object
     */
    if (module === null) {
        throw new Error('mod.js - no init object was provided');
    }
    //--------------------------------------
    //  VARIABLES
    //--------------------------------------
    // Whether or not mod is currently loading
    mod.loading = mod.loading || false;
    // A reference to the path of the last package loaded (we don't know the package
    // name until loading is complete, at which point we don't know the package path)
    mod.lastPathLoaded = mod.lastPathLoaded || 'main';
    // A reference to the DOM's head tag
    mod.head = mod.head || document.getElementsByTagName('head')[0];
    // All the modules (groups of dependencies) we've loaded/begun loading
    mod.modules = mod.modules || {};
    // An array of modules queued to load
    mod.packages = mod.packages || [];
    // An array of scripts to load
    mod.scripts = mod.scripts || [];
    // An array of loaded scripts
    mod.loadedScripts = mod.loadedScripts || [];
    // Whether or not to force the browser not to cache sources
    mod.nocache = mod.nocache || false;
    // Whether or not to use script tag injection for loading scripts
    mod.useTagInjection = mod.useTagInjection || false;
    // A string to hold our loaded scripts (for compile)
    mod.compilation = mod.compilation || '/// - mod.js compilation';
    // A base path to prefix when loading files
    mod.basePath = mod.basePath || '';
    //--------------------------------------
    //  RESET
    //--------------------------------------
    mod.reset = function(deleteModules) {
        /** * *
        * Resets mod.
        * Resets all values of mod. Used when loading is done.
        * @param deleteModules Whether or not to reset (delete) the already loaded modules.
        * * **/
        deleteModules = deleteModules || false;
        
        for (var key in mod) {
            if (key === 'modules' && !deleteModules) {
                continue;
            }
            if(typeof mod[key] === 'function') {
                continue;
            }
            delete mod[key];
        }
    };
    //--------------------------------------
    //  MODULES
    //--------------------------------------
    var isModule = mod.isModule = function (module) {
        if (!('name' in module) && (typeof module.name !== "string")) {
            return false;
        }
        if (!('init' in module) && (typeof init !== "function")) {
            return false;
        }
        if (('dependencies' in module) && (module.dependencies instanceof Array) !== true) {
            return false;
        }
        return true;
    };
    mod.sortPackages = function () {
        /**
         *    Sorts the packages according to module priority.
         */
        if (!('scripts' in mod)) {
            return;
        }
        
        var resolve = function (nodeName, resolved, unresolved) {
            /** * *
            * Resolves a dependency graph with root *nodeName*.
            * @param nodeName The name of the node to resolve.
            * @param resolved A list of resolved nodes.
            * @param unresolved A list of traversed nodes that have yet to be resolved.
            * * **/
            resolved = resolved || [];
            unresolved = unresolved || [];
            // Get the node by nodeName...
            var node = false;
            for (var i=0; i < mod.packages.length; i++) {
                if (mod.packages[i].path == nodeName) {
                    node = mod.packages[i];
                    if (resolved.indexOf(node) !== -1) {
                        // This node has already been resolved...
                        return resolved;
                    }
                    if (unresolved.indexOf(node) !== -1) {
                        // This node has not been resolved and yet
                        // has already been traversed, meaning a circular
                        // dependency...
                        var circle = nodeName;
                        for (var i = unresolved.length - 1; i >= 0; i--){
                            circle += ' <- '+unresolved[i].path;
                            if (unresolved[i].path == nodeName) {
                                break;
                            }
                        }
                        throw new Error('Detected a circular dependency with module defined in '+nodeName+'\n    '+circle);
                    }
                    unresolved.push(node);
                }
            }
            
            if (node === false) {
                // This node is not a module, but another js script...
                return resolved;
            }
            
            if (node.dependencies) {
                for (var i=0; i < node.dependencies.length; i++) {
                    resolve(node.dependencies[i], resolved, unresolved);
                }
            }
            
            resolved.push(node);
            unresolved.splice(unresolved.indexOf(node),1);
            
            return resolved;
        };
        
        mod.packages = resolve('main');
    };
    mod.compile = function (name) {
        /**
         *    Compiles the loaded modules into one script for optimization.
         *  @param - String - The name of the function that initializes this project.
         */
        mod.sortPackages();
        name = name || 'init';
        var output = 'function init(){';
        output += ('var modules = {};');
        for (var i = 0; i < mod.packages.length; i++) {
            if (isModule(mod.packages[i])) {
                var module = mod.packages[i];
                output += ('\n\n/// '+module.name);
                output += ('\nmodules.'+module.name+' = ('+module.init.toString()+')(modules);\n');
                output += ('('+module.callback.toString()+')(modules);\n');
            }
        }
        output += '};';
        return output;
    };
    mod.printCompilation = function () {
        document.write('<pre>'+mod.compile()+'</pre>');
    };
    //--------------------------------------
    //  PACKAGES
    //--------------------------------------
    var constructPackage = function (module) {
        /**
         *    Takes the arguments from mod and bundles them into a
         *    dependency object.
         */
        if (!isModule(module)) {
            throw new Error('mod() - module is malformed');
        }
        
        module.path = mod.lastPathLoaded;
        module.callback = module.callback || function blankCallback(){};
        module.completed = false;
        module.toString = function () {
            return '[mod() Dependency Module package]';
        };
        return module;
    };
    
    var packageExists = function (package) {
        /**
         *    Returns whether a package exists in the packages list.
         */
        for (var i = 0; i < mod.packages.length; i++) {
            var storedPackage = mod.packages[i];
            if (storedPackage.name === package.name) {
                return true;
            }
        }    
        return false;
    };
    
    var addPackage = function (package) {
        /** * *
        * Adds a dependency package to our packages list.
        * * **/
        if (packageExists(package)) {
            // The package exists, the module is loading or has loaded,
            // its callback has either been called or doesn't need to be...
            return;
        }
        
        // Add the package...
        mod.packages.unshift(package);
        for (var i = 0; package.dependencies && i < package.dependencies.length; i++) {
            var dependency = package.dependencies[i];
            var ndx = mod.scripts.indexOf(dependency);
            if (ndx === -1) {
                // This dependency is unique, so add it...
                mod.scripts.push(dependency);
            }
        }
    };
    
    var package = constructPackage(module);
    addPackage(package);
    
    var initPackage = function(package) {
        /** * *
        * Initializes a package, references it in the modules object.
        * * **/
         
        if (package.name in mod.modules) {
            // this module has already been defined.
            // this could have happened as a result of
            // a module getting defined in the init() 
            // or callback() of another
            return;
        }
        package.completed = true;
        try {
            mod.modules[package.name] = package.init(mod.modules);
        } catch (e) {
            console.log(package);
            throw new Error ('Error initializing '+package.path+'\n'+e);
        }
        package.callback(mod.modules);
    };
    
    var initPackages = function () {
        /**
         *    Initializes all packages.
         */
        mod.sortPackages();
        
        var n = mod.packages.length;
        for (var i = 0; i < n; i++) {
            initPackage(mod.packages[i]);
        }
    };
    //--------------------------------------
    //  LOADING
    //--------------------------------------
    var loadScript = function (src, onload) {
        /**
         *    Loads a script from *src*, calls *onload* on load complete.
         */
        var nocache = (Math.random()*100000000).toString()
        nocache = nocache.substr(0, nocache.indexOf('.'));
        
        // set the last path loaded
        mod.lastPathLoaded = src;
        mod.loadedScripts.unshift(src);
        
        var loadWithTagInjection = function (src, onload) {
            /**
             *    Uses script tag injection to download and exec a js file.
             */
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.id = 'mod_script_'+nocache;
            script.onload = function() {
                mod.head.removeChild(script);
                onload();
            };
            mod.head.appendChild(script);
            if (mod.nocache) {
                src += '?nocache='+nocache;
            }
            script.src = mod.basePath + src;
        };
        var loadWithXMLHttpRequest = function (src, onload) {
            /**
             *    Uses XMLHttpRequest to download and exec a js file.
             *    Also stores the response for compilation.
             */
            var request = new XMLHttpRequest();
            request.open('GET', mod.basePath + src, true);
            request.onreadystatechange = function (e) {
                if (request.readyState === 4) {
                    if (request.status === 200 || request.status === 0) {
                        onload();
                    } else {
                        console.log('Error', request.statusText);
                    }
                }
            };
            request.send(null);
        };
        
        if (mod.useTagInjection) {
            loadWithTagInjection(src, onload);
        } else {
            loadWithXMLHttpRequest(src, onload);
        }
    };
    
    var getNextDependency = function () {
        /**
         *    Retrieves the path of the next dependency.
         */
        var msl = mod.scripts.length;
        var mpl = mod.packages.length;
        for (var i = 0; i < msl; i++) {
            var script = mod.scripts[i];
            if (mod.loadedScripts.indexOf(script) !== -1) {
                continue;
            }
            var loaded = false;
            for (var j = 0; j < mpl; j++) {
                var loadedScript = mod.packages[j].path;
                if (script == loadedScript) {
                    loaded = true;
                    break;
                }
            }
            if (!loaded) {
                return script;
            }
        }
        return false;
    };
    
    var loadNextDependency = function() {
        /**
         *    Loads the next dependency needed by our packages.
         */
        var nextDependency = getNextDependency();
        if (nextDependency) {
            mod.loading = true;
            var onload = loadNextDependency;
            loadScript(nextDependency, onload);
        } else {
            // there are no more unloaded dependencies,
            // go through and call the callbacks in order
            mod.loading = false;
            initPackages();
        }
    };
    
    if (!mod.loading) {
        loadNextDependency();
    }
};