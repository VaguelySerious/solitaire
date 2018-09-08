var path = require('path');

module.exports = function(grunt) {
  'use strict';


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      js : {
        files: 'src/js/**/*.js',
        tasks: ['uglify']
      },
      css: {
        files: 'src/scss/**/*.scss',
        tasks: ['sass']
      },
      html: {
        files: 'src/views/**/*.html',
        tasks: ['htmlmin']
      }
    },

    uglify: {
      options: {
        beautify: true,
        sourceMap: true
      },
      all: {
        files: {
          'public/js/klondike.js': ['src/js/klondike.js'],
          'public/js/sol.js': ['src/js/sol.js']
        }
      }
    },

    sass: {
      options: {
        sourceMap: true
      },
      all: {
        files: [
          {
            expand: true,
            cwd: 'src/scss/',
            src: ['**/*.scss'],
            dest: 'public/css/',
            ext: '.css'
          }
        ]
      }
    },

    htmlmin: {
      options: {
        removeComments: true,
        collapseWhitespace: true
      },
      all: {
        files: [
          {
            expand: true,
            cwd: 'src/views/',
            src: ['**/*.html', '*.html'],
            dest: 'public'
          }
        ]
      }
    },

    postcss: {
      options: {
        processors: [
          require('autoprefixer')(),
          require('postcss-inline-svg')(),
          require('cssnano')()
        ]
      },
      all: {
        src: ['public/css/**.css']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-postcss');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');

  grunt.registerTask('default', [
    'uglify',
    'htmlmin',
    'sass',
    'postcss'
  ])
};
