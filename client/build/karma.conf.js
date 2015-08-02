// Karma configuration
"use strict";

module.exports = function (config) {
    config.set({
		// base path, that will be used to resolve files and exclude
        basePath: '../',

        // frameworks to use
        frameworks: ['mocha', 'commonjs'],

        preprocessors: {
            // Commonjs preprocessor allow the tests to use the modules system of browserify
            'target/stagger/**/*.js': ['commonjs']
        },

        // list of files / patterns to load in the browser
        // The order is important!
        files: [
            'node_modules/expect.js/index.js',
			'target/dist/lib/dependencies.js',
            {pattern: 'target/dist/images/*', included: false, served: true},
			'target/stagger/src/**/*.js'
        ],
		
		// list of files to exclude
        exclude: [
            './target/stagger/src/bootstrap.js'
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
        reporters: ['dots'],

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values:
        // config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers: ['PhantomJS'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,

        // Time to wait before a browser is considered disconnected
        browserDisconnectTimeout : 10000, // default 2000
        // Fix the disconnected error on PhantomJS 1.9.7
        browserDisconnectTolerance : 1, // default 0
        browserNoActivityTimeout : 60000, //default 10000

        // web server port
        port: 9876,

        //Will report any test slower than
        reportSlowerThan: 200,

        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false
    });
};
