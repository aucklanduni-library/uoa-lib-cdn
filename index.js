var Modules = require("./modules").Modules,
    querystring = require("querystring"),
    path = require("path");

var BaseConfig = require("./config.json");

var ModulesLookup = {};

Modules.forEach(function(m) {
    if(m.name) {
        ModulesLookup[m.name.toLowerCase()] = m;
    }
});

function CDNProvider(config, logger) {

    this._modules = Modules;
    this._modulesLookup = ModulesLookup;

    this._logger = logger;

    this._cdnRoots = BaseConfig.cdn_root || {};
    this._cdnVersion = BaseConfig.cdn_version;

    this._cacheTimes = BaseConfig.cache_periods || null;

    if(this._cacheTimes) {
        var updatedCacheTimes = {};

        for(var k in this._cacheTimes) {
            if(this._cacheTimes.hasOwnProperty(k)) {
                var t = this._cacheTimes[k];
                if(typeof t === "string") {
                    t = t.trim().toLowerCase().split(/\s+/);
                    if(t.length === 2) {
                        var n = parseInt(t[0]);
                        var m = t[1];

                        switch(m) {
                            case "week":
                            case "weeks":
                                m = 7 * 24 * 60 * 60 * 1000;
                                break;
                            case "day":
                            case "days":
                                m = 24 * 60 * 60 * 1000;
                                break;
                            case "hour":
                            case "hours":
                                m = 60 * 60 * 1000;
                                break;
                            case "min":
                            case "mins":
                                m = 60 * 1000;
                                break;
                            default:
                                m = 1;
                                break;
                        }
                        if(!isNaN(n)) {
                            updatedCacheTimes[k] = n * m;
                        }
                    }
                } else {
                    updatedCacheTimes[k] = t;
                }
            }
        }

        this._cacheTimes = updatedCacheTimes;
    }

    if(config && config.CDNRoots && typeof(config.CDNRoots) === "object") {
        this._cdnRoots = Object.assign({}, config.CDNRoots);
    }
}

CDNProvider.prototype.createStaticResourceHandler = function(serveStatic) {

    var contentsPath = path.resolve(__dirname, "./content");
    var cacheTimes = this._cacheTimes;

    var headersFn = function customCacheControl(res, path, stat) {
        var ext = path.split(".");
        ext = ext[ext.length - 1].toLowerCase();

        if(cacheTimes) {
            var t = cacheTimes[ext] || cacheTimes["*"] || null;
            if(t) {
                res.setHeader('Cache-Control', 'public, max-age=' + t);
            }
        }
    };

    return serveStatic(contentsPath, {
        acceptRanges: true,
        dotfiles: "deny",
        etag: true,
        index: false,
        setHeaders: headersFn
    });
};


CDNProvider.prototype.createExpressRouter = function(express, serveStatic) {
    var router = express.Router();
    router.use("/", this.createStaticResourceHandler(serveStatic));
    return router;
};


