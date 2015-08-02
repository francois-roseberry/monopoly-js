"use strict";

var karmaRunner = require('./build/karma_runner');
var buildServices = require('./build/build-services.js');

module.exports = function(grunt) {
	
	// Default task, do everything
	grunt.registerTask('default', 'Build and test everything', ['lint', 'package', 'test']);
	
	// Quick build
	grunt.registerTask('check', ['lint', 'package', 'runTest']);
	
	// Code quality
	grunt.registerTask('lint', ['jshint', 'csslint']);
	grunt.registerTask('test', ['service', 'runTest']);
	grunt.registerTask('runTest', ['karmaTest', 'mochaTest']);

	grunt.registerTask('karmaTest', 'Run the client unit test in all browser connected to Karma', function () {
	  karmaRunner.runTests(grunt, this.async());
	});
	
	// Packaging
	grunt.registerTask('prepare', ['copy:html', 'copy:flattenSourceAndTest', 'copy:flattenSmokeTest']);
	grunt.registerTask('copySource', ['copy:jqueryUiImages']);
	grunt.registerTask('minify', ['cssmin']);
	grunt.registerTask('package', ['prepare', 'browserify', 'concat', 'copySource', 'minify']);
	
	// Background services
	grunt.registerTask('background', ['service', 'wait']);
	grunt.registerTask('service', ['karmaServer', 'simpleServer', 'webdriver']);
  
	grunt.registerTask('simpleServer', function () {
	  buildServices.startServer(this.async());
	});

	grunt.registerTask('karmaServer', function () {
	  buildServices.startKarmaServer(this.async());
	});

	grunt.registerTask('webdriver', 'Start PhantomJS in WebDriver mode', function () {
	  buildServices.startPhantomJsWebdriver(this.async());
	});

	grunt.registerTask('wait', 'wait until the exit, useful for background services', function () {
	  grunt.log.writeln("Background service started".green);
	  grunt.log.writeln("Run 'grunt check' to do a quick build while this process is running");
	  this.async();
	});
	
	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: "build/jshintrc"
			},
			all: {
				src: [
					'Gruntfile.js',
					'build/**/*.js',
					'src/**/*.js'
				]
			}
		},

		csslint: {
			options: {
				csslintrc: 'build/csslintrc'
			},
			all: {
				src: ['src/**/*.css']
			}
		},
		
		browserify: {
			dist: {
				files: {
					'./target/dist/lib/app.js': ['target/stagger/src/bootstrap.js']
				}
			}
		},

		concat: {
			dependencies: {
				src: [
					'node_modules/underscore/underscore.js',
					'node_modules/d3/d3.min.js',
					'node_modules/rx/dist/rx.all.min.js',
					'node_modules/jquery/dist/jquery.min.js',
					'node_modules/jquery-ui/jquery-ui.js'
				],
				dest: 'target/dist/lib/dependencies.js'
			}
		},
			
		copy: {
			flattenSourceAndTest: {
				expand: true,
				src: ['src/main/**/*.js',
					'src/test/unit/**/*.js',
					'src/test/integration/**/*.js'],
				dest: 'target/stagger/src',
				filter: 'isFile',
				flatten: true
			},

			flattenSmokeTest: {
				expand: true,
				src: ['src/test/smoke/**/*.js',
					'src/test/page-object/**/*.js'],
				dest: 'target/stagger/smoke',
				filter: 'isFile',
				flatten: true
			},
			
			html: {
				src: ['src/static/index.html'],
				dest: 'target/dist/index.html',
				filter: 'isFile'
			},
			
			jqueryUiImages: {
				expand: true,
				cwd: 'node_modules/jquery-ui/themes/vader/images/',
				src: ['**/*'],
				dest: 'target/dist/images/',
				filter: 'isFile'
			}
		},
		
		mochaTest: {
			smoke: {
				options: {
					reporter: 'list'
				},

				src: ['target/stagger/smoke/*']
			}
		},

		cssmin: {
			target: {
				files: {
					'target/dist/styles.min.css': [
													'src/**/*.css',
													'node_modules/jquery-ui/themes/vader/jquery-ui.min.css'
												]
				}
			}
		},

		clean: ['target/**'],
	});

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
};