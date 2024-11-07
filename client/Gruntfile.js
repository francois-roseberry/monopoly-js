"use strict";

module.exports = function(grunt) {
	
	// Default task, do everything
	grunt.registerTask('default', 'Package', ['package']);
	
	// Packaging
	grunt.registerTask('minify', ['cssmin']);
	grunt.registerTask('package', ['concat', 'copy:jqueryUiImages', 'copy:lib', 'copy:fonts', 'minify']);
	
	grunt.initConfig({
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
				dest: 'dist/lib/dependencies.js'
			}
		},
			
		copy: {
			lib: {
				expand: true,
				cwd: 'node_modules',
				src: [
					'bootstrap/dist/css/bootstrap.css'
				],
				dest: 'dist/lib',
				filter: 'isFile',
				flatten: true
			},
			fonts: {
				expand: true,
				cwd: 'node_modules',
				src: [
					'bootstrap/dist/fonts/*.*'
				],
				dest: 'dist/fonts',
				filter: 'isFile',
				flatten: true
			},
			jqueryUiImages: {
				expand: true,
				cwd: 'node_modules/jquery-ui/dist/themes/ui-lightness/images/',
				src: ['**/*'],
				dest: 'dist/images/',
				filter: 'isFile'
			}
		},

		cssmin: {
			target: {
				files: {
					'dist/styles.min.css': [
						'src/**/*.css',
						'node_modules/jquery-ui/dist/themes/ui-lightness/jquery-ui.min.css'
					]
				}
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
};