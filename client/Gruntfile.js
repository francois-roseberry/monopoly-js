"use strict";

module.exports = function(grunt) {
	
	// Default task, do everything
	grunt.registerTask('default', 'Package', ['package']);
	
	// Packaging
	grunt.registerTask('minify', ['cssmin']);
	grunt.registerTask('package', ['concat', 'minify']);
	
	grunt.initConfig({
		concat: {
			dependencies: {
				src: [
					'../node_modules/underscore/underscore.js',
					'../node_modules/d3/d3.min.js',
					'../node_modules/rx/dist/rx.all.min.js',
					'../node_modules/jquery/dist/jquery.min.js',
					'../node_modules/jquery-ui/dist/jquery-ui.min.js',
					'../node_modules/bootstrap/dist/js/bootstrap.min.js'
				],
				dest: 'dist/lib/dependencies.js'
			}
		},

		cssmin: {
			target: {
				files: {
					'dist/styles.min.css': [
						'src/**/*.css',
						'../node_modules/jquery-ui/dist/themes/ui-lightness/jquery-ui.min.css'
					]
				}
			}
		},
	});

	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
};