module.exports = function (grunt) {

  // Stuff for sass
  var compass = require('compass-importer');
  var assetpath = "src/";
  var destination = "build/";

  // Configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Ugfliy
    uglify: {
      dist: {
        files: [{
          expand: true,
          cwd: assetpath+'js/',
          src: '*.js',
          dest: destination+'js/',
          ext: '.min.js'
        }]
      },
      dev: {
        files: [{
          mangle: false,
          compress: false,
          expand: true,
          beautify: true,
          cwd: assetpath+'js/',
          src: '*.js',
          dest: destination+'js/',
          ext: '.min.js'
        }]
      }
    },

    // Watch
    watch: {
      files: [assetpath+'scss/**/*.scss', assetpath+'js/*.js'],
      tasks: [
        'sass:dev',
        'uglify:dev'
      ]
    },

    // Sass/Scss
    sass: {
      options: {
        importer: compass,
        // sourceMap: true,
        includePaths: ['node_modules/bootstrap-sass/assets/stylesheets']
      },
      dev: {
        files: [{
          expand: true,
          cwd: assetpath+'scss',
          src: ['**/*.scss'],
          dest: destination+'css',
          ext: '.css'
        }]
      },
      dist: {
        
      }
    }
  });

  // Loading modules
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-sass');
};