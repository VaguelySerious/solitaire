module.exports = {
  all: {
    files: [{
    	expand: true,
    	filter: 'isFile',
    	cwd: 'resources/js',
      src: '*.js',
      dest: 'public/js',
      ext: '.min.js'
    }]
  }
};