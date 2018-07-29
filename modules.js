var path = require("path");

exports.Modules = [
    {
        name: "async",
        versions: ["2.3.0"],
        current: "2.3.0",
        path: "content/async/",
        baseJSFiles: "async.min.js",
        backupJSFiles: {
            "2.3.0": "https://cdnjs.cloudflare.com/ajax/libs/async/2.3.0/async.min.js"
        }
    },

    {
        name: "bluebird",
        versions: ["3.5.0"],
        current: "3.5.0",
        path: "content/bluebird/",
        baseJSFiles: "bluebird.min.js",
        backupJSFiles: {
            "3.5.0": "https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.5.0/bluebird.min.js"
        }
    },

    {
        name: "bootstrap",
        versions: ["3.3.7"],
        current: "3.3.7",
        path: "content/bootstrap/",
        baseJSFiles: "bootstrap.min.js",
        baseCSSFiles: [
            "bootstrap.min.css",
            "bootstrap-theme.min.css"
        ],
        requireShim: {
            deps: ["jquery"]
        }
    },

    {
        name: "ember",
        versions: ["2.16.0"],
        current: "2.16.0",
        path: "content/ember/",
        baseJSFiles: "ember.prod.js",
        backupJSFiles: {
            "2.16.0": "https://cdnjs.cloudflare.com/ajax/libs/ember.js/2.16.0/ember.prod.js"
        },
        requireShim: {
            deps: ["jquery"],
            exports: "Ember"
        }
    },

    {
        name: "ember-data",
        versions: ["2.16.0"],
        current: "2.16.0",
        path: "content/ember-data/",
        baseJSFiles: "ember-data.prod.js",
        backupJSFiles: {
            "2.16.0": "https://cdnjs.cloudflare.com/ajax/libs/ember-data.js/2.16.0/ember-data.prod.js"
        },
        requireShim: {
            "exports": "DS",
            "deps": [
                "ember"
            ]
        }
    },

/*    {
        name: "glyphicons",
        versions: ["1.9.2"],
        current: "1.9.2",
        path: "content/glyphicons/",
        baseCSSFiles: [
            "glyphicons.css"
        ],
        childCSSFiles: {
            "bootstrap": "glyphicons-bootstrap.css",    // helper
            "filetypes": "glyphicons-filetypes.css",
            "halflings": "glyphicons-halflings.css",
            "social": "glyphicons-social.css"
        },
        query: {                    // fix an issue where "Vary: Origin" was not present on CORS responses for font files
            v: "20180220"
        }
    }, */

    {
        name: "handlebars",
        versions: ["4.0.11"],
        current: "4.0.11",
        path: "content/handlebars/",
        baseJSFiles: "handlebars.amd.min.js",
        backupJSFiles: {
            "4.0.11": "https://cdnjs.cloudflare.com/ajax/libs/handlebars.js/4.0.11/handlebars.amd.min.js"
        }
    },

    {
        name: "jquery",
        versions: ["1.11.3"],
        current: "1.11.3",
        path: "content/jquery/",
        baseJSFiles: "jquery.min.js",
        backupJSFiles: {
            "1.11.3": "https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js"
        },

        requireShim: {
            exports: "jQuery"
        }
    },

    {
        name: "moment",
        versions: ["2.19.1"],
        current: "2.19.1",
        path: "content/moment/",
        baseJSFiles: "moment.min.js",
        backupJSFiles: {
            "2.19.1": "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.19.1/moment.min.js"
        }
    },

    {
        name: "moment-timezone-with-data",
        versions: ["0.5.13"],
        current: "0.5.13",
        path: "content/moment-timezone-with-data/",
        baseJSFiles: "moment-timezone-with-data.min.js",
        backupJSFiles: {
            "0.5.13": "https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.13/moment-timezone-with-data.min.js"
        }
    },

    {
        name: "require",
        versions: ["2.3.5"],
        current: "2.3.5",
        path: "content/require/",
        baseJSFiles: "require.min.js",
        backupJSFiles: {
            "2.3.5": "https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.5/require.min.js"
        }
    },

    {
        name: "showdown",
        versions: ["1.8.6"],
        current: "1.8.6",
        path: "content/showdown/",
        baseJSFiles: "showdown.min.js",
        backupJSFiles: {
            "1.8.6": "https://cdnjs.cloudflare.com/ajax/libs/showdown/1.8.6/showdown.min.js"
        }
    },

    {
        name: "socket.io-client",
        versions: ["2.0.4"],
        current: "2.0.4",
        path: "content/socket.io-client/",
        baseJSFiles: "socket.io.js",
        backupJSFiles: {
            "2.0.4": "https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js"
        }
    },

    {
        name: "uoa-lib-videojs",
        versions: ["0.8.1"],
        current: "0.8.1",
        path: "content/uoa-lib-videojs",
        baseJSFiles: "player.full.js",
        baseCSSFiles: [
            "player.full.css"
        ],
        baseJSBundle: ["videojs", "shaka", "uoa-lib-videojs/components/player"]
    }
];