CDNProvider.prototype.generateBundleDetails = function(items, environment, localBasePath) {

    var self = this;
    var logger = this._logger;

    function _warn(t) {
        if(logger) {
            logger.warn("[CDN/GenerateBundleDetails] " + t);
        } else {
            console.warn("[CDN/GenerateBundleDetails] " + t);
        }
    }

    var jsFiles = [];
    var cssFiles = [];
    var issues = [];

    function _addJSFiles(module, files, version, fullModuleName, optionalName, query) {

        if(!files) {
            return;
        }
        if(!(files instanceof Array)) {
            files = [files];
        }

        files.forEach(function(x) {
            if(typeof(x) === "string") {
                var p = self._resolveFileForModule(module, "js", x, version);
                if(p) {
                    var moduleName = null;
                    if(files.length === 1) {
                        moduleName = module.name;
                        if(optionalName) {
                            moduleName = moduleName + "-" + optionalName;
                        }
                    }

                    var f = {path:p.replace(/^content\//i, ""), filePath:p, module:module, reference:fullModuleName, version:version, queryParams:(query || null), type:"js"};
                    if(moduleName) {
                        f.moduleName = moduleName;
                    }

                    jsFiles.push(f);
                }
            }
        });
    }

    function _addCSSFiles(module, files, version, fullModuleName, optionalName, query) {

        if(!files) {
            return;
        }
        if(!(files instanceof Array)) {
            files = [files];
        }

        files.forEach(function(x) {
            if(typeof(x) === "string") {
                var p = self._resolveFileForModule(module, "css", x, version);
                if(p) {
                    cssFiles.push({path:p.replace(/^content\//i, ""), filePath:p, module:module, reference:fullModuleName, version:version, queryParams:(query || null), type:"css"});
                }
            }
        });
    }

    function _createIssue(fullModuleName, comment) {
        return {reference:fullModuleName, issue:comment};
    }

    function _createFullModuleName(moduleName, childName, version) {
        return moduleName + (childName ? ("/" + childName) : "") + (version ? ("@" + version) : "@current");
    }

    items.forEach(function(x) {

        var p = /^([-\w]+)(\/(\w+))?(@([\w\.]+))?$/i.exec(x);
        if(p) {

            var name = p[1];
            var childName = p[3];
            var version = p[5];
            var fullModuleName = _createFullModuleName(name, childName, version);

            var module = self._lookupModule(name);
            if(module) {
                if(!version) {
                    version = module.current;
                }

                if(module.versions.indexOf(version) === -1) {
                    _warn("Unable to find version [" + version + "] of module " + name + ".");
                    issues.push(_createIssue(fullModuleName, "Unable to find version [" + version + "] of module [" + name + "] in registry."));
                    return;
                }

                if(childName) {
                    if(module.childJSFiles && module.childJSFiles.hasOwnProperty(childName)) {
                        _addJSFiles(module, module.childJSFiles[childName], version, fullModuleName, childName, module.query);
                    }

                    if(module.childCSSFiles && module.childCSSFiles.hasOwnProperty(childName)) {
                        _addCSSFiles(module, module.childCSSFiles[childName], version, fullModuleName, childName, module.query);
                    }
                } else {
                    if(module.baseJSFiles) {
                        _addJSFiles(module, module.baseJSFiles, version, fullModuleName, null, module.query);
                    }

                    if(module.baseCSSFiles) {
                        _addCSSFiles(module, module.baseCSSFiles, version, fullModuleName, null, module.query);
                    }
                }

            } else {
                _warn("Unable to find module with name [" + name + "].");
                issues.push(_createIssue(fullModuleName, "Unable to find module [" + name + "] in module registry."));
            }
        }
    });

    var result = {};

    if(jsFiles && jsFiles.length) {
        var additionalJSFiles = [];
        var requirePaths = {};
        var requireBundles = {};
        var requireShims = {};
        var hasRequireConfigItems = false;
        var hasRequireBundleItems = false;
        var hasRequireShimItems = false;

        jsFiles.forEach(function(f){
            if(f.moduleName && f.moduleName !== "require") {
                var r = self._requireJSPathsForJSFile(f, environment, localBasePath);
                if(r) {
                    requirePaths[f.moduleName] = r;
                    hasRequireConfigItems = true;

                    if(f.module && f.module.name === f.moduleName && f.module.baseJSBundle) {
                        requireBundles[f.module.name] = f.module.baseJSBundle;
                        hasRequireBundleItems = true;
                    }

                } else {
                    _warn("Unable to generate RequireJS path information for module [" + f.reference + "].");
                    issues.push(_createIssue(f.reference, "Unable to generate RequireJS path information for module [" + f.reference + "]."));
                }

                if(f.module && f.module.name && f.module.requireShim) {
                    requireShims[f.module.name] = f.module.requireShim;
                    hasRequireShimItems = true;
                }

            } else {
                var p = self._resolvePathForFile(f, environment, localBasePath, "js");
                if(p) {
                    if(f.moduleName === "require") {
                        additionalJSFiles.unshift(p);
                    } else {
                        additionalJSFiles.push(p);
                    }
                } else {
                    _warn("Unable to generate direct javascript file reference for module [" + f.reference + "].");
                    issues.push(_createIssue(f.reference, "Unable to generate direct javascript file reference for module [" + f.reference + "]."));
                }
            }
        });

        if(hasRequireConfigItems) {
            result.requireConfig = {};
            result.requireConfig.paths = requirePaths;

            if(hasRequireBundleItems) {
                result.requireConfig.bundles = requireBundles;
            }

            if(hasRequireShimItems) {
                result.requireConfig.shim = requireShims;
            }
        }

        if(additionalJSFiles.length) {
            result.jsFiles = additionalJSFiles;
        }
    }

    if(cssFiles && cssFiles.length) {
        var additionalCSSFiles = [];

        cssFiles.forEach(function(f) {
            var p = self._resolvePathForFile(f, environment, localBasePath, "css");
            if(p) {
                additionalCSSFiles.push(p);
            } else {
                _warn("Unable to generate direct CSS file reference for module/file [" + f.reference + ", filePath=" + f.filePath + "].");
                issues.push(_createIssue(f.reference, "Unable to generate direct CSS file reference for module/file [" + f.reference + ", filePath=" + f.filePath + "]."));
            }
        });

        if(additionalCSSFiles.length) {
            result.cssFiles = additionalCSSFiles;
        }
    }

    if(issues.length) {
        result.issues = issues;
    }

    return result;
};


CDNProvider.prototype._lookupModule = function(name) {
    name = name.toLowerCase();
    return this._modulesLookup.hasOwnProperty(name) ? this._modulesLookup[name] : null;
};

CDNProvider.prototype._resolvePathForFile = function(file, environment, localBasePath, type) {

    var path = file.path;

    var cdnRoot = this._cdnRoots[environment] || this._cdnRoots["*"] || null;
    if(cdnRoot) {
        return _safeAppendQuery(_safeAppendToPath(cdnRoot, path), file.queryParams);
    }

    if(localBasePath) {
        return _safeAppendQuery(_safeAppendToPath(localBasePath, path), file.queryParams);
    }

    return null;
};

CDNProvider.prototype._requireJSPathsForJSFile = function(file, environment, localBasePath) {

    var links = [];
    var jsPath = file.path.replace(/\.js$/i, "");

    var cdnRoot = this._cdnRoots[environment] || this._cdnRoots["*"] || null;
    if(cdnRoot) {
        links.push(_safeAppendQuery(_safeAppendToPath(cdnRoot, jsPath), file.queryParams));
    }

    if(localBasePath) {
        links.push(_safeAppendQuery(_safeAppendToPath(localBasePath, jsPath), file.queryParams));
    }

    if(file.module.backupJSFiles && file.version && file.module.backupJSFiles.hasOwnProperty(file.version)) {
        var backupLink = file.module.backupJSFiles[file.version];
        if(backupLink) {
            links.push(backupLink.replace(/\.js$/i, ""));
        }
    }

    return (links.length ? links : null);
};

CDNProvider.prototype._resolveFileForModule = function(module, type, fileName, version) {
    var p = _safeAppendToPath(module.path, version);
    p = _safeAppendToPath(p, type);
    p = _safeAppendToPath(p, fileName);
    return p;
};


CDNProvider.localModuleJSDirectoryPath = function(moduleReference) {
    var p = /^([-\w]+)(@([\w\.]+))?$/i.exec(moduleReference);
    if(p) {
        var name = p[1];
        var version = p[3];
        var module;

        name = name.toLowerCase();
        module = ModulesLookup.hasOwnProperty(name) ? ModulesLookup[name] : null;

        if(module) {
            if(!version) {
                version = module.current;
            }

            if(module.versions.indexOf(version) === -1) {
                return null;
            }

            return path.join(__dirname, module.path, version, "js");
        }
    }

    return null;
};


module.exports = CDNProvider;


function _safeAppendToPath(p, a) {
    if(!a) {
        return p;
    }
    if(a[0] === "/") {
        a = a.substring(1);
    }
    if(p.length && p[p.length-1] !== "/") {
        return p + "/" + a;
    }
    return (p || "") + a;
}

function _safeAppendQuery(p, query) {
    if(!query) {
        return p;
    }
    return p + "?" + querystring.stringify(query);
}