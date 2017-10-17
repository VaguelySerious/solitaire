module.exports = function(grunt, data) {

  var compass = require('compass-importer');
  var include = [
    'node_modules/bootstrap-sass/assets/stylesheets',
  ];
  var files = [{
    expand: true,
    cwd: 'resources/scss',
    src: ['*.scss'],
    dest: 'public/css',
    ext: '.css'
  }];

  return {
    dev: {
      options: {
        importer: compass,
        sourceMap: true,
        includePaths: include
      },
      files: files
    },
    production: {
      options: {
        importer: compass,
        sourceMap: false,
        outputStyle: 'compressed',
        includePaths: include,
      },
      files: files,
    }
  };
}
