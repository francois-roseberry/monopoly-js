"use strict";

module.exports = function(grunt) {
	
	// Default task, do everything
	grunt.registerTask('default', 'Build and test everything', ['lint', 'package'/*, 'test'*/]);
	
	// Quick build
	grunt.registerTask('check', ['lint', 'package'/*, 'test'*/]);
	
	// Code quality
	grunt.registerTask('lint', ['jshint', 'csslint']);
	
	// Packaging
	grunt.registerTask('prepare', ['copy:html', 'copy:flattenSourceAndTest'/*, 'copy:flattenSmokeTest'*/]);
	grunt.registerTask('copySource', ['copy:jqueryUiImages', 'copy:lib', 'copy:fonts']);
	grunt.registerTask('minify', ['cssmin']);
	grunt.registerTask('package', ['prepare', 'browserify', 'concat', 'copySource', 'minify']);
	
	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: "jshintrc"
			},
			all: {
				src: [
					'Gruntfile.js',
					'build/**/*.js',
					'src/**/*.js',
					'test/unit/**/*.js',
					'test/integration/**/*.js',
					exclude('src/**/i18n.*.js'),
				]
			}
		},

		csslint: {
			options: {
				csslintrc: 'csslintrc'
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
					'node_modules/jquery-ui/dist/jquery-ui.min.js',
					'node_modules/bootstrap/dist/js/bootstrap.min.js'
				],
				dest: 'target/dist/lib/dependencies.js'
			}
		},
			
		copy: {
			flattenSourceAndTest: {
				expand: true,
				src: [
					'src/application/**/*.js',
					'src/domain/**/*.js',
					'src/infrastructure/**/*.js',
					'src/ui/**/*.js',
					'test/unit/**/*.js',
					'test/integration/**/*.js'],
				dest: 'target/stagger/src',
				filter: 'isFile',
				flatten: true
			},
			lib: {
				expand: true,
				cwd: 'node_modules',
				src: [
					'bootstrap/dist/css/bootstrap.css'
				],
				dest: 'target/dist/lib',
				filter: 'isFile',
				flatten: true
			},
			html: {
				src: ['static/index.html'],
				dest: 'target/dist/index.html',
				filter: 'isFile'
			},
			fonts: {
				expand: true,
				cwd: 'node_modules',
				src: [
					'bootstrap/dist/fonts/*.*'
				],
				dest: 'target/dist/fonts',
				filter: 'isFile',
				flatten: true
			},
			jqueryUiImages: {
				expand: true,
				cwd: 'node_modules/jquery-ui/dist/themes/ui-lightness/images/',
				src: ['**/*'],
				dest: 'target/dist/images/',
				filter: 'isFile'
			}
		},

		cssmin: {
			target: {
				files: {
					'target/dist/styles.min.css': [
						'src/**/*.css',
						'node_modules/jquery-ui/dist/themes/ui-lightness/jquery-ui.min.css'
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
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	  
	function exclude(filePattern) {
        return '!' + filePattern;
    }
};