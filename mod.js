/** * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
* mod.js
* A system for defining modules and loading external js sources.
* https://github.com/schell/mod
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
(function(window) {
    var console = window.console || {log:function(){}};
    /** * *
    * 
    * * **/
    var mod = function (module) {
        module = module || {
            name : false,
            init : false
        };
        //--------------------------------------
        //  PROPERTIES
        //--------------------------------------
        /** * *
        * Whether or not mod is currently loading.
        * @type {boolean}
        * * **/
        mod.loading = mod.loading || false;
        /** * *
        * A reference to the path of the last pkg loaded.
        * (We don't know the pkg name until loading is complete, 
        * at which point we don't know the pkg path.)
        * @type {string}
        * * **/
        mod.lastPathLoaded = mod.lastPathLoaded || 'main';
        /** * *
        * A reference to the DOM's head tag.
        * @type {HTMLHeadElement}
        * * **/
        mod.head = mod.head || document.getElementsByTagName('head')[0];
        /** * *
        * All the modules (groups of dependencies) we've at least started loading.
        * @type {Object}
        * * **/
        mod.modules = mod.modules || {};
        /** * *
        * An array of modules queued to load.
        * @type {Array.<Object>}
        * * **/
        mod.pkgs = mod.pkgs || [];
        /** * *
        * An array of scripts to load.
        * @type {Array.<string>}
        * * **/
        mod.scripts = mod.scripts || [];
        /** * *
        * An array of scripts we've already loaded.
        * @type {Array.<string>}
        * * **/
        mod.loadedScripts = mod.loadedScripts || [];
        /** * *
        * Whether or not to force the browser not to cache sources.
        * @type {boolean}
        * * **/
        mod.nocache = mod.nocache || false;
        /** * *
        * Whether or not to use script tag injection for loading scripts.
        * @type {boolean}
        * * **/
        mod.useTagInjection = mod.useTagInjection || false;
        /** * *
        * A string to hold our loaded scripts (for compiling).
        * @type {string}
        * * **/
        mod.compilation = mod.compilation || '/// - mod.js compilation';
        /** * *
        * An object that maps basepath names to basepath urls.
        * @type {Object.<string, string>}
        * * **/
        mod.expansions = mod.expansions || {};
        //--------------------------------------
        //  METHODS
        //--------------------------------------
        /** * *
        * Configures mod.
        * Used mostly for AMD compliance.
        * @param {Object}
        * * **/
        mod.configure = function modConfigure(config) {
            config = config || {};
            mod.useTagInjection = config.useTagInjection || false;
            mod.expansions = config.expansions || {};
        };
        /** * *
        * Resets mod.
        * Resets all values of mod. Used when loading is done.
        * @param {boolean} deleteModules Whether or not to reset (delete) the already loaded modules.
        * * **/
        mod.reset = function(deleteModules) {
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
        /** * *
        * Determines whether or not an object is a module.
        * @param {Object} module
        * @return {boolean}
        * @nosideeffects
        * * **/
        var isModule = mod.isModule = function (module) {
            if (!('name' in module) && (typeof module.name !== "string")) {
                return false;
            }
            if (!('init' in module) && (typeof module.init !== "function")) {
                return false;
            }
            if (('dependencies' in module) && (module.dependencies instanceof Array) !== true) {
                return false;
            }
            return true;
        };
        /** * *
        * Sorts the pkgs according to module priority.
        * * **/
        mod.sortPkgs = function () {
            if (!('scripts' in mod)) {
                return;
            }
            /** * *
            * Resolves a dependency graph with root nodeName.
            * @param {string} nodeName The name of the node to resolve.
            * @param {Array=} resolved A list of resolved nodes (optional). 
            * @param {Array=} unresolved A list of traversed nodes that have yet to be resolved (optional).
            * @return {Array}  
            * * **/
            var resolve = function (nodeName, resolved, unresolved) {
                resolved = resolved || [];
                unresolved = unresolved || [];
                // Get the node by nodeName...
                var node = false;
                for (var i=0; i < mod.pkgs.length; i++) {
                    if (mod.pkgs[i].path == nodeName) {
                        node = mod.pkgs[i];
                        if (resolved.indexOf(node) !== -1) {
                            // This node has already been resolved...
                            return resolved;
                        }
                        if (unresolved.indexOf(node) !== -1) {
                            // This node has not been resolved and yet
                            // has already been traversed, meaning a circular
                            // dependency...
                            var circle = nodeName;
                            for (i = unresolved.length - 1; i >= 0; i--){
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
                    for (i=0; i < node.dependencies.length; i++) {
                        resolve(node.dependencies[i], resolved, unresolved);
                    }
                }
            
                resolved.push(node);
                unresolved.splice(unresolved.indexOf(node),1);
            
                return resolved;
            };
        
            mod.pkgs = resolve('main');
        };
        /** * *
        * Prints the order of initilization of modules to the console.
        * Used for debugging.
        * * **/
        mod.printInitOrder = function () {
            mod.sortPkgs();
            for (var i=0; i < mod.pkgs.length; i++) {
                console.log(i,mod.pkgs[i].name,mod.pkgs[i].path);
            }
        };
        //--------------------------------------
        //  PACKAGES
        //--------------------------------------
        /** * *
        * Takes the arguments from mod and bundles them into a
        * dependency object.
        * @param {Object} pkg
        * @return {Object}
        * * **/
        var constructPkg = function (pkg) {
            if (!isModule(pkg)) {
                throw new Error('Package is malformed');
            }
        
            pkg.path = mod.lastPathLoaded;
            pkg.completed = false;
            pkg.initString = '';
            pkg.toString = function () {
                var output = ('/// '+pkg.name+' from '+pkg.path);
                output += ('\n    modules.'+pkg.name+' = '+pkg.initString+';\n');
                return output;
            };
            return pkg;
        };
        /** * *
        * Returns whether a pkg exists in the pkgs list.
        * @param {Object} pkg
        * @return {boolean}
        * @nosideeffects
        * * **/
        var pkgExists = function (pkg) {
            for (var i = 0; i < mod.pkgs.length; i++) {
                var storedPkg = mod.pkgs[i];
                if (storedPkg.name === pkg.name) {
                    return true;
                }
            }    
            return false;
        };
        /** * *
        * Adds a dependency pkg to our pkgs list.
        * @param {Object} pkg
        * * **/
        var addPkg = function (pkg) {
            if (pkgExists(pkg)) {
                // The pkg exists, the module is loading or has loaded...
                return;
            }
        
            // Add the pkg...
            mod.pkgs.unshift(pkg);
            for (var i = 0; pkg.dependencies && i < pkg.dependencies.length; i++) {
                var dependency = pkg.dependencies[i];
                var ndx = mod.scripts.indexOf(dependency);
                if (ndx === -1) {
                    // This dependency is unique, so add it...
                    mod.scripts.push(dependency);
                }
            }
        };
    
        var pkg = constructPkg(module);
        addPkg(pkg);
        
        /** * *
        * Initializes a pkg and references it in the modules object.
        * * **/
        var initPkg = function(pkg) {
            if (pkg.name in mod.modules) {
                // this module has already been defined.
                // this could have happened as a result of
                // a module getting defined in the init() 
                // of another
                return;
            }
            pkg.completed = true;
            var initParams = [];
            try {
                switch (typeof pkg.init) {
                    case 'function':
                        // Get the modules that this pkg depends on...
                        var modulePkgs = mod.pkgs.slice();
                        var params = pkg.dependencies.map(function (dependency) {
                            for (var i=0; i < modulePkgs.length; i++) {
                                var modulePkg = modulePkgs[i];
                                if (modulePkg.path === dependency) {
                                    // We've found the dependency's module package,
                                    // now get the module...
                                    var module = mod.modules[modulePkg.name];
                                    if (!module) {
                                        throw new Error('Module '+modulePkg.name+' has not been initialized.');
                                    }
                                    modulePkgs.splice(i, 1);
                                    // Add the module name to the list of parameters for the package...
                                    initParams.push(modulePkg.name);
                                    return module;
                                }
                            }
                            // This dependency did not define a module...
                            return false;
                        }).filter(function (module) {
                            return module;
                        });
                        mod.modules[pkg.name] = pkg.init.apply(null, params);
                        // Set its initString for compilation later...
                        pkg.initString = stringifyFactory(pkg.init, initParams);
                    break;
                    
                    case 'object':
                        mod.modules[pkg.name] = pkg.init;
                        // Set its initString for compilation later...
                        pkg.initString = stringifyFactory(pkg.init);
                    break;
                    
                    default:
                        throw new Error('Factory must be a function or Object.');
                }
            } catch (e) {
                console.log(pkg);
                throw new Error ('Error initializing '+pkg.path+'\n'+e);
            }
        };
        // A private placeholder function that executes
        // after all loading and all initialization...
        var _onload = function emptyFunction(){};
        
        /** * *
        * Stringifys a module factory.
        * @param {Object|function(...)} init
        * @param {?Array.<string>}
        * @return string
        * * **/
        function stringifyFactory(init, params) {
            switch (typeof init) {
                case 'function':
                    var parameters = '';
                    if (params.length) {
                        parameters = 'modules.'+params[0];
                        for (var i=1; i < params.length; i++) {
                            parameters += ',modules.'+params[i];
                        }
                    }
                    
                    return '('+init.toString()+')('+parameters+')';
                        
                case 'object':
                    var s = '{';
                    for (var key in init) {
                        s += key + ':' + stringifyFactory(init[key]);
                        s += ',';
                    }
                    s = s.substr(0, s.length-1);
                    s += '}';
                    return s;
                        
                case 'string':
                    return '"'+init.toString()+'"';
                        
                default:
                    return init.toString();
            }
        }
        /** * *
        * Initializes all pkgs.
        * * **/
        var initPkgs = function () {
            mod.sortPkgs();
            var output = '(function initModCompilation(window) {\n';
            output += ('    var modules = {};');
            
            var n = mod.pkgs.length;
            for (var i = 0; i < n; i++) {
                initPkg(mod.pkgs[i]);
                output += mod.pkgs[i].toString();
            }
            
            output += '    return modules;\n';
            output += '}(window));';
            mod.compilation = output;
            
            // At the end of all initialization perform the onload...
            _onload(mod.modules);
        };
        //--------------------------------------
        //  LOADING
        //--------------------------------------
        /** * *
        * Loads a script from src, calls onload on load complete.
        * @param {string} src
        * @param {function()} onload
        * * **/
        var loadScript = function (src, onload) {
            var nocache = (Math.random()*100000000).toString();
            nocache = nocache.substr(0, nocache.indexOf('.'));
        
            // set the last path loaded
            mod.lastPathLoaded = src;
            mod.loadedScripts.unshift(src);
        
            var expandURL = function (src) {
                var source = src;
                var matches = src.match(/[^:]*::/g);
                if (matches) {
                    matches.map(function(match,ndx) {
                        var key = match.substr(0,match.length-2);
                        if (key in mod.expansions) {
                            source = source.replace(match, mod.expansions[key]);
                        }
                    });
                }
                return source;
            };
            /** * *
            * Uses script tag injection to download and exec a js file.
            * @param {string} src
            * @param {function()} onload 
            * * **/
            var loadWithTagInjection = function (src, onload) {
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
                script.src = src;
            };
            /** * *
            * Uses XMLHttpRequest to download and exec a js file.
            * Also stores the response for compilation.
            * @param {string} src
            * @param {function()} onload 
            * * **/
            var loadWithXMLHttpRequest = function (src, onload) {
                var request = new XMLHttpRequest();
                var source = src;
                request.open('GET', src, true);
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
        
            var url = expandURL(src);
        
            if (mod.useTagInjection) {
                loadWithTagInjection(url, onload);
            } else {
                loadWithXMLHttpRequest(url, onload);
            }
        };
        /** * *
        * Retrieves the path of the next dependency.
        * Returns null if no more dependencies exist.
        * @return {?string}
        * * **/
        var getNextDependency = function () {
            var msl = mod.scripts.length;
            var mpl = mod.pkgs.length;
            for (var i = 0; i < msl; i++) {
                var script = mod.scripts[i];
                if (mod.loadedScripts.indexOf(script) !== -1) {
                    continue;
                }
                var loaded = false;
                for (var j = 0; j < mpl; j++) {
                    var loadedScript = mod.pkgs[j].path;
                    if (script == loadedScript) {
                        loaded = true;
                        break;
                    }
                }
                if (!loaded) {
                    return script;
                }
            }
            return null;
        };
        /** * *
        * Loads the next dependency needed by our pkgs.
        * * **/
        var loadNextDependency = function() {
            var nextDependency = getNextDependency();
            if (nextDependency) {
                mod.loading = true;
                var onload = loadNextDependency;
                var script = nextDependency;
                loadScript(script, onload);
            } else {
                // there are no more unloaded dependencies,
                // initialize the modules...
                mod.loading = false;
                initPkgs();
            }
        };
    
        if (!mod.loading) {
            loadNextDependency();
        }
    
        return {
            onload : function(todo) {
                _onload = todo;
            }
        };
    };
    //--------------------------------------
    //  AMD COMPLIANCE
    //--------------------------------------
    /** * *
    * Defines a module using the AMD spec.
    * https://github.com/amdjs/amdjs-api/wiki/AMD
    * @param {?string} id The id of the module.
    * @param {?Array.<string>} dependencies The modules this module depends on.
    * @param {function|Object} factory The value of the module.
    * * **/
    function define(id, dependencies, factory) {
        var args = Array.prototype.slice.call(arguments);
        factory = args.pop();
        dependencies = args.pop();
        id = args.pop();
        
        mod({
            name : id,
            dependencies : dependencies,
            init : factory
        });
    }
    //--------------------------------------
    //  GLOBALS
    //--------------------------------------
    //window.define = window.define || define;
    //window.require = window.require || define;
    window.mod = mod;
})(window);