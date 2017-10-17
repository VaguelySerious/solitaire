module.exports = function(grunt, data) {
  return {
    scss: {
      files: ['resources/scss/**/*.scss'],
      tasks: ['sass:dev', 'postcss']
    },

    scripts: {
      files: ['resources/js/**/*.js'],
      tasks: ['uglify']
    }
  };
}
